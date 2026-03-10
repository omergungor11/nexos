# Nexos Emlak

## Proje
Nexos Emlak — Next.js 16, Supabase ve Vercel ile geliştirilmiş kurumsal emlak web sitesi. Gelişmiş ilan listeleme, filtreleme, harita entegrasyonu ve admin paneli.

## Slash Commandlar

| Command | Ne yapar |
|---------|----------|
| `/cold-start` | Session başlangıcı — projeyi oku, durumu raporla |
| `/git-full` | Stage, commit, push — task durumlarını güncelle |
| `/local-testing` | Tüm servisleri ayağa kaldır ve doğrula |
| `/turn-off` | Session notu yaz, taskları işaretle, push, kapat |

---

## Mevcut Durum

**Progress**: 18/78 task (23%) — Phase 0 tamamlandı, Phase 2-4 devam ediyor.

> Her yeni session'da `nexos-tasks/task-index.md` oku veya `/cold-start` çalıştır.

---

## Workspace

```
app/                           → Next.js 16 App Router (çalışma dizini)
├── app/                       → Sayfalar (routes)
│   ├── page.tsx               → Ana sayfa (hero, featured, categories)
│   ├── emlak/page.tsx         → İlan listesi + filtreler
│   ├── emlak/[slug]/page.tsx  → İlan detay
│   ├── iletisim/              → İletişim sayfası + form
│   ├── ekibimiz/              → Ekip sayfası
│   ├── blog/                  → Blog listesi + detay
│   ├── api/contact/           → Contact form API
│   └── not-found.tsx          → 404 sayfası
├── components/
│   ├── layout/                → Header, Footer
│   ├── property/              → PropertyCard, FilterPanel, Grid, Pagination
│   ├── shared/                → HeroSearch, SectionHeader
│   ├── admin/                 → (henüz boş)
│   └── ui/                    → shadcn/ui (17 bileşen)
├── lib/
│   ├── supabase/              → client.ts, server.ts, middleware.ts
│   ├── queries/               → properties.ts, locations.ts, content.ts
│   ├── constants.ts           → Türkçe etiketler, nav links
│   └── format.ts              → Fiyat, alan, oda, tarih formatları
├── types/                     → TypeScript tip tanımları
├── store/                     → Zustand (comparison, ui)
├── supabase/migrations/       → 001_initial_schema.sql
├── nexos-tasks/               → Task tracking
├── nexos-config/              → Proje kuralları
├── nexos-docs/                → Hafıza ve changelog
└── nexos-plans/               → Mimari planlar
```

## Temel Komutlar

```bash
pnpm dev                    # Dev server (localhost:3000)
pnpm build                  # Production build
pnpm lint                   # ESLint
pnpm typecheck              # TypeScript check
pnpm format                 # Prettier format
```

---

## Code Conventions (Kısa)

- **TypeScript**: strict mode, `any` yasak, `unknown` + type guard kullan
- **Dosya**: `kebab-case` (property-card.tsx, use-property-filters.ts)
- **Bileşenler**: Server Components varsayılan, `'use client'` sadece gerektiğinde
- **API**: Response format `{ data, meta? }`, error `{ error: { code, message } }`
- **Commit**: `feat(TASK-XXX): açıklama` + `Co-Authored-By: Claude <noreply@anthropic.com>`
- **shadcn v2**: base-ui tabanlı, `asChild` YOK — server component'lerde `buttonVariants` kullanılmaz

Detaylar → `nexos-config/conventions.md`

## Parallel Agent Orchestration

Birden fazla sub-agent paralel çalıştırılırken:
- Her agent sadece kendi modül dizininde dosya düzenler (dizin izolasyonu)
- Paket kurulumu sadece ana agent (orchestrator) tarafından yapılır
- Paylaşılan dosyalarda retry pattern uygulanır
- Bağımlı task'lar sıralı, bağımsız olanlar paralel çalıştırılır

Detaylar → `nexos-config/agent-instructions.md`

---

## Referans Dizinleri

| Dizin | İçerik |
|-------|--------|
| `nexos-tasks/` | Task takip — dashboard + tüm task'lar |
| `nexos-tasks/task-index.md` | Master task listesi |
| `nexos-tasks/phases/` | Phase bazlı detaylı task açıklamaları |
| `nexos-tasks/active/session-notes.md` | Session notları |
| `nexos-config/workflow.md` | Task workflow kuralları |
| `nexos-config/conventions.md` | Kod standartları |
| `nexos-config/tech-stack.md` | Teknolojiler + versiyonlar |
| `nexos-config/agent-instructions.md` | Sub-agent sorumlulukları |
| `nexos-docs/MEMORY.md` | Kalıcı hafıza |
| `nexos-docs/CHANGELOG.md` | Değişiklik kaydı |
| `nexos-plans/` | Uygulama planları |

---

## Hooks (Otomatik Kurallar)

| Hook | Tetikleyici | Ne yapar |
|------|------------|----------|
| `protect-files.sh` | PreToolUse (Edit/Write) | .env, lock files, .git/ düzenlemeyi bloklar |

---

## Notlar

- Hafıza dosyası `nexos-docs/MEMORY.md`'de — her session'da oku, gerektiğinde güncelle
- Mimari plan `nexos-plans/architecture-plan.md`'de — tüm DB şeması, route yapısı, component mimarisi burada
- Supabase henüz bağlanmadı — mock client ile çalışıyor (`.env.local` eklenince gerçek veriler gelir)
- shadcn v2 base-ui tabanlı — `asChild` prop yok, `buttonVariants()` server component'lerde çalışmaz
