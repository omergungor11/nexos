# Nexos Emlak Project Memory

## Project Info
- Kurumsal emlak web sitesi — Next.js 15 + Supabase + Vercel
- Gelişmiş ilan filtreleme, harita entegrasyonu, admin paneli

## Project Status
- **Phase 0-7**: ALL COMPLETED — 78/78 tasks (100%)
- **GitHub**: https://github.com/omergungor11/nexos

## Key Technical Decisions
- Supabase tercih edildi (Prisma yerine) — realtime, auth, storage hepsi tek platformda
- Leaflet tercih edildi (Google Maps yerine) — ücretsiz, open source
- pnpm tercih edildi — disk tasarrufu, hız
- shadcn/ui tercih edildi — tam kontrol, copy-paste yaklaşım
- TipTap tercih edildi (admin rich text) — extensible, headless
- Türkçe URL parametreleri (islem=satilik, tip=daire) — SEO için
- Monorepo yok — tek Next.js projesi yeterli

## Important Patterns
- Filter state URL'de yaşar (useSearchParams sync)
- ISR + revalidateTag pattern: admin save → webhook → revalidate
- RLS ile güvenlik: public read, admin write, user-scoped favorites
- Server Components varsayılan, client sadece interaktif bileşenler

## Known Issues / Gotchas
- revalidateTag Next.js 16'da 2 argüman istiyor: `revalidateTag("tag", {})`
- Supabase local dev henüz kurulmadı — remote DB kullanılıyor
- Playwright chromium WSL2'de system deps eksik olabilir
- 002_saved_searches.sql migration'ı Supabase Dashboard'da çalıştırılmalı
