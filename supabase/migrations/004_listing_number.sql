-- Add listing_number column with auto-increment sequence
CREATE SEQUENCE IF NOT EXISTS properties_listing_number_seq START WITH 1001;

ALTER TABLE properties
  ADD COLUMN listing_number INT UNIQUE DEFAULT nextval('properties_listing_number_seq');

-- Backfill existing rows (ordered by creation date)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) + 1000 AS num
  FROM properties
)
UPDATE properties
SET listing_number = numbered.num
FROM numbered
WHERE properties.id = numbered.id;

-- Reset sequence to continue after the highest number
SELECT setval('properties_listing_number_seq',
  COALESCE((SELECT MAX(listing_number) FROM properties), 1000));
