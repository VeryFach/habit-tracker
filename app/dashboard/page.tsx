'use client'

import AnimatedCityScene from '@/components/AnimatedCityScene'
import BuildingMap from '@/components/BuildingMap'
import { Button } from '@/components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import CityVisualization from '@/components/CityVisualization'
import { useCivFitConfig } from '@/hooks/useCivFitConfig'
import { useHabitLog } from '@/hooks/useHabitLog'
import { useHabits } from '@/hooks/useHabits'
import { createClient } from '@/lib/supabase'
import type { Habit } from '@/types/database'
import { useEffect, useMemo, useState } from 'react'
import { CreateHabitForm } from './components/CreateHabitForm'

type MainTab = 'reality' | 'city'
type CityTab = 'visualization' | 'map' | 'scene' | 'buildings' | 'bank' | 'temple'
type HabitModalMode = 'create' | 'edit' | null

type BuildingKey = 'house' | 'farm' | 'taxOffice' | 'restaurant' | 'cloneCenter' | 'coffeeShop'
type HabitFormPayload = Pick<
  Habit,
  | 'name'
  | 'description'
  | 'category'
  | 'frequency'
  | 'target_count'
  | 'points_per_completion'
  | 'color'
  | 'icon'
>

interface CivFitState {
  hp: number
  exp: number
  level: number
  gold: number
  silver: number
  population: number
  sick: number
  food: number
  housing: number
  day: number
  leaveTomorrow: boolean
  cloneEnabled: boolean
  exchangeRate: number
  buildings: Record<BuildingKey, number>
  completions: Record<string, number>
  unlockedBadges: string[]
  history: string[]
  lastEvaluatedDate: string | null
  lastGachaSpinDate: string | null
}

interface BuildingDefinition {
  key: BuildingKey
  name: string
  description: string
  baseCost: number
}

const BADGES = [
  { id: 'steady-start', name: 'Langkah Awal', requirement: 100 },
  { id: 'city-founder', name: 'Pendiri Kota', requirement: 250 },
  { id: 'iron-discipline', name: 'Disiplin Besi', requirement: 450 },
  { id: 'gold-rhythm', name: 'Ritme Emas', requirement: 700 },
  { id: 'civilization-core', name: 'Inti Peradaban', requirement: 1000 },
]

const GACHA_REWARDS = [
  { name: 'Zonk Murni', silverReward: 0, prob: 0.1, type: 'loss' },
  { name: 'Receh Kembali', silverReward: 8, prob: 0.45, type: 'small' },
  { name: 'Hadiah Sedang', silverReward: 28, prob: 0.35, type: 'medium' },
  { name: 'Jackpot Kota', silverReward: 70, prob: 0.1, type: 'jackpot' },
]

const BUILDINGS: BuildingDefinition[] = [
  {
    key: 'house',
    name: 'Rumah Warga',
    description: '+5 kapasitas rumah.',
    baseCost: 30,
  },
  {
    key: 'farm',
    name: 'Kebun Pangan',
    description: '+8 makanan setiap evaluasi hari.',
    baseCost: 35,
  },
  {
    key: 'taxOffice',
    name: 'Kantor Pajak',
    description: 'Pajak dari maksimal 10 warga sehat per kantor.',
    baseCost: 50,
  },
  {
    key: 'restaurant',
    name: 'Restoran',
    description: '+2 populasi dan +6 makanan.',
    baseCost: 75,
  },
  {
    key: 'cloneCenter',
    name: 'Pusat Kloning',
    description: 'Menggandakan 1 warga per kelipatan 3 populasi.',
    baseCost: 140,
  },
  {
    key: 'coffeeShop',
    name: 'Kafe Kopi',
    description: 'Meningkatkan mood & produktivitas warga.',
    baseCost: 60,
  },
]

function createInitialState(): CivFitState {
  return {
    hp: 100,
    exp: 0,
    level: 1,
    gold: 25,
    silver: 40,
    population: 6,
    sick: 0,
    food: 12,
    housing: 8,
    day: 1,
    leaveTomorrow: false,
    cloneEnabled: true,
    exchangeRate: 4,
    buildings: {
      house: 1,
      farm: 1,
      taxOffice: 0,
      restaurant: 0,
      cloneCenter: 0,
      coffeeShop: 0,
    },
    completions: {},
    unlockedBadges: [],
    history: ['CivFit v1.7 started. Realita and Kota are now separated.'],
    lastEvaluatedDate: null,
    lastGachaSpinDate: null,
  }
}

function getLocalDateString(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().split('T')[0]
}

function getWeekNumber(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / 86400000)
  return Math.floor((dayOffset + firstDay.getDay()) / 7) + 1
}

function getPeriodKey(habit: Habit, date = new Date()) {
  if (habit.frequency === 'weekly') {
    return `${habit.id}:week:${date.getFullYear()}-${getWeekNumber(date)}`
  }

  if (habit.frequency === 'monthly') {
    return `${habit.id}:month:${date.getFullYear()}-${date.getMonth() + 1}`
  }

  return `${habit.id}:day:${getLocalDateString(date)}`
}

function getLevelRequirement(level: number) {
  const fixed = [0, 100, 250, 450, 700, 1000]
  return fixed[level] ?? fixed[fixed.length - 1] + (level - 5) * 350
}

function getLevelFromExp(exp: number) {
  let level = 1

  while (exp >= getLevelRequirement(level)) {
    level += 1
  }

  return Math.max(1, level - 1)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function calculateBuildingCost(definition: BuildingDefinition, owned: number) {
  return Math.round(definition.baseCost * 1.3 ** owned)
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex justify-end border-b border-gray-200 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('reality')
  const [cityTab, setCityTab] = useState<CityTab>('buildings')
  const [habitModalMode, setHabitModalMode] = useState<HabitModalMode>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [celebration, setCelebration] = useState<string | null>(null)
  const [state, setState] = useState<CivFitState>(() => createInitialState())

  const {
    habits,
    loading: habitsLoading,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits(userId)
  const { logs, loading: logLoading, logHabit } = useHabitLog(userId)
  const { buildings: configBuildings, gacha: configGacha, badges: configBadges, loading: configLoading } = useCivFitConfig()

  const buildingsSource =
    configLoading || configBuildings.length === 0 ? BUILDINGS : configBuildings
  const gachaSource =
    configLoading || configGacha.length === 0 ? GACHA_REWARDS : configGacha
  const badgeSource =
    configLoading || configBadges.length === 0 ? BADGES : configBadges

  const today = useMemo(() => new Date(), [])
  const todayKey = getLocalDateString(today)
  const healthyPopulation = Math.max(0, state.population - state.sick)
  const nextLevelRequirement = getLevelRequirement(state.level + 1)
  const currentLevelRequirement = getLevelRequirement(state.level)
  const levelProgress = Math.min(
    100,
    Math.round(
      ((state.exp - currentLevelRequirement) /
        Math.max(1, nextLevelRequirement - currentLevelRequirement)) *
        100
    )
  )

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }

    getCurrentUser()
  }, [])

  useEffect(() => {
    if (!userId) return

    const saved = window.localStorage.getItem(`civfit-state:${userId}`)
    if (!saved) return

    let nextState = createInitialState()
    try {
      nextState = { ...nextState, ...JSON.parse(saved) }
    } catch {
      nextState = createInitialState()
    }

    window.setTimeout(() => setState(nextState), 0)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    window.localStorage.setItem(`civfit-state:${userId}`, JSON.stringify(state))
  }, [state, userId])

  const completedToday = useMemo(() => {
    return new Set(
      logs
        .filter((log) => log.completed_at.startsWith(todayKey))
        .map((log) => log.habit_id)
    )
  }, [logs, todayKey])

  const addHistory = (message: string) => {
    setState((prev) => ({
      ...prev,
      history: [`Day ${prev.day}: ${message}`, ...prev.history].slice(0, 80),
    }))
  }

  const handleCreateHabit = async (data: HabitFormPayload) => {
    await createHabit({
      ...data,
      user_id: userId!,
      is_active: true,
      start_date: todayKey,
    })
    addHistory(`Habit baru dibuat: ${data.name}.`)
    setHabitModalMode(null)
  }

  const handleEditHabit = async (data: Partial<Habit>) => {
    if (!editingHabit) return
    await updateHabit(editingHabit.id, data)
    addHistory(`Habit diperbarui: ${data.name || editingHabit.name}.`)
    setEditingHabit(null)
    setHabitModalMode(null)
  }

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return
    await deleteHabit(habitToDelete.id)
    addHistory(`Habit dihapus: ${habitToDelete.name}.`)
    setHabitToDelete(null)
  }

  const handleLogHabit = async (habit: Habit) => {
    const periodKey = getPeriodKey(habit, today)
    const currentCount = state.completions[periodKey] || 0
    const isOverAchievement = currentCount >= habit.target_count
    const rewardMultiplier = isOverAchievement ? 0.5 : 1
    const baseReward = habit.points_per_completion
    const goldEarned = Math.max(1, Math.round(baseReward * rewardMultiplier))
    const expEarned = Math.max(1, Math.round(baseReward * rewardMultiplier))

    await logHabit(
      habit.id,
      isOverAchievement
        ? 'Over-achievement reward reduced by CivFit.'
        : undefined
    )

    setState((prev) => {
      const nextExp = prev.exp + expEarned
      const nextLevel = getLevelFromExp(nextExp)

      if (nextLevel > prev.level) {
        setCelebration(`Level ${nextLevel} tercapai.`)
      }

      return {
        ...prev,
        exp: nextExp,
        level: nextLevel,
        gold: prev.gold + goldEarned,
        completions: {
          ...prev.completions,
          [periodKey]: currentCount + 1,
        },
        history: [
          `Day ${prev.day}: ${habit.name} selesai. +${goldEarned} Gold, +${expEarned} EXP${
            isOverAchievement ? ' (bonus ekstra 50%).' : '.'
          }`,
          ...prev.history,
        ].slice(0, 80),
      }
    })
  }

  const handleSleep = () => {
    const missedHabits = habits.filter(
      (habit) => habit.frequency === 'daily' && !completedToday.has(habit.id)
    )
    const leaveUsed = state.leaveTomorrow
    const penalty = leaveUsed ? 0 : Math.min(missedHabits.length * 8, 30)
    const taxCapacity = state.buildings.taxOffice * 10
    const taxableCitizens = Math.min(healthyPopulation, taxCapacity)
    const taxSilver = taxableCitizens * 2
    const farmFood = state.buildings.farm * 8 + state.buildings.restaurant * 6
    const cloneBonus =
      state.cloneEnabled && state.buildings.cloneCenter > 0
        ? Math.floor(state.population / 3)
        : 0

    setState((prev) => {
      const nextHp = Math.max(0, prev.hp - penalty)
      const nextFood = prev.food + farmFood - prev.population
      const hungry = Math.max(0, -nextFood)
      const homeless = Math.max(0, prev.population - prev.housing)
      const newSick = Math.min(
        prev.population,
        prev.sick + Math.ceil((hungry + homeless) / 2)
      )
      const recovered = nextFood > 0 && prev.sick > 0 ? 1 : 0
      const finalSick = Math.max(0, newSick - recovered)
      const completionRatio =
        habits.length === 0
          ? 1
          : (habits.length - missedHabits.length) / habits.length
      const nextRate = Math.max(
        2,
        Math.min(7, Number((prev.exchangeRate + (completionRatio === 1 ? 0.4 : -0.5)).toFixed(1)))
      )
      const newlyUnlocked = badgeSource.filter(
        (badge) =>
          nextHp > 0 &&
          prev.exp >= badge.requirement &&
          !prev.unlockedBadges.includes(badge.id)
      )

      return {
        ...prev,
        hp: nextHp,
        silver: prev.silver + taxSilver,
        food: Math.max(0, nextFood),
        sick: finalSick,
        population: prev.population + cloneBonus,
        day: prev.day + 1,
        leaveTomorrow: false,
        exchangeRate: nextRate,
        unlockedBadges: [
          ...prev.unlockedBadges,
          ...newlyUnlocked.map((badge) => badge.id),
        ],
        history: [
          `Day ${prev.day}: Evaluasi tidur. Penalti HP -${penalty}, pajak +${taxSilver} Silver, makanan +${farmFood}, sakit ${finalSick}.`,
          ...(leaveUsed ? [`Day ${prev.day}: Tiket cuti dipakai, penalti HP dibatalkan.`] : []),
          ...(cloneBonus > 0
            ? [`Day ${prev.day}: Pusat Kloning menambah ${cloneBonus} warga.`]
            : []),
          ...newlyUnlocked.map(
            (badge) => `Day ${prev.day}: Lencana terbuka saat evaluasi: ${badge.name}.`
          ),
          ...prev.history,
        ].slice(0, 80),
        lastEvaluatedDate: todayKey,
      }
    })
  }

  const buyRealityItem = (item: 'espresso' | 'potion' | 'leave') => {
    const items = {
      espresso: { name: 'Kopi Espresso', cost: 15, hp: 10 },
      potion: { name: 'Ramuan Dewa', cost: 45, hp: 30 },
      leave: { name: 'Tiket Cuti', cost: 35, hp: 0 },
    }
    const selected = items[item]

    if (state.gold < selected.cost) return

    setState((prev) => ({
      ...prev,
      gold: prev.gold - selected.cost,
      hp: Math.min(100, prev.hp + selected.hp),
      leaveTomorrow: item === 'leave' ? true : prev.leaveTomorrow,
      history: [
        `Day ${prev.day}: Membeli ${selected.name} dengan ${selected.cost} Gold.`,
        ...prev.history,
      ].slice(0, 80),
    }))
  }

  const buyBuilding = (definition: BuildingDefinition) => {
    const owned = state.buildings[definition.key]
    const cost = calculateBuildingCost(definition, owned)
    if (state.silver < cost) return

    setState((prev) => ({
      ...prev,
      silver: prev.silver - cost,
      buildings: {
        ...prev.buildings,
        [definition.key]: owned + 1,
      },
      housing: definition.key === 'house' ? prev.housing + 5 : prev.housing,
      food:
        definition.key === 'restaurant' ? prev.food + 6 : prev.food,
      population:
        definition.key === 'restaurant' ? prev.population + 2 : prev.population,
      history: [
        `Day ${prev.day}: Membangun ${definition.name} seharga ${cost} Silver.`,
        ...prev.history,
      ].slice(0, 80),
    }))
  }

  const exchangeCurrency = (direction: 'goldToSilver' | 'silverToGold') => {
    setState((prev) => {
      if (direction === 'goldToSilver') {
        if (prev.gold < 10) return prev

        return {
          ...prev,
          gold: prev.gold - 10,
          silver: prev.silver + Math.round(10 * prev.exchangeRate),
          history: [
            `Day ${prev.day}: Bank menukar 10 Gold ke Silver dengan kurs ${prev.exchangeRate}.`,
            ...prev.history,
          ].slice(0, 80),
        }
      }

      const silverCost = Math.round(10 * prev.exchangeRate)
      if (prev.silver < silverCost) return prev

      return {
        ...prev,
        gold: prev.gold + 10,
        silver: prev.silver - silverCost,
        history: [
          `Day ${prev.day}: Bank menukar ${silverCost} Silver ke 10 Gold.`,
          ...prev.history,
        ].slice(0, 80),
      }
    })
  }

  const runTemple = () => {
    if (state.silver < 20) return

    const roll = Math.random()
    let silverReward = 0
    let text = 'Zonk murni.'

    let cumulativeProbability = 0
    for (const reward of gachaSource) {
      cumulativeProbability += reward.prob
      if (roll < cumulativeProbability) {
        silverReward = reward.silverReward
        text = reward.name
        break
      }
    }

    setState((prev) => ({
      ...prev,
      silver: prev.silver - 20 + silverReward,
      history: [
        `Day ${prev.day}: Kuil Keberuntungan: ${text} ${silverReward > 0 ? `+${silverReward} Silver.` : ''}`,
        ...prev.history,
      ].slice(0, 80),
    }))
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-lg bg-slate-950 px-4 py-5 text-white sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-200">CivFit v1.7.0</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Civilization Fitness
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {formatDate(today)} - Minggu ke-{getWeekNumber(today)}, Hari game
              ke-{state.day}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowHistory(true)}>
              Log
            </Button>
            <Button variant="primary" onClick={handleSleep}>
              Tidur & Evaluasi Hari
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-white p-1 shadow-sm">
        <button
          className={`rounded-md px-4 py-3 text-sm font-bold transition ${
            mainTab === 'reality'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setMainTab('reality')}
        >
          REALITA
        </button>
        <button
          className={`rounded-md px-4 py-3 text-sm font-bold transition ${
            mainTab === 'city'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setMainTab('city')}
        >
          KOTA
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['HP', state.hp, 'text-red-600'],
          ['Gold', state.gold, 'text-amber-600'],
          ['Silver', state.silver, 'text-slate-600'],
          ['Level', state.level, 'text-purple-600'],
        ].map(([label, value, color]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {mainTab === 'reality' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Habit Hari Ini</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    Penalti tidur: -8 HP per habit harian yang terlewat, maksimal
                    -30 HP.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingHabit(null)
                    setHabitModalMode('create')
                  }}
                >
                  Kelola Habit
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {habitsLoading ? (
                  <p className="py-6 text-center text-gray-500">
                    Loading habits...
                  </p>
                ) : habits.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-gray-500">
                      Belum ada habit. Buat misi pertama untuk memulai kota.
                    </p>
                    <Button
                      onClick={() => {
                        setEditingHabit(null)
                        setHabitModalMode('create')
                      }}
                    >
                      Buat Habit
                    </Button>
                  </div>
                ) : (
                  habits.map((habit) => {
                    const periodKey = getPeriodKey(habit, today)
                    const periodCount = state.completions[periodKey] || 0
                    const doneToday = completedToday.has(habit.id)
                    const overTarget = periodCount >= habit.target_count

                    return (
                      <div
                        key={habit.id}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                                style={{
                                  backgroundColor: `${habit.color}20`,
                                  color: habit.color,
                                }}
                              >
                                {habit.icon || 'OK'}
                              </span>
                              <div className="min-w-0">
                                <h3 className="truncate font-semibold text-gray-900">
                                  {habit.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {habit.frequency} - target {periodCount}/
                                  {habit.target_count} - {habit.points_per_completion}{' '}
                                  poin
                                </p>
                              </div>
                            </div>
                            {habit.description && (
                              <p className="mt-3 text-sm text-gray-600">
                                {habit.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 sm:min-w-40">
                            <Button
                              size="sm"
                              variant={doneToday ? 'secondary' : 'primary'}
                              isLoading={logLoading}
                              disabled={doneToday}
                              onClick={() => handleLogHabit(habit)}
                            >
                              {doneToday
                                ? 'Selesai Hari Ini'
                                : overTarget
                                  ? 'Selesai +50%'
                                  : 'Tandai Selesai'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingHabit(habit)
                                setHabitModalMode('edit')
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setHabitToDelete(habit)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Progress Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>EXP {state.exp}</span>
                  <span>{levelProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Level berikutnya di {nextLevelRequirement} EXP.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Toko Kebutuhan Realita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ShopButton
                  title="Kopi Espresso"
                  detail="+10 HP"
                  cost="15 Gold"
                  disabled={state.gold < 15}
                  onClick={() => buyRealityItem('espresso')}
                />
                <ShopButton
                  title="Ramuan Dewa"
                  detail="+30 HP"
                  cost="45 Gold"
                  disabled={state.gold < 45}
                  onClick={() => buyRealityItem('potion')}
                />
                <ShopButton
                  title="Tiket Cuti"
                  detail="Kebal penalti HP besok"
                  cost="35 Gold"
                  disabled={state.gold < 35}
                  onClick={() => buyRealityItem('leave')}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Populasi', state.population],
              ['Sehat', healthyPopulation],
              ['Sakit', state.sick],
              ['Makanan', state.food],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ['visualization', '🏙️ Panorama'],
              ['map', '🗺️ Peta'],
              ['scene', '🎬 Animasi'],
              ['buildings', '🏬 Toko Kota'],
              ['bank', '🏦 Bank'],
              ['temple', '⛩️ Kuil'],
            ].map(([id, label]) => (
              <Button
                key={id}
                variant={cityTab === id ? 'primary' : 'secondary'}
                onClick={() => setCityTab(id as CityTab)}
              >
                {label}
              </Button>
            ))}
          </div>

          {cityTab === 'visualization' && (
            <CityVisualization
              population={state.population}
              healthyPopulation={healthyPopulation}
              sick={state.sick}
              food={state.food}
              housing={state.housing}
              level={state.level}
              buildings={state.buildings}
            />
          )}

          {cityTab === 'map' && (
            <BuildingMap
              buildings={state.buildings}
              population={state.population}
              level={state.level}
            />
          )}

          {cityTab === 'scene' && (
            <AnimatedCityScene
              population={state.population}
              healthyPopulation={healthyPopulation}
              sick={state.sick}
              buildings={state.buildings}
              level={state.level}
            />
          )}

          {cityTab === 'buildings' && (
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Toko Kota</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    Bangunan dibeli memakai Silver. Harga naik 30% setiap
                    pembelian.
                  </p>
                </div>
                <Button
                  variant={state.cloneEnabled ? 'primary' : 'secondary'}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      cloneEnabled: !prev.cloneEnabled,
                    }))
                  }
                >
                  Kloning {state.cloneEnabled ? 'ON' : 'OFF'}
                </Button>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {buildingsSource.map((building) => {
                  const owned = state.buildings[building.key]
                  const cost = calculateBuildingCost(building, owned)

                  return (
                    <div
                      key={building.key}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {building.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {building.description}
                          </p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                          x{owned}
                        </span>
                      </div>
                      <Button
                        className="mt-4 w-full"
                        disabled={state.silver < cost}
                        onClick={() => buyBuilding(building)}
                      >
                        Beli - {cost} Silver
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {cityTab === 'bank' && (
            <Card>
              <CardHeader>
                <CardTitle>Bursa Penukaran</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Kurs hari ini</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    1 Gold🪙= {state.exchangeRate} Silver🥈
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Kurs naik jika semua habit aman saat evaluasi, turun jika
                    ada yang bolong.
                  </p>
                </div>
                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <Button
                    className="w-full"
                    disabled={state.gold < 10}
                    onClick={() => exchangeCurrency('goldToSilver')}
                  >
                    Tukar 10 Gold ke Silver
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled={state.silver < Math.round(10 * state.exchangeRate)}
                    onClick={() => exchangeCurrency('silverToGold')}
                  >
                    Tukar Silver ke 10 Gold
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {cityTab === 'temple' && (
            <Card>
              <CardHeader>
                <CardTitle>Kuil Keberuntungan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-500">
                  Biaya 20 Silver. Zonk murni 10%, receh 45%, sisanya hadiah
                  sedang atau jackpot.
                </p>
                <Button disabled={state.silver < 20} onClick={runTemple}>
                  Coba Gacha
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {habitModalMode && (
        <Modal
          onClose={() => {
            setHabitModalMode(null)
            setEditingHabit(null)
          }}
        >
          <CreateHabitForm
            key={editingHabit?.id || 'create'}
            initialData={editingHabit}
            title={habitModalMode === 'edit' ? 'Edit Habit' : 'Tambah Habit'}
            submitLabel={habitModalMode === 'edit' ? 'Simpan Habit' : 'Buat Habit'}
            onSubmit={habitModalMode === 'edit' ? handleEditHabit : handleCreateHabit}
            onCancel={() => {
              setHabitModalMode(null)
              setEditingHabit(null)
            }}
          />
        </Modal>
      )}

      {habitToDelete && (
        <Modal onClose={() => setHabitToDelete(null)}>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hapus Habit?</h2>
              <p className="mt-2 text-gray-600">
                Habit &quot;{habitToDelete.name}&quot; akan disembunyikan dari daftar
                aktif. Ini memakai pop-up game, bukan window.confirm browser.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setHabitToDelete(null)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteHabit}>
                Hapus Habit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showHistory && (
        <Modal onClose={() => setShowHistory(false)}>
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Buku Log Sejarah
            </h2>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto">
              {state.history.map((entry, index) => (
                <div
                  key={`${entry}-${index}`}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {celebration && (
        <Modal onClose={() => setCelebration(null)}>
          <div className="py-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">
              Perayaan Level
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {celebration}
            </h2>
            <p className="mt-3 text-gray-600">
              EXP scaling baru aktif: 100, 250, 450, 700, 1000, lalu meningkat
              bertahap.
            </p>
            <Button className="mt-6" onClick={() => setCelebration(null)}>
              Lanjut
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ShopButton({
  title,
  detail,
  cost,
  disabled,
  onClick,
}: {
  title: string
  detail: string
  cost: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-3 text-left transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      <span>
        <span className="block font-semibold text-gray-900">{title}</span>
        <span className="block text-sm text-gray-500">{detail}</span>
      </span>
      <span className="shrink-0 text-sm font-bold text-gray-700">{cost}</span>
    </button>
  )
}
