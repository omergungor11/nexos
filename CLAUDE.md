# Nexos Emlak

## Proje
Nexos Emlak — Next.js 16, Supabase ve Vercel ile geliştirilmiş kurumsal emlak web sitesi. Gelişmiş ilan listeleme, filtreleme, harita entegrasyonu ve admin paneli.

- **GitHub**: https://github.com/omergungor11/nexos
- **Vercel**: https://nexos-sand.vercel.app

## Slash Commandlar

| Command | Ne yapar |
|---------|----------|
| `/cold-start` | Session başlangıcı — projeyi oku, durumu raporla |
| `/git-full` | Stage, commit, push — task durumlarını güncelle |
| `/local-testing` | Tüm servisleri ayağa kaldır ve doğrula |
| `/turn-off` | Session notu yaz, taskları işaretle, push, kapat |

---

## Mevcut Durum

**Progress**: 78/78 task (%100) — Tüm phase'ler tamamlandı. Post-launch iyileştirmeler devam ediyor (vitrin yönetimi 4-flag sistemi, workflow_status, arsa pricing, sosyal medya sadeleştirme, rich-text editor, sub-listings + floor plans Faz C public render tamamlandı, SSS KKTC doğruluk revizyonu 5 dilde, sunumlar PDF/PowerPoint export pipeline, /emlak dinamik başlık, admin UX iyileştirmeleri).

Aktif/sırada: Dashboard workflow KPI kartları, Reels generator, Resend email entegrasyonu, Blog etiket yönetimi, bundle/performance audit, otomatik workflow transition'ları.

> Her yeni session'da `nexos-tasks/task-index.md` oku veya `/cold-start` çalıştır.

---

## Workspace

```
nexos/                         → Git root + Next.js proje kökü
├── app/                       → Next.js 16 App Router
│   ├── admin/                 → Admin paneli
│   ├── emlak/                 → İlan listeleme + detay
│   ├── harita/                → Tam ekran harita
│   ├── blog/                  → Blog
│   ├── ekibimiz/              → Danışmanlar
│   ├── giris/, kayit/         → Auth sayfaları
│   └── api/                   → API Routes
├── components/                → React componentler
│   ├── layout/                → Header, Footer, AdminLayout
│   ├── property/              → İlan kartları, filtreler, galeri
│   ├── admin/                 → Admin form ve tablo bileşenleri
│   ├── shared/                → Ortak bileşenler
│   └── ui/                    → shadcn/ui primitives
├── lib/                       → Supabase client, queries, utils
├── types/                     → TypeScript tip tanımları
├── hooks/                     → Custom React hooks
├── store/                     → Zustand store'lar
├── actions/                   → Next.js Server Actions
├── public/                    → Statik dosyalar
├── supabase/migrations/       → Migration dosyaları
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
npx supabase gen types typescript --project-id "$PROJECT_ID" > types/supabase.ts
```

---

## Code Conventions (Kısa)

- **TypeScript**: strict mode, `any` yasak, `unknown` + type guard kullan
- **Dosya**: `kebab-case` (property-card.tsx, use-property-filters.ts)
- **Bileşenler**: Server Components varsayılan, `'use client'` sadece gerektiğinde
- **API**: Response format `{ data, meta? }`, error `{ error: { code, message } }`
- **Commit**: `feat(TASK-XXX): açıklama` + `Co-Authored-By: Claude <noreply@anthropic.com>`

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
- Supabase local dev: `npx supabase start` ile çalıştırılır
