'use client'

import type { Badge } from '@/types/database'
import { Card, CardContent } from './Card'

interface AchievementCardProps {
  badge: Badge & {
    is_unlocked: boolean
    progress: number
    points_needed: number
  }
}

export function AchievementCard({ badge }: AchievementCardProps) {
  return (
    <Card className={badge.is_unlocked ? '' : 'opacity-50'}>
      <CardContent className="p-4">
        <div className="text-center">
          <div className="text-4xl mb-2">
            {badge.is_unlocked ? '🏆' : '🔒'}
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">{badge.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{badge.description}</p>

          {!badge.is_unlocked && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 mb-1">
                {Math.round(badge.progress)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {badge.points_needed} pts needed
              </p>
            </div>
          )}

          {badge.is_unlocked && (
            <p className="text-xs text-green-600 font-medium mt-2">✓ Unlocked</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
