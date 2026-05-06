'use client'

import { getLevelColor, getPointsToNextLevel } from '@/lib/utils'
import type { User } from '@/types/database'
import { Card, CardContent } from './Card'

interface ProgressCardProps {
  user: User | null
}

export function ProgressCard({ user }: ProgressCardProps) {
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading user data...</p>
        </CardContent>
      </Card>
    )
  }

  const level = user.current_level
  const pointsToNext = getPointsToNextLevel(user.total_points)
  const levelProgress = (() => {
    const levelRanges = {
      Beginner: { min: 0, max: 10 },
      Novice: { min: 10, max: 50 },
      Intermediate: { min: 50, max: 100 },
      Advanced: { min: 100, max: 300 },
      Master: { min: 300, max: 300 },
    }

    const range =
      levelRanges[level as keyof typeof levelRanges]

    if (!range) return 0

    if (level === 'Master') return 100

    return Math.round(
      ((user.total_points - range.min) /
        (range.max - range.min)) *
        100
    )
  })()

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          {/* Points */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Total Points</p>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{user.total_points}</p>
          </div>

          {/* Level */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Level</p>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: getLevelColor(level) }}
              >
                {level[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{level}</p>
                <p className="text-xs text-gray-500">{pointsToNext} more pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 sm:mt-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">Progress to Next Level</p>
            <p className="text-sm text-gray-500">{levelProgress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(Math.max(levelProgress, 0), 100)}%`,
                backgroundColor: getLevelColor(level),
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
