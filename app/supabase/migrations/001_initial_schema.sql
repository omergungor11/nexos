-- Nexos Emlak - Initial Database Schema
-- Phase 1: All tables, enums, indexes, RLS, functions, triggers

-- ==============================
-- ENUMS
-- ==============================

CREATE TYPE property_type_enum AS ENUM (
  'apartment', 'villa', 'detached', 'land', 'office', 'shop', 'warehouse'
);

CREATE TYPE transaction_type_enum AS ENUM ('sale', 'rent');

CREATE TYPE property_status_enum AS ENUM ('available', 'sold', 'rented', 'reserved');

CREATE TYPE heating_type_enum AS ENUM (
  'none', 'central', 'natural_gas', 'floor_heating', 'electric', 'solar', 'coal', 'air_condition'
);

CREATE TYPE currency_enum AS ENUM ('TRY', 'USD', 'EUR');

CREATE TYPE feature_category_enum AS ENUM (
  'interior', 'exterior', 'building', 'neighborhood', 'accessibility'
);

CREATE TYPE contact_status_enum AS ENUM ('new', 'in_progress', 'resolved', 'spam');

-- ==============================
-- LOCATION TABLES
-- ==============================

CREATE TABLE cities (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plate_code  SMALLINT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE districts (
  id         SERIAL PRIMARY KEY,
  city_id    INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

CREATE TABLE neighborhoods (
  id           SERIAL PRIMARY KEY,
  district_id  INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, slug)
);

-- ==============================
-- AGENTS
-- ==============================

CREATE TABLE agents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  title       TEXT,
  slug        TEXT NOT NULL UNIQUE,
  phone       TEXT,
  email       TEXT,
  photo_url   TEXT,
  bio         TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- FEATURES (AMENITIES)
-- ==============================

CREATE TABLE features (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  category   feature_category_enum NOT NULL,
  sort_order SMALLINT DEFAULT 0
);

-- ==============================
-- PROPERTIES (CORE)
-- ==============================

CREATE TABLE properties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  price             NUMERIC(15, 2) NOT NULL,
  currency          currency_enum NOT NULL DEFAULT 'TRY',
  type              property_type_enum NOT NULL,
  status            property_status_enum NOT NULL DEFAULT 'available',
  transaction_type  transaction_type_enum NOT NULL,
  area_sqm          NUMERIC(10, 2),
  gross_area_sqm    NUMERIC(10, 2),
  rooms             SMALLINT,
  living_rooms      SMALLINT DEFAULT 1,
  bathrooms         SMALLINT DEFAULT 1,
  floor             SMALLINT,
  total_floors      SMALLINT,
  year_built        SMALLINT,
  heating_type      heating_type_enum DEFAULT 'none',
  parking           BOOLEAN DEFAULT FALSE,
  furnished         BOOLEAN DEFAULT FALSE,
  balcony_count     SMALLINT DEFAULT 0,
  elevator          BOOLEAN DEFAULT FALSE,
  pool              BOOLEAN DEFAULT FALSE,
  garden            BOOLEAN DEFAULT FALSE,
  security_24_7     BOOLEAN DEFAULT FALSE,
  lat               DOUBLE PRECISION,
  lng               DOUBLE PRECISION,
  address           TEXT,
  city_id           INT NOT NULL REFERENCES cities(id),
  district_id       INT REFERENCES districts(id),
  neighborhood_id   INT REFERENCES neighborhoods(id),
  agent_id          UUID REFERENCES agents(id) ON DELETE SET NULL,
  is_featured       BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  views_count       INT DEFAULT 0,
  seo_title         TEXT,
  seo_description   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- PROPERTY IMAGES
-- ==============================

CREATE TABLE property_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  alt_text     TEXT,
  sort_order   SMALLINT DEFAULT 0,
  is_cover     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- PROPERTY FEATURES (M2M)
-- ==============================

CREATE TABLE property_features (
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  feature_id   INT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, feature_id)
);

-- ==============================
-- CONTACT REQUESTS
-- ==============================

CREATE TABLE contact_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  message      TEXT NOT NULL,
  property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  agent_id     UUID REFERENCES agents(id) ON DELETE SET NULL,
  status       contact_status_enum DEFAULT 'new',
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- BLOG POSTS
-- ==============================

CREATE TABLE blog_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content          TEXT NOT NULL,
  excerpt          TEXT,
  cover_image      TEXT,
  author           TEXT NOT NULL,
  published_at     TIMESTAMPTZ,
  is_published     BOOLEAN DEFAULT FALSE,
  seo_title        TEXT,
  seo_description  TEXT,
  views_count      INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- STATIC PAGES (CMS)
-- ==============================

CREATE TABLE pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,
  seo_title        TEXT,
  seo_description  TEXT,
  is_published     BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- SITE SETTINGS
-- ==============================

CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  value_type  TEXT DEFAULT 'string',
  label       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- FAVORITES
-- ==============================

CREATE TABLE favorites (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- ==============================
-- COMPARISONS
-- ==============================

CREATE TABLE comparisons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id   TEXT,
  property_ids UUID[] NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INDEXES
-- ==============================

CREATE INDEX idx_properties_type           ON properties(type);
CREATE INDEX idx_properties_transaction    ON properties(transaction_type);
CREATE INDEX idx_properties_status         ON properties(status);
CREATE INDEX idx_properties_city           ON properties(city_id);
CREATE INDEX idx_properties_district       ON properties(district_id);
CREATE INDEX idx_properties_neighborhood   ON properties(neighborhood_id);
CREATE INDEX idx_properties_price          ON properties(price);
CREATE INDEX idx_properties_area           ON properties(area_sqm);
CREATE INDEX idx_properties_featured       ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_properties_active         ON properties(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_properties_slug           ON properties(slug);
CREATE INDEX idx_properties_created        ON properties(created_at DESC);

-- Full-text search index (Turkish)
CREATE INDEX idx_properties_fts ON properties
  USING GIN(to_tsvector('turkish', title || ' ' || COALESCE(description, '')));

CREATE INDEX idx_property_images_property  ON property_images(property_id);
CREATE INDEX idx_property_features_property ON property_features(property_id);
CREATE INDEX idx_property_features_feature  ON property_features(feature_id);

CREATE INDEX idx_contact_requests_status   ON contact_requests(status);
CREATE INDEX idx_contact_requests_property ON contact_requests(property_id);

CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC) WHERE is_published = TRUE;
CREATE INDEX idx_blog_posts_slug      ON blog_posts(slug);

CREATE INDEX idx_favorites_user ON favorites(user_id);

CREATE INDEX idx_districts_city ON districts(city_id);
CREATE INDEX idx_neighborhoods_district ON neighborhoods(district_id);

-- ==============================
-- FUNCTIONS
-- ==============================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_contact_requests_updated_at
  BEFORE UPDATE ON contact_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment view counter
CREATE OR REPLACE FUNCTION increment_property_views(property_slug TEXT)
RETURNS VOID AS $$
  UPDATE properties SET views_count = views_count + 1
  WHERE slug = property_slug AND is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER;

-- Slugify helper
CREATE OR REPLACE FUNCTION slugify(text_input TEXT)
RETURNS TEXT AS $$
  SELECT regexp_replace(
    regexp_replace(
      lower(trim(text_input)),
      '[^a-z0-9\-]', '-', 'g'
    ),
    '-+', '-', 'g'
  );
$$ LANGUAGE sql IMMUTABLE;

-- Admin check helper
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================
-- ROW LEVEL SECURITY
-- ==============================

ALTER TABLE properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE features          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities            ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons       ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ
CREATE POLICY "public_read_properties"     ON properties FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_property_images" ON property_images FOR SELECT USING (TRUE);
CREATE POLICY "public_read_property_features" ON property_features FOR SELECT USING (TRUE);
CREATE POLICY "public_read_features"       ON features FOR SELECT USING (TRUE);
CREATE POLICY "public_read_cities"         ON cities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_districts"      ON districts FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_neighborhoods"  ON neighborhoods FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_agents"         ON agents FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_blog_posts"     ON blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_pages"          ON pages FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_site_settings"  ON site_settings FOR SELECT USING (TRUE);

-- CONTACT: public insert, admin read/update
CREATE POLICY "public_insert_contact"      ON contact_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "admin_read_contact"         ON contact_requests FOR SELECT USING (is_admin());
CREATE POLICY "admin_update_contact"       ON contact_requests FOR UPDATE USING (is_admin());

-- ADMIN WRITE
CREATE POLICY "admin_all_properties"       ON properties FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_property_images"  ON property_images FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_property_features" ON property_features FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_features"         ON features FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_cities"           ON cities FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_districts"        ON districts FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_neighborhoods"    ON neighborhoods FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_agents"           ON agents FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_blog_posts"       ON blog_posts FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_pages"            ON pages FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_site_settings"    ON site_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- USER-SCOPED
CREATE POLICY "user_own_favorites"         ON favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_own_comparisons"       ON comparisons FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- ==============================
-- SEED: Site Settings
-- ==============================

INSERT INTO site_settings (key, label, value, value_type) VALUES
  ('company_name',       'Şirket Adı',         'Nexos Gayrimenkul', 'string'),
  ('company_phone',      'Telefon',             '+90 212 000 0000',  'string'),
  ('company_email',      'E-posta',             'info@nexos.com.tr', 'string'),
  ('company_address',    'Adres',               '',                  'string'),
  ('hero_title',         'Hero Başlık',         'Hayalinizdeki Evi Bulun',  'string'),
  ('hero_subtitle',      'Hero Alt Başlık',     'Güvenilir gayrimenkul danışmanlığı ile doğru yatırımı yapın', 'string'),
  ('social_instagram',   'Instagram URL',       '',                  'string'),
  ('social_facebook',    'Facebook URL',        '',                  'string'),
  ('social_linkedin',    'LinkedIn URL',        '',                  'string'),
  ('social_youtube',     'YouTube URL',         '',                  'string'),
  ('whatsapp_number',    'WhatsApp Numarası',   '',                  'string');

-- ==============================
-- SEED: Features
-- ==============================

INSERT INTO features (name, slug, icon, category, sort_order) VALUES
  ('Asansör',          'asansor',          'ArrowUpDown',    'building', 1),
  ('Otopark',          'otopark',          'Car',            'building', 2),
  ('Yüzme Havuzu',    'havuz',            'Waves',          'exterior', 3),
  ('Bahçe',            'bahce',            'Trees',          'exterior', 4),
  ('24 Saat Güvenlik', 'guvenlik',         'Shield',         'building', 5),
  ('Balkon',           'balkon',           'LayoutDashboard','interior', 6),
  ('Eşyalı',          'esyali',           'Sofa',           'interior', 7),
  ('Klima',            'klima',            'AirVent',        'interior', 8),
  ('Ankastre Mutfak',  'ankastre',         'CookingPot',     'interior', 9),
  ('Giyinme Odası',    'giyinme-odasi',    'Shirt',          'interior', 10),
  ('Jakuzi',           'jakuzi',           'Bath',           'interior', 11),
  ('Şömine',           'somine',           'Flame',          'interior', 12),
  ('Teras',            'teras',            'Building',       'exterior', 13),
  ('Garaj',            'garaj',            'Warehouse',      'building', 14),
  ('Spor Salonu',      'spor-salonu',      'Dumbbell',       'building', 15),
  ('Sauna',            'sauna',            'Thermometer',    'building', 16),
  ('Çocuk Oyun Alanı', 'cocuk-oyun',       'Baby',           'neighborhood', 17),
  ('Market Yakın',     'market-yakin',     'ShoppingCart',   'neighborhood', 18),
  ('Okul Yakın',       'okul-yakin',       'GraduationCap',  'neighborhood', 19),
  ('Hastane Yakın',    'hastane-yakin',    'Heart',          'neighborhood', 20),
  ('Metro Yakın',      'metro-yakin',      'Train',          'accessibility', 21),
  ('Otobüs Durağı',    'otobus-duragi',    'Bus',            'accessibility', 22),
  ('Denize Yakın',     'denize-yakin',     'Anchor',         'neighborhood', 23),
  ('Manzaralı',        'manzarali',        'Mountain',       'exterior', 24);

-- ==============================
-- SEED: Sample CMS Pages
-- ==============================

INSERT INTO pages (slug, title, content, seo_title, seo_description) VALUES
  ('hakkimizda', 'Hakkımızda', '<p>Nexos Gayrimenkul olarak, gayrimenkul sektöründe güvenilir danışmanlık hizmeti sunuyoruz.</p>', 'Hakkımızda | Nexos Emlak', 'Nexos Gayrimenkul hakkında bilgi edinin.'),
  ('hizmetlerimiz', 'Hizmetlerimiz', '<p>Satılık ve kiralık emlak danışmanlığı, yatırım danışmanlığı ve değerleme hizmetleri sunuyoruz.</p>', 'Hizmetlerimiz | Nexos Emlak', 'Nexos Gayrimenkul hizmetleri.'),
  ('kvkk', 'KVKK Aydınlatma Metni', '<p>Kişisel verilerin korunması hakkında bilgilendirme.</p>', 'KVKK | Nexos Emlak', 'KVKK aydınlatma metni.'),
  ('gizlilik', 'Gizlilik Politikası', '<p>Gizlilik politikamız hakkında bilgilendirme.</p>', 'Gizlilik Politikası | Nexos Emlak', 'Gizlilik politikası.');
