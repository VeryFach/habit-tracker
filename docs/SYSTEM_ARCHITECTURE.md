# 🎯 Habit Tracker Premium - Sistem Arsitektur

## Ikhtisar Sistem

Habit Tracker Premium adalah aplikasi web modern yang membantu pengguna membangun kebiasaan baik, mendapatkan poin, dan membuka achievement. Sistem ini menggunakan teknologi modern dengan Next.js, Supabase, dan real-time processing.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│ • Dashboard (Home)              │ • Habit Management             │
│ • Quick Habit Logger            │ • Profile & Settings           │
│ • Progress Tracker              │ • Achievement Display          │
│ • Leaderboard                   │ • Weekly/Monthly Analytics     │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)               │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/habits              - Create new habit              │
│ GET    /api/habits              - Get all user habits           │
│ PUT    /api/habits/:id          - Update habit                  │
│ DELETE /api/habits/:id          - Delete habit                  │
│ POST   /api/habits/:id/log      - Log habit completion         │
│ GET    /api/progress            - Get progress data             │
│ GET    /api/achievements        - Get achievements              │
│ GET    /api/stats               - Get user statistics           │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│ • Points Calculator             │ • Streak Tracker              │
│ • Badge Unlocking Logic         │ • Progress Validator          │
│ • Leaderboard Ranker            │ • Notification Handler        │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (Supabase PostgreSQL)               │
├─────────────────────────────────────────────────────────────────┤
│ • users table               │ • habits table                     │
│ • habit_logs table          │ • habit_streaks table              │
│ • badges table              │ • user_badges table                │
│ • points_history table      │ • weekly_progress table            │
│ • categories table          │ • leaderboard_snapshots table      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Flow

### 1. **Dashboard / Home Page**
```
┌─────────────────────────────────────────┐
│  Habit Tracker Premium - Dashboard       │
├─────────────────────────────────────────┤
│ ⏰ Daily Mission Widget                 │
│ "One day, one mission. What's yours?"   │
├─────────────────────────────────────────┤
│ 🔴 Quick Button Section                 │
│ [+ Quick Log] [Add Habit] [View All]   │
├─────────────────────────────────────────┤
│ 🧭 Navigation Section                  │
│ [Today] [Weekly] [Monthly] [Profile]   │
├─────────────────────────────────────────┤
│                                         │
│ 📊 Progress Database                   │
│ ┌──────────────────────────────────┐   │
│ │ Your Name   │ Badge │ Points Text  │  │
│ ├──────────────────────────────────┤   │
│ │ 0 pts      │ Locked │ 0          │  │
│ │ -10 to Beginner                    │  │
│ └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ 📅 Today's Habits                      │
│ ├─ Morning Exercise (50 mins)          │
│ ├─ Read Book (30 mins)                 │
│ └─ Meditation (10 mins)                │
├─────────────────────────────────────────┤
│ 📆 Weekly Habits                       │
│ ├─ Gym (3x/week)                       │
│ ├─ Coding Practice (5x/week)          │
│ └─ Learning (7x/week)                 │
├─────────────────────────────────────────┤
│ 📋 All Logs                            │
│ [View full history]                    │
└─────────────────────────────────────────┘
```

### 2. **Habit Management Flow**
```
┌─ Create Habit ──┐
│                 ↓
│  Habit Form
│  • Name: string
│  • Category: enum
│  • Frequency: daily/weekly/monthly
│  • Target: number (times per period)
│  • Points: number
│  • Color: hex
│  • Icon: emoji/string
│                 ↓
│  Save to DB
│                 ↓
│  Create Streak Entry
│                 ↓
└─ Success ────────┘
```

---

## 🔄 System Workflow / Process Flow

### **Workflow 1: Habit Completion Logging**

```
User taps "Log Habit"
        ↓
Frontend sends request: POST /api/habits/{habitId}/log
        ↓
Backend receives request
        ↓
1. Check if user has this habit (security)
        ↓
2. Check if already logged today (duplicate check)
        ↓
3. Create entry in habit_logs table
        ↓
4. Calculate points (base_points + multipliers)
        ↓
5. Update user.total_points
        ↓
6. Update/create streak entry:
   - If yesterday logged: increment current_streak
   - Else: reset current_streak to 1
   - If new longest_streak: update it
        ↓
7. Create points_history record (audit)
        ↓
8. Check badge eligibility:
   - Check if user can unlock any badge
   - If yes: add to user_badges table
        ↓
9. Return response with:
   {
     "success": true,
     "points_earned": 10,
     "total_points": 45,
     "current_streak": 3,
     "new_badges_unlocked": ["7-day streak"],
     "level_updated": false,
     "next_level_progress": "45/100"
   }
        ↓
Frontend updates UI with success animation
```

### **Workflow 2: Weekly Progress Calculation**

```
(Background Job - runs daily at 00:00 UTC)
        ↓
For each active user:
        ↓
For each of their active habits:
        ↓
1. Get week_start_date = today - day_of_week
        ↓
2. Query habit_logs where:
   - habit_id = current_habit
   - completed_at >= week_start_date
   - completed_at < week_start_date + 7 days
        ↓
3. Count completed entries = completed_count
        ↓
4. completion_percentage = (completed_count / target_count) * 100
        ↓
5. Upsert to weekly_progress table
        ↓
6. If completion_percentage >= 100%:
   - Add bonus points (e.g., 50 extra points)
   - Update points_history
```

### **Workflow 3: Badge Unlocking System**

```
Event: Points Updated / Streak Reached / Habit Completed
        ↓
Check Badge Conditions:
        ↓
For each badge type:
   
   IF badge_type == 'milestone':
       IF user.total_points >= badge.min_points
       AND user NOT already have this badge:
           → Unlock badge
   
   IF badge_type == 'streak':
       IF habit_streak.current_streak >= badge.min_points
       AND user NOT already have this badge:
           → Unlock badge
        ↓
If badges unlocked:
   1. Add entries to user_badges table
   2. Add points_history for achievement
   3. Add notification
   4. Return unlocked badges to frontend
```

### **Workflow 4: Level Advancement System**

```
Points Reached:
├─ 0-9       → Beginner
├─ 10-49     → Novice
├─ 50-99     → Intermediate
├─ 100-299   → Advanced
└─ 300+      → Master

On each points update:
        ↓
1. Calculate new_level based on user.total_points
        ↓
2. IF new_level != user.current_level:
   - Update user.current_level
   - Create notification
   - Potentially unlock level-based badge
```

---

## 📊 Data Model Relationships

```
Users (1) ──────────────── (M) Habits
  |                           |
  |                           ├─── (M) Habit Logs
  |                           ├─── (M) Habit Streaks
  |                           └─── (M) Weekly Progress
  |
  ├─── (M) User Badges ──────── (M) Badges
  |
  ├─── (M) Points History
  |
  └─── (M) Leaderboard Snapshots
```

---

## 📈 Real-time Features

### **Suggested Real-time Implementations**

1. **Live Points Update**
   - When user completes habit → instant points display update
   - Use Supabase Realtime subscriptions

2. **Streak Notifications**
   - Notify user when streak breaks
   - Celebrate milestone streaks (7, 14, 30 days)

3. **Live Leaderboard**
   - Top users rankings updated in real-time
   - Your position tracker

4. **Achievement Popups**
   - Instant notification when badge unlocked
   - Celebration animation

---

## 🔐 Security Considerations

1. **Row Level Security (RLS)**: Enabled on Supabase
   - Users can only access their own data
   - Policies defined in schema

2. **Input Validation**
   - All user inputs validated on backend
   - SQL Injection prevention (use parameterized queries)

3. **Rate Limiting**
   - Prevent spam logging (max 1 log per habit per day)
   - Implement rate limiting on API endpoints

4. **Authentication**
   - Use Supabase Authentication
   - JWT token validation on each request

---

## 🚀 API Endpoints Specification

```
=== AUTHENTICATION ===
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh

=== HABITS ===
GET    /api/habits                 - Get all user habits
POST   /api/habits                 - Create new habit
GET    /api/habits/:id             - Get habit details
PUT    /api/habits/:id             - Update habit
DELETE /api/habits/:id             - Delete habit
GET    /api/habits/:id/logs        - Get habit logs
POST   /api/habits/:id/log         - Log habit completion

=== PROGRESS & STATS ===
GET    /api/progress/today         - Today's progress
GET    /api/progress/weekly        - Weekly progress
GET    /api/progress/monthly       - Monthly progress
GET    /api/stats/summary          - User summary stats
GET    /api/stats/streaks          - All streak data

=== ACHIEVEMENTS ===
GET    /api/achievements           - All available achievements
GET    /api/achievements/unlocked  - User's unlocked achievements
GET    /api/achievements/progress  - Progress to next achievements

=== LEADERBOARD ===
GET    /api/leaderboard/daily      - Daily rankings
GET    /api/leaderboard/weekly     - Weekly rankings
GET    /api/leaderboard/monthly    - Monthly rankings
GET    /api/leaderboard/all-time   - All-time rankings

=== USERS ===
GET    /api/users/profile          - User profile data
PUT    /api/users/profile          - Update profile
GET    /api/users/:id/public       - Public user profile
```

---

## 📦 Database Query Examples

### Get Today's Habits
```sql
SELECT h.*, 
       COUNT(CASE WHEN DATE(hl.completed_at) = CURRENT_DATE THEN 1 END) as completed_today
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id
WHERE h.user_id = $1 AND h.frequency = 'daily' AND h.is_active = true
GROUP BY h.id
ORDER BY h.created_at;
```

### Get Weekly Progress
```sql
SELECT h.id, h.name,
       COUNT(hl.id) as completed_count,
       h.target_count,
       ROUND((COUNT(hl.id)::float / h.target_count * 100)::numeric, 2) as percentage
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
  AND hl.completed_at >= DATE_TRUNC('week', CURRENT_DATE)
WHERE h.user_id = $1 AND h.is_active = true
GROUP BY h.id, h.name, h.target_count;
```

### Get Current Streaks
```sql
SELECT h.id, h.name, hs.current_streak, hs.longest_streak
FROM habit_streaks hs
JOIN habits h ON hs.habit_id = h.id
WHERE h.user_id = $1
ORDER BY hs.current_streak DESC;
```

---

## 🎯 Performance Optimization

1. **Caching**
   - Cache user stats (invalidate on change)
   - Cache leaderboard snapshots
   - Use Redis for real-time caching

2. **Database Optimization**
   - Indexes on frequently queried columns
   - Partitioning habit_logs by date
   - Archive old logs

3. **API Optimization**
   - Pagination on list endpoints
   - Selective field loading
   - Compression on responses

---

## 📱 Frontend State Management (Suggested)

```
Global State Structure:
{
  user: {
    id, name, email, total_points, current_level, avatar_url
  },
  habits: [
    { id, name, category, frequency, target_count, ... }
  ],
  todayHabits: [
    { id, name, completed_today, ... }
  ],
  streaks: {
    habitId: { current_streak, longest_streak }
  },
  achievements: [
    { id, name, unlocked, unlocked_at }
  ],
  stats: {
    total_logged: number,
    current_week_completion: number,
    level_progress: percentage
  }
}
```

---

**Siap untuk dimulai?** 🚀
Dokumentasi lengkap sudah siap. Silakan buat tabel di Supabase menggunakan SQL schema dan mulai implementasi!
