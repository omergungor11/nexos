-- ============================================================================
-- Sub-listings — gallery images
-- ============================================================================
-- cover_image stays as the primary image. gallery_images holds any additional
-- photos for this unit / variant in display order. Kept as TEXT[] (public
-- Supabase Storage URLs) because sub-listings don't need their own images
-- table yet — a single-property unit rarely has more than 6–8 photos.
-- ============================================================================

ALTER TABLE sub_listings
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN sub_listings.gallery_images IS
  'Additional gallery image URLs in display order. cover_image is the primary; this is the long tail.';
