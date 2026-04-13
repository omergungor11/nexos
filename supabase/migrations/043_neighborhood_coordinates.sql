-- Give neighborhoods their own lat/lng so the map fallback chain can reach
-- neighborhood-level precision (property -> neighborhood -> district -> city).
ALTER TABLE neighborhoods
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION DEFAULT NULL;
