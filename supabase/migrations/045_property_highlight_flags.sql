-- ============================================================================
-- Property highlight flags — slider / featured / showcase / deal
-- ============================================================================
-- Lets admins hand-pick which active listings appear in each of four curated
-- surfaces on the public site. Each flag is paired with an order column so
-- drag-and-drop reordering in the admin UI persists.
--
-- Existing behaviour:
--   * is_featured already existed and drives both the homepage featured cards
--     and the /vitrin page today.
--   * /vitrin, the homepage hero slider and the "deal" band all fed off
--     is_featured (or, for deals, off a hard-coded "cheapest 4 sales" query).
--
-- After this migration:
--   * is_slider   → homepage hero carousel (3–5 premium picks)
--   * is_featured → homepage "öne çıkan" cards + arama sıralama önceliği
--   * is_showcase → /vitrin galerisi (hand-picked)
--   * is_deal     → homepage fırsat ilanları bandı (hand-picked, no auto cheapest)
--
-- Order columns are nullable integers; NULL rows sort to the end. The admin
-- UI rewrites the whole list on each drag-drop via a single update batch so
-- gaps don't matter.
-- ============================================================================

-- 1. Flags -------------------------------------------------------------------

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS is_slider   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_deal     BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Per-surface order -------------------------------------------------------

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS slider_order   INTEGER,
  ADD COLUMN IF NOT EXISTS featured_order INTEGER,
  ADD COLUMN IF NOT EXISTS showcase_order INTEGER,
  ADD COLUMN IF NOT EXISTS deal_order     INTEGER;

-- 3. Partial indexes for fast admin + public queries -------------------------

CREATE INDEX IF NOT EXISTS idx_properties_slider
  ON properties(slider_order NULLS LAST, created_at DESC)
  WHERE is_slider = TRUE AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_properties_featured_ordered
  ON properties(featured_order NULLS LAST, created_at DESC)
  WHERE is_featured = TRUE AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_properties_showcase
  ON properties(showcase_order NULLS LAST, created_at DESC)
  WHERE is_showcase = TRUE AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_properties_deal
  ON properties(deal_order NULLS LAST, created_at DESC)
  WHERE is_deal = TRUE AND is_active = TRUE;

-- 4. Comments for documentation ---------------------------------------------

COMMENT ON COLUMN properties.is_slider   IS 'Appears in the homepage hero slider. Admin hand-picks; 3–5 recommended.';
COMMENT ON COLUMN properties.is_showcase IS 'Appears on the /vitrin showcase page. Admin hand-picks.';
COMMENT ON COLUMN properties.is_deal     IS 'Appears in the homepage "fırsat ilanları" band. Admin hand-picks (replaces the old cheapest-first auto query).';
COMMENT ON COLUMN properties.slider_order   IS 'Display order inside the hero slider. NULL sorts last.';
COMMENT ON COLUMN properties.featured_order IS 'Display order inside the featured section. NULL sorts last.';
COMMENT ON COLUMN properties.showcase_order IS 'Display order inside the /vitrin page. NULL sorts last.';
COMMENT ON COLUMN properties.deal_order     IS 'Display order inside the deals band. NULL sorts last.';
