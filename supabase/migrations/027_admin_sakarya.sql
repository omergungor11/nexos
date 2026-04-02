-- 027: Add admin role + Sakarya district
-- Run in Supabase Dashboard > SQL Editor

-- 1. Set admin role for nexosinvestmentcy@gmail.com
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'nexosinvestmentcy@gmail.com';

-- 2. Add Sakarya district to Gazimağusa
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, 'Sakarya', 'sakarya', TRUE
FROM cities c
WHERE c.slug = 'gazimagusa'
ON CONFLICT (city_id, slug) DO NOTHING;

-- 3. Add Long Beach district to İskele
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, 'Long Beach', 'long-beach', TRUE
FROM cities c
WHERE c.slug = 'iskele'
ON CONFLICT (city_id, slug) DO NOTHING;
