# Corporate Real Estate Website — Architecture Plan

## Technology Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Backend/BaaS | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Deployment | Vercel |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | TanStack Query v5 + Zustand |
| Language | TypeScript (strict mode) |
| Maps | Leaflet (react-leaflet) |
| SEO | Next.js Metadata API + next-sitemap |

---

## 1. Database Schema (Supabase / PostgreSQL)

### 1.1 Location Hierarchy

```sql
-- cities
CREATE TABLE cities (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plate_code  SMALLINT,              -- Turkish plate codes 01-81
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- districts
CREATE TABLE districts (
  id         SERIAL PRIMARY KEY,
  city_id    INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

-- neighborhoods
CREATE TABLE neighborhoods (
  id           SERIAL PRIMARY KEY,
  district_id  INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, slug)
);
```

### 1.2 Property Types

```sql
CREATE TYPE property_type_enum AS ENUM (
  'apartment',    -- Daire
  'villa',        -- Villa
  'detached',     -- Müstakil Ev
  'land',         -- Arsa/Tarla
  'office',       -- Ofis
  'shop',         -- Dükkan/Mağaza
  'warehouse'     -- Depo/Antrepo
);

CREATE TYPE transaction_type_enum AS ENUM (
  'sale',         -- Satılık
  'rent'          -- Kiralık
);

CREATE TYPE property_status_enum AS ENUM (
  'available',    -- Müsait
  'sold',         -- Satıldı
  'rented',       -- Kiralandı
  'reserved'      -- Rezerve
);

CREATE TYPE heating_type_enum AS ENUM (
  'none',
  'central',      -- Merkezi
  'natural_gas',  -- Doğalgaz (Kombi)
  'floor_heating',-- Yerden Isıtma
  'electric',     -- Elektrikli
  'solar',        -- Güneş Enerjisi
  'coal',         -- Kömür/Soba
  'air_condition' -- Klima
);

CREATE TYPE currency_enum AS ENUM (
  'TRY', 'USD', 'EUR'
);
```

### 1.3 Agents

```sql
CREATE TABLE agents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  title       TEXT,                          -- e.g. "Kıdemli Danışman"
  phone       TEXT,
  email       TEXT,
  photo_url   TEXT,
  bio         TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 Features (Amenities)

```sql
CREATE TYPE feature_category_enum AS ENUM (
  'interior',     -- İç Özellikler
  'exterior',     -- Dış Özellikler
  'building',     -- Bina Özellikleri
  'neighborhood', -- Çevre Özellikleri
  'accessibility' -- Ulaşım/Erişim
);

CREATE TABLE features (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,            -- e.g. "Asansör", "Havuz"
  slug      TEXT NOT NULL UNIQUE,
  icon      TEXT,                            -- Lucide icon name or SVG path
  category  feature_category_enum NOT NULL,
  sort_order SMALLINT DEFAULT 0
);
```

### 1.5 Properties (Core Table)

```sql
CREATE TABLE properties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,

  -- Pricing
  price             NUMERIC(15, 2) NOT NULL,
  currency          currency_enum NOT NULL DEFAULT 'TRY',

  -- Classification
  type              property_type_enum NOT NULL,
  status            property_status_enum NOT NULL DEFAULT 'available',
  transaction_type  transaction_type_enum NOT NULL,

  -- Physical Attributes
  area_sqm          NUMERIC(10, 2),          -- Net m²
  gross_area_sqm    NUMERIC(10, 2),          -- Brüt m²
  rooms             SMALLINT,               -- Oda sayısı
  living_rooms      SMALLINT DEFAULT 1,     -- Salon sayısı
  bathrooms         SMALLINT DEFAULT 1,
  floor             SMALLINT,               -- Bulunduğu kat (NULL for land)
  total_floors      SMALLINT,               -- Toplam kat
  year_built        SMALLINT,               -- İnşaat yılı
  heating_type      heating_type_enum DEFAULT 'none',

  -- Boolean Amenities (fast filter columns)
  parking           BOOLEAN DEFAULT FALSE,
  furnished         BOOLEAN DEFAULT FALSE,
  balcony_count     SMALLINT DEFAULT 0,
  elevator          BOOLEAN DEFAULT FALSE,
  pool              BOOLEAN DEFAULT FALSE,
  garden            BOOLEAN DEFAULT FALSE,
  security_24_7     BOOLEAN DEFAULT FALSE,

  -- Location
  lat               DOUBLE PRECISION,
  lng               DOUBLE PRECISION,
  address           TEXT,
  city_id           INT NOT NULL REFERENCES cities(id),
  district_id       INT REFERENCES districts(id),
  neighborhood_id   INT REFERENCES neighborhoods(id),

  -- Relations
  agent_id          UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Admin Controls
  is_featured       BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  views_count       INT DEFAULT 0,

  -- SEO
  seo_title         TEXT,
  seo_description   TEXT,

  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common filter operations
CREATE INDEX idx_properties_type            ON properties(type);
CREATE INDEX idx_properties_transaction     ON properties(transaction_type);
CREATE INDEX idx_properties_status          ON properties(status);
CREATE INDEX idx_properties_city            ON properties(city_id);
CREATE INDEX idx_properties_district        ON properties(district_id);
CREATE INDEX idx_properties_neighborhood    ON properties(neighborhood_id);
CREATE INDEX idx_properties_price           ON properties(price);
CREATE INDEX idx_properties_area            ON properties(area_sqm);
CREATE INDEX idx_properties_featured        ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_properties_active          ON properties(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_properties_slug            ON properties(slug);
CREATE INDEX idx_properties_created        ON properties(created_at DESC);

-- Full-text search index (Turkish)
CREATE INDEX idx_properties_fts ON properties
  USING GIN(to_tsvector('turkish', title || ' ' || COALESCE(description, '')));
```

### 1.6 Property Images

```sql
CREATE TABLE property_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,               -- Supabase Storage URL
  alt_text     TEXT,
  sort_order   SMALLINT DEFAULT 0,
  is_cover     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, is_cover) WHERE is_cover = TRUE  -- only one cover per property
);

CREATE INDEX idx_property_images_property ON property_images(property_id);
```

### 1.7 Property Features (Many-to-Many)

```sql
CREATE TABLE property_features (
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  feature_id   INT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, feature_id)
);

CREATE INDEX idx_property_features_property ON property_features(property_id);
CREATE INDEX idx_property_features_feature  ON property_features(feature_id);
```

### 1.8 Contact Requests

```sql
CREATE TYPE contact_status_enum AS ENUM (
  'new',
  'in_progress',
  'resolved',
  'spam'
);

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

CREATE INDEX idx_contact_requests_status   ON contact_requests(status);
CREATE INDEX idx_contact_requests_property ON contact_requests(property_id);
```

### 1.9 Blog Posts

```sql
CREATE TABLE blog_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content          TEXT NOT NULL,            -- Rich text / MDX
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

CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC) WHERE is_published = TRUE;
CREATE INDEX idx_blog_posts_slug      ON blog_posts(slug);
```

### 1.10 Static Pages

```sql
CREATE TABLE pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,      -- 'about', 'services', 'kvkk'
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,             -- Rich text
  seo_title        TEXT,
  seo_description  TEXT,
  is_published     BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.11 Site Settings

```sql
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,              -- 'company_name', 'hero_title', etc.
  value       TEXT,
  value_type  TEXT DEFAULT 'string',         -- 'string', 'json', 'boolean', 'number'
  label       TEXT,                          -- Human-readable label for admin
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with initial keys
INSERT INTO site_settings (key, label, value, value_type) VALUES
  ('company_name',       'Şirket Adı',         'Nexos Gayrimenkul', 'string'),
  ('company_phone',      'Telefon',             '+90 212 000 0000',  'string'),
  ('company_email',      'E-posta',             'info@nexos.com.tr', 'string'),
  ('company_address',    'Adres',               '',                  'string'),
  ('hero_title',         'Hero Başlık',         '',                  'string'),
  ('hero_subtitle',      'Hero Alt Başlık',     '',                  'string'),
  ('social_instagram',   'Instagram URL',       '',                  'string'),
  ('social_facebook',    'Facebook URL',        '',                  'string'),
  ('social_linkedin',    'LinkedIn URL',        '',                  'string'),
  ('social_youtube',     'YouTube URL',         '',                  'string'),
  ('google_maps_api_key','Google Maps API Key', '',                  'string'),
  ('whatsapp_number',    'WhatsApp Numarası',   '',                  'string');
```

### 1.12 Favorites

```sql
CREATE TABLE favorites (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
```

### 1.13 Property Comparisons (Session-based, persisted for logged-in users)

```sql
CREATE TABLE comparisons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id   TEXT,                         -- for anonymous users
  property_ids UUID[] NOT NULL,              -- max 4 properties
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.14 Row Level Security Policies

```sql
-- Enable RLS on all tables
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

-- Helper: identify admin users via metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PUBLIC READ policies
CREATE POLICY "public_read_active_properties"
  ON properties FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "public_read_property_images"
  ON property_images FOR SELECT
  USING (TRUE);

CREATE POLICY "public_read_property_features"
  ON property_features FOR SELECT
  USING (TRUE);

CREATE POLICY "public_read_features"
  ON features FOR SELECT
  USING (TRUE);

CREATE POLICY "public_read_cities"
  ON cities FOR SELECT USING (is_active = TRUE);

CREATE POLICY "public_read_districts"
  ON districts FOR SELECT USING (is_active = TRUE);

CREATE POLICY "public_read_neighborhoods"
  ON neighborhoods FOR SELECT USING (is_active = TRUE);

CREATE POLICY "public_read_agents"
  ON agents FOR SELECT USING (is_active = TRUE);

CREATE POLICY "public_read_blog_posts"
  ON blog_posts FOR SELECT USING (is_published = TRUE);

CREATE POLICY "public_read_pages"
  ON pages FOR SELECT USING (is_published = TRUE);

CREATE POLICY "public_read_site_settings"
  ON site_settings FOR SELECT USING (TRUE);

-- CONTACT REQUESTS: public insert, admin read/update
CREATE POLICY "public_insert_contact_requests"
  ON contact_requests FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "admin_read_contact_requests"
  ON contact_requests FOR SELECT
  USING (is_admin());

CREATE POLICY "admin_update_contact_requests"
  ON contact_requests FOR UPDATE
  USING (is_admin());

-- ADMIN WRITE policies (properties)
CREATE POLICY "admin_all_properties"
  ON properties FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_all_property_images"
  ON property_images FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_features"
  ON features FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_agents"
  ON agents FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_blog_posts"
  ON blog_posts FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_pages"
  ON pages FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_site_settings"
  ON site_settings FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- FAVORITES: user-scoped
CREATE POLICY "user_own_favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- COMPARISONS: user or session scoped
CREATE POLICY "user_own_comparisons"
  ON comparisons FOR ALL
  USING (auth.uid() = user_id OR session_id IS NOT NULL);
```

### 1.15 Database Functions & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment view counter (called from API route to avoid direct client access)
CREATE OR REPLACE FUNCTION increment_property_views(property_slug TEXT)
RETURNS VOID AS $$
  UPDATE properties SET views_count = views_count + 1
  WHERE slug = property_slug AND is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER;

-- Slug auto-generation helper
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
```

---

## 2. Full Feature List

### 2.1 Public Website

**Property Discovery**
- Hero section with quick search bar (transaction type + property type + location)
- Featured properties carousel on homepage
- Advanced multi-filter listing page with URL-synced state
- Interactive map view with property markers and clustering
- List/grid/map toggle views
- Property detail page with full gallery, virtual tour embed, and floor plan
- Related properties section on detail page
- Breadcrumb navigation reflecting location hierarchy
- Infinite scroll or paginated results

**Search and Filtering**
- Transaction type toggle (Satılık / Kiralık)
- Property type multi-select
- Cascading location selector (Il > Ilce > Mahalle)
- Price range slider with currency toggle (TRY / USD / EUR)
- Area range slider (m²)
- Room count buttons (Studio, 1+1, 2+1, 3+1, 4+1, 5+)
- Floor range inputs
- Building age range
- Amenities checklist (pool, parking, elevator, balcony, garden, security, furnished)
- Heating type filter
- Sort: newest, oldest, price ascending, price descending, area ascending, most viewed
- Save search (for logged-in users)
- URL parameter persistence for all filters

**Property Detail**
- Full-width image gallery with lightbox
- 360-degree / virtual tour iframe embed
- Floor plan image display
- Google Maps / Leaflet embed with exact marker
- Key stats grid (m², rooms, floor, year built, heating)
- Full feature/amenity tags
- Agent card with call, WhatsApp, and email CTA buttons
- WhatsApp direct message button
- Social share buttons (Twitter/X, Facebook, LinkedIn, WhatsApp)
- Print-friendly view
- PDF download of listing
- Favorite toggle button
- Add to comparison button
- View count display
- Report listing form

**User Accounts**
- Email/password registration and login via Supabase Auth
- OAuth login (Google)
- Saved favorites page
- Property comparison page (up to 4 properties side by side)
- Saved searches with email alert opt-in
- Profile management

**Corporate Pages**
- About Us (dynamic content from `pages` table)
- Services offered
- Our Team / Agents listing
- Individual agent profile pages
- Blog listing with category filter
- Blog post detail with rich content
- Contact page with form and embedded map
- KVKK / Privacy Policy static page
- Frequently Asked Questions (FAQ)

**General UX**
- Multilingual readiness (Turkish primary, English secondary via next-intl)
- Dark mode toggle
- Responsive design (mobile first)
- Loading skeletons for all data-fetched components
- 404 and 500 error pages with helpful navigation
- Cookie consent banner (KVKK compliance)
- Back to top button
- Sticky navigation header with search bar on scroll

### 2.2 Admin Panel

**Dashboard**
- KPI cards: total active listings, new leads this week, total views, total favorites
- Recent contact requests table with status update inline
- New properties added this month chart
- Top 10 most viewed properties
- Quick action buttons: add property, view leads

**Property Management**
- Full paginated data table with search, filter, and sort
- Create property form (multi-step wizard)
- Edit property form
- Bulk actions: activate, deactivate, delete, feature/unfeature
- Drag-and-drop image upload with reorder
- Cover image selector
- Status change dropdown (available, sold, rented, reserved)
- Duplicate listing action
- Preview listing (public view) link

**Agent Management**
- Agent CRUD
- Assign properties to agents
- Agent performance stats (listing count, lead count, view totals)

**Blog Management**
- Create/edit blog posts with rich text editor (TipTap)
- Publish/unpublish toggle
- Cover image upload
- SEO fields (title, description, OG image)
- Preview post before publishing

**Content Management**
- Edit all static pages (About, Services, FAQ, KVKK) via rich text
- Manage site settings (company info, social links, hero text)
- Upload and manage global images/assets

**Lead Management**
- Contact requests inbox with status workflow
- Filter by status, property, agent, date
- Assign lead to agent
- Add internal notes
- Export leads to CSV

**Location Management**
- Add/edit/deactivate cities, districts, neighborhoods
- Import districts/neighborhoods from JSON

**Features and Amenities**
- Add/edit features with icon assignment and category
- Reorder features via drag-and-drop

**Analytics**
- Property view trends (7d, 30d, 90d)
- Top search terms (if captured)
- Lead source breakdown
- Vercel Analytics integration

### 2.3 Advanced Features

- **Full-text search** in Turkish using PostgreSQL `tsvector` with `turkish` dictionary
- **Geospatial queries** using PostGIS extension for radius search ("within 5 km")
- **ISR revalidation** triggered by admin saves via `revalidatePath` / `revalidateTag`
- **On-demand OG image generation** using `@vercel/og` for each property and blog post
- **Sitemap generation** with `next-sitemap` covering all properties, blog posts, and pages
- **Rate limiting** on contact form via Upstash Redis or Vercel Edge middleware
- **Image optimization** pipeline: Supabase Storage + Next.js `<Image>` with WebP conversion
- **Structured data** (JSON-LD) for properties using `RealEstateListing` schema
- **Comparison tool** stored in Zustand, persisted in `comparisons` table for logged-in users
- **WhatsApp floating button** with pre-filled message template
- **Currency conversion** display (TRY/USD/EUR) with cached exchange rates
- **Print/PDF export** of property detail using `react-to-print` or server-side Puppeteer
- **Email notifications** via Supabase Edge Functions calling Resend for new leads
- **Real-time lead notifications** for admin using Supabase Realtime channel

---

## 3. Advanced Filtering System Design

### 3.1 URL Schema

All filter state is encoded in URL search parameters to enable SEO-friendly, shareable, bookmarkable filtered pages.

```
/emlak?
  islem=satilik
  &tip=daire,villa
  &sehir=istanbul
  &ilce=besiktas
  &mahalle=levent
  &fiyat_min=5000000
  &fiyat_max=15000000
  &m2_min=80
  &m2_max=200
  &oda=2+1,3+1
  &kat_min=2
  &kat_max=10
  &bina_yasi_max=10
  &ozellikler=havuz,otopark,asansor
  &isitma=dogalgaz
  &siralama=fiyat_artan
  &sayfa=1
```

### 3.2 Filter State Type

```typescript
// types/filters.ts
export interface PropertyFilters {
  islem?: 'satilik' | 'kiralik';
  tip?: PropertyTypeEnum[];
  sehir?: string;            // city slug
  ilce?: string;             // district slug
  mahalle?: string;          // neighborhood slug
  fiyat_min?: number;
  fiyat_max?: number;
  para_birimi?: 'TRY' | 'USD' | 'EUR';
  m2_min?: number;
  m2_max?: number;
  oda?: string[];            // ['1+0', '1+1', '2+1', '3+1', '4+1', '5+']
  kat_min?: number;
  kat_max?: number;
  bina_yasi_max?: number;    // max age = current_year - year_built
  ozellikler?: string[];     // feature slugs
  isitma?: HeatingTypeEnum;
  siralama?: SortOption;
  sayfa?: number;
  gorunum?: 'liste' | 'kart' | 'harita';
}

export type SortOption =
  | 'yeni'
  | 'eski'
  | 'fiyat_artan'
  | 'fiyat_azalan'
  | 'm2_artan'
  | 'm2_azalan'
  | 'cok_izlenen';
```

### 3.3 Filter Panel Component Structure

```
FilterPanel (sticky sidebar or top drawer on mobile)
├── TransactionTypeToggle      -- Satılık / Kiralık pill buttons
├── PropertyTypeSelect         -- multi-select dropdown with icons
├── LocationCascade
│   ├── CityCombobox           -- searchable dropdown, all cities
│   ├── DistrictCombobox       -- enabled after city selected
│   └── NeighborhoodCombobox   -- enabled after district selected
├── PriceRangeSection
│   ├── CurrencyToggle         -- TRY / USD / EUR
│   ├── PriceMinInput
│   └── PriceMaxInput
├── AreaRangeSection
│   ├── AreaMinInput           -- m²
│   └── AreaMaxInput
├── RoomCountSelector          -- toggle buttons: Studio 1+1 2+1 3+1 4+1 5+
├── FloorRangeSection
│   ├── FloorMinInput
│   └── FloorMaxInput
├── BuildingAgeSlider          -- 0-5, 5-10, 10-20, 20+ years
├── HeatingTypeSelect          -- single select
├── AmenitiesChecklist         -- grouped by feature_category
│   ├── Interior group
│   ├── Exterior group
│   ├── Building group
│   └── Neighborhood group
├── FilterActions
│   ├── ApplyButton            -- triggers URL update
│   ├── ResetButton            -- clears all params
│   └── SaveSearchButton       -- auth-gated
└── ActiveFilterBadges         -- displays applied filters with remove X
```

### 3.4 Supabase Query Builder

```typescript
// lib/queries/properties.ts
export async function buildPropertyQuery(filters: PropertyFilters) {
  let query = supabase
    .from('properties')
    .select(`
      id, slug, title, price, currency, type, transaction_type,
      area_sqm, rooms, living_rooms, floor, is_featured, views_count,
      city:cities(id, name, slug),
      district:districts(id, name, slug),
      neighborhood:neighborhoods(id, name, slug),
      images:property_images(url, alt_text, is_cover)
    `)
    .eq('is_active', true);

  // Transaction type
  if (filters.islem) {
    query = query.eq('transaction_type',
      filters.islem === 'satilik' ? 'sale' : 'rent'
    );
  }

  // Property type (multi)
  if (filters.tip?.length) {
    query = query.in('type', filters.tip);
  }

  // Location cascade
  if (filters.mahalle) {
    query = query.eq('neighborhoods.slug', filters.mahalle);
  } else if (filters.ilce) {
    query = query.eq('districts.slug', filters.ilce);
  } else if (filters.sehir) {
    query = query.eq('cities.slug', filters.sehir);
  }

  // Price range
  if (filters.fiyat_min) query = query.gte('price', filters.fiyat_min);
  if (filters.fiyat_max) query = query.lte('price', filters.fiyat_max);

  // Area range
  if (filters.m2_min) query = query.gte('area_sqm', filters.m2_min);
  if (filters.m2_max) query = query.lte('area_sqm', filters.m2_max);

  // Room count (encoded as "2+1" means rooms=2, living_rooms=1)
  if (filters.oda?.length) {
    const roomConditions = filters.oda.map(r => {
      if (r === 'studio') return `(rooms.eq.0,living_rooms.eq.1)`;
      const [rooms, living] = r.split('+');
      return `(rooms.eq.${rooms},living_rooms.eq.${living})`;
    });
    query = query.or(roomConditions.join(','));
  }

  // Floor range
  if (filters.kat_min) query = query.gte('floor', filters.kat_min);
  if (filters.kat_max) query = query.lte('floor', filters.kat_max);

  // Building age
  if (filters.bina_yasi_max) {
    const minYear = new Date().getFullYear() - filters.bina_yasi_max;
    query = query.gte('year_built', minYear);
  }

  // Amenity features (uses junction table via subquery)
  if (filters.ozellikler?.length) {
    const featureIds = await getFeatureIdsBySlugs(filters.ozellikler);
    query = query.in('id',
      supabase
        .from('property_features')
        .select('property_id')
        .in('feature_id', featureIds)
    );
  }

  // Heating type
  if (filters.isitma) {
    query = query.eq('heating_type', filters.isitma);
  }

  // Sorting
  switch (filters.siralama) {
    case 'fiyat_artan':  query = query.order('price', { ascending: true }); break;
    case 'fiyat_azalan': query = query.order('price', { ascending: false }); break;
    case 'm2_artan':     query = query.order('area_sqm', { ascending: true }); break;
    case 'm2_azalan':    query = query.order('area_sqm', { ascending: false }); break;
    case 'cok_izlenen':  query = query.order('views_count', { ascending: false }); break;
    case 'eski':         query = query.order('created_at', { ascending: true }); break;
    default:             query = query.order('created_at', { ascending: false }); break;
  }

  // Pagination
  const page = filters.sayfa ?? 1;
  const pageSize = 20;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  return query;
}
```

### 3.5 URL Sync Hook

```typescript
// hooks/usePropertyFilters.ts
'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function usePropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseFiltersFromParams(searchParams);

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    });

    // Reset to page 1 when filters change
    params.delete('sayfa');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, updateFilters, resetFilters };
}
```

---

## 4. Complete Route Structure

### 4.1 App Router File Structure

```
app/
├── layout.tsx                          -- Root layout (fonts, providers, analytics)
├── page.tsx                            -- Homepage                        [SSG + ISR 1h]
├── not-found.tsx                       -- Custom 404
├── error.tsx                           -- Global error boundary
├── loading.tsx                         -- Global loading UI
│
├── emlak/                              -- Property listing
│   ├── page.tsx                        -- /emlak (filtered listing)       [SSR]
│   ├── loading.tsx
│   └── [slug]/
│       ├── page.tsx                    -- /emlak/[slug] (detail)          [ISR 30m]
│       ├── loading.tsx
│       └── opengraph-image.tsx         -- Dynamic OG image
│
├── harita/
│   └── page.tsx                        -- /harita (full map view)         [CSR]
│
├── hakkimizda/
│   └── page.tsx                        -- /hakkimizda (About)             [ISR 24h]
│
├── hizmetlerimiz/
│   └── page.tsx                        -- /hizmetlerimiz (Services)       [ISR 24h]
│
├── ekibimiz/
│   ├── page.tsx                        -- /ekibimiz (Team listing)        [ISR 1h]
│   └── [slug]/
│       └── page.tsx                    -- /ekibimiz/[slug] (Agent profile)[ISR 1h]
│
├── iletisim/
│   └── page.tsx                        -- /iletisim (Contact)             [SSG]
│
├── blog/
│   ├── page.tsx                        -- /blog (post listing)            [ISR 1h]
│   └── [slug]/
│       ├── page.tsx                    -- /blog/[slug] (post detail)      [ISR 1h]
│       └── opengraph-image.tsx
│
├── favoriler/
│   └── page.tsx                        -- /favoriler (auth-gated)         [CSR]
│
├── karsilastir/
│   └── page.tsx                        -- /karsilastir (comparison)       [CSR]
│
├── [slug]/                             -- Dynamic CMS pages
│   └── page.tsx                        -- /kvkk, /gizlilik etc.           [ISR 24h]
│
├── (auth)/
│   ├── layout.tsx                      -- Auth layout (centered card)
│   ├── giris/
│   │   └── page.tsx                    -- /giris (Login)                  [SSG]
│   └── kayit/
│       └── page.tsx                    -- /kayit (Register)               [SSG]
│
├── admin/
│   ├── layout.tsx                      -- Admin layout (sidebar, auth guard)
│   ├── page.tsx                        -- /admin (Dashboard)              [CSR]
│   ├── ilanlar/
│   │   ├── page.tsx                    -- /admin/ilanlar (list)           [CSR]
│   │   ├── yeni/
│   │   │   └── page.tsx                -- /admin/ilanlar/yeni             [CSR]
│   │   └── [id]/
│   │       └── page.tsx                -- /admin/ilanlar/[id] (edit)      [CSR]
│   ├── danismanlar/
│   │   ├── page.tsx                    -- /admin/danismanlar (list)       [CSR]
│   │   ├── yeni/
│   │   │   └── page.tsx                -- create agent                    [CSR]
│   │   └── [id]/
│   │       └── page.tsx                -- edit agent                      [CSR]
│   ├── blog/
│   │   ├── page.tsx                    -- /admin/blog (list)              [CSR]
│   │   ├── yeni/
│   │   │   └── page.tsx                -- create post                     [CSR]
│   │   └── [id]/
│   │       └── page.tsx                -- edit post                       [CSR]
│   ├── talepler/
│   │   └── page.tsx                    -- /admin/talepler (leads inbox)   [CSR + Realtime]
│   ├── sayfalar/
│   │   └── [slug]/
│   │       └── page.tsx                -- edit CMS pages                  [CSR]
│   └── ayarlar/
│       └── page.tsx                    -- /admin/ayarlar (site settings)  [CSR]
│
└── api/
    ├── properties/
    │   ├── route.ts                    -- GET list (used by map CSR)
    │   └── [slug]/
    │       └── views/
    │           └── route.ts            -- POST increment view counter
    ├── contact/
    │   └── route.ts                    -- POST contact form with rate limit
    ├── revalidate/
    │   └── route.ts                    -- POST on-demand revalidation webhook
    ├── sitemap/
    │   └── route.ts                    -- Dynamic sitemap entries
    └── og/
        └── property/
            └── route.ts                -- OG image generation
```

### 4.2 Data Fetching Strategy per Route

| Route | Strategy | Revalidation | Rationale |
|---|---|---|---|
| `/` | ISR | 1 hour | Featured properties change infrequently |
| `/emlak` | SSR | None | Filters are dynamic per request |
| `/emlak/[slug]` | ISR | 30 minutes | Detail pages benefit from caching |
| `/harita` | CSR | None | Client-side map interaction |
| `/hakkimizda` | ISR | 24 hours | Rarely changing CMS content |
| `/ekibimiz` | ISR | 1 hour | Agent list updated occasionally |
| `/ekibimiz/[slug]` | ISR | 1 hour | Individual agent pages |
| `/blog` | ISR | 1 hour | New posts trigger revalidation |
| `/blog/[slug]` | ISR | 1 hour | On-publish webhook revalidates |
| `/iletisim` | SSG | Build only | Static form page |
| `/favoriler` | CSR | None | User-specific, auth-gated |
| `/karsilastir` | CSR | None | Session state driven |
| `/[slug]` (CMS) | ISR | 24 hours | Admin edit triggers revalidation |
| `/admin/**` | CSR | None | Always-fresh admin data |

---

## 5. Component Architecture

### 5.1 Provider Tree

```
app/layout.tsx
└── Providers
    ├── ThemeProvider          (next-themes)
    ├── QueryClientProvider    (TanStack Query)
    ├── AuthProvider           (Supabase session context)
    └── Toaster                (sonner)
```

### 5.2 Layout Components

```
components/layout/
├── Header/
│   ├── Header.tsx             -- Root header with logo, nav, search bar
│   ├── MobileMenu.tsx         -- Sheet-based mobile drawer
│   ├── SearchBar.tsx          -- Quick search with transaction type toggle
│   └── UserMenu.tsx           -- Avatar dropdown for logged-in users
├── Footer/
│   ├── Footer.tsx             -- Links, company info, social icons
│   └── FooterNewsletter.tsx   -- Email subscription form
├── AdminLayout/
│   ├── AdminSidebar.tsx       -- Collapsible sidebar with nav items
│   ├── AdminHeader.tsx        -- Topbar with notifications, user menu
│   └── AdminBreadcrumb.tsx
└── AuthLayout.tsx             -- Centered card layout for auth pages
```

### 5.3 Property Components

```
components/property/
├── listing/
│   ├── PropertyGrid.tsx            -- Responsive card grid
│   ├── PropertyList.tsx            -- Horizontal list layout
│   ├── PropertyCard.tsx            -- Card variant (image, title, price, badges)
│   ├── PropertyListItem.tsx        -- List variant (wider, more detail)
│   ├── PropertyCardSkeleton.tsx    -- Loading skeleton
│   ├── ViewToggle.tsx              -- Grid/List/Map toggle buttons
│   ├── SortSelect.tsx              -- Sort dropdown
│   └── ResultCount.tsx             -- "123 ilan bulundu" text
├── filter/
│   ├── FilterPanel.tsx             -- Desktop sidebar filter panel
│   ├── FilterDrawer.tsx            -- Mobile bottom sheet filter drawer
│   ├── TransactionTypeToggle.tsx
│   ├── PropertyTypeSelect.tsx
│   ├── LocationCascade.tsx
│   ├── PriceRangeFilter.tsx
│   ├── AreaRangeFilter.tsx
│   ├── RoomCountSelector.tsx
│   ├── FloorRangeFilter.tsx
│   ├── BuildingAgeFilter.tsx
│   ├── AmenitiesChecklist.tsx
│   ├── HeatingTypeSelect.tsx
│   ├── ActiveFilterBadges.tsx
│   └── SaveSearchButton.tsx
├── detail/
│   ├── PropertyGallery.tsx         -- Lightbox gallery with thumbnails
│   ├── PropertyStats.tsx           -- Key stats grid (m², rooms, floor, etc.)
│   ├── PropertyFeatureTags.tsx     -- Amenity badge list
│   ├── PropertyDescription.tsx     -- Rich text description
│   ├── PropertyMap.tsx             -- Leaflet map with marker (client)
│   ├── PropertyAgentCard.tsx       -- Agent info with CTA buttons
│   ├── PropertyShareButtons.tsx    -- Social share + copy link
│   ├── PropertyContactForm.tsx     -- Inline contact form (client)
│   ├── PropertyVirtualTour.tsx     -- iframe embed wrapper
│   ├── RelatedProperties.tsx       -- Horizontal scroll carousel
│   ├── FavoriteButton.tsx          -- Heart toggle, auth-gated
│   └── CompareButton.tsx           -- Add to comparison, max 4
└── map/
    ├── PropertyMap.tsx             -- Full page Leaflet map
    ├── PropertyMarker.tsx          -- Custom marker with price label
    ├── MarkerCluster.tsx           -- Cluster group wrapper
    └── MapPropertyPopup.tsx        -- Popup card on marker click
```

### 5.4 UI / Shared Components

```
components/ui/                      -- shadcn/ui primitives (auto-generated)
components/shared/
├── PageHeader.tsx                  -- Page title + breadcrumb
├── SectionTitle.tsx                -- Section heading with optional CTA
├── Breadcrumb.tsx                  -- Hierarchical breadcrumb
├── ImageWithFallback.tsx           -- next/image with error fallback
├── RichTextRenderer.tsx            -- Renders HTML/MDX safely
├── PriceDisplay.tsx                -- Formats price with currency symbol
├── AreaDisplay.tsx                 -- "120 m²" formatted display
├── RoomDisplay.tsx                 -- "3+1" formatted display
├── StatusBadge.tsx                 -- Satılık/Kiralık/Satıldı badge
├── PhoneLink.tsx                   -- tel: href with formatting
├── WhatsAppButton.tsx              -- Floating or inline WA button
├── CookieBanner.tsx                -- KVKK consent banner
├── ScrollToTop.tsx
├── EmptyState.tsx                  -- No results illustration + message
├── ErrorState.tsx                  -- Error illustration + retry
└── ConfirmDialog.tsx               -- Reusable confirmation modal
```

### 5.5 Admin Components

```
components/admin/
├── PropertyForm/
│   ├── PropertyForm.tsx            -- Multi-step form container
│   ├── Step1_BasicInfo.tsx         -- Title, type, transaction, price
│   ├── Step2_Details.tsx           -- m², rooms, floor, year, heating
│   ├── Step3_Location.tsx          -- City/district/neighborhood + map pin
│   ├── Step4_Amenities.tsx         -- Feature checklist
│   ├── Step5_Images.tsx            -- Drag-drop image upload
│   └── Step6_SEO.tsx               -- SEO title, description, slug
├── ImageUploader.tsx               -- Supabase Storage upload with preview
├── RichTextEditor.tsx              -- TipTap wrapper
├── DataTable.tsx                   -- Generic reusable table with sorting/pagination
├── StatCard.tsx                    -- KPI card for dashboard
├── LeadCard.tsx                    -- Contact request card with status
├── LeadStatusBadge.tsx
├── AgentForm.tsx
├── BlogPostForm.tsx
├── PageEditor.tsx
└── SiteSettingsForm.tsx
```

---

## 6. Project Phases with Tasks

### Phase 0: Project Setup

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P0-01 | Initialize Next.js 15 project with TypeScript strict mode and App Router | DevOps | S | None |
| P0-02 | Configure Tailwind CSS v4 and install shadcn/ui with custom theme tokens (brand colors, Turkish font) | Frontend | S | P0-01 |
| P0-03 | Set up ESLint (next/core-web-vitals), Prettier, and Husky pre-commit hooks | DevOps | S | P0-01 |
| P0-04 | Configure environment variables structure (.env.local, .env.example) and Supabase client helpers (server, client, middleware) | Backend | S | P0-01 |
| P0-05 | Install and configure TanStack Query v5 with Zustand and create global Providers component | Frontend | S | P0-01 |
| P0-06 | Set up folder structure: components/, lib/, types/, hooks/, store/, actions/ | DevOps | S | P0-01 |
| P0-07 | Configure absolute imports with TypeScript path aliases (@/components, @/lib, @/types, @/hooks) | DevOps | S | P0-01 |

### Phase 1: Supabase Core

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P1-01 | Create all database tables with correct types, constraints, and foreign keys as defined in schema | Backend | L | P0-04 |
| P1-02 | Create all indexes for filter performance and full-text search tsvector index with Turkish dictionary | Backend | M | P1-01 |
| P1-03 | Write all RLS policies (public read, admin write, user-scoped favorites) and is_admin() helper function | Backend | M | P1-01 |
| P1-04 | Create database functions: update_updated_at_column triggers, increment_property_views, slugify | Backend | M | P1-01 |
| P1-05 | Configure Supabase Auth with email/password and Google OAuth provider, set redirect URLs | Backend | M | P0-04 |
| P1-06 | Set up Supabase Storage buckets: property-images (public), agent-photos (public), blog-covers (public), documents (private) with size and MIME type policies | Backend | M | P0-04 |
| P1-07 | Seed database with Turkish cities (81 iller), sample districts, neighborhoods, features, property types, and site_settings | Backend | M | P1-01 |
| P1-08 | Create TypeScript types from Supabase schema using supabase gen types typescript and organize in types/supabase.ts and types/domain.ts | Backend | S | P1-01 |
| P1-09 | Implement Next.js middleware for session refresh and admin route protection (/admin/* redirect to /giris) | Backend | M | P1-05 |

### Phase 2: Property System

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P2-01 | Build property query builder lib/queries/properties.ts supporting all filter parameters with type safety | Backend | L | P1-01, P1-08 |
| P2-02 | Build cascading location query helpers: getDistricts(citySlug), getNeighborhoods(districtSlug) | Backend | S | P1-01 |
| P2-03 | Create Server Actions for property CRUD: createProperty, updateProperty, deleteProperty, toggleActive, toggleFeatured | Backend | L | P1-03 |
| P2-04 | Build image upload flow: client-side Supabase Storage upload, insert property_images rows, drag-to-reorder logic, set cover image | Frontend | L | P1-06 |
| P2-05 | Create feature/amenity management: fetch features grouped by category, property_features junction insert/delete | Backend | S | P1-01 |
| P2-06 | Build API route POST /api/properties/[slug]/views calling increment_property_views with IP-based deduplication | Backend | S | P1-04 |
| P2-07 | Build API route POST /api/contact with input validation (zod), rate limiting via Upstash Redis, insert to contact_requests, trigger email via Resend | Backend | M | P1-01 |
| P2-08 | Set up on-demand revalidation: POST /api/revalidate endpoint accepting webhook secret, calling revalidateTag or revalidatePath for property and blog pages | Backend | M | P0-04 |
| P2-09 | Implement favorites Server Actions: addFavorite, removeFavorite, getFavorites with auth guard | Backend | S | P1-03, P1-05 |
| P2-10 | Build property comparison Zustand store with addToCompare, removeFromCompare, clearComparison, max 4 items enforcement | Frontend | S | P0-05 |

### Phase 3: Public Listing Pages

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P3-01 | Build homepage: hero with quick search, featured properties ISR carousel, recent listings section, stats section, CTA sections | Frontend | L | P2-01 |
| P3-02 | Build /emlak listing page: SSR filter application, PropertyGrid/PropertyList views, pagination, result count | Frontend | L | P2-01 |
| P3-03 | Build FilterPanel desktop sidebar and FilterDrawer mobile sheet with all filter components and URL sync hook | Frontend | L | P2-01, P2-02 |
| P3-04 | Build /emlak/[slug] property detail page: gallery lightbox, stats grid, feature tags, description, agent card, contact form, JSON-LD schema | Frontend | L | P2-01 |
| P3-05 | Integrate Leaflet map in property detail page: dynamic import (no SSR), single marker with address label | Frontend | M | P3-04 |
| P3-06 | Build /harita full-screen map page: CSR, fetch all active property coordinates, custom price markers, cluster groups, popup card on click, sync with list sidebar | Frontend | L | P2-01 |
| P3-07 | Build related properties horizontal carousel using embla-carousel or Swiper | Frontend | M | P3-04 |
| P3-08 | Build FavoriteButton with optimistic UI update, auth-redirect if not logged in | Frontend | M | P2-09 |
| P3-09 | Build /karsilastir comparison page: side-by-side table of up to 4 properties, all attributes compared, remove button per column | Frontend | M | P2-10 |
| P3-10 | Build /favoriler page: auth-gated, user's saved properties as PropertyGrid | Frontend | M | P2-09, P1-05 |

### Phase 4: Corporate Pages

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P4-01 | Build shared Header component: logo, desktop nav with dropdowns, mobile menu sheet, sticky behavior on scroll, search bar reveal | Frontend | M | P0-02 |
| P4-02 | Build shared Footer component: company info, nav columns, social icons, newsletter form, legal links | Frontend | M | P0-02 |
| P4-03 | Build /hakkimizda (About) page fetching from pages table, rich text renderer, team preview section | Frontend | M | P1-01 |
| P4-04 | Build /hizmetlerimiz (Services) page with service cards, icons, descriptions fetched from pages or hardcoded with CMS override | Frontend | M | P1-01 |
| P4-05 | Build /ekibimiz (Team) page: agent cards grid, ISR, links to individual agent profile pages | Frontend | M | P1-01 |
| P4-06 | Build /ekibimiz/[slug] (Agent Profile) page: photo, bio, contact buttons, assigned property listings | Frontend | M | P4-05, P2-01 |
| P4-07 | Build /blog listing page: post cards with cover image, excerpt, author, date; pagination | Frontend | M | P1-01 |
| P4-08 | Build /blog/[slug] post detail page: cover image, rich text content, related posts, social share, author section | Frontend | M | P4-07 |
| P4-09 | Build /iletisim (Contact) page: contact form with validation, company info panel, embedded Leaflet map | Frontend | M | P2-07 |
| P4-10 | Build dynamic /[slug] CMS page renderer for legal pages (KVKK, Gizlilik, Hizmet Sözleşmesi) from pages table | Frontend | S | P1-01 |
| P4-11 | Build /giris and /kayit auth pages with Supabase Auth form, Google OAuth button, redirect logic | Frontend | M | P1-05 |
| P4-12 | Implement WhatsApp floating button, cookie consent banner (KVKK), and scroll-to-top button | Frontend | S | P0-02 |

### Phase 5: Advanced Features

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P5-01 | Implement property sharing: Web Share API with fallback to copy-to-clipboard; pre-built social share URLs for WhatsApp, Facebook, Twitter, LinkedIn | Frontend | S | P3-04 |
| P5-02 | Build virtual tour embed system: YouTube, Matterport, and generic iframe embed with lazy loading | Frontend | S | P3-04 |
| P5-03 | Implement save search feature: auth-gated, serializes current URL params to user's saved_searches (new table or site_settings JSON), email alert opt-in | Full-Stack | M | P3-03, P1-05 |
| P5-04 | Build currency conversion display: fetch rates from exchangerate-api.com via Edge Function, cache in Upstash Redis for 1 hour, display TRY/USD/EUR toggle on price | Full-Stack | M | P2-01 |
| P5-05 | Implement property print / PDF view: dedicated print stylesheet or react-to-print integration, print button on detail page | Frontend | M | P3-04 |
| P5-06 | Build Supabase Edge Function for email notifications: triggered on contact_requests insert, sends formatted email via Resend to assigned agent and admin | Backend | M | P2-07 |
| P5-07 | Implement Supabase Realtime subscription in admin leads page: new contact_requests appear without page reload, notification toast | Frontend | M | P4-09, P6-04 |
| P5-08 | Add full-text search endpoint: POST /api/search accepting query string, use PostgreSQL to_tsquery with turkish dictionary, return top 10 property matches | Backend | M | P1-02 |

### Phase 6: Admin Panel

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P6-01 | Build admin layout: collapsible sidebar with nav items, header with notifications bell and user menu, mobile responsive drawer | Frontend | M | P1-09 |
| P6-02 | Build /admin dashboard: KPI StatCards (active listings, new leads, total views, favorites), recent leads table, top properties chart using Recharts | Frontend | M | P6-01, P1-01 |
| P6-03 | Build admin property DataTable: columns (image, title, type, price, status, views, actions), server-side sort/filter/pagination, bulk action toolbar | Frontend | L | P6-01, P2-01 |
| P6-04 | Build multi-step property creation form (6 steps as defined in components), form state with react-hook-form + zod, step validation before advancing | Frontend | L | P2-03, P2-04 |
| P6-05 | Build property edit form reusing creation form components, pre-populated with existing data | Frontend | M | P6-04 |
| P6-06 | Build drag-and-drop image manager within property form: react-dropzone for upload, dnd-kit for reorder, set cover, delete with Supabase Storage removal | Frontend | L | P2-04 |
| P6-07 | Build /admin/danismanlar agent management: list table, create/edit form with photo upload, deactivate action | Frontend | M | P6-01, P2-03 |
| P6-08 | Build /admin/blog blog post management: list table, TipTap rich text editor form, image upload, publish toggle, SEO fields | Frontend | L | P6-01 |
| P6-09 | Build /admin/talepler leads inbox: table with status badges, detail modal with full message + property link + agent assign + notes field, CSV export | Frontend | L | P6-01, P5-07 |
| P6-10 | Build /admin/sayfalar CMS page editor: fetch page by slug, TipTap editor, save via Server Action, trigger revalidation | Frontend | M | P6-08, P2-08 |
| P6-11 | Build /admin/ayarlar site settings form: key-value form generated from site_settings table, grouped by category, save all on submit | Frontend | M | P6-01 |
| P6-12 | Build location management UI: city/district/neighborhood add/edit/deactivate, cascading selects for district and neighborhood forms | Frontend | M | P6-01 |

### Phase 7: SEO and Deployment

| ID | Title | Agent Type | Complexity | Dependencies |
|---|---|---|---|---|
| P7-01 | Implement generateMetadata for all public routes: dynamic title, description, OG image URL, canonical URL, Twitter card tags | Frontend | M | P3-01 — P4-12 |
| P7-02 | Build dynamic OG image generation using @vercel/og for property detail pages (cover photo, title, price, location badge) and blog posts | Frontend | M | P7-01 |
| P7-03 | Configure next-sitemap: static routes, dynamic routes (properties, blog, agents, pages) fetched from Supabase at build time, sitemap index with priority and changefreq | DevOps | M | P3-01 — P4-12 |
| P7-04 | Implement JSON-LD structured data: RealEstateListing schema on property pages, BlogPosting on blog posts, LocalBusiness on contact page, BreadcrumbList on all pages | Frontend | M | P7-01 |
| P7-05 | Add robots.txt (disallow /admin, /api), canonical link tags, hreflang if multilingual, and breadcrumb structured data | DevOps | S | P7-03 |
| P7-06 | Configure Vercel project: environment variables, build settings, domain configuration, Edge Network regions set to Europe for Turkish latency | DevOps | M | All Phase 0-6 |
| P7-07 | Set up Vercel Analytics and Speed Insights, configure Vercel Cron Jobs for scheduled sitemap regeneration | DevOps | S | P7-06 |
| P7-08 | Performance audit: run Lighthouse, fix Core Web Vitals (LCP, CLS, INP), add font-display:swap, preload critical images, defer non-critical scripts | Frontend | L | P7-06 |
| P7-09 | Configure Content Security Policy headers in next.config.ts, add security headers (X-Frame-Options, X-Content-Type-Options, HSTS) | DevOps | M | P7-06 |
| P7-10 | Write E2E smoke tests using Playwright: homepage loads, property filter returns results, contact form submits, admin login redirects correctly | QA | M | P7-06 |

---

## 7. Performance Strategy

### 7.1 Rendering Strategy Decision Tree

```
Is the page content user-specific?
  YES → CSR (favorites, comparison, admin)
  NO  → Is the content highly dynamic (changes per request based on URL params)?
          YES → SSR (filtered property listing /emlak)
          NO  → Does it change regularly (hours)?
                  YES → ISR with revalidation (property detail, blog, homepage)
                  NO  → SSG (contact page, auth pages, legal pages)
```

### 7.2 ISR Revalidation Tags

```typescript
// lib/cache-tags.ts
export const CACHE_TAGS = {
  properties:     'properties',
  property:       (slug: string) => `property-${slug}`,
  blog:           'blog',
  blogPost:       (slug: string) => `blog-${slug}`,
  agents:         'agents',
  agent:          (slug: string) => `agent-${slug}`,
  pages:          'pages',
  page:           (slug: string) => `page-${slug}`,
  siteSettings:   'site-settings',
  homepage:       'homepage',
} as const;

// Usage in Server Component
import { unstable_cache } from 'next/cache';

const getProperty = unstable_cache(
  async (slug: string) => {
    return supabase.from('properties').select('...').eq('slug', slug).single();
  },
  ['property'],
  {
    tags: [CACHE_TAGS.properties, CACHE_TAGS.property(slug)],
    revalidate: 1800, // 30 minutes fallback
  }
);
```

### 7.3 Image Optimization

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // ...
};
```

All property images are stored in Supabase Storage and served through Next.js `<Image>` which handles:
- Automatic WebP/AVIF conversion
- Responsive `srcset` generation
- Lazy loading with blur placeholder
- Layout shift prevention via `width` and `height`

For property cards, cover images use `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` to avoid loading oversized images on smaller viewports.

### 7.4 TanStack Query Caching Strategy

```typescript
// lib/query-config.ts
export const queryConfig = {
  queries: {
    staleTime: 5 * 60 * 1000,     // 5 minutes before refetch
    gcTime: 30 * 60 * 1000,       // 30 minutes garbage collection
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

// Key patterns
export const queryKeys = {
  properties: {
    all:     ['properties'] as const,
    list:    (filters: PropertyFilters) => ['properties', 'list', filters] as const,
    detail:  (slug: string) => ['properties', 'detail', slug] as const,
    map:     ['properties', 'map'] as const,
  },
  favorites: {
    all:     (userId: string) => ['favorites', userId] as const,
  },
  agents: {
    all:     ['agents'] as const,
    detail:  (slug: string) => ['agents', slug] as const,
  },
};
```

### 7.5 Database Query Performance

- All filter columns have B-tree indexes
- Full-text search uses GIN index with Turkish stemming dictionary
- Property list query uses `select()` with specific columns only, never `select('*')`
- Cover image retrieved via filtered join, not fetching all images in list query
- Location joins use `!inner` join pattern to avoid N+1
- View count increments use a database function called from an API route, not direct client calls, to prevent RLS bypass concerns
- Admin queries bypass RLS using the `service_role` key only in Server Actions and API routes, never in client code

### 7.6 Edge and Middleware Optimization

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Supabase session refresh
  const supabase = createServerClient(/* ... */, { /* cookie handlers */ });
  await supabase.auth.getSession();

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.user_metadata?.role === 'admin';

    if (!user || !isAdmin) {
      return NextResponse.redirect(new URL('/giris', request.url));
    }
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 7.7 Bundle Optimization

- Leaflet and react-leaflet are imported dynamically with `next/dynamic` and `{ ssr: false }` to exclude from the server bundle
- TipTap rich text editor loaded only on admin routes with dynamic import
- Chart components (Recharts) dynamically imported on admin dashboard
- `next/font` used for all fonts with `display: 'swap'` and preloading only the Latin-ext and Turkish subsets
- shadcn/ui components are individually imported, not as a barrel export, keeping per-page bundle minimal
- Zustand store split into separate slices: comparisonStore, uiStore to prevent unnecessary re-renders

### 7.8 Vercel Deployment Configuration

```json
// vercel.json
{
  "regions": ["fra1"],
  "crons": [
    {
      "path": "/api/sitemap",
      "schedule": "0 2 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

The `fra1` (Frankfurt) region is chosen as the nearest Vercel Edge region to Turkey, minimizing latency for Turkish users. Supabase project should also be deployed in the `eu-central-1` (Frankfurt) region for co-location.

---

## Summary Statistics

| Category | Count |
|---|---|
| Database Tables | 15 |
| RLS Policies | 22 |
| Public Routes | 18 |
| Admin Routes | 10 |
| API Routes | 8 |
| Total Components | ~75 |
| Project Phases | 8 |
| Total Tasks | 68 |
| SSG Pages | 4 |
| ISR Pages | 9 |
| SSR Pages | 1 |
| CSR Pages | 8 |