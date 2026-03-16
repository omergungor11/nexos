-- Migration 014: Landing pages for marketing campaigns
-- Run this in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  hero_image TEXT,
  content TEXT,
  cta_text TEXT DEFAULT 'İletişime Geç',
  cta_url TEXT DEFAULT '/iletisim',
  filter_params TEXT, -- URL query params for property filter (e.g. "islem=satilik&tip=villa&sehir=girne")
  is_published BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_published ON landing_pages(is_published);

CREATE TRIGGER trg_landing_pages_updated_at
  BEFORE UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_landing_pages" ON landing_pages FOR SELECT USING (is_published = TRUE);
CREATE POLICY "admin_all_landing_pages" ON landing_pages FOR ALL TO authenticated WITH CHECK (TRUE);
