import { getServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface BadgeConfig {
  id: string
  name: string
  min_points: number
}

export async function GET() {
  try {
    const supabase = await getServerClient()

    const { data: badges, error } = await supabase
      .from('badges')
      .select('id, name, min_points')
      .order('min_points', { ascending: true })

    if (error) {
      const code =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code?: unknown }).code === 'string'
          ? (error as { code: string }).code
          : null

      if (code === 'PGRST205') {
        console.warn(
          'badges table missing (PGRST205). Returning empty badges list.'
        )
        return NextResponse.json({ badges: [] }, { status: 200 })
      }

      throw error
    }

    // Transform to frontend format
    const transformedBadges = (badges || []).map((badge: BadgeConfig) => ({
      id: badge.id,
      name: badge.name,
      requirement: badge.min_points,
    }))

    return NextResponse.json({ badges: transformedBadges })
  } catch (error) {
    console.error('Error fetching badges config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
