# Nexos Emlak Project Memory

## Project Info
- Kurumsal emlak web sitesi — Next.js 16 + Supabase + Vercel
- Gelişmiş ilan filtreleme, harita entegrasyonu, admin paneli
- Proje yapısı: Next.js root = git root (app/ alt dizini değil)

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

## Important Patterns (Updated 2026-03-16)
- Supabase FK join'leri RLS ile çakışabiliyor → ayrı query + Map pattern kullan (talepler sayfası örneği)
- Admin sayfalar `force-dynamic` (layout.tsx'de) — her zaman taze veri
- Taslak ilan akışı: yeni ilan → draft (is_active=false) → düzenleme sayfası → kaydet (is_active=true)
- Select component (base-ui): `onValueChange` `string | null` döner, `v ?? "default"` pattern
- Migration'lar manuel: Supabase Dashboard SQL Editor'de çalıştırılmalı

## Known Issues / Gotchas
- revalidateTag Next.js 16'da 2 argüman istiyor: `revalidateTag("tag", {})`
- Supabase local dev henüz kurulmadı — remote DB kullanılıyor
- NEXT_PUBLIC_SITE_URL Vercel'de ayarlanmalı (şu an localhost gösteriyor)
- Vercel deployment: Root Directory BOŞ olmalı (proje git root'ta)
- `is_admin()` fonksiyonu `auth.jwt() -> user_metadata ->> 'role' = 'admin'` kontrol eder
