import { createClient } from './supabase'

export async function getCurrentUser() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
}

export async function signUp(email: string, password: string, username: string) {
    const supabase = createClient()

    // Sign up - Supabase Auth will handle email validation
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    // Handle specific Supabase Auth errors
    if (authError) {
        if (
            authError.message?.includes('already registered') ||
            authError.message?.includes('already exist') ||
            authError.message?.includes('duplicate')
        ) {
            throw new Error('This email is already registered. Please login instead.')
        }
        throw authError
    }

    // Create user profile
    if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            email,
            username,
            total_points: 0,
            current_level: 'Beginner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw - auth user is created, profile will be created on first login
        }
    }

    return authData
}

export async function signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error
    return data
}

export async function signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getUserProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data
}

export async function updateUserProfile(
    userId: string,
    updates: Partial<any>
) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('users')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}
