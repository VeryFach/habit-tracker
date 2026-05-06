'use client'

import { Header } from '@/components/Header'
import { Navigation } from '@/components/Navigation'
import { ensureUserProfile, signOut } from '@/lib/auth'
import { createClient } from '@/lib/supabase'
import type { User as ProfileUser } from '@/types/database'
import type { User as AuthUser } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<ProfileUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false
    let subscription: ReturnType<typeof supabase.channel> | null = null

    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const userProfile = await ensureUserProfile(user)
        if (cancelled) return

        setUser(user)
        setProfile(userProfile)

        subscription = supabase
          .channel(`header-user:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`,
            },
            (payload: { new: ProfileUser }) => {
              setProfile(payload.new)
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      cancelled = true
      subscription?.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      <Header
        userName={profile?.username || user?.email?.split('@')[0]}
        totalPoints={profile?.total_points}
        onLogout={handleLogout}
      />
      <Navigation />
      <main className="max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  )
}
