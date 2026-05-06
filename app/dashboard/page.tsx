'use client'

import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { HabitList } from '@/components/HabitList'
import { ProgressCard } from '@/components/ProgressCard'
import { useHabitLog } from '@/hooks/useHabitLog'
import { useHabits } from '@/hooks/useHabits'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { CreateHabitForm } from './components/CreateHabitForm'

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { habits, loading: habitsLoading, createHabit } = useHabits(userId)
  const { logs, loading: logLoading, logHabit } = useHabitLog(userId)
  const { user } = useUser(userId)

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

  const todayHabits = habits.filter((h) => h.frequency === 'daily')

  const handleCreateHabit = async (data: any) => {
    await createHabit({
      ...data,
      user_id: userId!,
    })
    setShowCreateForm(false)
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Daily Mission Section */}
      <Card>
        <CardContent className="p-5 text-center sm:p-8">
          <p className="text-4xl mb-4">🎯</p>
          <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            One Day, One Mission
          </h2>
          <p className="text-gray-600 mb-4">What's yours today?</p>
          <p className="text-sm text-gray-500">
            You have <span className="font-bold">{todayHabits.length}</span> habits scheduled for today
          </p>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {user && <ProgressCard user={user} />}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="flex-1"
        >
          + Create New Habit
        </Button>
      </div>

      {/* Create Habit Form */}
      {showCreateForm && (
        <CreateHabitForm
          onSubmit={handleCreateHabit}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Today's Habits */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Today's Habits</h2>
        {habitsLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500 sm:p-8">
              Loading habits...
            </CardContent>
          </Card>
        ) : (
          <HabitList
            habits={todayHabits}
            logs={logs}
            streaks={logs.reduce((acc: any, log) => acc, {})}
            isLogging={logLoading}
            onLogHabit={logHabit}
            onCreateHabit={() => setShowCreateForm(true)}
          />
        )}
      </div>
    </div>
  )
}
