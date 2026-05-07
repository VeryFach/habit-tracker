-- ============================================
-- CIVFIT v1.7.0 - GAMIFICATION STATE SCHEMA
-- Tambahan untuk Database Habit Tracker
-- ============================================

-- 1. CIVFIT GAME STATE TABLE
CREATE TABLE IF NOT EXISTS civfit_game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Core Game Stats
  hp INT DEFAULT 100,
  exp INT DEFAULT 0,
  level INT DEFAULT 1,
  day INT DEFAULT 1,
  civilization_era VARCHAR(50) DEFAULT 'Zaman Batu',
  
  -- Economy
  gold INT DEFAULT 25,
  silver INT DEFAULT 40,
  exchange_rate DECIMAL(3,1) DEFAULT 4.0,
  
  -- Modifiers
  leave_tomorrow BOOLEAN DEFAULT FALSE,
  clone_enabled BOOLEAN DEFAULT TRUE,
  
  -- Last eval date (untuk prevent double-eval)
  last_evaluated_date DATE,
  
  -- Unlock badges tracking (JSON array)
  unlocked_badges TEXT DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CIVFIT CITY STATE TABLE
CREATE TABLE IF NOT EXISTS civfit_city_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Population
  population INT DEFAULT 6,
  sick INT DEFAULT 0,
  
  -- Resources
  food INT DEFAULT 12,
  housing INT DEFAULT 8,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CIVFIT BUILDINGS TABLE
CREATE TABLE IF NOT EXISTS civfit_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  building_type VARCHAR(50) NOT NULL,  -- 'house', 'farm', 'taxOffice', 'restaurant', 'cloneCenter'
  quantity INT DEFAULT 0,
  
  UNIQUE(user_id, building_type),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CIVFIT ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS civfit_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day INT NOT NULL,
  activity_type VARCHAR(50),  -- 'habit_complete', 'building_buy', 'eval', 'badge_unlock', 'shop_buy', 'temple_gacha', 'currency_exchange'
  description TEXT,
  
  -- Optional detailed tracking
  old_value INT,
  new_value INT,
  change_amount INT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXTENSIONS FOR EXISTING TABLES
-- ============================================

-- Update habit_logs to track period keys
ALTER TABLE habit_logs 
ADD COLUMN IF NOT EXISTS period_key VARCHAR(100),  -- 'habit_id:day:2026-05-04' or 'habit_id:week:2026-19'
ADD COLUMN IF NOT EXISTS period_type VARCHAR(20);  -- 'daily', 'weekly', 'monthly'

-- Update user_badges for CivFit badge values
ALTER TABLE user_badges 
ADD COLUMN IF NOT EXISTS badge_value VARCHAR(50),  -- CivFit badges: 'steady-start', 'city-founder', etc
ADD COLUMN IF NOT EXISTS unlock_reason TEXT;       -- 'exp >= 100', 'population >= 50', etc

-- Update points_history to track currency type
ALTER TABLE points_history 
ADD COLUMN IF NOT EXISTS currency_type VARCHAR(20),    -- 'gold', 'silver', 'points'
ADD COLUMN IF NOT EXISTS balance_after INT,
ADD COLUMN IF NOT EXISTS city_action_type VARCHAR(50); -- 'building_tax', 'food_production', 'clone_bonus', etc

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_civfit_game_state_user_id ON civfit_game_state(user_id);
CREATE INDEX IF NOT EXISTS idx_civfit_city_state_user_id ON civfit_city_state(user_id);
CREATE INDEX IF NOT EXISTS idx_civfit_buildings_user_id ON civfit_buildings(user_id);
CREATE INDEX IF NOT EXISTS idx_civfit_activity_log_user_id ON civfit_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_civfit_activity_log_day ON civfit_activity_log(day);
CREATE INDEX IF NOT EXISTS idx_civfit_activity_log_created_at ON civfit_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_habit_logs_period_key ON habit_logs(period_key);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================
CREATE TRIGGER IF NOT EXISTS trigger_civfit_game_state_updated_at 
BEFORE UPDATE ON civfit_game_state 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_civfit_city_state_updated_at 
BEFORE UPDATE ON civfit_city_state 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_civfit_buildings_updated_at 
BEFORE UPDATE ON civfit_buildings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS
ALTER TABLE civfit_game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE civfit_city_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE civfit_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE civfit_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own game state" ON civfit_game_state;
DROP POLICY IF EXISTS "Users can insert own game state" ON civfit_game_state;
DROP POLICY IF EXISTS "Users can update own game state" ON civfit_game_state;
DROP POLICY IF EXISTS "Users can view own city state" ON civfit_city_state;
DROP POLICY IF EXISTS "Users can insert own city state" ON civfit_city_state;
DROP POLICY IF EXISTS "Users can update own city state" ON civfit_city_state;
DROP POLICY IF EXISTS "Users can view own buildings" ON civfit_buildings;
DROP POLICY IF EXISTS "Users can insert own buildings" ON civfit_buildings;
DROP POLICY IF EXISTS "Users can update own buildings" ON civfit_buildings;
DROP POLICY IF EXISTS "Users can view own activity log" ON civfit_activity_log;
DROP POLICY IF EXISTS "Users can insert own activity log" ON civfit_activity_log;

-- CivFit Game State policies
CREATE POLICY "Users can view own game state" ON civfit_game_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state" ON civfit_game_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state" ON civfit_game_state
  FOR UPDATE USING (auth.uid() = user_id);

-- CivFit City State policies
CREATE POLICY "Users can view own city state" ON civfit_city_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own city state" ON civfit_city_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own city state" ON civfit_city_state
  FOR UPDATE USING (auth.uid() = user_id);

-- CivFit Buildings policies
CREATE POLICY "Users can view own buildings" ON civfit_buildings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own buildings" ON civfit_buildings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buildings" ON civfit_buildings
  FOR UPDATE USING (auth.uid() = user_id);

-- CivFit Activity Log policies
CREATE POLICY "Users can view own activity log" ON civfit_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity log" ON civfit_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SAMPLE INITIALIZATION DATA (for testing)
-- ============================================
-- Note: Uncomment and modify user_id as needed

-- INSERT INTO civfit_game_state (user_id, hp, exp, level, day, gold, silver, population, food, housing)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',  -- Replace with actual user_id
--   100, 0, 1, 1, 25, 40, 6, 12, 8
-- ) ON CONFLICT (user_id) DO NOTHING;

-- INSERT INTO civfit_city_state (user_id, population, sick, food, housing)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',  -- Replace with actual user_id
--   6, 0, 12, 8
-- ) ON CONFLICT (user_id) DO NOTHING;

-- INSERT INTO civfit_buildings (user_id, building_type, quantity)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'house', 1),
--   ('00000000-0000-0000-0000-000000000001', 'farm', 1),
--   ('00000000-0000-0000-0000-000000000001', 'taxOffice', 0),
--   ('00000000-0000-0000-0000-000000000001', 'restaurant', 0),
--   ('00000000-0000-0000-0000-000000000001', 'cloneCenter', 0)
-- ON CONFLICT (user_id, building_type) DO NOTHING;

-- ============================================
-- END OF CIVFIT SCHEMA EXTENSION
-- ============================================
