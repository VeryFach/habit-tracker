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
    const levels: Record<string, number> = { Beginner: 10, Novice: 50, Intermediate: 100, Advanced: 300, Master: Infinity }
    const current = levels[level as keyof typeof levels] || 0
    const prev: Record<string, number> = {
      Beginner: 0,
      Novice: 10,
      Intermediate: 50,
      Advanced: 100,
      Master: 300,
    }
    return Math.round(((user.total_points - (prev[level] || 0)) / (current - (prev[level] || 0))) * 100)
  })()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Points */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Total Points</p>
            <p className="text-3xl font-bold text-gray-900">{user.total_points}</p>
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
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Progress to Next Level</p>
            <p className="text-sm text-gray-500">{levelProgress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${levelProgress}%`,
                backgroundColor: getLevelColor(level),
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
