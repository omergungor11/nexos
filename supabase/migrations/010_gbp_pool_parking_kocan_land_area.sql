-- Migration 010: GBP currency, pool/parking types, koçan durumu, land area for villas
-- Run this in Supabase Dashboard SQL Editor

-- 1. Add GBP to currency enum
ALTER TYPE currency_enum ADD VALUE IF NOT EXISTS 'GBP';

-- 2. Add new columns to properties table
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS pool_type TEXT CHECK (pool_type IN ('none', 'private', 'shared')) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS parking_type TEXT CHECK (parking_type IN ('none', 'open', 'closed', 'both')) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS title_deed_type TEXT CHECK (title_deed_type IN ('esdeger', 'tahsis', 'turk', 'gazi', 'yabanci', 'other')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS land_area_sqm NUMERIC(12,2) DEFAULT NULL;

-- 3. Add lat/lng columns to cities and districts for map fallback
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION DEFAULT NULL;

ALTER TABLE districts
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION DEFAULT NULL;

-- 4. Update North Cyprus city coordinates (approximate centers)
UPDATE cities SET lat = 35.185, lng = 33.382 WHERE slug = 'lefkosa';
UPDATE cities SET lat = 35.125, lng = 33.941 WHERE slug = 'gazimagusa';
UPDATE cities SET lat = 35.337, lng = 33.319 WHERE slug = 'girne';
UPDATE cities SET lat = 35.289, lng = 32.910 WHERE slug = 'guzelyurt';
UPDATE cities SET lat = 35.296, lng = 34.004 WHERE slug = 'iskele';
UPDATE cities SET lat = 35.520, lng = 34.100 WHERE slug = 'karpaz';
UPDATE cities SET lat = 35.190, lng = 33.370 WHERE slug = 'lefke';

-- 5. Migrate existing boolean pool/parking data to new type columns
UPDATE properties SET pool_type = 'private' WHERE pool = TRUE;
UPDATE properties SET parking_type = 'closed' WHERE parking = TRUE;
