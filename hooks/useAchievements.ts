'use client'

import { createClient } from '@/lib/supabase'
import type { Badge, UserBadge } from '@/types/database'
import { useCallback, useEffect, useState } from 'react'

export function useAchievements(userId: string | null) {
    const [allBadges, setAllBadges] = useState<Badge[]>([])
    const [unlockedBadges, setUnlockedBadges] = useState<UserBadge[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                setLoading(true)
                const supabase = createClient()

                // Get all badges
                const { data: badges, error: badgesError } = await supabase
                    .from('badges')
                    .select('*')
                    .order('min_points', { ascending: true })

                if (badgesError) throw badgesError
                setAllBadges(badges || [])

                // Get user's unlocked badges
                if (userId) {
                    const { data: userBadges, error: userBadgesError } = await supabase
                        .from('user_badges')
                        .select('*')
                        .eq('user_id', userId)

                    if (userBadgesError) throw userBadgesError
                    setUnlockedBadges(userBadges || [])
                }

                setError(null)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchBadges()
    }, [userId])

    const getUnlockedBadgeIds = useCallback(() => {
        return new Set(unlockedBadges.map((b) => b.badge_id))
    }, [unlockedBadges])

    const getBadgeProgress = useCallback(
        (badge: Badge, userPoints: number) => {
            const progress = Math.min((userPoints / badge.min_points) * 100, 100)
            return {
                progress,
                isUnlocked: getUnlockedBadgeIds().has(badge.id),
                pointsNeeded: Math.max(0, badge.min_points - userPoints),
            }
        },
        [getUnlockedBadgeIds]
    )

    return {
        allBadges,
        unlockedBadges,
        loading,
        error,
        getUnlockedBadgeIds,
        getBadgeProgress,
    }
}
