-- ============================================================================
-- Property Showcases — shareable WhatsApp/landing page bundles
-- ============================================================================
-- A showcase is a curated set of properties prepared by an admin for a
-- specific customer and shared via a short-slug public URL. The customer
-- opens it from a WhatsApp message; the admin sees view counts.
--
-- This is intentionally a separate table from `custom_offers` (which
-- represents a single-property price negotiation). The two have very
-- different lifecycles and data shapes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_showcases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count      INTEGER NOT NULL DEFAULT 0,
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at  TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_showcases_slug ON property_showcases(slug);
CREATE INDEX IF NOT EXISTS idx_showcases_active
  ON property_showcases(created_at DESC)
  WHERE is_archived = FALSE;

CREATE TABLE IF NOT EXISTS property_showcase_items (
  showcase_id UUID NOT NULL REFERENCES property_showcases(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (showcase_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_showcase_items_showcase
  ON property_showcase_items(showcase_id, sort_order);

-- updated_at trigger (function already exists from earlier migrations)
CREATE TRIGGER trg_property_showcases_updated_at
  BEFORE UPDATE ON property_showcases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------

ALTER TABLE property_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_showcase_items ENABLE ROW LEVEL SECURITY;

-- Admin: full control
CREATE POLICY "admin_all_showcases" ON property_showcases
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_showcase_items" ON property_showcase_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Public: read only non-archived, non-expired showcases
CREATE POLICY "public_read_showcases" ON property_showcases
  FOR SELECT USING (
    is_archived = FALSE
    AND (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "public_read_showcase_items" ON property_showcase_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM property_showcases s
      WHERE s.id = showcase_id
        AND s.is_archived = FALSE
        AND (s.expires_at IS NULL OR s.expires_at > NOW())
    )
  );

-- ----------------------------------------------------------------------------
-- View tracking RPC — anon clients increment the counter via this function
-- so we don't need broader UPDATE permissions on the table.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_showcase_view(p_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE property_showcases
  SET view_count      = view_count + 1,
      first_viewed_at = COALESCE(first_viewed_at, NOW()),
      last_viewed_at  = NOW()
  WHERE slug = p_slug
    AND is_archived = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION increment_showcase_view(TEXT) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- Comments
-- ----------------------------------------------------------------------------

COMMENT ON TABLE property_showcases IS 'WhatsApp/landing-page property bundles prepared per-customer. Slug is short and unguessable.';
COMMENT ON COLUMN property_showcases.slug IS '8-12 char nanoid; appears in /teklif/<slug> public URL.';
COMMENT ON COLUMN property_showcases.expires_at IS 'After this moment the showcase 404s in public + drops out of "active" list. NULL = never expires.';
COMMENT ON COLUMN property_showcases.view_count IS 'Incremented by increment_showcase_view RPC (called once per session client-side).';
COMMENT ON TABLE property_showcase_items IS 'Many-to-many ordered link between showcases and properties.';
