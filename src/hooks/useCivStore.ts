import { useState, useEffect, useCallback, useRef } from 'react';
import { UserStats, Habit, CityState, ActivityLog, Era, HabitType, PlacedBuilding } from '../types';
import { EXP_PER_LEVEL, DEFAULT_HP, BUILDINGS, DISASTERS, ERA_MILESTONES } from '../constants';
import { calculateCitySummary } from '../lib/cityUtils';
import { auth, db } from '../lib/firebase';
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import {
  normalizeEra,
  normalizeEras,
  normalizeHabitType,
  validateHabitPayload,
  validateBuildingPayload,
  validateLogPayload,
  buildingDocId,
  isDeterministicBuildingId,
} from '../lib/validation';

const STORAGE_KEYS = {
  STATS: 'civfit_stats',
  HABITS: 'civfit_habits',
  CITY: 'civfit_city',
  LOGS: 'civfit_logs'
};

const INITIAL_STATS: UserStats = {
  hp: DEFAULT_HP,
  maxHp: DEFAULT_HP,
  gold: 100,
  silver: 500,
  exp: 0,
  level: 1,
  maxExp: EXP_PER_LEVEL,
  momentum: 50,
  lastCelebratedLevel: 1,
  lastEndDay: null,
  dayCount: 1,
  badges: [],
  pendingReport: null,
  skipTickets: 0,
  unlockedEras: [Era.STONE_AGE]
};

const INITIAL_CITY: CityState = {
  population: 0,
  populationSick: 0,
  food: 0,
  housing: 0,
  health: 100,
  happiness: 100,
  buildings: [],
  currentEra: Era.STONE_AGE,
  unlockedEvolutions: []
};

const getDateKey = (date = new Date()) => date.toISOString().split('T')[0];

const getPeriodKey = (dateKey: string, type: HabitType) => {
  if (!dateKey) return null;
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  if (isNaN(date.getTime())) {
    console.error('Invalid Date : ', dateKey);
    return null;
  }

  if (type === 'daily') return dateKey;
  if (type === 'monthly') return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;

  const weekStart = new Date(date);
  const day = weekStart.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  weekStart.setUTCDate(weekStart.getUTCDate() + diffToMonday);
  return weekStart.toISOString().split('T')[0];
};

const countCompletionsInCurrentPeriod = (habit: Habit, todayKey: string) => {
  const currentPeriod = getPeriodKey(todayKey, habit.type);
  return habit.completedDates.filter(dateKey => getPeriodKey(dateKey, habit.type) === currentPeriod).length;
};

const applyExpGain = (currentStats: UserStats, expGain: number) => {
  let newExp = currentStats.exp + expGain;
  let newLevel = currentStats.level;
  let newMaxExp = currentStats.maxExp;

  while (newExp >= newMaxExp) {
    newExp -= newMaxExp;
    newLevel += 1;
    newMaxExp = Math.floor(newMaxExp * 1.2);
  }

  return {
    exp: newExp,
    level: newLevel,
    maxExp: newMaxExp
  };
};

export function useCivStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [city, setCity] = useState<CityState>(INITIAL_CITY);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setLoading(false);
    });
  }, []);

  // Firestore Sync - User Doc (Stats & City)
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsub = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.stats) {
          // Normalize legacy era values from mobile clients on read
          const normalizedStats = {
            ...data.stats,
            unlockedEras: data.stats.unlockedEras
              ? normalizeEras(data.stats.unlockedEras)
              : [Era.STONE_AGE],
          };
          setStats(normalizedStats);
        }
        if (data.city) {
          // Normalize currentEra from any legacy format (e.g. "Stone Age", "STONE AGE")
          const normalizedCity = {
            ...data.city,
            currentEra: normalizeEra(data.city.currentEra),
          };
          setCity(normalizedCity);
        }
      } else {
        // Initialize user in firestore if not exists
        const initialData = {
          stats: INITIAL_STATS,
          city: INITIAL_CITY,
          updatedAt: Timestamp.now()
        };
        setDoc(userDocRef, initialData).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`));
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`));

    return () => unsub();
  }, [currentUser]);

  // Firestore Sync - Habits
  useEffect(() => {
    if (!currentUser) return;

    const habitsRef = collection(db, 'users', currentUser.uid, 'habits');
    const q = query(habitsRef);
    const unsub = onSnapshot(q, (snapshot) => {
      const habitsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Normalize habit type from any legacy format
          type: normalizeHabitType(data.type),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        } as Habit;
      });
      setHabits(habitsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/habits`));

    return () => unsub();
  }, [currentUser]);

  // Firestore Sync - Logs
  useEffect(() => {
    if (!currentUser) return;

    const logsRef = collection(db, 'users', currentUser.uid, 'logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const logsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp
        } as ActivityLog;
      });
      setLogs(logsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/logs`));

    return () => unsub();
  }, [currentUser]);

  // Firestore Sync - Buildings Subcollection (with legacy migration)
  // This listener:
  // 1. Reads all docs from /users/{uid}/buildings
  // 2. Detects legacy random-ID docs (doc.id != `${gridX}_${gridY}`)
  // 3. Creates deterministic-ID copies for legacy docs (non-destructive)
  // 4. Builds deduplicated building list preferring deterministic IDs
  useEffect(() => {
    if (!currentUser) return;

    const buildingsRef = collection(db, 'users', currentUser.uid, 'buildings');
    const unsub = onSnapshot(buildingsRef, async (snapshot) => {
      const migratedDocIds = new Set<string>();

      // Phase 1: Migrate legacy docs (best-effort, non-blocking)
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const gx = data.gridX;
        const gy = data.gridY;

        if (typeof gx !== 'number' || typeof gy !== 'number') continue;

        const expectedId = buildingDocId(gx, gy);
        if (docSnap.id !== expectedId && !migratedDocIds.has(expectedId)) {
          // Legacy random-ID doc detected — create deterministic copy
          migratedDocIds.add(expectedId);
          try {
            const deterministicRef = doc(db, 'users', currentUser.uid, 'buildings', expectedId);
            const existingDeterministic = await getDoc(deterministicRef);
            if (!existingDeterministic.exists()) {
              await setDoc(deterministicRef, {
                buildingTypeId: data.buildingTypeId || '',
                createdAt: data.createdAt || serverTimestamp(),
                gridX: gx,
                gridY: gy,
                health: typeof data.health === 'number' ? data.health : 100,
                level: typeof data.level === 'number' ? data.level : 1,
              });
              console.info('[buildings] Migrated legacy doc', docSnap.id, '->', expectedId);
            }
          } catch (e) {
            console.warn('[buildings] Legacy migration failed for', docSnap.id, '(non-fatal):', e);
          }
        }
      }

      // Phase 2: Build deduplicated list — deterministic IDs take priority
      const buildingMap = new Map<string, PlacedBuilding>();
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const gx = data.gridX;
        const gy = data.gridY;
        if (typeof gx !== 'number' || typeof gy !== 'number') continue;

        const key = buildingDocId(gx, gy);

        // Prefer deterministic-ID docs over legacy random-ID docs
        const isLegacyDoc = docSnap.id !== key;
        const alreadyHasDeterministic = buildingMap.has(key);
        if (alreadyHasDeterministic && isLegacyDoc) continue; // skip legacy duplicate

        const createdAtStr = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString());

        buildingMap.set(key, {
          id: key,
          buildingTypeId: data.buildingTypeId || '',
          gridX: gx,
          gridY: gy,
          level: typeof data.level === 'number' ? data.level : 1,
          health: typeof data.health === 'number' ? data.health : 100,
          createdAt: createdAtStr,
        });
      }

      // NOTE: We do NOT overwrite city.buildings here because syncStatsAndCity
      // already manages it via the user doc. This listener is primarily for
      // migration and future authoritative reads.
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/buildings`));

    return () => unsub();
  }, [currentUser]);

  const syncStatsAndCity = async (newStats: UserStats, newCity: CityState) => {
    if (!currentUser) {
      setStats(newStats);
      setCity(newCity);
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', currentUser.uid), {
        stats: newStats,
        city: newCity,
        updatedAt: Timestamp.now()
      });

      batch.set(doc(db, 'leaderboard', currentUser.uid), {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Survivor',
        photoURL: currentUser.photoURL || '',
        level: newStats.level,
        population: newCity.population,
        currentEra: newCity.currentEra,
        updatedAt: Timestamp.now()
      });

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  const addLog = async (type: ActivityLog['type'], message: string, change: number, unit: ActivityLog['unit']) => {
    // Validate log payload before any write
    const logValidation = validateLogPayload({ type, message, unit });
    if (!logValidation.valid) {
      console.warn('[addLog] Validation failed, skipping write:', logValidation.reason);
      return;
    }

    const logId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    const newLog = {
      timestamp,
      type,
      message,
      change,
      unit
    };

    if (!currentUser) {
      setLogs(prev => [{ ...newLog, id: logId } as ActivityLog, ...(prev || [])].slice(0, 50));
      return;
    }

    try {
      // For Firestore, use Timestamp
      const firestoreLog = {
        ...newLog,
        timestamp: Timestamp.now()
      };
      await setDoc(doc(db, 'users', currentUser.uid, 'logs', logId), firestoreLog);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}/logs/${logId}`);
    }
  };

  const addHabit = async (title: string, type: HabitType) => {
    // Validate habit payload before any write
    const habitValidation = validateHabitPayload({ title, type });
    if (!habitValidation.valid) {
      console.warn('[addHabit] Validation failed, skipping write:', habitValidation.reason);
      return;
    }

    const normalizedType = normalizeHabitType(type);
    const goldBase = normalizedType === 'daily' ? 10 : normalizedType === 'weekly' ? 50 : 200;
    const expBase = normalizedType === 'daily' ? 50 : normalizedType === 'weekly' ? 250 : 1000;
    const target = normalizedType === 'daily' ? 1 : normalizedType === 'weekly' ? 3 : 10;
    const habitId = Math.random().toString(36).substr(2, 9);

    const newHabit = {
      title,
      type: normalizedType,
      completedDates: [],
      createdAt: Timestamp.now(),
      targetCount: target,
      goldReward: goldBase,
      expReward: expBase,
      difficulty: 1,
      currentStreak: 0
    };

    if (!currentUser) {
      setHabits(prev => [...prev, { ...newHabit, id: habitId }]);
      return;
    }

    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'habits', habitId), newHabit);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}/habits/${habitId}`);
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    // Validate habit type if being updated
    if (updates.type !== undefined) {
      const habitTypeValidation = validateHabitPayload({ title: 'placeholder', type: updates.type });
      if (!habitTypeValidation.valid) {
        console.warn('[updateHabit] Validation failed, skipping write:', habitTypeValidation.reason);
        return;
      }
    }

    if (!currentUser) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
      return;
    }

    try {
      const normalizedUpdates = updates.type
        ? { ...updates, type: normalizeHabitType(updates.type) }
        : updates;
      await setDoc(doc(db, 'users', currentUser.uid, 'habits', id), normalizedUpdates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/habits/${id}`);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!currentUser) {
      setHabits(prev => prev.filter(h => h.id !== id));
      return;
    }

    try {
      const habitRef = doc(db, 'users', currentUser.uid, 'habits', id);
      const batch = writeBatch(db);
      batch.delete(habitRef);
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${currentUser.uid}/habits/${id}`);
    }
  };

  const completeHabit = async (id: string) => {
    const today = getDateKey();
    const h = habits.find(habit => habit.id === id);
    if (!h || h.completedDates.includes(today)) return;

    const completionsThisPeriod = countCompletionsInCurrentPeriod(h, today);
    const overAchievement = completionsThisPeriod >= h.targetCount;

    const momentumMult = 1 + (stats.momentum / 100) * 0.5; // up to 1.5x
    const baseMultiplier = overAchievement ? 0.5 : 1;
    const finalMultiplier = baseMultiplier * momentumMult;

    const expGain = Math.floor(h.expReward * finalMultiplier);
    const expProgress = applyExpGain(stats, expGain);

    const updatedStats = {
      ...stats,
      gold: stats.gold + Math.floor(h.goldReward * finalMultiplier),
      ...expProgress,
      momentum: Math.min(100, stats.momentum + 2)
    };

    const updatedHabit = {
      ...h,
      completedDates: [...h.completedDates, today],
      currentStreak: h.currentStreak + 1,
      createdAt: typeof h.createdAt === 'string' && h.createdAt
        ? Timestamp.fromDate(new Date(h.createdAt))
        : Timestamp.now()
    };

    if (!currentUser) {
      setStats(updatedStats);
      setHabits(prev => prev.map(habit => habit.id === id ? updatedHabit : habit));
      addLog('habit', `Completed: ${h.title}`, Math.floor(h.goldReward * finalMultiplier), 'gold');
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', currentUser.uid), { stats: updatedStats, updatedAt: Timestamp.now() }, { merge: true });
      batch.set(doc(db, 'users', currentUser.uid, 'habits', id), updatedHabit);
      await batch.commit();
      addLog('habit', `Completed: ${h.title}`, Math.floor(h.goldReward * finalMultiplier), 'gold');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  const endDay = async () => {
    const today = getDateKey();
    const dailyHabits = habits.filter(h => h.type === 'daily');
    const unfinishedDaily = dailyHabits.filter(h => !h.completedDates.includes(today));
    const finishedDailyToday = dailyHabits.filter(h => h.completedDates.includes(today));

    const canSkip = stats.skipTickets > 0 && unfinishedDaily.length > dailyHabits.length * 0.5;
    let ticketUsed = false;
    const completionRate = dailyHabits.length > 0 ? finishedDailyToday.length / dailyHabits.length : 1;

    let hpChange = 0;
    let momentumChange = 0;

    if (canSkip) {
      ticketUsed = true;
      hpChange = 5;
      momentumChange = 0;
    } else {
      const maxPenalty = stats.maxHp * 0.25;
      const hpPenalty = Math.min(maxPenalty, unfinishedDaily.length * (stats.maxHp * 0.05));
      hpChange = completionRate >= 0.8 ? 10 : -hpPenalty;
      momentumChange = completionRate >= 0.8 ? 5 : -(unfinishedDaily.length * 10);
    }

    const summary = calculateCitySummary(city);
    const taxes = Math.floor(summary.totalSilverIncome * (0.8 + (stats.momentum / 100) * 0.4));
    const healthChange = summary.healthImpact + (completionRate >= 0.8 ? 5 : -(unfinishedDaily.length * 4));
    const happinessChange = summary.happinessImpact + (completionRate >= 0.8 ? 10 : -(unfinishedDaily.length * 6));

    const newHealth = Math.min(100, Math.max(0, city.health + healthChange));
    const newHappiness = Math.min(100, Math.max(0, city.happiness + happinessChange));

    let popChange = 0;
    let sickChange = 0;
    let deathCount = 0;

    if (summary.isHungry || summary.isHomeless) {
      const newSufferers = Math.ceil((summary.foodDeficit / 5) + (summary.homelessCount / 2));
      sickChange += newSufferers;
    }

    if (newHealth > 70) {
      const recovered = Math.ceil(city.populationSick * 0.3);
      sickChange -= recovered;
    }

    const deathRate = newHealth < 20 ? 0.4 : newHealth < 50 ? 0.15 : 0.05;
    deathCount = Math.ceil(city.populationSick * deathRate);
    if (newHealth < 10) deathCount += Math.ceil(city.population * 0.05);

    popChange -= deathCount;
    sickChange -= deathCount;

    if (!summary.isHungry && newHealth > 60 && city.population < summary.totalHousing) {
      popChange += Math.ceil((summary.totalHousing - city.population) * 0.1) + 1;
    }

    const finalPop = Math.max(0, city.population + popChange);
    const finalSick = Math.min(finalPop, Math.max(0, city.populationSick + sickChange));

    let activeDisaster: any = null;
    let eventImpactMessage = "";
    if (Math.random() < 0.15) {
      activeDisaster = DISASTERS[Math.floor(Math.random() * DISASTERS.length)];
      eventImpactMessage = `[EVENT] ${activeDisaster.name} detected!`;
    }

    let finalHealth = newHealth;
    let finalHappiness = newHappiness;
    if (activeDisaster) {
      if (activeDisaster.impactType === 'health') finalHealth = Math.max(0, finalHealth - activeDisaster.severity);
      if (activeDisaster.impactType === 'happiness') finalHappiness = Math.max(0, finalHappiness - activeDisaster.severity);
    }

    let nextEra = city.currentEra;
    const eraOrder = [Era.STONE_AGE, Era.MEDIEVAL, Era.INDUSTRIAL, Era.MODERN, Era.DIGITAL];
    const currentIndex = eraOrder.indexOf(city.currentEra);
    if (currentIndex < eraOrder.length - 1) {
      const nextEraType = eraOrder[currentIndex + 1];
      const milestone = ERA_MILESTONES.find(m => m.era === nextEraType);
      if (milestone && finalPop >= milestone.populationTarget) {
        nextEra = nextEraType;
        addLog('system', `Civilization evolved to ${nextEra}!`, 0, 'exp');
      }
    }

    const report: any = {
      date: today,
      habitsCompleted: finishedDailyToday.length,
      habitsTotal: dailyHabits.length,
      goldGained: finishedDailyToday.reduce((sum, h) => sum + h.goldReward, 0),
      expGained: finishedDailyToday.reduce((sum, h) => sum + h.expReward, 0),
      hpChange,
      cityHealthChange: healthChange - (activeDisaster?.impactType === 'health' ? activeDisaster.severity : 0),
      cityHappinessChange: happinessChange - (activeDisaster?.impactType === 'happiness' ? activeDisaster.severity : 0),
      silverTax: taxes,
      populationGrowth: popChange,
      momentumBonus: momentumChange,
      sickChange,
      deathCount,
      event: activeDisaster,
      emergencyHabitAdded: !!activeDisaster,
      message: ticketUsed
        ? "Emergency Protocol Activated: Ticket used to safeguard simulation."
        : (activeDisaster ? eventImpactMessage : (hpChange >= 0 ? "You dominated the day! Momentum is building." : "A rough day in the simulation. Stay consistent."))
    };

    if (activeDisaster) {
      addHabit(`Mitigasi: ${activeDisaster.name}`, 'daily');
    }

    const updatedStats = {
      ...stats,
      hp: Math.min(stats.maxHp, Math.max(0, stats.hp + hpChange)),
      silver: stats.silver + taxes,
      momentum: Math.min(100, Math.max(0, stats.momentum + momentumChange)),
      skipTickets: ticketUsed ? stats.skipTickets - 1 : stats.skipTickets,
      lastEndDay: today,
      dayCount: stats.dayCount + 1,
      lastCelebratedLevel: stats.level,
      pendingReport: report
    };

    const updatedCity = {
      ...city,
      population: finalPop,
      populationSick: finalSick,
      currentEra: nextEra,
      food: summary.totalFoodProduction,
      housing: summary.totalHousing,
      health: finalHealth,
      happiness: finalHappiness
    };

    if (!currentUser) {
      setStats(updatedStats);
      setCity(updatedCity);
      setHabits(prev => prev.map(h => h.type === 'daily' && !h.completedDates.includes(today) ? { ...h, currentStreak: 0 } : h));
      return report;
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', currentUser.uid), { stats: updatedStats, city: updatedCity, updatedAt: Timestamp.now() });

      batch.set(doc(db, 'leaderboard', currentUser.uid), {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Survivor',
        photoURL: currentUser.photoURL || '',
        level: updatedStats.level,
        population: updatedCity.population,
        currentEra: updatedCity.currentEra,
        updatedAt: Timestamp.now()
      });

      habits.forEach(h => {
        if (h.type === 'daily' && !h.completedDates.includes(today)) {
          batch.set(doc(db, 'users', currentUser.uid, 'habits', h.id), { currentStreak: 0 }, { merge: true });
        }
      });
      await batch.commit();
      return report;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  const deployBuilding = async (buildingTypeId: string, silverCost: number, goldCost: number, x: number, y: number) => {
    // Validate building payload before any write
    const buildingValidation = validateBuildingPayload({ buildingTypeId, gridX: x, gridY: y, level: 1, health: 100 });
    if (!buildingValidation.valid) {
      console.warn('[deployBuilding] Validation failed, skipping write:', buildingValidation.reason);
      return false;
    }

    if (stats.silver >= silverCost && stats.gold >= goldCost) {
      // Use deterministic doc ID matching mobile schema: "${gridX}_${gridY}"
      const bDocId = buildingDocId(x, y);

      // Prevent duplicate placement: check if subcollection doc already exists
      if (currentUser) {
        try {
          const existingDoc = await getDoc(doc(db, 'users', currentUser.uid, 'buildings', bDocId));
          if (existingDoc.exists()) {
            console.warn('[deployBuilding] Tile already occupied:', bDocId);
            return false;
          }
        } catch (e) {
          console.warn('[deployBuilding] Duplicate check failed (proceeding):', e);
        }
      }

      const nowISO = new Date().toISOString();
      const newBuilding: PlacedBuilding = {
        id: bDocId,
        buildingTypeId,
        gridX: x,
        gridY: y,
        level: 1,
        health: 100,
        createdAt: nowISO
      };

      const newCity = {
        ...city,
        buildings: [...(city.buildings || []), newBuilding]
      };
      const newStats = { ...stats, silver: stats.silver - silverCost, gold: stats.gold - goldCost };

      await syncStatsAndCity(newStats, newCity);

      // Dual-write: persist to /buildings subcollection with deterministic doc ID
      if (currentUser) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'buildings', bDocId), {
            buildingTypeId,
            createdAt: serverTimestamp(),
            gridX: x,
            gridY: y,
            health: 100,
            level: 1,
          });
        } catch (e) {
          console.warn('[deployBuilding] Subcollection write failed (non-fatal):', e);
        }
      }

      addLog('city', `Constructed ${buildingTypeId}`, -silverCost, 'silver');
      if (goldCost > 0) addLog('city', `Gold material used for ${buildingTypeId}`, -goldCost, 'gold');
      return true;
    }
    return false;
  };

  const upgradeBuilding = async (id: string, silverCost: number) => {
    // Validate: building must exist in current state
    const existing = (city.buildings || []).find(b => b.id === id);
    if (!existing) {
      console.warn('[upgradeBuilding] Building not found, skipping write:', id);
      return false;
    }

    if (stats.silver >= silverCost) {
      const newLevel = existing.level + 1;
      const newCity = {
        ...city,
        buildings: (city.buildings || []).map(b =>
          b.id === id ? { ...b, level: newLevel } : b
        )
      };
      const newStats = { ...stats, silver: stats.silver - silverCost };

      await syncStatsAndCity(newStats, newCity);

      // Dual-write: update /buildings subcollection using deterministic doc ID
      // Falls back to the legacy ID if the building still has one
      const subDocId = buildingDocId(existing.gridX, existing.gridY);
      if (currentUser) {
        try {
          await setDoc(
            doc(db, 'users', currentUser.uid, 'buildings', subDocId),
            { level: newLevel },
            { merge: true }
          );
        } catch (e) {
          console.warn('[upgradeBuilding] Subcollection write failed (non-fatal):', e);
        }
      }

      addLog('city', `Upgraded building`, -silverCost, 'silver');
      return true;
    }
    return false;
  };

  const removeBuilding = async (id: string) => {
    const existing = (city.buildings || []).find(b => b.id === id);

    const newCity = {
      ...city,
      buildings: (city.buildings || []).filter(b => b.id !== id)
    };
    await syncStatsAndCity(stats, newCity);

    // Dual-write: delete from /buildings subcollection
    // Use deterministic ID derived from grid coords (works for both old and new buildings)
    if (currentUser && existing) {
      const subDocId = buildingDocId(existing.gridX, existing.gridY);
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'buildings', subDocId));
        // If the local ID was a legacy random ID different from the deterministic one,
        // also attempt to delete the legacy doc (best-effort, non-fatal)
        if (id !== subDocId) {
          try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'buildings', id));
          } catch (_) { /* legacy doc may not exist */ }
        }
      } catch (e) {
        console.warn('[removeBuilding] Subcollection delete failed (non-fatal):', e);
      }
    }

    addLog('city', `Removed building`, 0, 'silver');
  };

  const unlockEvolution = async (branchId: string) => {
    if (city.unlockedEvolutions?.includes(branchId)) return false;

    const newCity = {
      ...city,
      unlockedEvolutions: [...(city.unlockedEvolutions || []), branchId]
    };

    await syncStatsAndCity(stats, newCity);
    addLog('system', `Evolution unlocked: ${branchId}`, 0, 'exp');
    return true;
  };

  return {
    currentUser,
    loading,
    stats, setStats,
    habits, addHabit, completeHabit, updateHabit, deleteHabit, setHabits,
    city, setCity,
    logs, addLog,
    syncStatsAndCity,
    deployBuilding,
    upgradeBuilding,
    removeBuilding,
    unlockEvolution,
    endDay
  };
}
