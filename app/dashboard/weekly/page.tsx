'use client'

import { Card, CardContent } from '@/components/Card'
import { ProgressBar } from '@/components/ProgressBar'
import { useHabits } from '@/hooks/useHabits'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function WeeklyPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { habits } = useHabits(userId)

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

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId) return

      try {
        const response = await fetch('/api/progress?period=weekly')
        const data = await response.json()
        setProgressData(data)
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [userId])

  const weeklyHabits = habits.filter((h) => h.frequency === 'weekly')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Weekly Progress</h1>
        <p className="text-gray-600">Track your habits for this week</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Loading progress data...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {progressData?.progress && progressData.progress.length > 0 ? (
            progressData.progress.map((item: any) => (
              <ProgressBar
                key={item.habit_id}
                label={item.name}
                completed={item.completed_count}
                target={item.target_count}
                icon="✅"
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No habits to track this week
              </CardContent>
            </Card>
          )}

          {progressData && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-700">
                  Overall Weekly Completion
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {progressData.total_completion}%
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
