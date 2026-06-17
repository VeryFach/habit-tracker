import { LucideIcon } from 'lucide-react';

export enum Era {
  STONE_AGE = 'STONE_AGE',
  MEDIEVAL = 'MEDIEVAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MODERN = 'MODERN',
  DIGITAL = 'DIGITAL',
}

export type HabitType = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  completedDates: string[]; // ISO Strings
  createdAt: string | unknown; // string in local state, Timestamp when written to Firestore
  targetCount: number;
  goldReward: number;
  expReward: number;
  difficulty: number;
  currentStreak: number;
}

export interface BuildingType {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'economic' | 'utility' | 'food' | 'special';
  era: Era;
  costSilver: number;
  costGold: number;
  housing: number;
  foodProduction: number;
  silverIncome: number;
  healthBonus?: number;
  happinessBonus?: number;
  iconName: string;
}

export interface PlacedBuilding {
  id: string;
  buildingTypeId: string;
  gridX: number;
  gridY: number;
  level: number;
  health: number; // 0-100
  createdAt?: string;
}

export interface DailyReport {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  goldGained: number;
  expGained: number;
  hpChange: number;
  cityHealthChange: number;
  cityHappinessChange: number;
  silverTax: number;
  populationGrowth: number;
  momentumBonus: number;
  message: string;
  sickChange?: number;
  deathCount?: number;
  event?: DisasterEvent;
  emergencyHabitAdded?: boolean;
  levelUpCount?: number;
  previousLevel?: number;
  newLevel?: number;
}

export interface DisasterEvent {
  id: string;
  name: string;
  description: string;
  impactType: 'health' | 'population' | 'happiness' | 'silver' | 'building';
  severity: number;
  mitigationHabitId?: string;
}

export interface EraMilestone {
  era: Era;
  populationTarget: number;
  unlocks: string[];
}

export interface UserStats {
  hp: number;
  maxHp: number;
  gold: number;
  silver: number;
  exp: number;
  level: number;
  maxExp: number;
  momentum: number; // 0-100 percentage
  lastCelebratedLevel: number;
  lastEndDay: string | null;
  dayCount: number;
  badges: string[];
  pendingReport: DailyReport | null;
  skipTickets: number;
  unlockedEras: Era[];
}

export interface CityState {
  population: number;
  populationSick: number;
  food: number;
  housing: number;
  health: number; // 0-100 percentage
  happiness: number; // 0-100 percentage
  buildings: PlacedBuilding[];
  currentEra: Era;
  unlockedEvolutions: string[]; // List of branch IDs
}

export interface EvolutionRequirement {
  type: 'level' | 'buildings' | 'silver' | 'gold' | 'achievement';
  target: number | string;
  count?: number;
  description: string;
}

export interface EvolutionBranch {
  id: string;
  name: string;
  description: string;
  era: Era;
  requirements: EvolutionRequirement[];
  benefits: string[];
  iconName: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'habit' | 'city' | 'economy' | 'system';
  message: string;
  change: number;
  unit: 'hp' | 'gold' | 'silver' | 'exp' | 'pop' | 'system';
}
