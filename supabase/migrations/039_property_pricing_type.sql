-- Add pricing_type (fixed | exchange | offer) and price_per_donum for land listings
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS pricing_type TEXT NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS price_per_donum NUMERIC(15, 2);

-- Relax the NOT NULL constraint on price since exchange/offer listings don't have one
ALTER TABLE properties ALTER COLUMN price DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'properties_pricing_type_check'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT properties_pricing_type_check
      CHECK (pricing_type IN ('fixed', 'exchange', 'offer'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_properties_pricing_type ON properties(pricing_type);
