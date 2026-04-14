-- ============================================================================
-- Floor plans — polymorphic attachment to property / project / sub_listing
-- ============================================================================
-- Why a separate table (not property_images):
--   * Kat planı semantik olarak galeri görselinden ayrı — başlık zorunlu,
--     sıralama bağımsız, sub-listing'e bağlanabilir
--   * Ayrı görüntüleme bileşeni (grid + lightbox)
--   * Sub-listing'in kendi kat planı olabiliyor
--
-- Polymorphic parent: property | project | sub_listing
-- ============================================================================

CREATE TABLE IF NOT EXISTS floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic parent
  parent_type TEXT NOT NULL CHECK (parent_type IN ('property', 'project', 'sub_listing')),
  parent_id   UUID NOT NULL,

  -- Media
  url       TEXT NOT NULL,
  alt_text  TEXT,
  label     TEXT NOT NULL,

  -- Optional specs (katın kaç m², kaç oda olduğunu göstermek için)
  area_sqm  NUMERIC(10, 2),
  rooms     INTEGER,

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_floor_plans_parent
  ON floor_plans(parent_type, parent_id, sort_order);

CREATE TRIGGER trg_floor_plans_updated_at
  BEFORE UPDATE ON floor_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Cascade cleanup
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cleanup_floor_plans_on_property_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM floor_plans WHERE parent_type = 'property' AND parent_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_floor_plans_on_project_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM floor_plans WHERE parent_type = 'project' AND parent_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_floor_plans_on_sub_listing_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM floor_plans WHERE parent_type = 'sub_listing' AND parent_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cleanup_floor_plans_on_property_delete ON properties;
CREATE TRIGGER trg_cleanup_floor_plans_on_property_delete
  BEFORE DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION cleanup_floor_plans_on_property_delete();

DROP TRIGGER IF EXISTS trg_cleanup_floor_plans_on_project_delete ON projects;
CREATE TRIGGER trg_cleanup_floor_plans_on_project_delete
  BEFORE DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION cleanup_floor_plans_on_project_delete();

DROP TRIGGER IF EXISTS trg_cleanup_floor_plans_on_sub_listing_delete ON sub_listings;
CREATE TRIGGER trg_cleanup_floor_plans_on_sub_listing_delete
  BEFORE DELETE ON sub_listings
  FOR EACH ROW EXECUTE FUNCTION cleanup_floor_plans_on_sub_listing_delete();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_floor_plans" ON floor_plans
  FOR SELECT USING (TRUE);

CREATE POLICY "admin_all_floor_plans" ON floor_plans
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

COMMENT ON TABLE floor_plans IS 'Polymorphic floor plan images attachable to property, project, or sub_listing.';
COMMENT ON COLUMN floor_plans.label IS 'Örn: "Zemin Kat", "A Blok 2+1", "Teras".';
