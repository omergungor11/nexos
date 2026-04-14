-- ============================================================================
-- Sub-listings — polymorphic "units" / "variants" under a property or project
-- ============================================================================
-- Use cases:
--   * Site içindeki bağımsız daire/villa tipleri (projeler için birincil)
--   * Aynı ilan içindeki farklı satış seçenekleri (1+1 stüdyo + 2+1 daire)
--   * Tek ilanın içinde farklı fiyatlı birimler
--
-- Polymorphic: parent_type + parent_id. CHECK constraint enforces that only
-- one of property/project is referenced. No true FK to the parent table; a
-- trigger on DELETE of parent cleans up children.
-- ============================================================================

CREATE TABLE IF NOT EXISTS sub_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic parent
  parent_type TEXT NOT NULL CHECK (parent_type IN ('property', 'project')),
  parent_id   UUID NOT NULL,

  -- Display
  label       TEXT NOT NULL,
  description TEXT,

  -- Specs
  rooms         INTEGER,
  living_rooms  INTEGER,
  bathrooms     INTEGER,
  room_config   TEXT,
  area_sqm      NUMERIC(10, 2),
  gross_area_sqm NUMERIC(10, 2),

  -- Pricing (optional — inherits from parent if NULL)
  price     NUMERIC(15, 2),
  currency  TEXT CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),

  -- Inventory
  availability TEXT NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'reserved', 'sold', 'rented')),
  unit_count   INTEGER NOT NULL DEFAULT 1,

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sub_listings_parent
  ON sub_listings(parent_type, parent_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_sub_listings_availability
  ON sub_listings(parent_type, parent_id, availability)
  WHERE availability = 'available';

-- Updated_at trigger
CREATE TRIGGER trg_sub_listings_updated_at
  BEFORE UPDATE ON sub_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Cascade cleanup on parent delete (no real FK because parent is polymorphic)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cleanup_sub_listings_on_property_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM sub_listings WHERE parent_type = 'property' AND parent_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_sub_listings_on_project_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM sub_listings WHERE parent_type = 'project' AND parent_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cleanup_sub_listings_on_property_delete ON properties;
CREATE TRIGGER trg_cleanup_sub_listings_on_property_delete
  BEFORE DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION cleanup_sub_listings_on_property_delete();

DROP TRIGGER IF EXISTS trg_cleanup_sub_listings_on_project_delete ON projects;
CREATE TRIGGER trg_cleanup_sub_listings_on_project_delete
  BEFORE DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION cleanup_sub_listings_on_project_delete();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

ALTER TABLE sub_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_sub_listings" ON sub_listings
  FOR SELECT USING (TRUE);

CREATE POLICY "admin_all_sub_listings" ON sub_listings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Comments
COMMENT ON TABLE sub_listings IS 'Polymorphic units/variants under a property or project (e.g. site içindeki daire tipleri, tek ilan içindeki farklı birimler).';
COMMENT ON COLUMN sub_listings.parent_type IS 'Parent entity: property or project.';
COMMENT ON COLUMN sub_listings.unit_count IS 'How many identical units exist for this variant (site projelerinde daire sayısı).';
COMMENT ON COLUMN sub_listings.availability IS 'available / reserved / sold / rented.';
