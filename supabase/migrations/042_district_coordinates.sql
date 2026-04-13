-- Populate district lat/lng so that when a listing has no explicit coords
-- the map falls back to the district center (not the whole-city center).
--
-- Strategy:
-- 1) For any district still missing lat/lng, seed it with the parent city's
--    coordinates so the fallback always yields something.
-- 2) Override the populated/well-known districts with their actual centers
--    (coordinates taken from OpenStreetMap).

-- 1) City-level fallback for every district
UPDATE districts d
SET lat = c.lat, lng = c.lng
FROM cities c
WHERE d.city_id = c.id
  AND (d.lat IS NULL OR d.lng IS NULL)
  AND c.lat IS NOT NULL
  AND c.lng IS NOT NULL;

-- 2) Well-known districts with accurate centers
-- Girne (Kyrenia) region
UPDATE districts SET lat = 35.3417, lng = 33.3192 WHERE slug = 'girne-merkez';
UPDATE districts SET lat = 35.3486, lng = 33.2361 WHERE slug = 'alsancak';
UPDATE districts SET lat = 35.3406, lng = 33.2108 WHERE slug = 'karsiyaka';
UPDATE districts SET lat = 35.3450, lng = 33.1822 WHERE slug = 'lapta';
UPDATE districts SET lat = 35.3375, lng = 33.3561 WHERE slug = 'catalkoy';
UPDATE districts SET lat = 35.3575, lng = 33.5653 WHERE slug = 'esentepe';
UPDATE districts SET lat = 35.3562, lng = 33.5147 WHERE slug = 'bahceli';
UPDATE districts SET lat = 35.3881, lng = 33.7594 WHERE slug = 'tatlisu';
UPDATE districts SET lat = 35.3292, lng = 33.3469 WHERE slug = 'beylerbeyi';
UPDATE districts SET lat = 35.3294, lng = 33.3314 WHERE slug = 'ozankoy';
UPDATE districts SET lat = 35.3031, lng = 33.2861 WHERE slug = 'karaman';
UPDATE districts SET lat = 35.3336, lng = 33.3856 WHERE slug = 'arapkoy';
UPDATE districts SET lat = 35.2844, lng = 33.2456 WHERE slug = 'malatya';
UPDATE districts SET lat = 35.3486, lng = 33.2647 WHERE slug = 'camlibel';
UPDATE districts SET lat = 35.3175, lng = 33.1003 WHERE slug = 'sadrazamkoy';
UPDATE districts SET lat = 35.3272, lng = 33.3031 WHERE slug = 'pinarbasi';
UPDATE districts SET lat = 35.3253, lng = 33.2797 WHERE slug = 'tepebasi';
UPDATE districts SET lat = 35.3431, lng = 33.2253 WHERE slug = 'karaagac';
UPDATE districts SET lat = 35.2872, lng = 33.2975 WHERE slug = 'bogazkoy';
UPDATE districts SET lat = 35.2831, lng = 33.3578 WHERE slug = 'dagyolu';

-- İskele region
UPDATE districts SET lat = 35.2878, lng = 33.8958 WHERE slug = 'iskele-merkez';
UPDATE districts SET lat = 35.3319, lng = 33.8700 WHERE slug = 'bogazici';
UPDATE districts SET lat = 35.4014, lng = 34.0358 WHERE slug = 'bafra';
UPDATE districts SET lat = 35.5236, lng = 34.1158 WHERE slug = 'yeni-erenkoy';
UPDATE districts SET lat = 35.6000, lng = 34.3833 WHERE slug = 'dipkarpaz';
UPDATE districts SET lat = 35.4769, lng = 34.0322 WHERE slug = 'mehmetcik';
UPDATE districts SET lat = 35.5303, lng = 34.1339 WHERE slug = 'ziyamet';
UPDATE districts SET lat = 35.5489, lng = 34.2236 WHERE slug = 'sipahi';
UPDATE districts SET lat = 35.5567, lng = 34.2581 WHERE slug = 'yesilkoy';
UPDATE districts SET lat = 35.4089, lng = 33.9642 WHERE slug = 'buyukkonuk';
UPDATE districts SET lat = 35.3122, lng = 33.8381 WHERE slug = 'kumyali';
UPDATE districts SET lat = 35.3236, lng = 33.9303 WHERE slug = 'yarkoy';
UPDATE districts SET lat = 35.5489, lng = 34.2833 WHERE slug = 'kaleburnu';
UPDATE districts SET lat = 35.3047, lng = 33.7869 WHERE slug = 'gecitkale';
UPDATE districts SET lat = 35.2836, lng = 33.8700 WHERE slug = 'mersinlik';

-- Gazimağusa (Famagusta) region
UPDATE districts SET lat = 35.1264, lng = 33.9619 WHERE slug = 'gazimagusa-merkez';
UPDATE districts SET lat = 35.1689, lng = 33.8897 WHERE slug = 'yenibogazici';
UPDATE districts SET lat = 35.1478, lng = 33.7647 WHERE slug = 'dortyol';
UPDATE districts SET lat = 35.1025, lng = 33.8881 WHERE slug = 'mutluyaka';
UPDATE districts SET lat = 35.1197, lng = 33.7400 WHERE slug = 'vadili';
UPDATE districts SET lat = 35.1781, lng = 33.7619 WHERE slug = 'akdogan';
UPDATE districts SET lat = 35.2014, lng = 33.7939 WHERE slug = 'serdarli';
UPDATE districts SET lat = 35.0894, lng = 33.6894 WHERE slug = 'pile';
UPDATE districts SET lat = 35.0653, lng = 33.9028 WHERE slug = 'paskoy';
UPDATE districts SET lat = 35.1542, lng = 33.9553 WHERE slug = 'sehitler';
UPDATE districts SET lat = 35.0647, lng = 33.9558 WHERE slug = 'beyarmudu';

-- Lefkoşa (Nicosia) region
UPDATE districts SET lat = 35.1764, lng = 33.3642 WHERE slug = 'lefkosa-surlarici';
UPDATE districts SET lat = 35.2125, lng = 33.3222 WHERE slug = 'gonyeli';
UPDATE districts SET lat = 35.2311, lng = 33.3311 WHERE slug = 'yenikent';
UPDATE districts SET lat = 35.1975, lng = 33.3511 WHERE slug = 'hamitkoy';
UPDATE districts SET lat = 35.1897, lng = 33.3886 WHERE slug = 'haspolat';
UPDATE districts SET lat = 35.1842, lng = 33.3531 WHERE slug = 'kizilbas';
UPDATE districts SET lat = 35.1731, lng = 33.3572 WHERE slug = 'gocmenkoy';
UPDATE districts SET lat = 35.1917, lng = 33.3592 WHERE slug = 'ortakoy';
UPDATE districts SET lat = 35.1889, lng = 33.3450 WHERE slug = 'kucuk-kaymakli';
UPDATE districts SET lat = 35.1922, lng = 33.3422 WHERE slug = 'metehan';
UPDATE districts SET lat = 35.1814, lng = 33.3800 WHERE slug = 'kumsal';
UPDATE districts SET lat = 35.1961, lng = 33.3683 WHERE slug = 'koskluciftlik';
UPDATE districts SET lat = 35.1928, lng = 33.3864 WHERE slug = 'yenisehir';
UPDATE districts SET lat = 35.1919, lng = 33.3333 WHERE slug = 'taskinkoy';
UPDATE districts SET lat = 35.1817, lng = 33.3708 WHERE slug = 'marmara';
UPDATE districts SET lat = 35.1994, lng = 33.3103 WHERE slug = 'alaykoy';
UPDATE districts SET lat = 35.1803, lng = 33.4008 WHERE slug = 'minarelikoy';
UPDATE districts SET lat = 35.2522, lng = 33.4458 WHERE slug = 'degirmenlik';
UPDATE districts SET lat = 35.1958, lng = 33.3208 WHERE slug = 'yilmazkoy';

-- Güzelyurt (Morphou) region
UPDATE districts SET lat = 35.1989, lng = 32.9897 WHERE slug = 'guzelyurt-merkez';
UPDATE districts SET lat = 35.2761, lng = 32.9222 WHERE slug = 'kalkanli';
UPDATE districts SET lat = 35.1889, lng = 32.9658 WHERE slug = 'zumrutkoy';
UPDATE districts SET lat = 35.2092, lng = 33.0519 WHERE slug = 'serhatkoy';
UPDATE districts SET lat = 35.2167, lng = 32.9944 WHERE slug = 'aydinkoy';
UPDATE districts SET lat = 35.2833, lng = 32.9461 WHERE slug = 'sahinler';

-- Lefke region
UPDATE districts SET lat = 35.1139, lng = 32.8486 WHERE slug = 'lefke-merkez';
UPDATE districts SET lat = 35.1708, lng = 32.7833 WHERE slug = 'gemikonagi';
UPDATE districts SET lat = 35.1489, lng = 32.7111 WHERE slug = 'erenkoy';
UPDATE districts SET lat = 35.1497, lng = 32.8239 WHERE slug = 'gaziveren';
UPDATE districts SET lat = 35.1458, lng = 32.8694 WHERE slug = 'bademlikoy';
UPDATE districts SET lat = 35.1225, lng = 32.9053 WHERE slug = 'taskoy';
