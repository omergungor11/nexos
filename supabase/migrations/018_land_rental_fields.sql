-- Migration 018: Land infrastructure fields + rental period fields
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS has_road_access BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_electricity BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_water BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS zoning_status TEXT CHECK (zoning_status IN ('none', 'residential', 'commercial', 'mixed', 'industrial', 'tourism', 'agricultural')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS min_rental_period TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rental_payment_interval TEXT CHECK (rental_payment_interval IN ('daily', 'monthly', '3months', '6months', 'yearly')) DEFAULT NULL;
