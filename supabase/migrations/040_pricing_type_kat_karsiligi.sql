-- Allow 'kat_karsiligi' (construction-for-land swap) as a pricing_type option
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_pricing_type_check;

ALTER TABLE properties
  ADD CONSTRAINT properties_pricing_type_check
  CHECK (pricing_type IN ('fixed', 'exchange', 'offer', 'kat_karsiligi'));
