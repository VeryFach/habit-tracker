import { getServerClient } from '@/lib/supabase'
import type { Habit } from '@/types/database'
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
        const frequency = searchParams.get('frequency')

        let query = supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (frequency) {
            query = query.eq('frequency', frequency)
        }

        const { data: habits, error } = await query

        if (error) throw error

        return NextResponse.json(habits)
    } catch (error) {
        console.error('Error fetching habits:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        const habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id,
            name: body.name,
            description: body.description,
            category: body.category,
            frequency: body.frequency || 'daily',
            target_count: body.target_count || 1,
            points_per_completion: body.points_per_completion || 10,
            color: body.color || '#FF6B6B',
            icon: body.icon || '✅',
            is_active: true,
            start_date: new Date().toISOString().split('T')[0],
        }

        const { data: habit, error } = await supabase
            .from('habits')
            .insert(habitData)
            .select()

        if (error) throw error

        if (habit?.[0]) {
            // Create streak entry
            await supabase.from('habit_streaks').insert({
                habit_id: habit[0].id,
                user_id: user.id,
                current_streak: 0,
                longest_streak: 0,
            })
        }

        return NextResponse.json(habit?.[0], { status: 201 })
    } catch (error) {
        console.error('Error creating habit:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
