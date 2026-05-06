import { createClient } from './supabase'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'

function getProfileUsername(authUser: SupabaseAuthUser, username?: string) {
    const metadataUsername = authUser.user_metadata?.username
    const emailName = authUser.email?.split('@')[0]
    const fallback = `user-${authUser.id.slice(0, 8)}`

    return username || (typeof metadataUsername === 'string' && metadataUsername) || emailName || fallback
}

export async function ensureUserProfile(authUser: SupabaseAuthUser, username?: string) {
    const supabase = createClient()

    const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

    if (fetchError) throw fetchError
    if (existingProfile) return existingProfile

    const now = new Date().toISOString()
    const { data, error } = await supabase
        .from('users')
        .insert({
            id: authUser.id,
            email: authUser.email || '',
            username: getProfileUsername(authUser, username),
            password_hash: 'managed-by-supabase-auth',
            total_points: 0,
            current_level: 'Beginner',
            created_at: now,
            updated_at: now,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

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
        options: {
            data: {
                username,
            },
        },
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
        await ensureUserProfile(authData.user, username)
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

    if (data.user) {
        await ensureUserProfile(data.user)
    }

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
