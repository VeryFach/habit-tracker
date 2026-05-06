'use client'

import type { Habit, HabitLog, HabitLogResponse, HabitStreak } from '@/types/database'
import { useState } from 'react'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { HabitCard } from './HabitCard'
import { QuickLogModal } from './QuickLogModal'

interface HabitListProps {
  habits: Habit[]
  logs: HabitLog[]
  streaks: Record<string, HabitStreak>
  isLogging?: boolean
  onLogHabit: (habitId: string, notes?: string) => Promise<HabitLogResponse | void>
  onCreateHabit?: () => void
}

export function HabitList({
  habits,
  logs,
  streaks,
  isLogging = false,
  onLogHabit,
  onCreateHabit,
}: HabitListProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const handleOpenLog = (habit: Habit) => {
    setSelectedHabitId(habit.id)
    setSelectedHabitName(habit.name)
  }

  const handleLogHabit = async (notes?: string) => {
    if (!selectedHabitId) return
    await onLogHabit(selectedHabitId, notes)
    setSelectedHabitId(null)
  }

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 mb-4">No habits yet. Create your first habit!</p>
          {onCreateHabit && (
            <Button variant="primary" onClick={onCreateHabit}>
              + Create Habit
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const habitLogs = logs.filter(
          (log) =>
            log.habit_id === habit.id && log.completed_at.startsWith(today)
        )
        const isCompletedToday = habitLogs.length > 0
        const streak = streaks[habit.id]
        const currentStreak = streak?.current_streak || 0

        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            isCompletedToday={isCompletedToday}
            currentStreak={currentStreak}
            onComplete={() => handleOpenLog(habit)}
          />
        )
      })}

      <QuickLogModal
        isOpen={selectedHabitId !== null}
        habitName={selectedHabitName}
        isLoading={isLogging}
        onSubmit={handleLogHabit}
        onClose={() => setSelectedHabitId(null)}
      />
    </div>
  )
}
