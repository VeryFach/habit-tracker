-- ============================================
-- CIVFIT v1.7.0 - SCHEMA UPDATE SCRIPT
-- Idempotent: adds missing tables/columns only.
-- ============================================

-- ============================================
-- 1. PASTIKAN FUNGSI TRIGGER updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. TABEL CIVFIT_GAME_STATE
-- ============================================
CREATE TABLE IF NOT EXISTS civfit_game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  hp INT DEFAULT 100,
  exp INT DEFAULT 0,
  level INT DEFAULT 1,
  day INT DEFAULT 1,
  civilization_era VARCHAR(50) DEFAULT 'Zaman Batu',
  gold INT DEFAULT 25,
  silver INT DEFAULT 40,
  exchange_rate DECIMAL(3,1) DEFAULT 4.0,
  leave_tomorrow BOOLEAN DEFAULT FALSE,
  clone_enabled BOOLEAN DEFAULT TRUE,
  last_evaluated_date DATE,
  unlocked_badges TEXT DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tambahan kolom jika belum ada (untuk upgrade)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='civfit_game_state' AND column_name='civilization_era') THEN
    ALTER TABLE civfit_game_state ADD COLUMN civilization_era VARCHAR(50) DEFAULT 'Zaman Batu';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='civfit_game_state' AND column_name='unlocked_badges') THEN
    ALTER TABLE civfit_game_state ADD COLUMN unlocked_badges TEXT DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='civfit_game_state' AND column_name='last_evaluated_date') THEN
    ALTER TABLE civfit_game_state ADD COLUMN last_evaluated_date DATE;
  END IF;
END $$;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_civfit_game_state_updated_at ON civfit_game_state;
CREATE TRIGGER trigger_civfit_game_state_updated_at 
BEFORE UPDATE ON civfit_game_state 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. TABEL CIVFIT_CITY_STATE
-- ============================================
CREATE TABLE IF NOT EXISTS civfit_city_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  population INT DEFAULT 6,
  sick INT DEFAULT 0,
  food INT DEFAULT 12,
  housing INT DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_civfit_city_state_updated_at ON civfit_city_state;
CREATE TRIGGER trigger_civfit_city_state_updated_at 
BEFORE UPDATE ON civfit_city_state 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. TABEL CIVFIT_BUILDINGS
-- ============================================
CREATE TABLE IF NOT EXISTS civfit_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  building_type VARCHAR(50) NOT NULL,
  quantity INT DEFAULT 0,
  UNIQUE(user_id, building_type),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tambahan kolom 'coffeeShop' jika diperlukan (opsional)
DO $$
BEGIN
  -- Pastikan building_type 'coffeeShop' bisa disimpan (tidak perlu alter, hanya catatan)
  -- Tidak ada perubahan struktural required.
END $$;

DROP TRIGGER IF EXISTS trigger_civfit_buildings_updated_at ON civfit_buildings;
CREATE TRIGGER trigger_civfit_buildings_updated_at 
BEFORE UPDATE ON civfit_buildings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. TABEL CIVFIT_ACTIVITY_LOG
-- ============================================
CREATE TABLE IF NOT EXISTS civfit_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day INT NOT NULL,
  activity_type VARCHAR(50),
  description TEXT,
  old_value INT,
  new_value INT,
  change_amount INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_civfit_activity_log_user_id ON civfit_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_civfit_activity_log_day ON civfit_activity_log(day);
CREATE INDEX IF NOT EXISTS idx_civfit_activity_log_created_at ON civfit_activity_log(created_at);

-- ============================================
-- 6. PENYESUAIAN TABEL EXISTING (HABIT_LOGS)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='habit_logs' AND column_name='period_key') THEN
    ALTER TABLE habit_logs ADD COLUMN period_key VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='habit_logs' AND column_name='period_type') THEN
    ALTER TABLE habit_logs ADD COLUMN period_type VARCHAR(20);
  END IF;
END $$;

-- ============================================
-- 7. PENYESUAIAN TABEL USER_BADGES
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_badges' AND column_name='badge_value') THEN
    ALTER TABLE user_badges ADD COLUMN badge_value VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_badges' AND column_name='unlock_reason') THEN
    ALTER TABLE user_badges ADD COLUMN unlock_reason TEXT;
  END IF;
END $$;

-- ============================================
-- 8. PENYESUAIAN TABEL POINTS_HISTORY
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points_history' AND column_name='currency_type') THEN
    ALTER TABLE points_history ADD COLUMN currency_type VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points_history' AND column_name='balance_after') THEN
    ALTER TABLE points_history ADD COLUMN balance_after INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points_history' AND column_name='city_action_type') THEN
    ALTER TABLE points_history ADD COLUMN city_action_type VARCHAR(50);
  END IF;
END $$;

-- ============================================
-- 9. INDEXES UNTUK CIVFIT
-- ============================================
CREATE INDEX IF NOT EXISTS idx_civfit_game_state_user_id ON civfit_game_state(user_id);
CREATE INDEX IF NOT EXISTS idx_civfit_city_state_user_id ON civfit_city_state(user_id);
CREATE INDEX IF NOT EXISTS idx_civfit_buildings_user_id ON civfit_buildings(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_period_key ON habit_logs(period_key);

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Aktifkan RLS
ALTER TABLE civfit_game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE civfit_city_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE civfit_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE civfit_activity_log ENABLE ROW LEVEL SECURITY;

-- Hapus policy yang mungkin sudah ada (untuk menghindari duplikasi)
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

-- Buat policy baru
CREATE POLICY "Users can view own game state" ON civfit_game_state
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game state" ON civfit_game_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game state" ON civfit_game_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own city state" ON civfit_city_state
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own city state" ON civfit_city_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own city state" ON civfit_city_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own buildings" ON civfit_buildings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own buildings" ON civfit_buildings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own buildings" ON civfit_buildings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity log" ON civfit_activity_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity log" ON civfit_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. OPSIONAL: INISIALISASI DATA DEFAULT UNTUK USER LAMA (JIKA PERLU)
-- ============================================
-- Skrip di bawah akan membuat entri default untuk user yang sudah ada tapi belum punya data CivFit.
-- Jalankan sekali jika diperlukan.
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM users
    WHERE NOT EXISTS (SELECT 1 FROM civfit_game_state WHERE user_id = users.id)
  LOOP
    INSERT INTO civfit_game_state (user_id) VALUES (user_record.id);
    INSERT INTO civfit_city_state (user_id) VALUES (user_record.id);
    INSERT INTO civfit_buildings (user_id, building_type, quantity) VALUES 
      (user_record.id, 'house', 1),
      (user_record.id, 'farm', 1);
  END LOOP;
END $$;

-- ============================================
-- SELESAI
-- ============================================