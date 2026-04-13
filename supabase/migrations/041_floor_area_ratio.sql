-- Imar oranı (floor-area ratio) for land listings, e.g. 0.60, 1.20
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS floor_area_ratio NUMERIC(5, 2);
