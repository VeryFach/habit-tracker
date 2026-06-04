-- ============================================
-- ADD CONFIGURATION TABLES FOR CIVFIT
-- ============================================

-- GACHA_REWARDS TABLE
CREATE TABLE IF NOT EXISTS gacha_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  silver_reward INT DEFAULT 0,
  probability DECIMAL(5,3) NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BUILDING_CONFIGS TABLE
CREATE TABLE IF NOT EXISTS building_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_key VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_cost INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERT DEFAULT GACHA REWARDS
INSERT INTO gacha_rewards (name, silver_reward, probability, reward_type) VALUES
  ('Zonk Murni', 0, 0.1, 'loss'),
  ('Receh Kembali', 8, 0.45, 'small'),
  ('Hadiah Sedang', 28, 0.35, 'medium'),
  ('Jackpot Kota', 70, 0.1, 'jackpot')
ON CONFLICT DO NOTHING;

-- INSERT DEFAULT BUILDINGS
INSERT INTO building_configs (building_key, name, description, base_cost) VALUES
  ('house', 'Rumah Warga', '+5 kapasitas rumah.', 30),
  ('farm', 'Kebun Pangan', '+8 makanan setiap evaluasi hari.', 35),
  ('taxOffice', 'Kantor Pajak', 'Pajak dari maksimal 10 warga sehat per kantor.', 50),
  ('restaurant', 'Restoran', '+2 populasi dan +6 makanan.', 75),
  ('cloneCenter', 'Pusat Kloning', 'Menggandakan 1 warga per kelipatan 3 populasi.', 140),
  ('coffeeShop', 'Kafe Kopi', 'Meningkatkan mood & produktivitas warga.', 60)
ON CONFLICT (building_key) DO NOTHING;

-- INSERT DEFAULT BADGES (if badges table is empty)
-- These should use string UUIDs or be referenced by the dashboard's badge IDs
INSERT INTO badges (id, name, description, min_points, badge_type) 
SELECT 
  gen_random_uuid() as id,
  name,
  description,
  min_points,
  badge_type
FROM (VALUES
  ('Langkah Awal', 'Dapatkan 100 poin pertama Anda', 100, 'milestone'),
  ('Pendiri Kota', 'Kumpulkan 250 poin', 250, 'milestone'),
  ('Disiplin Besi', 'Kumpulkan 450 poin', 450, 'milestone'),
  ('Ritme Emas', 'Kumpulkan 700 poin', 700, 'milestone'),
  ('Inti Peradaban', 'Kumpulkan 1000 poin', 1000, 'milestone')
) AS badge_data(name, description, min_points, badge_type)
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = badge_data.name);
