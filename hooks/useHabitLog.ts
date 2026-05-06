'use client'

import { createClient } from '@/lib/supabase'
import type { HabitLog, HabitLogResponse, HabitStreak } from '@/types/database'
import { useCallback, useEffect, useState } from 'react'

export function useHabitLog(userId: string | null) {
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [streaks, setStreaks] = useState<Record<string, HabitStreak>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!userId) return

        const fetchData = async () => {
            try {
                const supabase = createClient()

                // Fetch logs
                const { data: logsData, error: logsError } = await supabase
                    .from('habit_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('completed_at', { ascending: false })
                    .limit(50)

                if (logsError) throw logsError

                // Fetch streaks
                const { data: streaksData, error: streaksError } = await supabase
                    .from('habit_streaks')
                    .select('*')
                    .eq('user_id', userId)

                if (streaksError) throw streaksError

                setLogs(logsData || [])
                const streaksMap = (streaksData || []).reduce(
                    (acc: Record<string, HabitStreak>, streak: HabitStreak) => {
                        acc[streak.habit_id] = streak
                        return acc
                    },
                    {}
                )
                setStreaks(streaksMap)
            } catch (err) {
                setError(err as Error)
            }
        }

        fetchData()
    }, [userId])

    const logHabit = useCallback(
        async (habitId: string, notes?: string): Promise<HabitLogResponse> => {
            if (!userId) throw new Error('No user ID')

            try {
                setLoading(true)

                const supabase = createClient()
                const {
                    data: { session },
                } = await supabase.auth.getSession()

                if (!session?.access_token) {
                    throw new Error('Unauthorized')
                }

                const response = await fetch('/api/habits/log', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        habit_id: habitId,
                        notes,
                    }),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to log habit')
                }

                const data = await response.json()

                // Update logs optimistically
                const { data: newLog } = await supabase
                    .from('habit_logs')
                    .select('*')
                    .eq('habit_id', habitId)
                    .eq('user_id', userId)
                    .order('completed_at', { ascending: false })
                    .limit(1)
                    .single()

                if (newLog) {
                    setLogs((prev) => [newLog, ...prev])
                }

                setError(null)
                return data
            } catch (err) {
                const error = err as Error
                setError(error)
                throw error
            } finally {
                setLoading(false)
            }
        },
        [userId]
    )

    const getTodayLogs = useCallback(
        (habitId: string) => {
            const today = new Date().toISOString().split('T')[0]
            return logs.filter(
                (log) =>
                    log.habit_id === habitId &&
                    log.completed_at.startsWith(today)
            )
        },
        [logs]
    )

    return {
        logs,
        streaks,
        loading,
        error,
        logHabit,
        getTodayLogs,
    }
}
