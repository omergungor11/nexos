-- 028: Add new districts
-- Run in Supabase Dashboard > SQL Editor

-- Gazimağusa: Çanakkale
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, 'Çanakkale', 'canakkale', TRUE
FROM cities c WHERE c.slug = 'gazimagusa'
ON CONFLICT (city_id, slug) DO NOTHING;

-- Gazimağusa: Maraş
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, 'Maraş', 'maras', TRUE
FROM cities c WHERE c.slug = 'gazimagusa'
ON CONFLICT (city_id, slug) DO NOTHING;

-- İskele: Boğaz
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, 'Boğaz', 'bogaz', TRUE
FROM cities c WHERE c.slug = 'iskele'
ON CONFLICT (city_id, slug) DO NOTHING;
