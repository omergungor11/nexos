-- Migration 013: Blog categories and tags
-- Run this in Supabase Dashboard SQL Editor

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog post <-> tag junction
CREATE TABLE IF NOT EXISTS blog_post_tags (
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, tag_id)
);

-- Add category_id to blog_posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS category_id INT REFERENCES blog_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);

-- RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_blog_categories" ON blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_blog_categories" ON blog_categories FOR ALL TO authenticated WITH CHECK (TRUE);

CREATE POLICY "public_read_blog_tags" ON blog_tags FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_blog_tags" ON blog_tags FOR ALL TO authenticated WITH CHECK (TRUE);

CREATE POLICY "public_read_blog_post_tags" ON blog_post_tags FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_blog_post_tags" ON blog_post_tags FOR ALL TO authenticated WITH CHECK (TRUE);

-- Seed default categories
INSERT INTO blog_categories (name, slug, sort_order) VALUES
  ('Yatırım Rehberi', 'yatirim-rehberi', 1),
  ('Yaşam Rehberi', 'yasam-rehberi', 2),
  ('Hukuki Bilgiler', 'hukuki-bilgiler', 3),
  ('Piyasa Analizi', 'piyasa-analizi', 4),
  ('Bölge Tanıtımı', 'bolge-tanitimi', 5),
  ('Haberler', 'haberler', 6)
ON CONFLICT (slug) DO NOTHING;
