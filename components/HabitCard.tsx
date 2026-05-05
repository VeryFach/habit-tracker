'use client'

import type { Habit } from '@/types/database'
import { useState } from 'react'
import { Button } from './Button'
import { Card, CardContent } from './Card'

interface HabitCardProps {
  habit: Habit
  isCompletedToday: boolean
  currentStreak: number
  onComplete: () => void | Promise<void>
  onEdit?: () => void
}

export function HabitCard({
  habit,
  isCompletedToday,
  currentStreak,
  onComplete,
  onEdit,
}: HabitCardProps) {
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    try {
      setLoading(true)
      await onComplete()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{habit.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900">{habit.name}</h4>
                <p className="text-sm text-gray-500">
                  {habit.category} • {habit.points_per_completion} pts
                </p>
              </div>
            </div>

            {currentStreak > 0 && (
              <div className="mt-2 inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                🔥 {currentStreak} day streak
              </div>
            )}
          </div>

          <div className="text-right">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: habit.color + '20',
                color: habit.color,
              }}
            >
              {isCompletedToday ? '✓' : '○'}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant={isCompletedToday ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1"
            isLoading={loading}
            onClick={handleComplete}
            disabled={isCompletedToday}
          >
            {isCompletedToday ? '✓ Completed' : 'Mark Done'}
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
