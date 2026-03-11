-- Add video & virtual tour fields to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;

-- Price history table
CREATE TABLE IF NOT EXISTS property_price_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  old_price   NUMERIC(15, 2) NOT NULL,
  new_price   NUMERIC(15, 2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'TRY',
  changed_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_property ON property_price_history(property_id);

ALTER TABLE property_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_price_history" ON property_price_history FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_price_history" ON property_price_history FOR ALL USING (is_admin()) WITH CHECK (is_admin());
