Local dev ortamini dogrula:

0. Port temizligi — eski process'leri kontrol et
1. Docker/container durumu — kapaliysa baslat
2. Veritabani — Supabase local calisiyorsa migration kontrolu
3. Backend — build kontrolu + health check
4. Frontend — build kontrolu (`pnpm build`)
5. Ozet rapor: her servis OK/FAIL, erisim URL'leri

NOT: Sunuculari baslatma — sadece build ve health check yap.
