CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  location TEXT,
  city_id INT REFERENCES cities(id),
  district_id INT REFERENCES districts(id),
  developer TEXT,
  completion_date TEXT,
  total_units INT,
  starting_price NUMERIC(15,2),
  currency TEXT DEFAULT 'GBP',
  features TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('upcoming', 'under_construction', 'completed', 'selling')) DEFAULT 'selling',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(is_featured) WHERE is_featured = TRUE;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (is_active = TRUE);
CREATE POLICY "admin_all_projects" ON projects FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
