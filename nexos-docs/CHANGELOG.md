# Changelog

<!-- Format: ## [DATE] / ### Added / ### Changed / ### Fixed -->

## [2026-03-15]

### Added
- Kuzey Kıbrıs lokasyon verileri: 6 şehir (Lefkoşa, Girne, Gazimağusa, Güzelyurt, İskele, Lefke) + 205 ilçe
- Gelişmiş filtre paneli: şehir/ilçe, kat aralığı, bina yaşı, olanaklar (otopark, eşyalı, asansör, havuz, bahçe, güvenlik, balkon)
- Admin Panel v2: dashboard KPI kartları, Recharts grafikler, analiz sayfası, bildirim çanı, bulk işlemler, ilan kopyalama, command palette
- Admin analytics: property_views tablosu, admin_activity_log, danışman performans metrikleri
- Görsel sıkıştırma: WebP formatı, adaptive kalite (0.7-0.82), max 1600px
- Ekibimiz sayfasında danışman kartlarına link eklendi
- Tüm diller için filter çevirileri (TR, EN, DE, RU, FA)
- Admin kullanıcı yönetimi, CSV/Excel export-import

### Changed
- Cookie banner: basit floating bar tasarımı
- Admin panel dark mode uyumu: tüm hardcoded slate renkleri tema-aware sınıflara dönüştürüldü
- Oda sayısı filtreleri detaylı arama bölümüne taşındı
- Sidebar bağımsız scroll özelliği eklendi

### Fixed
- Admin Select bileşenlerinde İngilizce etiketler Türkçe'ye düzeltildi (property types, transaction types, categories)
- ShareButtons hydration hatası düzeltildi (useState + useEffect pattern)
- Next.js dev indicator kaldırıldı
- Danışman atama admin formda persist edilmiyordu — düzeltildi

## [2026-03-09]

### Added
- Phase 0 tamamlandı: Next.js 16 + TypeScript strict + Tailwind v4 + shadcn/ui v2 + ESLint + Prettier + Supabase client helpers + Zustand + TanStack Query + folder structure
- Homepage: hero search, featured properties, stats bar, category links, CTA (TASK-027)
- /emlak listeleme: SSR filter panel (desktop+mobile), sort bar, pagination, property grid (TASK-028, TASK-029)
- /emlak/[slug] detay: image gallery, specs grid, features, agent card, contact form, related properties (TASK-030)
- Header: sticky, desktop nav, mobile Sheet menu (TASK-037)
- Footer: firma bilgileri, linkler, sosyal ikonlar (TASK-038)
- /ekibimiz danışman listesi (TASK-041)
- /blog listeleme + /blog/[slug] detay (TASK-043, TASK-044)
- /iletisim: iletişim formu + bilgi kartları (TASK-045)
- Contact API endpoint with zod validation (TASK-024)
- Comparison Zustand store (TASK-026)
- PropertyCard, PropertyCardSkeleton, HeroSearch, SectionHeader components
- 404 sayfası
- Mock Supabase client (env yokken çalışmaya devam eder)
- Claude Code workflow: slash commands, hooks, task tracking
