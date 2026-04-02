-- 029: Add Bahçeler district to İskele
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, 'Bahçeler', 'bahceler', TRUE
FROM cities c WHERE c.slug = 'iskele'
ON CONFLICT (city_id, slug) DO NOTHING;
