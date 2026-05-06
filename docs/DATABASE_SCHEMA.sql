-- ============================================
-- HABIT TRACKER PREMIUM - POSTGRESQL SCHEMA
-- Untuk Supabase
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) DEFAULT 'managed-by-supabase-auth',
  avatar_url TEXT,
  total_points INT DEFAULT 0,
  current_level VARCHAR(50) DEFAULT 'Beginner', -- Beginner, Novice, Intermediate, Advanced, Master
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BADGES/ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  min_points INT NOT NULL, -- Berapa poin minimum untuk unlock
  badge_type VARCHAR(50), -- milestone, streak, skill_master
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER BADGES (Tracking badge completion)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 4. HABITS TABLE
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- fitness, health, learning, productivity, etc
  frequency VARCHAR(50) NOT NULL, -- daily, weekly, monthly
  target_count INT, -- Berapa kali dalam periode (e.g., 7 kali per minggu)
  points_per_completion INT DEFAULT 10,
  color VARCHAR(7), -- Hex color #RRGGBB
  icon VARCHAR(100), -- Emoji atau icon name
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. HABIT LOGS (Tracking setiap completion)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  points_earned INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HABIT STREAKS (Tracking streak data)
CREATE TABLE IF NOT EXISTS habit_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, user_id)
);

-- 7. WEEKLY PROGRESS TABLE
CREATE TABLE IF NOT EXISTS weekly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  completed_count INT DEFAULT 0,
  target_count INT,
  completion_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. POINTS HISTORY (Audit trail)
CREATE TABLE IF NOT EXISTS points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_change INT NOT NULL,
  reason VARCHAR(255), -- habit_completion, achievement_unlock, bonus, penalty
  related_habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  related_badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7)
);

-- 10. LEADERBOARD VIEW (untuk daily/weekly/monthly ranking)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ranking_period VARCHAR(50), -- daily, weekly, monthly, all_time
  period_date DATE,
  points_in_period INT,
  rank INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES untuk Performance
-- ============================================

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_active ON habits(is_active);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_completed_at ON habit_logs(completed_at);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_weekly_progress_user_id ON weekly_progress(user_id);
CREATE INDEX idx_weekly_progress_period ON weekly_progress(week_start_date);
CREATE INDEX idx_points_history_user_id ON points_history(user_id);
CREATE INDEX idx_points_history_created_at ON points_history(created_at);

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert categories
INSERT INTO categories (name, icon, color) VALUES
('Fitness', '💪', '#FF6B6B'),
('Health', '🏥', '#4ECDC4'),
('Learning', '📚', '#45B7D1'),
('Productivity', '⚡', '#FFA07A'),
('Mental Wellness', '🧘', '#98D8C8'),
('Social', '👥', '#F7DC6F');

-- Insert sample badges
INSERT INTO badges (name, description, min_points, badge_type) VALUES
('First Step', 'Unlock your first habit', 0, 'milestone'),
('10 Points Wonder', 'Reach 10 points', 10, 'milestone'),
('Century Club', 'Reach 100 points', 100, 'milestone'),
('Thousand Master', 'Reach 1000 points', 1000, 'milestone'),
('Week Warrior', 'Complete 7-day streak', 0, 'streak'),
('Month Maestro', 'Complete 30-day streak', 0, 'streak');

-- ============================================
-- RLS (Row Level Security) - Optional untuk Supabase
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies untuk users - users hanya bisa lihat data sendiri
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies untuk habits - users hanya bisa lihat habit sendiri
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies untuk habit_logs
CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
