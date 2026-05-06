'use client'

import { getLevelColor, getPointsToNextLevel } from '@/lib/utils'
import type { User } from '@/types/database'
import { Card, CardContent } from './Card'

interface ProgressCardProps {
  user: User | null
}

function getLevelInfo(points: number) {
  if (points < 10) {
    return {
      level: 'Beginner',
      min: 0,
      max: 10,
    }
  }

  if (points < 50) {
    return {
      level: 'Novice',
      min: 10,
      max: 50,
    }
  }

  if (points < 100) {
    return {
      level: 'Intermediate',
      min: 50,
      max: 100,
    }
  }

  if (points < 300) {
    return {
      level: 'Advanced',
      min: 100,
      max: 300,
    }
  }

  return {
    level: 'Master',
    min: 300,
    max: 300,
  }
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

  // Get level information based on total points
  const levelInfo = getLevelInfo(user.total_points)

  const level = levelInfo.level
  const pointsToNext = getPointsToNextLevel(user.total_points)

  // Calculate progress safely
  const levelProgress =
    level === 'Master'
      ? 100
      : Math.round(
          ((user.total_points - levelInfo.min) /
            (levelInfo.max - levelInfo.min)) *
            100
        )

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          {/* Points */}
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Total Points
            </p>

            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {user.total_points}
            </p>
          </div>

          {/* Level */}
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Level
            </p>

            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{
                  backgroundColor: getLevelColor(level),
                }}
              >
                {level[0]}
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  {level}
                </p>

                <p className="text-xs text-gray-500">
                  {pointsToNext} more pts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 sm:mt-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">
              Progress to Next Level
            </p>

            <p className="text-sm text-gray-500">
              {levelProgress}%
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  Math.max(levelProgress, 0),
                  100
                )}%`,
                backgroundColor: getLevelColor(level),
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}