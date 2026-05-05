import { getServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
        const habitId = id

        const { data: habit, error } = await supabase
            .from('habits')
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq('id', habitId)
            .eq('user_id', user.id)
            .select()

        if (error) throw error

        if (!habit || habit.length === 0) {
            return NextResponse.json(
                { error: 'Habit not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(habit[0])
    } catch (error) {
        console.error('Error updating habit:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const habitId = id

        // Soft delete by marking as inactive
        const { data: habit, error } = await supabase
            .from('habits')
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', habitId)
            .eq('user_id', user.id)
            .select()

        if (error) throw error

        if (!habit || habit.length === 0) {
            return NextResponse.json(
                { error: 'Habit not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting habit:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
