-- Migration 005: Admin Panel v2 schema enhancements
-- 1. Extend property_type_enum with 17 new types
-- 2. Add category column to site_settings
-- 3. Fix cms_pages → pages reference

-- ─── 1. Extend property_type_enum ────────────────────────────────────────────
-- Add new residential types
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'twin_villa';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'penthouse';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'residence';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'bungalow';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'building';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'timeshare';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'derelict';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'unfinished';

-- Add land types
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'residential_land';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'mixed_land';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'commercial_land';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'industrial_land';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'tourism_land';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'field';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'olive_grove';

-- Add commercial types
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'hotel';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'workplace';
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'business_transfer';

-- ─── 2. Add category column to site_settings ────────────────────────────────
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS category TEXT;

-- Assign categories to existing seed rows
UPDATE site_settings SET category = 'company' WHERE key IN ('company_name', 'company_phone', 'company_email', 'company_address');
UPDATE site_settings SET category = 'hero' WHERE key IN ('hero_title', 'hero_description', 'hero_cta_text', 'hero_cta_url');
UPDATE site_settings SET category = 'social' WHERE key IN ('instagram_url', 'facebook_url', 'linkedin_url', 'youtube_url', 'whatsapp_url', 'x_url', 'twitter_url');
UPDATE site_settings SET category = 'seo' WHERE key IN ('seo_title', 'seo_description', 'og_image');
UPDATE site_settings SET category = 'contact' WHERE key IN ('notification_email', 'contact_email');

-- ─── 3. Rename cms_pages to pages (create view for backward compat) ─────────
-- If cms_pages exists but pages does not, rename it
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cms_pages')
     AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pages') THEN
    ALTER TABLE cms_pages RENAME TO pages;
  END IF;

  -- If pages exists but cms_pages does not, create a view for backward compat
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pages')
     AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cms_pages')
     AND NOT EXISTS (SELECT FROM pg_views WHERE schemaname = 'public' AND viewname = 'cms_pages') THEN
    EXECUTE 'CREATE VIEW cms_pages AS SELECT * FROM pages';
  END IF;
END $$;
