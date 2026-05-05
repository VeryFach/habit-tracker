'use client'

import { createClient } from '@/lib/supabase'
import type { User, WeeklyProgress } from '@/types/database'
import { useCallback, useEffect, useState } from 'react'

export function useUser(userId: string | null) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchUser = async () => {
            try {
                setLoading(true)
                const supabase = createClient()
                const { data, error: err } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single()

                if (err) throw err
                setUser(data || null)
                setError(null)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()

        // Subscribe to changes
        const supabase = createClient()
        const subscription = supabase
            .channel(`user:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${userId}`,
                },
                (payload: { new: User }) => {
                    setUser(payload.new)
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [userId])

    const updateProfile = useCallback(
        async (updates: Partial<User>) => {
            if (!userId) throw new Error('No user ID')

            try {
                const supabase = createClient()
                const { data, error: err } = await supabase
                    .from('users')
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId)
                    .select()
                    .single()

                if (err) throw err
                setUser(data)
                return data
            } catch (err) {
                setError(err as Error)
                throw err
            }
        },
        [userId]
    )

    return { user, loading, error, updateProfile }
}

export function useProgress(userId: string | null) {
    const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchProgress = async () => {
            try {
                setLoading(true)
                const supabase = createClient()

                // Get current week
                const today = new Date()
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - today.getDay() + 1)
                const weekStartStr = weekStart.toISOString().split('T')[0]

                const { data, error: err } = await supabase
                    .from('weekly_progress')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('week_start_date', weekStartStr)

                if (err) throw err
                setWeeklyProgress(data || [])
                setError(null)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [userId])

    return { weeklyProgress, loading, error }
}
