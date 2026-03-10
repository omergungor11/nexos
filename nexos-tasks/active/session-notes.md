# Session Notes
<!-- Her session için tarih, yapılanlar, yarım kalanlar, sıradakiler, notlar -->

## 2026-03-09

### Yapılanlar
- Phase 0 tamamlandı (TASK-001~007): Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui v2, ESLint, Prettier, Supabase client helpers, Zustand, TanStack Query, folder structure
- Homepage (TASK-027): hero search, featured/recent properties, stats bar, category links, CTA
- /emlak listeleme (TASK-028, TASK-029): SSR filter panel (desktop+mobile), sort bar, pagination, property grid
- /emlak/[slug] detay (TASK-030): image gallery, specs grid, features, agent card, contact form, related properties
- Header + Footer (TASK-037, TASK-038): sticky header, mobile menu, footer with links
- /ekibimiz (TASK-041), /blog + /blog/[slug] (TASK-043, TASK-044), /iletisim (TASK-045)
- Contact API (TASK-024): zod validation, POST endpoint
- Comparison store (TASK-026): Zustand max 4 items
- 404 sayfası, PropertyCard, HeroSearch, SectionHeader components
- Mock Supabase client (env yokken dev çalışır)
- Claude Code workflow: slash commands, hooks, task tracking sistemi kuruldu
- İlk commit oluşturuldu (c306718)

### Yarım Kalanlar
- GitHub remote repo henüz oluşturulmadı — push yapılamadı
- Supabase bağlantısı yok (.env.local eksik) — mock client ile çalışıyor

### Sıradakiler
- **GitHub repo oluştur** ve push et
- **Phase 1 - Supabase Core** (TASK-008~016): DB tabloları, RLS, Auth, Storage, seed data
- **Phase 2 kalan**: TypeScript types (TASK-017), query builder (TASK-018), location helpers (TASK-019), server actions (TASK-020)
- Phase 3 kalan: harita (TASK-031, TASK-032), carousel (TASK-033), favorites (TASK-034~036)
- Phase 4 kalan: /hakkimizda, /hizmetlerimiz, danışman profil, auth sayfaları, WhatsApp button

### Dikkat Edilecekler
- shadcn v2 base-ui tabanlı — `asChild` prop YOK, `buttonVariants()` server component'lerde çalışmaz
- Select `onValueChange` tipi `string | null` — `v ?? ""` pattern kullan
- Supabase query'ler raw `string` döner, domain type'lara cast gerekli
