# 🎨 Habit Tracker Premium - UI/UX Mockup Explanation

## Tampilan Desain Sistem Saat Ini (Dari HTML)

Berikut adalah penjelasan detail tentang setiap bagian dari interface yang sudah didisain:

---

## 📋 Struktur Page Utama

### **Header Section**
```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  [Cover Image: Productivity/Habits Background]           │
│                                                           │
│  📊 Habit Tracker Premium                               │
│     "Build habits. Earn points. Unlock achievements"    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Main Dashboard Components

### **1. Daily Mission Widget**
```
┌──────────────────────────────┐
│  🕐 ONE DAY, ONE MISSION     │
│  ══════════════════════════  │
│  "What's yours?"             │
│                              │
│  [Live Clock Widget]         │
│  (Embedded from Indify)      │
└──────────────────────────────┘

Data yang ditampilkan:
├─ Current time / date
├─ Motivational quote
└─ Quick action button
```

**Backend Process:**
```
GET /api/daily-mission
└─ Returns:
   {
     "date": "2026-05-05",
     "total_habits_today": 5,
     "completed_today": 2,
     "time_remaining": "18 hours",
     "motivational_quote": "Every streak starts with one habit!"
   }
```

---

### **2. Quick Button Section**
```
┌──────────────────────────────┐
│  ⚡ QUICK BUTTON             │
│  ══════════════════════════  │
│                              │
│  [+ LOG HABIT] [+ ADD] [...] │
│                              │
└──────────────────────────────┘

Tombol-tombol tersedia:
├─ "+ Quick Log" → Modal untuk quick habit logging
├─ "+ Add Habit" → Form untuk membuat habit baru
└─ "..." → More actions (settings, export, etc)
```

**Backend Endpoints:**
```
POST /api/habits/:habitId/quick-log
  - Fast logging tanpa modal form
  - Auto-generate points

POST /api/habits
  - Create new habit dengan full details
```

---

### **3. Navigation Section**
```
┌──────────────────────────────┐
│  🧭 NAVIGATION               │
│  ══════════════════════════  │
│                              │
│  [📅 TODAY] [📊 WEEKLY]     │
│  [📈 MONTHLY] [👤 PROFILE]  │
│  [🏆 ACHIEVEMENTS] [⚙️ SETTINGS] │
│                              │
└──────────────────────────────┘

Navigasi utama:
├─ Today Tab
│  └─ Menampilkan habits untuk hari ini
├─ Weekly Tab
│  └─ Menampilkan progress minggu ini
├─ Monthly Tab
│  └─ Menampilkan progress bulan ini
├─ Profile Tab
│  └─ User stats & settings
├─ Achievements Tab
│  └─ Badges & milestones
└─ Settings Tab
   └─ App configuration
```

---

### **4. Progress Database Card**
```
┌─────────────────────────────────────────────────────┐
│  📊 PROGRESS DATABASE                               │
├─────────────────────────────────────────────────────┤
│ Name     │ Badge      │ Points Text │ Progress       │
├─────────────────────────────────────────────────────┤
│ Add Your │ Locked     │ Total Pts   │ 0%            │
│ Name     │ -10 to     │ 0           │ [=====    ]    │
│          │ Beginner   │             │                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Level: Beginner                                    │
│  Next Level: Novice (need 10 more points)          │
│                                                     │
└─────────────────────────────────────────────────────┘

Kolom Breakdown:
├─ Name: User profile name
├─ Badge: Current achievement/level status
│         Format: "Locked -10 to Beginner"
│         Artinya: Butuh 10 poin untuk unlock Beginner
├─ Points Text: Label untuk points (always "Total Points")
└─ Progress: Numeric value & progress bar
   └─ Shows: (current_points / total_points_needed) * 100
```

**Backend Response:**
```
GET /api/users/progress
└─ Returns:
   {
     "username": "John Doe",
     "total_points": 0,
     "current_level": "Beginner",
     "badge_status": "Locked",
     "points_to_next_level": 10,
     "progress_percentage": 0,
     "level_progression": {
       "beginner": { min: 0, max: 9 },
       "novice": { min: 10, max: 49 },
       "intermediate": { min: 50, max: 99 },
       "advanced": { min: 100, max: 299 },
       "master": { min: 300, max: null }
     }
   }
```

---

### **5. Today's Habits Section**
```
┌─────────────────────────────────────────────────────┐
│  📅 TODAY'S HABITS                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Habit 1: Morning Exercise                          │
│  ├─ Target: 1x/day                                 │
│  ├─ Status: ⭕ Not Done / ✅ Done                  │
│  ├─ Points: 25 pts                                 │
│  └─ [✅ MARK DONE]  [➕ ADD NOTE]                 │
│                                                     │
│  Habit 2: Read Book                                │
│  ├─ Target: 1x/day                                 │
│  ├─ Status: ⭕ Not Done                            │
│  ├─ Points: 15 pts                                 │
│  └─ [✅ MARK DONE]  [➕ ADD NOTE]                 │
│                                                     │
│  Habit 3: Meditation                               │
│  ├─ Target: 1x/day                                 │
│  ├─ Status: ✅ Done (2 days streak!)              │
│  ├─ Points: 20 pts                                 │
│  └─ [✅ ALREADY DONE]  [📝 VIEW NOTE]             │
│                                                     │
└─────────────────────────────────────────────────────┘

Fitur per habit item:
├─ Visual status indicator (circle/checkmark)
├─ Points yang akan didapat
├─ Streak counter
├─ Mark as done button
├─ Add/view notes
└─ Time spent (optional)
```

**Backend Response:**
```
GET /api/habits/today
└─ Returns:
   {
     "habits": [
       {
         "id": "uuid",
         "name": "Morning Exercise",
         "frequency": "daily",
         "category": "fitness",
         "target_count": 1,
         "points_per_completion": 25,
         "icon": "💪",
         "color": "#FF6B6B",
         "status_today": {
           "completed": false,
           "logged_at": null,
           "current_streak": 0
         },
         "next_deadline": "2026-05-05T23:59:59Z"
       },
       ...
     ]
   }
```

---

### **6. Weekly Habits Section**
```
┌─────────────────────────────────────────────────────┐
│  📆 WEEKLY HABITS                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Habit 1: Gym Training                              │
│  ├─ Target: 3x/week                               │
│  ├─ Completed: 2/3 (67%)                           │
│  ├─ Progress: [████████░░░░░░░░]                   │
│  ├─ Days left: 4 days (until Saturday)             │
│  └─ Points: +50 pts when completed                 │
│                                                     │
│  Habit 2: Coding Practice                          │
│  ├─ Target: 5x/week                               │
│  ├─ Completed: 5/5 (100%) ✅                       │
│  ├─ Progress: [██████████████████]                 │
│  ├─ BONUS: +50 points for 100% completion!        │
│  └─ Points: +150 pts total (this week)             │
│                                                     │
│  Habit 3: Learning (Reading/Courses)               │
│  ├─ Target: 7x/week                               │
│  ├─ Completed: 3/7 (43%)                           │
│  ├─ Progress: [██████░░░░░░░░]                     │
│  ├─ Days left: 4 days                              │
│  └─ Points: +100 pts when completed                │
│                                                     │
└─────────────────────────────────────────────────────┘

Fitur per weekly habit:
├─ Target completion count
├─ Visual progress bar
├─ Percentage completion
├─ Days/time remaining
├─ Bonus points indication
└─ Quick complete/view details
```

**Backend Response:**
```
GET /api/habits/weekly
└─ Returns:
   {
     "week": {
       "start_date": "2026-04-28",
       "end_date": "2026-05-04",
       "habits": [
         {
           "id": "uuid",
           "name": "Gym Training",
           "target_count": 3,
           "completed_count": 2,
           "completion_percentage": 66.67,
           "days_remaining": 4,
           "points_per_completion": 50,
           "bonus_points_at_100": 50,
           "current_completion_dates": [
             "2026-04-29",
             "2026-05-02"
           ]
         },
         ...
       ]
     }
   }
```

---

### **7. All Logs Section**
```
┌─────────────────────────────────────────────────────┐
│  📋 ALL LOGS                                        │
├─────────────────────────────────────────────────────┤
│  [View full history]                               │
│                                                     │
│  Expanded view (paginated):                         │
│                                                     │
│  May 5, 2026 - 08:30 AM                            │
│  └─ ✅ Morning Exercise                            │
│     └─ +25 points → Total: 285 pts                 │
│     └─ Notes: "45 mins running"                    │
│                                                     │
│  May 4, 2026 - 06:15 PM                            │
│  └─ ✅ Read Book                                   │
│     └─ +15 points → Total: 260 pts                 │
│     └─ Notes: "Chapter 5 - React Patterns"         │
│                                                     │
│  May 4, 2026 - 09:00 PM                            │
│  └─ ✅ Meditation                                  │
│     └─ +20 points → Total: 245 pts                 │
│     └─ Notes: "20 mins guided meditation"          │
│                                                     │
│  May 3, 2026 - 07:00 AM                            │
│  └─ ✅ Gym Training                                │
│     └─ +50 points → Total: 225 pts                 │
│     └─ Notes: "Chest & Triceps"                    │
│     └─ Badge Unlocked: "Gym Rat" 🏋️               │
│                                                     │
│  [Load More...]                                    │
│                                                     │
└─────────────────────────────────────────────────────┘

Per log entry menampilkan:
├─ Date & time
├─ Habit name with checkmark
├─ Points earned
├─ Running total
├─ User notes/comments
├─ Badges unlocked (if any)
└─ Edit/Delete options
```

**Backend Response:**
```
GET /api/habit-logs?limit=20&offset=0
└─ Returns:
   {
     "total": 156,
     "logs": [
       {
         "id": "uuid",
         "habit_id": "uuid",
         "habit_name": "Morning Exercise",
         "completed_at": "2026-05-05T08:30:00Z",
         "points_earned": 25,
         "total_points_after": 285,
         "notes": "45 mins running",
         "streak_reached": 5,
         "badges_unlocked": []
       },
       ...
     ]
   }
```

---

### **8. Advanced Section (Navigation)**
```
┌─────────────────────────────────────────────────────┐
│  🔗 [Advanced] - Link to additional features        │
└─────────────────────────────────────────────────────┘

Advanced Features Page:
├─ 📊 Detailed Analytics
│  └─ Charts & graphs for habit trends
├─ 🏆 Leaderboard
│  └─ Compare with other users
├─ 🎯 Goal Settings
│  └─ Set custom targets
├─ 📱 Notifications
│  └─ Reminders & achievement alerts
├─ 🔧 Integrations
│  └─ Connect with other apps
└─ 📤 Export Data
   └─ Download activity logs
```

---

## 🔄 Interactive Flows

### **Flow 1: Logging a Habit**

```
User clicks "MARK DONE" on Today's Habits
    ↓
Frontend: POST /api/habits/:habitId/quick-log
    ↓
Backend processes:
    ├─ Validates user permission
    ├─ Checks for duplicate today
    ├─ Calculates points
    ├─ Updates streak
    ├─ Checks badge eligibility
    └─ Returns response
    ↓
Frontend receives response:
{
  "success": true,
  "points_earned": 25,
  "new_total_points": 285,
  "current_streak": 5,
  "new_badges": ["5-Day Warrior"],
  "level_progress": "285/300 (95%)",
  "animation_type": "celebration"
}
    ↓
UI Updates:
├─ Mark habit as completed ✅
├─ Show +25 points animation
├─ Update total points counter
├─ Show streak badge
├─ Trigger achievement popup
└─ Play success sound (optional)
```

### **Flow 2: Adding a New Habit**

```
User clicks "+ ADD HABIT"
    ↓
Modal Form Opens:
├─ Name: ____________________
├─ Category: [dropdown]
├─ Frequency: ○Daily ○Weekly ○Monthly
├─ Target: _____ times per period
├─ Points: _____ (default 10)
├─ Color: [color picker]
├─ Icon: [emoji picker]
└─ [Cancel] [Create]
    ↓
User fills form & clicks "Create"
    ↓
Frontend: POST /api/habits
{
  "name": "Morning Exercise",
  "category": "fitness",
  "frequency": "daily",
  "target_count": 1,
  "points_per_completion": 25,
  "color": "#FF6B6B",
  "icon": "💪"
}
    ↓
Backend creates:
├─ Habit entry in habits table
├─ Streak entry in habit_streaks table (current_streak: 0)
└─ Returns habit object
    ↓
UI Updates:
├─ Close modal
├─ Add to habits list
├─ Show success toast
└─ Refresh dashboard
```

### **Flow 3: Weekly Progress Calculation**

```
Nightly scheduled job (00:00 UTC)
    ↓
For each user with active habits:
    ├─ Get all weekly habits
    ├─ Count completions for this week
    ├─ Calculate completion percentage
    ├─ Check if 100% completed
    │  └─ If yes: add bonus points (+50)
    ├─ Update weekly_progress table
    └─ Check for achievement unlocks
    ↓
Update Leaderboard Snapshots
    ├─ Calculate rankings for the week
    └─ Store in leaderboard_snapshots table
    ↓
Send Notifications (optional)
    ├─ Users at 100%: "Great job! 🎉"
    ├─ Users at 50%: "Keep going! 💪"
    └─ Users at 0%: "Get started today!"
```

---

## 💾 Data Flow Summary

```
┌──────────────┐
│   User UI    │
└──────┬───────┘
       │ (User Action)
       ↓
┌────────────────────────────┐
│   Frontend (Next.js Pages) │
└──────┬──────────────────────┘
       │ (HTTP Request)
       ↓
┌────────────────────────────┐
│   API Route Handler         │
│   - Validation             │
│   - Authorization          │
└──────┬──────────────────────┘
       │ (Supabase Client)
       ↓
┌────────────────────────────┐
│   Business Logic Layer     │
│   - Points calculation     │
│   - Streak logic           │
│   - Badge checking         │
└──────┬──────────────────────┘
       │ (SQL Query)
       ↓
┌────────────────────────────┐
│   PostgreSQL Database      │
│   (Supabase)              │
└─────────────────────────────┘
       │ (Data)
       ↓
┌────────────────────────────┐
│   Response JSON            │
└──────┬──────────────────────┘
       │ (HTTP Response)
       ↓
┌──────────────────────────────┐
│   Frontend State Update      │
│   - Update cache/state       │
│   - Re-render UI             │
│   - Show animations          │
└──────────────────────────────┘
```

---

## 🎨 Color & Design System

```
Colors Used in UI:
├─ Primary: #FF6B6B (Coral Red) - Fitness
├─ Secondary: #4ECDC4 (Teal) - Health
├─ Accent: #45B7D1 (Sky Blue) - Learning
├─ Warning: #FFA07A (Light Salmon) - Productivity
├─ Success: #98D8C8 (Mint) - Wellness
├─ Dark BG: #000000 or #1a1a1a
└─ Light BG: #FFFFFF or #f5f5f5

Typography:
├─ Headers: Bold, 24-32px
├─ Body: Regular, 14-16px
├─ Small text: 12px, opacity 0.7
└─ Mono: For technical values

Spacing:
├─ Padding: 8px, 16px, 24px, 32px
├─ Margin: 8px, 16px, 24px
├─ Gap between elements: 12px

Animations:
├─ Button hover: 200ms fade
├─ Page transitions: 300ms fade
├─ Achievement popup: 500ms scale-in
├─ Points animation: 1000ms scale-pulse
└─ Success toast: 3000ms auto-dismiss
```

---

**Sekarang UI sudah dijelaskan dengan detail!** 🎨
Silakan gunakan struktur ini sebagai blueprint untuk implementasi frontend React components.
