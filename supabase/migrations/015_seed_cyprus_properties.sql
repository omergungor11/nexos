-- 015: Remove Turkey-based properties and seed 10 North Cyprus properties
-- Run this in Supabase Dashboard > SQL Editor

BEGIN;

-- ============================================================
-- 1. Delete all existing properties (and cascade to images, etc.)
-- ============================================================
DELETE FROM property_images;
DELETE FROM property_features;
DELETE FROM property_price_history;
DELETE FROM saved_searches;
DELETE FROM properties;

-- ============================================================
-- 2. Insert 10 North Cyprus properties
-- ============================================================

-- Property 1: Girne Çatalköy Villa
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  '4+1 Müstakil Villa — Özel Havuzlu, Çatalköy',
  'catalkoy-mustakil-villa-ozel-havuzlu',
  'Girne Çatalköy''de deniz manzaralı, özel havuzlu lüks villa. 220 m² kapalı alan, geniş bahçe, modern mutfak, jakuzi ve BBQ alanı. Altyapısı tamamlanmış sitede, merkeze 5 dakika.',
  285000, 'GBP', 'villa', 'available', 'sale',
  220, 280, 4, 1, 3, NULL, 2,
  2024, 'air_condition', 'private', 'closed', TRUE, 2,
  FALSE, TRUE, TRUE, 35.340, 33.350, 'Çatalköy, Girne',
  (SELECT id FROM cities WHERE slug = 'girne'),
  (SELECT id FROM districts WHERE slug = 'catalkoy' AND city_id = (SELECT id FROM cities WHERE slug = 'girne')),
  TRUE, TRUE, 'esdeger'
);

-- Property 2: Girne Alsancak Penthouse
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  '3+1 Penthouse — Çatı Terası, Alsancak',
  'alsancak-penthouse-cati-terasi',
  'Alsancak''ta denize 500 metre mesafede çatı teraslı penthouse. 160 m², panoramik Akdeniz manzarası, açık mutfak konsepti, ortak havuz ve fitness. Yatırıma uygun.',
  195000, 'GBP', 'penthouse', 'available', 'sale',
  160, 185, 3, 1, 2, 5, 5,
  2025, 'air_condition', 'shared', 'closed', FALSE, 3,
  TRUE, FALSE, TRUE, 35.345, 33.290, 'Alsancak, Girne',
  (SELECT id FROM cities WHERE slug = 'girne'),
  (SELECT id FROM districts WHERE slug = 'alsancak' AND city_id = (SELECT id FROM cities WHERE slug = 'girne')),
  TRUE, TRUE, 'turk'
);

-- Property 3: İskele Long Beach Daire
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  '2+1 Daire — Long Beach, İskele',
  'iskele-long-beach-2-plus-1-daire',
  'İskele Long Beach''te denize sıfır komplekste 2+1 daire. 85 m², tam eşyalı, ortak havuz, SPA, restoran. Yatırım getirisi yüksek, kira garantili.',
  120000, 'GBP', 'apartment', 'available', 'sale',
  85, 105, 2, 1, 1, 3, 12,
  2023, 'air_condition', 'shared', 'open', TRUE, 1,
  TRUE, FALSE, TRUE, 35.280, 33.960, 'Long Beach, İskele',
  (SELECT id FROM cities WHERE slug = 'iskele'),
  (SELECT id FROM districts WHERE slug = 'iskele-merkez' AND city_id = (SELECT id FROM cities WHERE slug = 'iskele')),
  TRUE, TRUE, 'esdeger'
);

-- Property 4: Lefkoşa Gönyeli Daire
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  '3+1 Daire — Gönyeli, Lefkoşa',
  'lefkosa-gonyeli-3-plus-1-daire',
  'Lefkoşa Gönyeli''de yeni inşaat 3+1 daire. 125 m², açık mutfak, ebeveyn banyosu, kapalı otopark. Okul, market ve hastaneye yakın lokasyon.',
  95000, 'GBP', 'apartment', 'available', 'sale',
  125, 140, 3, 1, 2, 2, 5,
  2025, 'air_condition', 'none', 'closed', FALSE, 1,
  TRUE, FALSE, FALSE, 35.210, 33.350, 'Gönyeli, Lefkoşa',
  (SELECT id FROM cities WHERE slug = 'lefkosa'),
  (SELECT id FROM districts WHERE slug = 'gonyeli' AND city_id = (SELECT id FROM cities WHERE slug = 'lefkosa')),
  FALSE, TRUE, 'turk'
);

-- Property 5: Gazimağusa Yeniboğaziçi Villa
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  '3+1 İkiz Villa — Yeniboğaziçi, Gazimağusa',
  'gazimagusa-yenibogazici-ikiz-villa',
  'Gazimağusa Yeniboğaziçi''nde denize 300 metre ikiz villa. 180 m², özel bahçe, barbekü alanı, kapalı garaj. Sakin ve huzurlu yaşam.',
  175000, 'GBP', 'twin_villa', 'available', 'sale',
  180, 210, 3, 1, 2, NULL, 2,
  2024, 'air_condition', 'none', 'closed', FALSE, 1,
  FALSE, TRUE, FALSE, 35.160, 33.880, 'Yeniboğaziçi, Gazimağusa',
  (SELECT id FROM cities WHERE slug = 'gazimagusa'),
  (SELECT id FROM districts WHERE slug = 'yenibogazici' AND city_id = (SELECT id FROM cities WHERE slug = 'gazimagusa')),
  FALSE, TRUE, 'esdeger'
);

-- Property 6: Girne Lapta Kiralık Daire
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  '2+1 Kiralık Daire — Lapta, Girne',
  'girne-lapta-kiralik-2-plus-1',
  'Lapta''da deniz manzaralı, tam eşyalı kiralık daire. 90 m², klimalı, internet dahil. Yürüme mesafesinde sahil, market ve restoranlar.',
  650, 'GBP', 'apartment', 'available', 'rent',
  90, 110, 2, 1, 1, 1, 3,
  2021, 'air_condition', 'shared', 'open', TRUE, 1,
  FALSE, FALSE, FALSE, 35.350, 33.170, 'Lapta, Girne',
  (SELECT id FROM cities WHERE slug = 'girne'),
  (SELECT id FROM districts WHERE slug = 'lapta' AND city_id = (SELECT id FROM cities WHERE slug = 'girne')),
  FALSE, TRUE, NULL
);

-- Property 7: İskele Bafra Arsa
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, land_area_sqm, rooms, living_rooms, bathrooms,
  lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  'Konut İmarlı Arsa — Bafra, İskele',
  'iskele-bafra-konut-imarli-arsa',
  'İskele Bafra''da denize 1 km mesafede konut imarlı arsa. 750 m², düz arazi, altyapı hazır. Villa veya apartman projesine uygun.',
  85000, 'GBP', 'residential_land', 'available', 'sale',
  NULL, 750, NULL, NULL, NULL,
  35.270, 33.990, 'Bafra, İskele',
  (SELECT id FROM cities WHERE slug = 'iskele'),
  (SELECT id FROM districts WHERE slug = 'bafra' AND city_id = (SELECT id FROM cities WHERE slug = 'iskele')),
  FALSE, TRUE, 'tahsis'
);

-- Property 8: Güzelyurt Merkez Dükkan
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  'Cadde Üzeri Dükkan — Güzelyurt Merkez',
  'guzelyurt-merkez-cadde-uzeri-dukkan',
  'Güzelyurt ana cadde üzerinde köşe dükkan. 65 m², yüksek tavan, vitrinli cephe, depolu. Kiracılı olarak satılık, yatırıma uygun.',
  55000, 'GBP', 'shop', 'available', 'sale',
  65, 70, NULL, NULL, 1, 0, 3,
  35.200, 32.990, 'Güzelyurt Merkez',
  (SELECT id FROM cities WHERE slug = 'guzelyurt'),
  (SELECT id FROM districts WHERE slug = 'guzelyurt-merkez' AND city_id = (SELECT id FROM cities WHERE slug = 'guzelyurt')),
  FALSE, TRUE, 'turk'
);

-- Property 9: Girne Esentepe Bungalow
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active, title_deed_type
) VALUES (
  '2+1 Bungalow — Esentepe, Girne',
  'girne-esentepe-bungalow',
  'Esentepe''de dağ ve deniz manzaralı bungalow. 95 m², özel bahçe, teras, doğayla iç içe yaşam. Site içinde ortak havuz ve güvenlik.',
  135000, 'GBP', 'bungalow', 'available', 'sale',
  95, 120, 2, 1, 1, NULL, 1,
  2024, 'air_condition', 'shared', 'open', TRUE, 1,
  FALSE, TRUE, TRUE, 35.320, 33.560, 'Esentepe, Girne',
  (SELECT id FROM cities WHERE slug = 'girne'),
  (SELECT id FROM districts WHERE slug = 'esentepe' AND city_id = (SELECT id FROM cities WHERE slug = 'girne')),
  TRUE, TRUE, 'esdeger'
);

-- Property 10: Lefkoşa Hamitköy Günlük Kiralık
INSERT INTO properties (
  title, slug, description, price, currency, type, status, transaction_type,
  area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms, floor, total_floors,
  year_built, heating_type, pool_type, parking_type, furnished, balcony_count,
  elevator, garden, security_24_7, lat, lng, address,
  city_id, district_id, is_featured, is_active
) VALUES (
  '1+1 Günlük Kiralık — Hamitköy, Lefkoşa',
  'lefkosa-hamitkoy-gunluk-kiralik',
  'Lefkoşa Hamitköy''de üniversiteye yakın günlük kiralık daire. 55 m², tam eşyalı, klimalı, Wi-Fi. Öğrenci ve kısa süreli konaklama için ideal.',
  40, 'GBP', 'apartment', 'available', 'daily_rental',
  55, 65, 1, 1, 1, 4, 6,
  2022, 'air_condition', 'none', 'open', TRUE, 1,
  TRUE, FALSE, FALSE, 35.215, 33.365, 'Hamitköy, Lefkoşa',
  (SELECT id FROM cities WHERE slug = 'lefkosa'),
  (SELECT id FROM districts WHERE slug = 'hamitkoy' AND city_id = (SELECT id FROM cities WHERE slug = 'lefkosa')),
  FALSE, TRUE
);

COMMIT;
