import { getServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface GachaReward {
  id: string
  name: string
  silver_reward: number
  probability: number
  reward_type: string
}

export async function GET() {
  try {
    const supabase = await getServerClient()

    const { data: rewards, error } = await supabase
      .from('gacha_rewards')
      .select('*')
      .order('created_at', { ascending: true })

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
          'gacha_rewards table missing (PGRST205). Returning empty gacha_rewards list.'
        )
        return NextResponse.json({ gacha_rewards: [] }, { status: 200 })
      }

      throw error
    }

    // Transform to frontend format
    const transformedRewards = (rewards || []).map((reward: GachaReward) => ({
      name: reward.name,
      silverReward: reward.silver_reward,
      prob: reward.probability,
      type: reward.reward_type,
    }))

    return NextResponse.json({ gacha_rewards: transformedRewards })
  } catch (error) {
    console.error('Error fetching gacha rewards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
