-- Ensure pricing_type / price_per_donum exist (in case 039 wasn't applied)
-- and allow 'kat_karsiligi' as a value.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS pricing_type TEXT NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS price_per_donum NUMERIC(15, 2);

ALTER TABLE properties ALTER COLUMN price DROP NOT NULL;

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_pricing_type_check;

ALTER TABLE properties
  ADD CONSTRAINT properties_pricing_type_check
  CHECK (pricing_type IN ('fixed', 'exchange', 'offer', 'kat_karsiligi'));

CREATE INDEX IF NOT EXISTS idx_properties_pricing_type ON properties(pricing_type);
