-- 023: Add sequential listing_number to properties
-- Run this in Supabase Dashboard > SQL Editor

-- Add column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_number SERIAL;

-- Create sequence starting from 1
CREATE SEQUENCE IF NOT EXISTS property_listing_seq START 1;

-- Set existing properties with sequential numbers ordered by created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM properties
)
UPDATE properties SET listing_number = numbered.rn
FROM numbered WHERE properties.id = numbered.id;

-- Set sequence to next value
SELECT setval('property_listing_seq', COALESCE((SELECT MAX(listing_number) FROM properties), 0) + 1);

-- Set default for new rows
ALTER TABLE properties ALTER COLUMN listing_number SET DEFAULT nextval('property_listing_seq');
