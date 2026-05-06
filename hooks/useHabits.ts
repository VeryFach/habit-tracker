'use client'

import { createClient } from '@/lib/supabase'
import type { Habit } from '@/types/database'
import { useCallback, useEffect, useState } from 'react'

function getTodayDateString() {
    const today = new Date()
    const timezoneOffset = today.getTimezoneOffset() * 60000
    return new Date(today.getTime() - timezoneOffset).toISOString().split('T')[0]
}

export function useHabits(userId: string | null) {
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchHabits = async () => {
            try {
                setLoading(true)
                const supabase = createClient()
                const { data, error: err } = await supabase
                    .from('habits')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                if (err) throw err
                setHabits(data || [])
                setError(null)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchHabits()

        // Subscribe to changes
        const supabase = createClient()
        const subscription = supabase
            .channel(`habits:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'habits',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchHabits()
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [userId])

    const createHabit = useCallback(
        async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
            if (!userId) throw new Error('No user ID')

            try {
                const supabase = createClient()
                const { data, error: err } = await supabase
                    .from('habits')
                    .insert({
                        ...habitData,
                        user_id: userId,
                        start_date: habitData.start_date || getTodayDateString(),
                    })
                    .select()

                if (err) throw err

                if (data?.[0]) {
                    // Create streak entry
                    await supabase.from('habit_streaks').insert({
                        habit_id: data[0].id,
                        user_id: userId,
                        current_streak: 0,
                        longest_streak: 0,
                    })

                    setHabits((prev) => [data[0], ...prev])
                }

                return data?.[0]
            } catch (err) {
                setError(err as Error)
                throw err
            }
        },
        [userId]
    )

    const updateHabit = useCallback(
        async (habitId: string, updates: Partial<Habit>) => {
            if (!userId) throw new Error('No user ID')

            try {
                const supabase = createClient()
                const { data, error: err } = await supabase
                    .from('habits')
                    .update(updates)
                    .eq('id', habitId)
                    .eq('user_id', userId)
                    .select()

                if (err) throw err

                if (data?.[0]) {
                    setHabits((prev) =>
                        prev.map((h) => (h.id === habitId ? data[0] : h))
                    )
                }

                return data?.[0]
            } catch (err) {
                setError(err as Error)
                throw err
            }
        },
        [userId]
    )

    const deleteHabit = useCallback(
        async (habitId: string) => {
            if (!userId) throw new Error('No user ID')

            try {
                const supabase = createClient()
                const { error: err } = await supabase
                    .from('habits')
                    .update({ is_active: false })
                    .eq('id', habitId)
                    .eq('user_id', userId)

                if (err) throw err

                setHabits((prev) => prev.filter((h) => h.id !== habitId))
            } catch (err) {
                setError(err as Error)
                throw err
            }
        },
        [userId]
    )

    const getTodayHabits = useCallback(() => {
        return habits.filter((h) => h.frequency === 'daily')
    }, [habits])

    const getWeeklyHabits = useCallback(() => {
        return habits.filter((h) => h.frequency === 'weekly')
    }, [habits])

    return {
        habits,
        loading,
        error,
        createHabit,
        updateHabit,
        deleteHabit,
        getTodayHabits,
        getWeeklyHabits,
    }
}
