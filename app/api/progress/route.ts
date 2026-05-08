import { getServerClient } from '@/lib/supabase'
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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'weekly'

    // Get current week
    const today = new Date()
    const dateFrom = new Date()

    if (period === 'daily') {
      dateFrom.setHours(0, 0, 0, 0)
    } else if (period === 'weekly') {
      dateFrom.setDate(today.getDate() - today.getDay() + 1)
      dateFrom.setHours(0, 0, 0, 0)
    } else if (period === 'monthly') {
      dateFrom.setDate(1)
      dateFrom.setHours(0, 0, 0, 0)
    }

    const dateFromStr = dateFrom.toISOString()

    // Get habits with logs
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, name, target_count, frequency')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (habitsError) throw habitsError

    // Get logs for period
    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('user_id', user.id)
      .gte('completed_at', dateFromStr)

    if (logsError) throw logsError

    // Group logs by habit_id on client
    const logsByHabit: Record<string, number> = {}
    ;(logs || []).forEach((log: { habit_id: string }) => {
      logsByHabit[log.habit_id] = (logsByHabit[log.habit_id] || 0) + 1
    })

    // Calculate progress
    const progress = (habits || []).map((habit) => {
      const completed = logsByHabit[habit.id] || 0
      const percentage = Math.min(
        (completed / habit.target_count) * 100,
        100
      )

      return {
        habit_id: habit.id,
        name: habit.name,
        completed_count: completed,
        target_count: habit.target_count,
        completion_percentage: Math.round(percentage),
      }
    })

    return NextResponse.json({
      period,
      progress,
      total_completion: Math.round(
        progress.length > 0
          ? progress.reduce((a, p) => a + p.completion_percentage, 0) /
              progress.length
          : 0
      ),
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
