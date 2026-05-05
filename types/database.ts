// User types
export interface User {
  id: string
  username: string
  email: string
  password_hash?: string
  avatar_url?: string
  total_points: number
  current_level: 'Beginner' | 'Novice' | 'Intermediate' | 'Advanced' | 'Master'
  created_at: string
  updated_at: string
}

// Habit types
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

// Habit Log types
export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes?: string
  points_earned: number
  created_at: string
}

// Habit Streak types
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

// Badge types
export interface Badge {
  id: string
  name: string
  description?: string
  icon_url?: string
  min_points: number
  badge_type: 'milestone' | 'streak' | 'skill_master'
  created_at: string
}

// User Badge types
export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  unlocked_at: string
}

// Weekly Progress types
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

// Points History types
export interface PointsHistory {
  id: string
  user_id: string
  points_change: number
  reason: 'habit_completion' | 'achievement_unlock' | 'bonus' | 'penalty'
  related_habit_id?: string
  related_badge_id?: string
  created_at: string
}

// Category types
export interface Category {
  id: string
  name: string
  description?: string
  icon: string
  color: string
}

// Leaderboard types
export interface LeaderboardSnapshot {
  id: string
  user_id: string
  ranking_period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  period_date: string
  points_in_period: number
  rank: number
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface HabitLogResponse {
  success: boolean
  points_earned: number
  total_points: number
  current_streak: number
  new_badges_unlocked: string[]
  level_updated: boolean
  next_level_progress: string
}
