-- ============================================================================
-- Sub-listings — cover image + property type
-- ============================================================================
-- Admins kept asking for each sub-listing / unit row to carry its own
-- thumbnail and property type (daire/villa/dükkan etc.) so the public detail
-- page and cross-referenced cards can render something meaningful without
-- falling back to the parent's single cover.
--
-- Both columns are nullable — existing rows stay untouched.
-- ============================================================================

ALTER TABLE sub_listings
  ADD COLUMN IF NOT EXISTS cover_image   TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT;

COMMENT ON COLUMN sub_listings.cover_image IS
  'Public URL for this unit''s cover image (Supabase Storage or external). NULL → use parent property cover.';
COMMENT ON COLUMN sub_listings.property_type IS
  'Maps to property_type_enum literals (villa / apartment / shop / ...). Free-form TEXT so the app can validate against the enum.';
