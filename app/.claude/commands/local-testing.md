Local dev ortamini dogrula:

0. Port temizligi — eski process'leri kontrol et (lsof -i :3000)
1. Supabase durumu — `npx supabase status` ile kontrol et
2. Veritabani — Pending migration var mi? Seed data?
3. Next.js build — `pnpm build` ile build kontrolu
4. TypeScript — `pnpm typecheck` ile tip kontrolu
5. Lint — `pnpm lint` ile kod kalite kontrolu
6. Dev server — `pnpm dev` ile baslatilabilirlik testi
7. Ozet rapor: her servis OK/FAIL, erisim URL'leri

NOT: Sunuculari arka planda baslatma — sadece build ve health check yap.
