import { getServerClient } from '@/lib/supabase'
import { Badge } from '@/types/database'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await getServerClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get all badges
        const { data: allBadges, error: badgesError } = await supabase
            .from('badges')
            .select('*')
            .order('min_points', { ascending: true })

        if (badgesError) throw badgesError

        // Get user's unlocked badges
        const { data: userBadges, error: userBadgesError } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', user.id)

        if (userBadgesError) throw userBadgesError

        // Get user's current points
        const { data: userData } = await supabase
            .from('users')
            .select('total_points')
            .eq('id', user.id)
            .single()

        const userPoints = userData?.total_points || 0
        const unlockedBadgeIds = new Set(
            (userBadges || []).map((b: { badge_id: string }) => b.badge_id)
        )

        // Calculate badge progress
        const badgesWithProgress = (allBadges || []).map((badge: Badge) => ({
            ...badge,
            is_unlocked: unlockedBadgeIds.has(badge.id),
            progress: Math.min((userPoints / badge.min_points) * 100, 100),
            points_needed: Math.max(0, badge.min_points - userPoints),
        }))

        return NextResponse.json({
            all_badges: badgesWithProgress,
            unlocked_count: userBadges?.length || 0,
            total_badges: allBadges?.length || 0,
        })
    } catch (error) {
        console.error('Error fetching achievements:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
