# 🚀 Setup Guide - Habit Tracker Premium

## Panduan Setup Database & Backend

---

## 1️⃣ Setup Supabase Database

### Step 1: Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Sign in atau buat akun baru
3. Click **"New project"**
4. Isi details:
   ```
   Project name: habit-tracker-premium
   Database password: [Generate secure password]
   Region: Pilih terdekat dengan lokasi Anda (Asia Southeast 1 untuk Indonesia)
   ```
5. Click **"Create new project"** dan tunggu 2-3 menit

### Step 2: Jalankan SQL Schema

1. Di Supabase dashboard, navigate ke **SQL Editor**
2. Click **"New query"**
3. Copy-paste seluruh isi file `docs/DATABASE_SCHEMA.sql`
4. Click **"Run"**
5. Tunggu hingga semua table berhasil dibuat ✅

**Verifikasi:**
```
Di "Tables" section seharusnya sudah ada:
✓ users
✓ badges
✓ user_badges
✓ habits
✓ habit_logs
✓ habit_streaks
✓ weekly_progress
✓ points_history
✓ categories
✓ leaderboard_snapshots
```

---

## 2️⃣ Setup Project Next.js

### Step 1: Install Dependencies

```bash
cd d:\dako\habit-tracker

# Install required packages
npm install \
  @supabase/supabase-js \
  @supabase/auth-helpers-nextjs \
  @supabase/auth-ui-react \
  @supabase/auth-ui-shared

# For API requests & data fetching
npm install axios swr react-query

# For UI Components (optional)
npm install clsx
```

### Step 2: Setup Environment Variables

1. Create `.env.local` file di root project:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Dapatkan credentials dari Supabase:
   - Dashboard → Settings → API
   - Copy: **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy: **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy: **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Folder Structure

```
habit-tracker/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── route.ts
│   │   │   └── callback/
│   │   ├── habits/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   ├── progress/
│   │   │   └── route.ts
│   │   └── achievements/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── components/
│   │       ├── HabitList.tsx
│   │       ├── ProgressCard.tsx
│   │       └── QuickLog.tsx
│   ├── layout.tsx
│   └── page.tsx (login page)
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── api-client.ts
├── components/
│   ├── Header.tsx
│   ├── Navigation.tsx
│   └── common/
├── hooks/
│   ├── useHabits.ts
│   ├── useUser.ts
│   └── useProgress.ts
├── types/
│   ├── index.ts
│   └── database.ts
├── docs/
│   ├── DATABASE_SCHEMA.sql
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── UI_MOCKUP_EXPLANATION.md
│   └── SETUP_GUIDE.md
└── public/
```

---

## 3️⃣ Create Core Files

### A. Supabase Client Setup (`lib/supabase.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// Server component supabase client
export async function createServerClient() {
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')

  return createServerComponentClient({ cookies })
}
```

### B. Types Definition (`types/database.ts`)

```typescript
export interface User {
  id: string
  username: string
  email: string
  total_points: number
  current_level: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly'
  target_count: number
  points_per_completion: number
  color: string
  icon: string
  is_active: boolean
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes?: string
  points_earned: number
  created_at: string
}

export interface HabitStreak {
  id: string
  habit_id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_completed_date?: string
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description?: string
  icon_url?: string
  min_points: number
  badge_type: 'milestone' | 'streak' | 'skill_master'
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  unlocked_at: string
}

export interface WeeklyProgress {
  id: string
  user_id: string
  habit_id: string
  week_start_date: string
  completed_count: number
  target_count: number
  completion_percentage: number
  created_at: string
  updated_at: string
}
```

### C. Custom Hook - useHabits (`hooks/useHabits.ts`)

```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Habit, HabitLog } from '@/types/database'

export function useHabits(userId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchHabits = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setHabits(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchHabits()
  }, [userId])

  const logHabit = async (habitId: string, notes?: string) => {
    try {
      const supabase = createClient()
      
      // Create habit log
      const { data: logData, error: logError } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: new Date().toISOString(),
          notes: notes,
          points_earned: 10,
        })
        .select()

      if (logError) throw logError

      // Update user points
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_points')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      await supabase
        .from('users')
        .update({ total_points: (userData?.total_points || 0) + 10 })
        .eq('id', userId)

      return logData[0]
    } catch (err) {
      console.error('Error logging habit:', err)
      throw err
    }
  }

  return { habits, loading, error, logHabit }
}
```

### D. API Route - Create Habit (`app/api/habits/route.ts`)

```typescript
import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

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
    const supabase = await createServerClient()

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

    const { data: habit, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: body.name,
        category: body.category,
        frequency: body.frequency,
        target_count: body.target_count || 1,
        points_per_completion: body.points_per_completion || 10,
        color: body.color || '#FF6B6B',
        icon: body.icon || '✅',
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()

    if (error) throw error

    // Create streak entry
    await supabase.from('habit_streaks').insert({
      habit_id: habit[0].id,
      user_id: user.id,
      current_streak: 0,
      longest_streak: 0,
    })

    return NextResponse.json(habit[0], { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### E. API Route - Log Habit (`app/api/habits/[id]/log/route.ts`)

```typescript
import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()

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
    const habitId = params.id

    // Check if already logged today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingLog } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00`)
      .lt('completed_at', `${today}T23:59:59`)
      .single()

    if (existingLog) {
      return NextResponse.json(
        { error: 'Already logged today' },
        { status: 400 }
      )
    }

    // Get habit details
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single()

    if (habitError || !habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    // Create log entry
    const { data: log, error: logError } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        notes: body.notes,
        points_earned: habit.points_per_completion,
      })
      .select()

    if (logError) throw logError

    // Update user points
    const { data: userData } = await supabase
      .from('users')
      .select('total_points')
      .eq('id', user.id)
      .single()

    const newTotal = (userData?.total_points || 0) + habit.points_per_completion

    await supabase
      .from('users')
      .update({ total_points: newTotal })
      .eq('id', user.id)

    // Update streak
    const { data: streak } = await supabase
      .from('habit_streaks')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .single()

    if (streak) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const { data: yesterdayLog } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .gte('completed_at', `${yesterdayStr}T00:00:00`)
        .lt('completed_at', `${yesterdayStr}T23:59:59`)
        .single()

      const newStreak = yesterdayLog ? streak.current_streak + 1 : 1
      const newLongestStreak = Math.max(newStreak, streak.longest_streak)

      await supabase
        .from('habit_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_completed_date: today,
        })
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      points_earned: habit.points_per_completion,
      total_points: newTotal,
      log: log[0],
    })
  } catch (error) {
    console.error('Error logging habit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 4️⃣ Testing Database Connection

Create file `app/api/test-db/route.ts`:

```typescript
import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Test connection
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      status: 'Connected',
      categories_count: data?.length || 0,
    })
  } catch (error) {
    console.error('DB Connection Error:', error)
    return NextResponse.json(
      { status: 'Error', error: String(error) },
      { status: 500 }
    )
  }
}
```

Test dengan akses: `http://localhost:3000/api/test-db`

---

## 5️⃣ Run Project

```bash
# Development mode
npm run dev

# Buka browser
http://localhost:3000

# Test database connection
http://localhost:3000/api/test-db
```

---

## 📋 Checklist Setup

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] PostgreSQL tables verified in Supabase
- [ ] `.env.local` file created with credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Project folder structure set up
- [ ] Core files created (supabase.ts, types, hooks)
- [ ] API routes created (habits, log)
- [ ] Test database connection success
- [ ] Project runs without errors

---

## 🐛 Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
→ Pastikan `.env.local` sudah ada dan benar

### Error: "Unauthorized" pada API calls
→ Check: Auth session & JWT token validity

### Database connection timeout
→ Check: Supabase project status & network

### Habit logging fails
→ Check: User authenticated & habit belongs to user

---

**Siap dimulai?** 🚀

Dengan setup ini, Anda sudah punya:
- ✅ PostgreSQL database di Supabase
- ✅ Next.js backend API
- ✅ Type-safe Typescript
- ✅ Foundation untuk frontend components

Next step: Buat UI components & connect to API!
