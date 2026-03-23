-- 016: Seed property images for 10 North Cyprus properties using Unsplash URLs
-- Run this in Supabase Dashboard > SQL Editor

BEGIN;

-- Property 1: Çatalköy Villa (4 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'catalkoy-mustakil-villa-ozel-havuzlu'),
 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', 'Çatalköy villa dış cephe', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'catalkoy-mustakil-villa-ozel-havuzlu'),
 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'Villa havuz alanı', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'catalkoy-mustakil-villa-ozel-havuzlu'),
 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', 'Villa salon', 2, FALSE),
((SELECT id FROM properties WHERE slug = 'catalkoy-mustakil-villa-ozel-havuzlu'),
 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', 'Villa mutfak', 3, FALSE);

-- Property 2: Alsancak Penthouse (4 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'alsancak-penthouse-cati-terasi'),
 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'Penthouse salon görünümü', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'alsancak-penthouse-cati-terasi'),
 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'Penthouse yatak odası', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'alsancak-penthouse-cati-terasi'),
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'Çatı terası manzara', 2, FALSE),
((SELECT id FROM properties WHERE slug = 'alsancak-penthouse-cati-terasi'),
 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'Penthouse banyo', 3, FALSE);

-- Property 3: İskele Long Beach Daire (4 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'iskele-long-beach-2-plus-1-daire'),
 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 'Long Beach daire dış cephe', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'iskele-long-beach-2-plus-1-daire'),
 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80', 'Daire salon', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'iskele-long-beach-2-plus-1-daire'),
 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80', 'Kompleks havuz', 2, FALSE),
((SELECT id FROM properties WHERE slug = 'iskele-long-beach-2-plus-1-daire'),
 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80', 'Deniz manzarası balkon', 3, FALSE);

-- Property 4: Lefkoşa Gönyeli Daire (3 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'lefkosa-gonyeli-3-plus-1-daire'),
 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80', 'Gönyeli daire bina', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'lefkosa-gonyeli-3-plus-1-daire'),
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', 'Daire oturma odası', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'lefkosa-gonyeli-3-plus-1-daire'),
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'Modern mutfak', 2, FALSE);

-- Property 5: Gazimağusa İkiz Villa (4 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'gazimagusa-yenibogazici-ikiz-villa'),
 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', 'İkiz villa dış görünüm', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'gazimagusa-yenibogazici-ikiz-villa'),
 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80', 'Villa bahçe', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'gazimagusa-yenibogazici-ikiz-villa'),
 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', 'Villa iç mekan', 2, FALSE),
((SELECT id FROM properties WHERE slug = 'gazimagusa-yenibogazici-ikiz-villa'),
 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80', 'Villa yatak odası', 3, FALSE);

-- Property 6: Girne Lapta Kiralık (3 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'girne-lapta-kiralik-2-plus-1'),
 'https://images.unsplash.com/photo-1493809842364-78f1e9615053?w=800&q=80', 'Lapta daire manzara', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'girne-lapta-kiralik-2-plus-1'),
 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80', 'Kiralık daire salon', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'girne-lapta-kiralik-2-plus-1'),
 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', 'Daire mutfak', 2, FALSE);

-- Property 7: İskele Bafra Arsa (2 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'iskele-bafra-konut-imarli-arsa'),
 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', 'Bafra arsa genel görünüm', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'iskele-bafra-konut-imarli-arsa'),
 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80', 'Arsa yakın çekim', 1, FALSE);

-- Property 8: Güzelyurt Dükkan (3 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'guzelyurt-merkez-cadde-uzeri-dukkan'),
 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&q=80', 'Dükkan dış cephe', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'guzelyurt-merkez-cadde-uzeri-dukkan'),
 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80', 'Dükkan iç mekan', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'guzelyurt-merkez-cadde-uzeri-dukkan'),
 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80', 'Dükkan vitrin', 2, FALSE);

-- Property 9: Girne Esentepe Bungalow (4 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'girne-esentepe-bungalow'),
 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&q=80', 'Esentepe bungalow dış', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'girne-esentepe-bungalow'),
 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', 'Bungalow teras', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'girne-esentepe-bungalow'),
 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', 'Bungalow salon', 2, FALSE),
((SELECT id FROM properties WHERE slug = 'girne-esentepe-bungalow'),
 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&q=80', 'Bungalow bahçe', 3, FALSE);

-- Property 10: Lefkoşa Hamitköy Günlük Kiralık (3 images)
INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover) VALUES
((SELECT id FROM properties WHERE slug = 'lefkosa-hamitkoy-gunluk-kiralik'),
 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80', 'Günlük kiralık daire salon', 0, TRUE),
((SELECT id FROM properties WHERE slug = 'lefkosa-hamitkoy-gunluk-kiralik'),
 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', 'Yatak odası', 1, FALSE),
((SELECT id FROM properties WHERE slug = 'lefkosa-hamitkoy-gunluk-kiralik'),
 'https://images.unsplash.com/photo-1564540583246-934409427776?w=800&q=80', 'Mutfak ve yemek alanı', 2, FALSE);

COMMIT;
