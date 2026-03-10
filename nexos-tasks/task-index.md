# Nexos Emlak - Task Index

## Dashboard

| Phase | Name | Total | Done | In Progress | Pending | Blocked |
|-------|------|-------|------|-------------|---------|---------|
| 0 | Project Setup | 7 | 7 | 0 | 0 | 0 |
| 1 | Supabase Core | 9 | 0 | 0 | 9 | 0 |
| 2 | Property System | 10 | 2 | 0 | 8 | 0 |
| 3 | Public Listing Pages | 10 | 4 | 0 | 6 | 0 |
| 4 | Corporate Pages | 12 | 5 | 0 | 7 | 0 |
| 5 | Advanced Features | 8 | 0 | 0 | 8 | 0 |
| 6 | Admin Panel | 12 | 0 | 0 | 12 | 0 |
| 7 | SEO & Deployment | 10 | 0 | 0 | 10 | 0 |
| **Total** | | **78** | **18** | **0** | **60** | **0** |

**Progress**: 18/78 (23%)

---

## Phase 0: Project Setup

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-001 | Next.js 15 + TypeScript strict + pnpm init | devops | S | COMPLETED | - |
| TASK-002 | Tailwind CSS v4 + shadcn/ui + tema tokens | frontend | S | COMPLETED | TASK-001 |
| TASK-003 | ESLint + Prettier + Husky pre-commit | devops | S | COMPLETED | TASK-001 |
| TASK-004 | Supabase client helpers (server, client, middleware) + env yapısı | backend | S | COMPLETED | TASK-001 |
| TASK-005 | TanStack Query v5 + Zustand + global Providers | frontend | S | COMPLETED | TASK-001 |
| TASK-006 | Klasör yapısı: components/, lib/, types/, hooks/, store/, actions/ | devops | S | COMPLETED | TASK-001 |
| TASK-007 | Git init + .gitignore + ilk commit | devops | S | COMPLETED | TASK-001..006 |

## Phase 1: Supabase Core

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-008 | DB tablolar: cities, districts, neighborhoods, agents, features | backend | L | PENDING | TASK-004 |
| TASK-009 | DB tablolar: properties, property_images, property_features | backend | L | PENDING | TASK-008 |
| TASK-010 | DB tablolar: contact_requests, blog_posts, pages, site_settings, favorites, comparisons | backend | M | PENDING | TASK-009 |
| TASK-011 | Tüm indexler + full-text search (Turkish tsvector) | backend | M | PENDING | TASK-009 |
| TASK-012 | RLS politikaları + is_admin() helper | backend | M | PENDING | TASK-010 |
| TASK-013 | DB functions: updated_at trigger, increment_views, slugify | backend | M | PENDING | TASK-009 |
| TASK-014 | Supabase Auth: email/password + Google OAuth + redirect URLs | backend | M | PENDING | TASK-004 |
| TASK-015 | Supabase Storage buckets: property-images, agent-photos, blog-covers | backend | M | PENDING | TASK-004 |
| TASK-016 | Seed data: 81 il, örnek ilçeler, mahalleler, features, site_settings | backend | M | PENDING | TASK-010 |

## Phase 2: Property System

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-017 | TypeScript types: supabase.ts (gen) + domain.ts | backend | S | PENDING | TASK-010 |
| TASK-018 | Property query builder (tüm filtreler destekli) | backend | L | PENDING | TASK-017 |
| TASK-019 | Cascading location helpers: getDistricts, getNeighborhoods | backend | S | PENDING | TASK-008 |
| TASK-020 | Server Actions: property CRUD (create, update, delete, toggle) | backend | L | PENDING | TASK-012 |
| TASK-021 | Image upload flow: Supabase Storage + property_images CRUD | frontend | L | PENDING | TASK-015 |
| TASK-022 | Feature/amenity management: grouped fetch + junction CRUD | backend | S | PENDING | TASK-008 |
| TASK-023 | API: POST /api/properties/[slug]/views (view counter) | backend | S | PENDING | TASK-013 |
| TASK-024 | API: POST /api/contact (validation + rate limit) | backend | M | COMPLETED | TASK-010 |
| TASK-025 | Favorites Server Actions: add, remove, getFavorites | backend | S | PENDING | TASK-012, TASK-014 |
| TASK-026 | Comparison Zustand store (max 4 items) | frontend | S | COMPLETED | TASK-005 |

## Phase 3: Public Listing Pages

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-027 | Homepage: hero + hızlı arama + öne çıkan ilanlar + stats | frontend | L | COMPLETED | TASK-018 |
| TASK-028 | /emlak listeleme: SSR + PropertyGrid/List + pagination | frontend | L | COMPLETED | TASK-018 |
| TASK-029 | FilterPanel (desktop) + FilterDrawer (mobile) + URL sync | frontend | L | COMPLETED | TASK-018, TASK-019 |
| TASK-030 | /emlak/[slug] detay: galeri, stats, features, agent card, form | frontend | L | COMPLETED | TASK-018 |
| TASK-031 | Detay sayfasında Leaflet harita entegrasyonu | frontend | M | PENDING | TASK-030 |
| TASK-032 | /harita tam ekran harita: markers + clustering + popup | frontend | L | PENDING | TASK-018 |
| TASK-033 | Related properties karusel (embla-carousel) | frontend | M | PENDING | TASK-030 |
| TASK-034 | FavoriteButton: optimistic UI + auth redirect | frontend | M | PENDING | TASK-025 |
| TASK-035 | /karsilastir karşılaştırma sayfası (4'e kadar) | frontend | M | PENDING | TASK-026 |
| TASK-036 | /favoriler sayfası (auth-gated) | frontend | M | PENDING | TASK-025, TASK-014 |

## Phase 4: Corporate Pages

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-037 | Header: logo, nav, mobile menu, search bar, user menu | frontend | M | COMPLETED | TASK-002 |
| TASK-038 | Footer: firma bilgileri, linkler, sosyal ikonlar | frontend | M | COMPLETED | TASK-002 |
| TASK-039 | /hakkimizda (About) sayfası — CMS'den çekilen | frontend | M | PENDING | TASK-010 |
| TASK-040 | /hizmetlerimiz (Services) sayfası | frontend | M | PENDING | TASK-010 |
| TASK-041 | /ekibimiz danışman listesi sayfası | frontend | M | COMPLETED | TASK-008 |
| TASK-042 | /ekibimiz/[slug] danışman profil + ilanları | frontend | M | PENDING | TASK-041, TASK-018 |
| TASK-043 | /blog listeleme sayfası | frontend | M | COMPLETED | TASK-010 |
| TASK-044 | /blog/[slug] blog detay sayfası | frontend | M | COMPLETED | TASK-043 |
| TASK-045 | /iletisim sayfası (form + harita + WhatsApp) | frontend | M | COMPLETED | TASK-024 |
| TASK-046 | /[slug] dinamik CMS sayfa renderer (KVKK vb.) | frontend | S | PENDING | TASK-010 |
| TASK-047 | /giris ve /kayit auth sayfaları | frontend | M | PENDING | TASK-014 |
| TASK-048 | WhatsApp floating button + cookie banner + scroll-to-top | frontend | S | PENDING | TASK-002 |

## Phase 5: Advanced Features

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-049 | Sosyal paylaşım: Web Share API + fallback | frontend | S | PENDING | TASK-030 |
| TASK-050 | Virtual tour embed (YouTube, Matterport, iframe) | frontend | S | PENDING | TASK-030 |
| TASK-051 | Arama kaydetme: auth-gated, URL params serialize | fullstack | M | PENDING | TASK-029, TASK-014 |
| TASK-052 | Para birimi dönüştürme (TRY/USD/EUR) | fullstack | M | PENDING | TASK-018 |
| TASK-053 | İlan yazdırma / PDF görünümü | frontend | M | PENDING | TASK-030 |
| TASK-054 | Edge Function: yeni talep e-posta bildirimi (Resend) | backend | M | PENDING | TASK-024 |
| TASK-055 | Admin Realtime: yeni talepler anlık bildirim | frontend | M | PENDING | TASK-045 |
| TASK-056 | Full-text search endpoint (Turkish tsvector) | backend | M | PENDING | TASK-011 |

## Phase 6: Admin Panel

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-057 | Admin layout: sidebar, header, breadcrumb, auth guard | frontend | M | PENDING | TASK-014 |
| TASK-058 | /admin dashboard: KPI kartları, son talepler, grafikler | frontend | M | PENDING | TASK-057 |
| TASK-059 | Admin property DataTable: sıralama, filtre, pagination, bulk | frontend | L | PENDING | TASK-057, TASK-018 |
| TASK-060 | 6 adımlı property oluşturma formu (react-hook-form + zod) | frontend | L | PENDING | TASK-020, TASK-021 |
| TASK-061 | Property düzenleme formu (create form reuse) | frontend | M | PENDING | TASK-060 |
| TASK-062 | Drag-and-drop image manager (react-dropzone + dnd-kit) | frontend | L | PENDING | TASK-021 |
| TASK-063 | /admin/danismanlar agent yönetimi | frontend | M | PENDING | TASK-057, TASK-020 |
| TASK-064 | /admin/blog blog post yönetimi (TipTap editor) | frontend | L | PENDING | TASK-057 |
| TASK-065 | /admin/talepler leads inbox + durum takibi + CSV export | frontend | L | PENDING | TASK-057, TASK-055 |
| TASK-066 | /admin/sayfalar CMS sayfa editörü | frontend | M | PENDING | TASK-064 |
| TASK-067 | /admin/ayarlar site settings formu | frontend | M | PENDING | TASK-057 |
| TASK-068 | Konum yönetimi UI: il/ilçe/mahalle CRUD | frontend | M | PENDING | TASK-057 |

## Phase 7: SEO & Deployment

| ID | Task | Agent | Complexity | Status | Dependencies |
|----|------|-------|-----------|--------|-------------|
| TASK-069 | generateMetadata tüm public route'lar için | frontend | M | PENDING | TASK-027..048 |
| TASK-070 | Dynamic OG image (@vercel/og) property + blog | frontend | M | PENDING | TASK-069 |
| TASK-071 | next-sitemap konfigürasyonu (tüm dinamik route'lar) | devops | M | PENDING | TASK-069 |
| TASK-072 | JSON-LD structured data (RealEstateListing, BlogPosting, LocalBusiness) | frontend | M | PENDING | TASK-069 |
| TASK-073 | robots.txt + canonical links + hreflang | devops | S | PENDING | TASK-071 |
| TASK-074 | Vercel proje konfigürasyonu + env variables + domain | devops | M | PENDING | All Phase 0-6 |
| TASK-075 | Vercel Analytics + Speed Insights + Cron Jobs | devops | S | PENDING | TASK-074 |
| TASK-076 | Lighthouse audit + Core Web Vitals düzeltmeleri | frontend | L | PENDING | TASK-074 |
| TASK-077 | Security headers (CSP, HSTS, X-Frame-Options) | devops | M | PENDING | TASK-074 |
| TASK-078 | E2E smoke tests (Playwright) | qa | M | PENDING | TASK-074 |
