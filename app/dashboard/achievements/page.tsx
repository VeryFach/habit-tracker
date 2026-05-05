'use client'

import { AchievementCard } from '@/components/AchievementCard'
import { Card, CardContent } from '@/components/Card'
import { useAchievements } from '@/hooks/useAchievements'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function AchievementsPage() {
  const [userId, setUserId] = useState<string | null>(null)

  const { user } = useUser(userId)
  const { allBadges, unlockedBadges, loading } = useAchievements(userId)

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

  const unlockedBadgeIds = new Set(unlockedBadges.map((b) => b.badge_id))

  const badgesWithProgress = allBadges.map((badge) => ({
    ...badge,
    is_unlocked: unlockedBadgeIds.has(badge.id),
    progress: user
      ? Math.min((user.total_points / badge.min_points) * 100, 100)
      : 0,
    points_needed: user ? Math.max(0, badge.min_points - user.total_points) : badge.min_points,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Achievements</h1>
        <p className="text-gray-600">Unlock badges and earn rewards</p>
      </div>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{unlockedBadges.length}</p>
              <p className="text-sm opacity-90">Unlocked</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{allBadges.length}</p>
              <p className="text-sm opacity-90">Total</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {Math.round(
                  (unlockedBadges.length / allBadges.length) * 100 || 0
                )}%
              </p>
              <p className="text-sm opacity-90">Completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Loading achievements...
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badgesWithProgress.map((badge) => (
            <AchievementCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  )
}
