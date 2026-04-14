-- ============================================================================
-- Location coordinate accuracy fix
-- ============================================================================
-- Earlier migrations (010 city coords, 042 district coords) seeded
-- coordinates from a mix of Nominatim queries and manual estimates. Several
-- ended up materially wrong (5-12 km off the true centre, or in one case
-- pointing at the wrong city entirely):
--
--   * iskele   was ~10 km east of the actual İskele/Trikomo town centre
--   * guzelyurt was ~10 km north of Morphou
--   * lefke    was pointing into the Lefkoşa region — completely wrong end
--   * mersinlik was ~12 km south of the real village
--   * karsiyaka, mehmetcik, alsancak, tatlisu were several km off
--   * long-beach and bahceler had no coords at all → silently fell back to
--     the (already-wrong) city centre
--
-- This migration overwrites the impacted rows with values cross-checked
-- against Wikipedia + OpenStreetMap (Nominatim) and verified to fall inside
-- the Cyprus bounding box (lat 34.5-35.7, lng 32.2-34.6).
--
-- It is an UPDATE-only migration: no schema change, no row creation. Safe
-- to re-run.
-- ============================================================================

-- 1) City corrections ---------------------------------------------------------

UPDATE cities SET lat = 35.1753, lng = 33.3647 WHERE slug = 'lefkosa';     -- Nicosia
UPDATE cities SET lat = 35.3403, lng = 33.3192 WHERE slug = 'girne';        -- Kyrenia
UPDATE cities SET lat = 35.1250, lng = 33.9417 WHERE slug = 'gazimagusa';   -- Famagusta
UPDATE cities SET lat = 35.2875, lng = 33.8917 WHERE slug = 'iskele';       -- Trikomo
UPDATE cities SET lat = 35.1981, lng = 32.9939 WHERE slug = 'guzelyurt';    -- Morphou
UPDATE cities SET lat = 35.1139, lng = 32.8499 WHERE slug = 'lefke';        -- Lefka

-- 2) İskele region — fix off-centre rows + add coords for new districts ------

UPDATE districts SET lat = 35.2864, lng = 33.9126 WHERE slug = 'bahceler';
UPDATE districts SET lat = 35.2623, lng = 33.9072 WHERE slug = 'long-beach';
UPDATE districts SET lat = 35.3965, lng = 33.8571 WHERE slug = 'mersinlik';
UPDATE districts SET lat = 35.4221, lng = 34.0693 WHERE slug = 'mehmetcik';
UPDATE districts SET lat = 35.4104, lng = 33.9936 WHERE slug = 'buyukkonuk';
UPDATE districts SET lat = 35.3795, lng = 34.0713 WHERE slug = 'bafra';
UPDATE districts SET lat = 35.3150, lng = 33.9506 WHERE slug = 'bogazici';   -- Boğaz village
UPDATE districts SET lat = 35.3568, lng = 33.8860 WHERE slug = 'ardahan';
UPDATE districts SET lat = 35.3660, lng = 34.0298 WHERE slug = 'cayirova';
UPDATE districts SET lat = 35.5977, lng = 34.3807 WHERE slug = 'dipkarpaz';

-- 3) Girne region — refine northern coastline ----------------------------------

UPDATE districts SET lat = 35.3441, lng = 33.1961 WHERE slug = 'alsancak';
UPDATE districts SET lat = 35.3387, lng = 33.1723 WHERE slug = 'lapta';
UPDATE districts SET lat = 35.3481, lng = 33.1212 WHERE slug = 'karsiyaka';
UPDATE districts SET lat = 35.3424, lng = 33.2717 WHERE slug = 'karaoglanoglu';
UPDATE districts SET lat = 35.3213, lng = 33.3907 WHERE slug = 'catalkoy';
UPDATE districts SET lat = 35.3196, lng = 33.3534 WHERE slug = 'ozankoy';
UPDATE districts SET lat = 35.3000, lng = 33.3500 WHERE slug = 'bellapais';
UPDATE districts SET lat = 35.3394, lng = 33.5832 WHERE slug = 'esentepe';
UPDATE districts SET lat = 35.4158, lng = 33.8307 WHERE slug = 'tatlisu';
UPDATE districts SET lat = 35.4040, lng = 32.9203 WHERE slug = 'korucam';

-- 4) Gazimağusa region --------------------------------------------------------

UPDATE districts SET lat = 35.1611, lng = 33.8831 WHERE slug = 'tuzla';
UPDATE districts SET lat = 35.0505, lng = 33.6591 WHERE slug = 'beyarmudu';   -- Pyla
UPDATE districts SET lat = 35.2360, lng = 33.7225 WHERE slug = 'gecitkale';   -- Lefkoniko
UPDATE districts SET lat = 35.2200, lng = 33.9035 WHERE slug = 'yenibogazici';

-- 5) Lefkoşa region -----------------------------------------------------------

UPDATE districts SET lat = 35.2170, lng = 33.3752 WHERE slug = 'hamitkoy';
UPDATE districts SET lat = 35.2315, lng = 33.2963 WHERE slug = 'gonyeli';
UPDATE districts SET lat = 35.2219, lng = 33.4170 WHERE slug = 'haspolat';
UPDATE districts SET lat = 35.2003, lng = 33.3402 WHERE slug = 'ortakoy';
UPDATE districts SET lat = 35.2045, lng = 33.3181 WHERE slug = 'yenikent';

-- 6) Güzelyurt + Lefke regions ------------------------------------------------

UPDATE districts SET lat = 35.1428, lng = 32.8113 WHERE slug = 'gemikonagi';

-- 7) Final safety net ---------------------------------------------------------
-- Any district still missing coords inherits from its city. Mahalle table
-- already follows this pattern via PropertyMap fallback chain.

UPDATE districts d
SET lat = c.lat, lng = c.lng
FROM cities c
WHERE d.city_id = c.id
  AND (d.lat IS NULL OR d.lng IS NULL)
  AND c.lat IS NOT NULL
  AND c.lng IS NOT NULL;

-- 8) Documentation ------------------------------------------------------------

COMMENT ON COLUMN cities.lat IS 'City centre latitude. Verified against Wikipedia + OpenStreetMap (last reviewed 048).';
COMMENT ON COLUMN cities.lng IS 'City centre longitude. Verified against Wikipedia + OpenStreetMap (last reviewed 048).';
COMMENT ON COLUMN districts.lat IS 'District/village centre latitude. Falls back to city centre if NULL.';
COMMENT ON COLUMN districts.lng IS 'District/village centre longitude. Falls back to city centre if NULL.';
