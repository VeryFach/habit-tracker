import { getServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const { habit_id, notes } = body

        if (!habit_id) {
            return NextResponse.json(
                { error: 'habit_id is required' },
                { status: 400 }
            )
        }

        // Check if already logged today
        const today = new Date().toISOString().split('T')[0]
        const { data: existingLog } = await supabase
            .from('habit_logs')
            .select('id')
            .eq('habit_id', habit_id)
            .eq('user_id', user.id)
            .gte('completed_at', `${today}T00:00:00`)
            .lt('completed_at', `${today}T23:59:59`)
            .single()

        if (existingLog) {
            return NextResponse.json(
                { error: 'Already logged today' },
                { status: 400 }
            )
        }

        // Get habit details
        const { data: habit, error: habitError } = await supabase
            .from('habits')
            .select('*')
            .eq('id', habit_id)
            .eq('user_id', user.id)
            .single()

        if (habitError || !habit) {
            return NextResponse.json(
                { error: 'Habit not found' },
                { status: 404 }
            )
        }

        // Create log entry
        const { data: log, error: logError } = await supabase
            .from('habit_logs')
            .insert({
                habit_id,
                user_id: user.id,
                notes,
                points_earned: habit.points_per_completion,
            })
            .select()

        if (logError) throw logError

        // Update user points
        const { data: userData } = await supabase
            .from('users')
            .select('total_points, current_level')
            .eq('id', user.id)
            .single()

        const newTotal =
            (userData?.total_points || 0) + habit.points_per_completion

        await supabase
            .from('users')
            .update({ total_points: newTotal })
            .eq('id', user.id)

        // Create points history
        await supabase.from('points_history').insert({
            user_id: user.id,
            points_change: habit.points_per_completion,
            reason: 'habit_completion',
            related_habit_id: habit_id,
        })

        // Update streak
        const { data: streak } = await supabase
            .from('habit_streaks')
            .select('*')
            .eq('habit_id', habit_id)
            .eq('user_id', user.id)
            .single()

        let currentStreak = 1
        let longestStreak = 1

        if (streak) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            const { data: yesterdayLog } = await supabase
                .from('habit_logs')
                .select('id')
                .eq('habit_id', habit_id)
                .eq('user_id', user.id)
                .gte('completed_at', `${yesterdayStr}T00:00:00`)
                .lt('completed_at', `${yesterdayStr}T23:59:59`)
                .single()

            currentStreak = yesterdayLog ? streak.current_streak + 1 : 1
            longestStreak = Math.max(currentStreak, streak.longest_streak)

            await supabase
                .from('habit_streaks')
                .update({
                    current_streak: currentStreak,
                    longest_streak: longestStreak,
                    last_completed_date: today,
                })
                .eq('habit_id', habit_id)
                .eq('user_id', user.id)
        }

        // Check for badge unlocks
        const newBadges: string[] = []
        const { data: badges } = await supabase
            .from('badges')
            .select('*')
            .lte('min_points', newTotal)

        if (badges) {
            for (const badge of badges) {
                const { data: userBadge } = await supabase
                    .from('user_badges')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('badge_id', badge.id)
                    .single()

                if (!userBadge) {
                    await supabase.from('user_badges').insert({
                        user_id: user.id,
                        badge_id: badge.id,
                    })

                    newBadges.push(badge.name)

                    // Add bonus points for achievement
                    await supabase
                        .from('users')
                        .update({ total_points: newTotal + 50 })
                        .eq('id', user.id)

                    await supabase.from('points_history').insert({
                        user_id: user.id,
                        points_change: 50,
                        reason: 'achievement_unlock',
                        related_badge_id: badge.id,
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            points_earned: habit.points_per_completion,
            total_points: newTotal,
            current_streak: currentStreak,
            new_badges_unlocked: newBadges,
            log: log?.[0],
        })
    } catch (error) {
        console.error('Error logging habit:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
