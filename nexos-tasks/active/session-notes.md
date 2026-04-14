# Session Notes
<!-- Her session için tarih, yapılanlar, yarım kalanlar, sıradakiler, notlar -->

## 2026-04-14 (akşam bloğu)

### Yapılanlar — Sub-Listings & Floor Plans Faz C (Public Render)
- `components/property/floor-plans-section.tsx` — grid + modal lightbox (ESC/arrow klavye, label/m²/oda meta), `bare` prop alt-ilan içinde başlıksız kullanım
- `components/property/sub-listings-section.tsx` — availability filter pill'leri (Müsait/Rezerve/Satıldı/Kiralandı sayımlı), accordion satırları, parent currency fallback, `formatListingPrice` entegrasyonu
- `actions/floor-plans.ts` → `listFloorPlansByParentIds` batch fetcher (N+1 engelleme)
- `app/[locale]/emlak/[slug]/page.tsx` — property + sub-listings + property floor plans + sub-listing floor plans paralel fetch → UI: Sub-listings → Property floor plans → Açıklama
- `app/[locale]/projeler/[slug]/page.tsx` — Gallery sonrası "Daire Tipleri" section, sonra "Kat Planları" section

### Yapılanlar — Admin UX İyileştirmeleri
- **Harita Yönetimi**: FullScreenMap'e `heightClass` prop'u, admin'de `h-[420px]` + `rounded-2xl border shadow-sm`
- **Map Management tablosu**: Başlık `w-[260px]` + hücre `max-w-[180px]` + hover tooltip (`title` attribute)
- **Admin sidebar scrollbar**: `globals.css` yeni `.admin-scroll` — idle görünmez, hover'da ince/theme-aware
- **Dashboard Son Aktiviteler**: son 5 aktivite (`.slice(0, 5)`)
- **Dashboard Hızlı İşlemler**: "Yeni İlan" primary sarı dolu, "Yeni Blog" primary outlined

### Yapılanlar — /emlak Arama Sonuçları
- Yeni `buildPageTitle(filters, cities, t)`: `?tip=apartment` → "Daire İlanları", `?islem=satilik&tip=villa` → "Satılık Villa İlanları", `?q=...` → "\"...\" Arama Sonuçları"
- SearchBar başlık satırından `SortBar`'ın yeni `middleSlot` prop'una taşındı → `[68 ilan bulundu] [🔍] [Sıralama▼]`
- 5 locale'a `listing.searchResults` key eklendi

### Yapılanlar — SSS İçerik Revizyonu (KKTC Doğruluk)
- `messages/tr/sss.json`: 24 yanıt düzeltildi + 3 yeni soru = 72 Q&A
- `messages/en|de|ru|fa/sss.json`: aynı yamalar yerel olarak çevrildi
- `scripts/patch-sss-translations.py` — reprodüktif multi-locale yama kaynağı
- Kritik düzeltmeler: tapu türleri (İTEM terminolojisi kaldırıldı, Tahsis/TMD eklendi), yabancı edinim limitleri (Yasa 52/2008 + 2023), BK süresi 6-12 ay, Specific Performance 21 gün, vatandaşlık (5 yıl yanlışı kaldırıldı), hastane sınıflandırması, "geçmiş performans gelecek garantisi değildir" uyarıları
- Yeni sorular: deprem/yapı güvenliği, abonelik kurulumu, ödeme transferi

### Yapılanlar — Sunumlar PDF/PPTX Export Yeniden Yazımı
- **Eski sorun**: `window.print()` → imajlar yüklenmeden tetikleniyordu, `buildPrintHTML` sadece 5/9 slayt tipini destekliyordu (photo/location/why_cyprus/investment atlıyordu)
- **Yeni akış**: Gizli 1920×1080 off-screen surface + `<SlideRenderer />` ile canlı React render → `html-to-image` ile capture → `jsPDF` (PDF) veya `pptxgenjs` (PPTX)
- **PowerPoint desteği**: LAYOUT_WIDE (13.333×7.5" native 16:9), yeni "PowerPoint İndir" butonu
- **UX**: Butonlar disabled, progress counter "3/12", toast feedback
- **4 düzeltme iterasyonu**:
  1. `buildPrintHTML` silindi (183 satır ölü kod)
  2. Lazy-image hang fix: surface viewport içine taşındı + `loading="eager"` force + 10s per-slide timeout + 15s html2canvas timeout
  3. `lab()`/`oklch()` parse hatası: html2canvas → `html-to-image` geçişi (foreignObject SVG → browser native CSS)
  4. Boş sayfa fix: opacity:0.01 yerine parent/inner clip yapısı (1×1 outer overflow:hidden, inner 1920×1080 opacity:1)

### Yeni Paketler
- `html-to-image` (capture pipeline)

### Dikkat Edilecekler
- **html-to-image computed style yakalar**: surface'a opacity/filter/clip-path **UYGULAMA** — parent clip frame kullan
- **next/image lazy-load**: off-screen surface (left:-100000px) IntersectionObserver tetiklemiyor → görseller asla yüklenmiyor → hang. Surface viewport içinde kalmalı (1×1 clip wrapper)
- **SSS TR source of truth**: diğer diller TR'den türetildi; TR değişirse `scripts/patch-sss-translations.py` güncellenip çalıştırılmalı
- **emlak başlık üretici**: `PROPERTY_TYPE_LABELS`'a dayalı — yeni tip eklersen constants'a unutma
- **Sub-listing'in kendi floor plan'ları**: polymorphic `parent_type='sub_listing'`. `listFloorPlansByParentIds` ile batch fetch

### Yarım Kalanlar (bu session'dan)
- Sub-listings + floor plans için gerçek veri ile manuel test (daire tipleri vs tek ilandaki birimler senaryoları)
- Sunumlar — özel font gömme (Geist vb.) — html-to-image font-substitution durumu kontrol edilmeli

### Sıradakiler
- Dashboard workflow_status KPI kartları
- Reels generator
- Resend email entegrasyonu
- Blog etiket yönetimi admin UI
- Bundle/performance audit
- Otomatik workflow transition'ları (30 gün taslak, 60 gün pasif→arşiv)

---

## 2026-04-14

### Yapılanlar — Vitrin Yönetimi (4 Bağımsız Highlight Flag)
- **Migration 045**: `is_slider`, `is_showcase`, `is_deal` bool kolonları + `slider_order/featured_order/showcase_order/deal_order` int kolonları + 4 partial index
- **Backend**: `actions/property-highlights.ts` — `toggleHighlight` (append order at end), `reorderHighlight` (rewrite order batch), `getHighlightedProperties` (admin için), `searchAvailableProperties` (Ekle modal'ı için)
- **Queries**: `getSliderProperties`, `getShowcaseProperties` eklendi; `getDealProperties` artık `is_deal=true` filtresi (otomatik ucuz sıralama kaldırıldı)
- **Admin UI `/admin/vitrin-yonetimi`**: 4 sekmeli (Slider/Öne Çıkan/Vitrin/Fırsat) + dnd-kit drag-drop sıralama + "İlan Ekle" modal (arama + ekleme)
- **Form**: Yayın tab'ına 2×2 renkli toggle grid (4 flag)
- **Sidebar**: Gayrimenkul grubuna "Vitrin Yönetimi" (Sparkles icon)
- **Frontend**: Hero slider → `getSliderProperties` (featured fallback), `/vitrin` → `getShowcaseProperties` (featured fallback)
- **Cross-list bug fix**: Aynı ilan birden fazla listeye eklenirken local state tüm flag'leri overwrite ediyordu → sadece tek flag/order patch'i; modal'da diğer sekme rozetleri (küçük pill'ler)

### Yapılanlar — Property Form Layout Düzeltmeleri
- **Yayın Durumu dropdown** Temel Bilgiler tab'ına eklendi (Satış Durumu'nun yanına) — 3'lü save buton yerine tek "Kaydet — {durum}"
- **Sorumlu Danışman** grid içine taşındı (Yayın Durumu yanında)
- **Alan grid**: Net + Brüt + Arazi → tek `grid-cols-3` satır
- **Oda grid**: Oda Tipi preset + Oda/Salon/Banyo/Yıl → tek `grid-cols-5` satır
- **Arazi grid**: Koçan + İmar Durumu + İmar Oranı → tek `grid-cols-3` satır (altında Yol/Elektrik/Su checkboxları)

### Yapılanlar — Rich Text Editor İyileştirmeleri
- **Plain-text preprocessing**: TipTap'e beslenmeden önce eski `"satır1\nsatır2\n\nsatır3"` formatı `<p>...<br/>...</p>` yapısına normalize ediliyor → editor ve detay sayfasında paragraflar ayrı görünüyor
- **Emoji picker butonu**: Native OS emoji picker için hint (`Win+.` / `Ctrl+Cmd+Space`)

### Migration'lar (tümü çalıştırıldı)
- ✅ `045_property_highlight_flags.sql`
- ✅ `046_sub_listings.sql` (başka session)
- ✅ `047_floor_plans.sql` (başka session)

### Dikkat Edilecekler
- **Highlight flags bağımsız**: Bir ilan aynı anda Slider + Öne Çıkan + Vitrin + Fırsat olabilir. `toggleHighlight(id, flag, true)` sadece o flag + order yazar, diğerlerini etkilemez
- **reorderHighlight**: Sadece order column'ı günceller, flag'leri değil. Remove için toggleHighlight kullanmak gerek
- **AddPropertyDialog onAdded pattern**: Patch-style — sadece değişen flag/order'ı merge et, yeni obje spreadlenmiyor
- **FormState.workflow_status**: Artık source of truth. Enter submit + Kaydet butonu hep `form.workflow_status` kullanıyor. Server publish-gate validation aynen çalışıyor (başlık/fiyat/şehir/min 1 görsel)
- **RichTextEditor legacy input**: `normalizeInitialContent` fonksiyonu plain-text'i HTML paragraflara çeviriyor; HTML varsa dokunmuyor
- **Alan grid responsive**: Arazi Alanı gösterilen türlerde `sm:grid-cols-3`, değilse `sm:grid-cols-2` (inline className check)

### Yarım Kalanlar
- **Reels generator**: Hâlâ "Yakında" placeholder
- **Dashboard KPI kartları**: Workflow status sayıları (Taslak/Yayında/Pasif/Arşiv)
- **Otomatik transition'lar**: 30 gün taslak hatırlatma, 60 gün pasif → arşiv

### Sıradakiler
- Reels üreteci (video/animasyon)
- Dashboard'a 4-durum KPI kartları
- E-posta bildirimi (Resend entegrasyonu)
- Blog etiket yönetimi admin UI
- Bundle analysis + lazy loading audit
- Highlight flag'ler için dashboard widget'ı ("2 slider ilanı var, vitrinde 18 ilan")

---

## 2026-04-13 (devam — ikinci blok)

### Yapılanlar — Pricing Type & Land
- **Migration 039/040**: `properties.pricing_type` (fixed/exchange/offer/kat_karsiligi) + `price_per_donum`; price NOT NULL kaldırıldı; `kat_karsiligi` sadece arazilerde görünür
- **Migration 041**: `floor_area_ratio` (TAKS/KAKS) kolonu
- **Form**: Fiyat Tipi radyo grubu (Sabit/Takas/Teklif + araziyse Kat Karşılığı), arazi ise Dönüm Başına Fiyat + İmar Oranı alanları
- **`formatListingPrice`**: TAKASA UYGUN / TEKLİF / KAT KARŞILIĞI etiketleri (user: "takas" → "takasa uygun")
- **Detay sayfası**: Arazilerde spec grid Oda/Banyo yerine Arazi Alanı / Net Alan / Koçan Türü / İmar Durumu / İmar Oranı gösteriyor

### Yapılanlar — Harita / Lokasyon
- **Migration 042**: ~70 popüler KKTC ilçesi gerçek koordinatlarla + null olanlar parent şehirden inherit
- **Migration 043**: `neighborhoods.lat/lng` kolonları
- **`lib/geocode.ts`**: OpenStreetMap Nominatim wrapper — KKTC viewbox, Kıbrıs sanity check, city→district→neighborhood için progresif sorgu listesi
- **Auto-geocode**: createCity/updateCity/createDistrict/updateDistrict/createNeighborhood/updateNeighborhood artık otomatik koordinat yazar; bulamazsa üst seviyeye (şehir/ilçe) fallback
- **Fallback zinciri**: property → neighborhood → district → city (4 seviyeli)

### Yapılanlar — Property Card Swipe
- **`hooks/use-card-image-preview.ts`**: index state, pointer handlers, klavye ok tuşları, isDragging (tıklama/swipe ayrımı)
- **`components/property/card-image-preview.tsx`**: slider track, hover arrows (desktop), dot navigation (sliding window max 5), touch swipe
- **PropertyCard refactor**: Link image alanından çıkarıldı → router.push ile programatik navigasyon. Arrow/dot tıklamaları stopPropagation
- **Yayma**: Tüm mapper'lar (home, /emlak, vitrin, favoriler, ekibimiz, kampanya) `images[]` doldurur; `PROPERTY_LIST_SELECT` + `actions/favorites.ts` + kampanya query'lerine `alt_text, sort_order` eklendi

### Yapılanlar — Sosyal Medya & Tasarım
- **Konum label**: district → city fallback (önce "İskele, Kıbrıs" gösteriyordu, şimdi sadece "İskele")
- **Neighborhood > district > city** öncelik: Mersinlik gibi ilanlar artık ilçe yerine mahalle gösteriyor
- **FullImage gradient**: Overall 30% overlay kaldırıldı → alt kısımda yazı alanına doğru koyulaşan gradient (resim aydınlık)
- **Görsel sıralama/sayaç**: Her tasarımın kaç görsel kullandığı rozet, hover'da ← → ⭐ 🗑️ butonları, kullanılmayan slotlar solukça
- **Renk değişimi**: `#0f172a` → `#171717` (sunum + story + social media tasarımları, 5 dosya 52 yer)

### Yapılanlar — Sunumlar & Proje Formu
- **Null price crash fix**: `PropertyForPresentation.price` → `number | null`, `formatPrice` pricing_type-aware, Investment slide safePrice guard
- **Photo slaytlarına logo**: Kapak slaytındaki gibi sol üstte Nexos logo + "NEXOS" yazısı
- **Proje status label bug**: Edit modda base-ui Select ham "completed" gösteriyordu → Türkçe label map SelectValue children'a geçildi
- **Proje form RichTextEditor**: Detaylı Açıklama artık TipTap (blog editörüyle aynı toolbar)
- **Migration 044 — Özel Alanlar**: `projects.custom_fields JSONB`. Fiyat & Birimler tab'ında + Alan Ekle / 🗑️ ile sınırsız etiket/değer ikilisi

### Migration'lar (tümü çalıştırıldı)
- ✅ `039_property_pricing_type.sql` → 040 self-contained yapıldı
- ✅ `040_pricing_type_kat_karsiligi.sql`
- ✅ `041_floor_area_ratio.sql`
- ✅ `042_district_coordinates.sql`
- ✅ `043_neighborhood_coordinates.sql`
- ✅ `044_project_custom_fields.sql`

### Dikkat Edilecekler
- **Nominatim**: Saniyede 1 istek limiti — admin tek tek kullanımda sorun yok. User-Agent header zorunlu (set edildi)
- **Fallback zinciri** her zaman 4 seviyeli: property → neighborhood → district → city. Yeni yerlerde PropertyMap bileşeni kullanılıyorsa `neighborhoodLat/Lng` prop'unu da geçmeyi unutma
- **pricing_type null-safe**: price null olabilir — tüm formatter/calculator'larda `price ?? 0` veya pricing_type kontrolü şart
- **Renk**: Artık `#171717` kullanıyoruz, yeni tasarımlarda da aynı tonu kullan

## 2026-04-13

### Yapılanlar — Workflow Status Sistemi (Migration 038)
- **4-state workflow**: `draft / published / passive / archived` enum + kolon + iki yönlü sync trigger (is_active ile)
- **Admin data-table**: Yayın Durumu filtre ayrı (Satış Durumu filtre ayrı), renkli inline dropdown, bulk 4-durumlu select
- **Form save butonları**: "Taslak Kaydet" / "Yayınla / Değişiklikleri Kaydet" / "Pasife Al" — publish-gate validation (başlık, fiyat, şehir, min 1 görsel)
- **Enter safe**: Form submit mevcut workflow_status'u koruyor (accidental publish yok)

### Yapılanlar — Arsa/Fiyat Bug'ları
- **pricing_type + price_per_donum** DB'ye yazılmıyormuş → `createProperty` ve `updateProperty` payload'larına eklendi. Takas/teklif/kat karşılığı non-fixed pricing için price=null
- **Publish-gate** pricing_type duyarlılığı: fixed değilse price > 0 zorunluluğu devre dışı
- **Edit page SELECT eksik kolonlar**: pricing_type, price_per_donum, has_road/elektrik/su, zoning_status, floor_area_ratio, show_on_map, min_rental_period, rental_payment_interval — hepsi eklendi. Eksik select'ler formun default'larla DB'yi **ezmesine** sebep oluyordu
- **`form.x || undefined` anti-pattern**: has_road_access/has_electricity/has_water — false değerler drop ediliyordu, düzeltildi
- **İmar Oranı (%)**: step=1, sağda `%` suffix, detay sayfasında `%220` olarak render

### Yapılanlar — Sosyal Medya Paneli Yeniden Yapılandırma
- **Tab yapısı**: Instagram + Facebook → tek **Metin** tab. Görsel ayrı tab, Story ayrı tab, **Reels (Yakında)** placeholder eklendi
- **Yeni post formatı**: Emoji-rich Turkish (🚀 özellikler, ✅ bullet'ler, 💎 fırsat, 📍📩 CTA, hashtag block). pricing_type duyarlı (TAKASA UYGUN/TEKLİF/KAT KARŞILIĞI)
- **İlan seçici iyileştirme**: `#0042 — Başlık` (ilan no + title) + sağda **nexos sarısı** fiyat. Arama ilan no ile de çalışıyor
- **Dropdown positioning fix**: `alignItemWithTrigger={false}` + `align="start"` — popup artık trigger altında doğru açılıyor

### Yapılanlar — Image Manager & Editor & Görsel Optimizasyon
- **Drag handle submit bug**: Native `<button>` drag handle form içindeyken default `type="submit"` → 8px threshold altında drag'ler click olarak yorumlanıp form submit ediyordu. `type="button"` eklendi
- **Fabric editor boyut**: Scale hesabı iki boyutlu, container `maxHeight: calc(100vh - 280px)` + `minHeight: 420px`
- **Social media image edit mode**: Grid `[1fr_280px]` → canvas `max-w-[420px]` ile preview mode ile uyumlu
- **Hero search fiyat badge**: Font büyütüldü (sm→base), extrabold, gölge, hover'da primary invert + scale-105
- **Vercel Pro alındı** — image optimization quota artık makul, kısa vadede başka değişiklik gerekmiyor

### Yapılanlar — Rich Text Editor (TipTap)
- **Açıklama alanı**: Textarea → **RichTextEditor** (Bold/İtalik/Strike/H2/H3/madde-numaralı liste/alıntı/link/undo-redo)
- **Detay sayfasında**: HTML ise `dangerouslySetInnerHTML` + `.rte-content` style, değilse eski plain-text fallback (backwards compat)
- **`.rte-content` custom CSS**: Tailwind v4 typography plugin yok — globals.css'te hand-styled (p/h2/h3/strong/em/s/ul/ol/li/blockquote/hr/a + empty placeholder)
- **Deps**: @tiptap/react, @tiptap/pm, @tiptap/starter-kit, @tiptap/extension-link

### Yapılanlar — Diğer Küçük İyileştirmeler
- **Default currency**: TRY → **GBP** (sterlin) — form + createProperty + import + DB kolon default (migration 042)
- **Yeni ilan form default'ları**: Isıtma=Klima, Otopark=Açık, Balkon=1 (sadece create mode, edit'te korunur)
- **Price nullable**: Types/supabase + 2 caller (page.tsx hero, comparison-table) güncellendi

### Migration'lar (Supabase Dashboard'da çalıştırıldı)
- ✅ `038_property_workflow_status.sql` — workflow_status enum + kolon + sync trigger
- ✅ `042_default_currency_gbp.sql` — properties.currency default 'TRY' → 'GBP'

### Yarım Kalanlar
- **Reels generator**: Tab'da "Yakında" placeholder var, asıl üretici yazılmadı
- **Dashboard KPI kartları** (Aşama 3 workflow): Taslak/Yayında/Pasif/Arşiv sayımlı kartlar eklenmedi
- **Otomatik transition**: 30 gün taslak → hatırlatma, 60 gün pasif → arşiv öner — planlanmış ama yapılmadı

### Sıradakiler
- Dashboard'a workflow_status KPI kartları (4 durum sayımı)
- E-posta bildirimi (Resend entegrasyonu)
- Blog etiket yönetimi admin UI
- Performance: bundle analysis, lazy loading audit
- Reels generator (video/animasyon)

### Dikkat Edilecekler
- **Base-ui Select**: `alignItemWithTrigger` default `true` — custom SelectItem children + SelectValue children beraber kullanıldığında width hesabı bozuluyor → `alignItemWithTrigger={false}` + `align="start"` koymak gerek
- **`form.x || undefined` pattern**: Boolean alanlarda false değerleri droplayıp stale true bırakıyor. Yeni alan eklerken `form.x` direkt geçirilmeli
- **Edit page SELECT**: Yeni kolon eklenince buraya da eklenmezse form default'larla DB'yi ezer. 038/039/040/041/042 sonrası edit page select full audit edildi
- **Native `<button>` + dnd-kit**: Form içinde kullanılırken mutlaka `type="button"` eklemeli
- **TipTap v3**: `setContent(html, { emitUpdate: false })` Next.js 16 hydration uyumlu
- **PropertyWorkflowStatus DB trigger**: is_active ↔ workflow_status bidirectional sync sayesinde eski is_active yazan kod hâlâ çalışıyor

### Aktif Context7 / Workflow Geçiş Durumu
- Phase 0-7 **COMPLETED** (78/78 task)
- Post-launch bu session'da workflow yönetimi + arsa pricing + sosyal medya sadeleştirme + zengin metin eklendi
- Bir sonraki ağır iş: Reels üreteci + dashboard KPI widget'ları + otomatik transition

---

## 2026-04-12

### Yapılanlar — Çeviri
- **9 sayfanın tam çevirisi**: harita, projeler (liste+detay), blog (liste+detay), giriş, kayıt, emlak-talebi, ekibimiz/[slug]
- **5 dil**: TR, EN, DE, RU, FA — toplam ~90 yeni key/dil
- **Eksik key düzeltme**: 7 missing key (footer/property/search/propertyTypes) + 3 extra nav key temizliği
- **Proje detay sayfası**: CTA, video, konum, Google Maps link dahil tüm metinler çevrildi

### Yapılanlar — Admin İyileştirmeler
- **Analiz sayfası redesign**: KPI kartları (trend ikonları + renk çizgisi), top 10 ilan (progress bar listesi), 3 dağılım kartı (tip/işlem/şehir)
- **Animasyonlu polinom grafik**: `AnimatedCurveChart` — natural curve, 1.8s giriş animasyonu, pulsating dot, gradient fill, ortalama referans çizgisi
- **Admin sidebar kategorize**: 6 grup (Gayrimenkul/İçerik/Müşteri/Yönetim + Dashboard/Yardım)
- **Help Center** (`/admin/yardim`): 6 kategori, ~20 rehber kartı, ipuçları bölümü
- **Onboarding Tour**: 8 adımlı interaktif tur, ilk girişte otomatik, localStorage flag
- **Help Menu**: Header'da "?" butonu, dropdown (Yardım Merkezi/Turu Başlat/⌘K)
- **Geliştirici alanı kaldırıldı**: Projects tablosundan developer/developer_logo tamamen silindi (migration 035)
- **Admin harita**: Projeler tabloya eklendi, filtreleme (tip/işlem/kayıt/harita durumu), pagination

### Yapılanlar — Animate UI Tema Sistemi
- **Faz 1**: Motion kütüphanesi kurulumu, `animate_ui_enabled` setting (migration 037), admin toggle
- **Faz 2**: HeaderAnimate (slide-down, stagger nav, scroll glass, animated mobile), FooterAnimate (scroll reveal, stagger, spring social icons)
- **Faz 3**: Animation primitives — ScrollReveal, StaggerChildren, HoverScale, TextReveal, CountUp
- **Faz 4**: AnimateUIProvider context, SmartPropertyCard, PropertyCardAnimate
- **Faz 5**: Tüm sayfalarda PropertyCard → SmartPropertyCard (property-grid, vitrin, favoriler, kampanya, ekibimiz, emlak detay, related-carousel)

### Yapılanlar — Diğer
- **Danışman form**: Kapak fotoğrafı + kaldır butonu + canlı profil kartı önizleme (migration 034)
- **Görsel kaldırma fix**: Boş string → undefined sorunu çözüldü (create + update action'lar)
- **İlan görsel path**: `properties/{listing_number}-{slug}/` yapısına geçildi
- **Nav kategoriler**: İlanlar altına sub menü olarak taşındı (NavChildGroup tipi)
- **Harita z-index fix**: Mobilde header üstüne çıkma sorunu düzeltildi
- **Leaflet marker fix**: Tailwind preflight img reset override

### Migration'lar
- ✅ `034_agents_cover_image.sql` — agents.cover_image kolonu
- ✅ `035_drop_projects_developer.sql` — developer/developer_logo kaldırıldı
- ✅ `037_animate_ui_setting.sql` — animate_ui_enabled setting

### Yarım Kalanlar
- Animate UI: SSS animated accordion, proje/emlak detay section scroll reveal
- Blog etiket CRUD admin UI yok
- Sunum PDF/PNG export iyileştirmesi

### Sıradakiler
- Animate UI detay sayfaları (SSS accordion, proje detay section reveal)
- Blog etiket yönetimi admin sayfası
- E-posta bildirimi (Resend entegrasyonu)
- Performance optimizasyonu (bundle size, lazy loading)

### Dikkat Edilecekler
- `animate_ui_enabled` Supabase'de `site_settings` tablosunda — toggle ile açılır
- Motion kütüphanesi sadece animate aktifken yüklenir (dynamic import)
- SmartPropertyCard `useAnimateUI` context'i kullanır — layout'taki AnimateUIProvider içinde olmalı
- Leaflet marker fix: `globals.css`'te `.leaflet-container img { max-width: none !important }`

---

## 2026-04-09

### Yapılanlar — Harita & Admin
- **Harita yönetimi**: Admin sidebar'a "Harita" sayfası eklendi, `show_on_map` boolean kolonu (migration 032), toggle/bulk toggle, harita preview, pagination
- **Proje pinleri**: Harita sayfasında projeler için mor labeled pin (yazılı + link + görsel), MapProjectPopup componenti, harita sayfası artık hem ilanlar hem projeleri gösteriyor
- **Admin Projeler**: CRUD sayfaları, ProjectDataTable, ProjectForm (tab'lı — Temel/Geliştirici/Konum/Fiyat/Medya/Özellikler/Durum), server actions (create/update/delete/toggleStatus/toggleFeatured)
- **LocationPicker**: Reusable interaktif harita komponenti (Leaflet + Nominatim→kendi DB arama), tıkla-yerleştir, sürüklenebilir pin, Kuzey Kıbrıs viewbox
- **Şehir/ilçe Select fix**: Proje formunda Select trigger'da ID yerine isim gösteriliyor (base-ui workaround)
- **Geçitkale ilçesi** İskele'ye eklendi (migration 033)

### Yapılanlar — Galeri & Upload
- **MediaPicker Yükle tab'ı**: Sürükle-bırak upload, çoklu dosya, max 10MB
- **Client-side WebP compression**: `lib/image-compress.ts` — Canvas API ile 2048px max, %82 kalite
- **Upload düzeltme**: Server action yerine client-side Supabase Storage (1MB body limit sorunu çözüldü)
- **Admin galeri sayfası**: Upload zone üstte, "Son Eklenen Görseller" 10×2 grid, "Diğer Görseller" (media/ klasörü) her zaman üstte açık
- **Görsel detay popup**: Dosya adı, çözünürlük, boyut, URL kopyala, silme butonu, tüm bölümlerde tıklanabilir
- **Harici görseller**: next/image catch-all remotePattern, YouTube embed CSP düzeltildi

### Yapılanlar — Legal & Content
- **Yasal sayfalar**: Migration 034 — Gizlilik Politikası, Kullanım Şartları, KVKK (tam içerikli), footer'a 3 link
- **Breadcrumb**: Projeler sayfasına "Anasayfa > Projeler" eklendi
- **Nav kategoriler**: Public nav'a Kategoriler dropdown (Villa/Daire/Penthouse/Arsa/Dükkan/Ofis/Bungalow), 5 dil i18n
- **Header cleanup**: İletişime Geçin butonu kaldırıldı, telefon 1300px altında gizli

### Yapılanlar — Sunumlar (Ana İş)
- **Logo**: N placeholder yerine `/logo-square.jpeg` (cover + contact slide)
- **Photo slaytları**: Tek sayfa tam ekran görsel, Settings panelde thumbnail grid ile seçim, custom banner text
- **Drag-and-drop sıralama**: `@dnd-kit` ile slayt tab'ları sürükleyerek sıralanabilir, her fotoğraf bağımsız
- **Konum slaytı**: OpenStreetMap → Google Maps iframe, city/district lat/lng fallback
- **Neden Kıbrıs? slaytı**: Detaylı araştırma verileriyle (KPI row: %8-9 ROI, %6-9 yield, 7-10yr payback, 320+ sun days; 6 sebep: turizm 1.8M, Ercan 5.29M, Girne fiyatları); font boyutları artırıldı
- **Yatırım slaytı**: 5 yıllık projeksiyon (%7.5 yield + %8.5 appreciation), aylık/yıllık/5yr kira, bugün vs 5yr değer, property görseli arkaplan
- **Açıklama slaytı**: Custom description textarea, pull-quote layout (ilk cümle italic, altın çizgi), görsel arkaplan
- **Detaylar + Özellikler birleşti**: Tek "Detaylar" slaytı, her alan kendi ikonu ile (Maximize2/BedDouble/Bath/Layers/CalendarDays/Home/Building2/Sparkles)

### Migration'lar (Supabase Dashboard SQL Editor'de çalıştırılacak)
- ✅ `032_show_on_map.sql` — properties.show_on_map boolean
- ✅ `033_gecitkale_district.sql` — İskele'ye Geçitkale ilçesi
- ✅ `034_legal_pages.sql` — Gizlilik/Kullanım/KVKK yasal sayfaları

### Sıradakiler / İyileştirmeler
- PDF export kalitesini iyileştirme (şu an browser print dialog — Puppeteer veya @react-pdf/renderer geçişi)
- PNG export gerçekten çalışır hale getirme (html-to-image library)
- Presentation manager 2000+ satır — component'lara ayırma refactor'u
- Sunumlara floor plan slaytı ve QR kod (contact slide) eklenebilir

### Dikkat Edilecekler
- Base-ui Select: edit modda seçili value ID gösteriyorsa, SelectValue children'ına `.find(...)?.name ?? fallback` pattern kullan
- Upload: server action body limit 1MB — client-side Supabase Storage kullan
- next.config.ts CSP frame-src: youtube.com, openstreetmap.org, maps.google.com izinli
- Fotoğraf slaytı state: `photo-{idx}` key formatı, slideOrder string[] tutuyor
- LocationPicker: Nominatim yerine kendi `cities`/`districts` tablolarından arama (daha hızlı, daha alakalı)

---

## 2026-03-16

### Yapılanlar
- **Firma bilgileri güncellendi**: Telefon (+90 542 880 64 56), e-posta, adres, domain tüm sayfalarda
- **GBP para birimi** eklendi (DB enum, types, form, currency converter)
- **Havuz** (Özel/Ortak), **Otopark** (Açık/Kapalı/Her İkisi) seçenekleri
- **Koçan durumu** arsa ilanları için (Eşdeğer, Tahsis, Türk, Gazi, Yabancı)
- **Arazi alanı** villa türleri için
- **Harita fallback**: lat/lng yoksa şehir/ilçe merkezi gösteriliyor
- **Medya tab'ı**: İlan formuna Görseller + Video + 360° tab eklendi
- **Taslak ilan akışı**: Yeni ilan → otomatik draft → düzenleme sayfasına yönlendir (görseller hemen yüklenebilir)
- **İlan detay formu**: Çalışan contact form (property_id + ilan linki dahil)
- **WhatsApp mesajına ilan linki** eklendi
- **Harita sayfası**: Kuzey Kıbrıs merkez (35.24, 33.66), şehir fallback ile tüm ilanlar görünür
- **Admin force-dynamic**: Tüm admin sayfaları her istekte taze veri
- **Talepler sayfası düzeltildi**: FK join kaldırıldı, ayrı query'ler + Map ile join
- **Talep silme** özelliği eklendi
- **Admin galeri sayfası**: İlan bazlı gruplama, arama, filtre, toplu silme, detay popup
- **Aktivite sayfası yenilendi**: İstatistik kartları, timeline, detay popup, gelişmiş filtreler
- **Blog kategorileri ve etiketleri**: DB tabloları, admin form, public filtre
- **Landing page builder**: Admin CRUD + public /kampanya/[slug] sayfası (sonra sidebar'dan kaldırıldı)
- **PWA**: manifest.ts, service worker, offline page
- **İlan geçmişi timeline**: Fiyat değişimleri %, görüntülenme, oluşturulma tarihi
- **Tab validasyon**: Hatalı sekmeler kırmızı + * işareti, otomatik sekme geçişi
- **Günlük kiralık**: TransactionType + admin filtre eklendi
- **Select placeholder**: Varsayılan "Seçiniz" (Türkçe) tüm dropdown'larda
- **Plaka alanı** konum yönetiminden kaldırıldı
- **Erişilebilirlik** feature kategorisi kaldırıldı
- **Sayfalar ve Kullanıcılar** admin sidebar'dan kaldırıldı
- **Analiz** tab olarak form içine taşındı, ilan listesinde analiz butonu

### Çalıştırılması gereken migration'lar (Supabase Dashboard SQL Editor)
- ✅ 010: GBP, pool_type, parking_type, title_deed_type, land_area_sqm, city/district lat/lng
- ✅ 011: admin_activity_log + property_views RLS
- ✅ 012: contact_requests DELETE policy
- ✅ 013: blog_categories, blog_tags, blog_post_tags
- ✅ 014: landing_pages
- ✅ 006 (geç çalıştırıldı): assigned_agent_id, admin_notes
- ✅ 007 (geç çalıştırıldı): admin_activity_log, property_views tabloları
- ✅ Storage RLS: property-images bucket policies
- ✅ contact_requests SELECT policy: authenticated kullanıcılar okuyabilir

### Yarım Kalanlar
- **NEXT_PUBLIC_SITE_URL** Vercel env variable'ı ayarlanmalı (localhost gösteriyor)
- Blog etiket yönetimi admin UI'ı yok (DB'den eklenebilir)

### Sıradakiler
- Vercel'de NEXT_PUBLIC_SITE_URL=https://nexos-sand.vercel.app ayarla
- Blog etiket CRUD admin sayfası
- Canlı test: ilan ekleme → görsel yükleme → form → talep → harita akışı
- E-posta bildirimi (Resend entegrasyonu)
- WhatsApp Business API entegrasyonu

### Dikkat Edilecekler
- Supabase FK join'leri RLS ile çakışabiliyor — ayrı query + Map pattern kullan
- `is_admin()` fonksiyonu `auth.jwt() -> user_metadata ->> role = 'admin'` kontrol ediyor
- Taslak ilanlar `is_active=false` — kaydet'te `is_active=true` yapılıyor
- Select component (base-ui): `onValueChange` `string | null` döner, `v ?? "default"` pattern kullan
- Migration'lar manuel çalıştırılmalı (Supabase Dashboard SQL Editor)

## 2026-03-12

### Yapılanlar
- **Danışman atama özelliği eklendi**: İlanları ekip üyelerine atama
  - Admin ilan formu (yeni + düzenle): "Sorumlu Danışman" dropdown eklendi (Temel Bilgiler sekmesi)
  - Admin ilan listesi tablosuna "Danışman" kolonu eklendi
  - `PropertyCreateInput` tipi `agent_id: string | null` destekliyor
  - `buildPayload` ve `updateProperty` agent kaldırma (`null`) durumunu doğru işliyor
- **Danışman kartı yeniden tasarlandı** (ilan detay sayfası sidebar):
  - Büyük avatar + açık renkli header arka planı
  - Telefon, e-posta, WhatsApp iletişim butonları (sol hizalı, ikonlu)
  - "Danışman Profilini Gör" linki (`/ekibimiz/[slug]`)
- **Agent atama bug fix**: Select value `""` ↔ `__none__` uyumsuzluğu düzeltildi, `null` gönderimi sağlandı
- Commits: f0f2657, e2d081c, 9132e56

### Yarım Kalanlar
- Yok — tüm istenen özellikler tamamlandı ve push edildi

### Sıradakiler
- Danışman atamasını canlıda test et (admin panelden bir ilana danışman ata, detay sayfasında kartın göründüğünü doğrula)
- Gerekirse danışman kartına ilan bazlı mesaj şablonu eklenebilir

### Dikkat Edilecekler
- `i18n/navigation` Link'i typed pathname kullanır: `{ pathname: "/ekibimiz/[slug]", params: { slug } }` — template literal kullanma
- Select component'te `value=""` ile `SelectItem` eşleşmezse placeholder görünmez, `"__none__"` sentinel kullan
- `agent_id` `undefined` gönderilirse `updateProperty` o alanı atlar (güncelleme yapmaz); `null` gönderilmesi gerekir

## 2026-03-11

### Yapılanlar
- **Proje yapısı yeniden düzenlendi**: Next.js projesi `app/` alt dizininden git root'a taşındı
  - Eski: `nexos/app/` (Next.js root) → `nexos/app/app/` (App Router)
  - Yeni: `nexos/` (Next.js root) → `nexos/app/` (App Router)
- Tüm dosyalar taşındı: components, lib, actions, types, store, hooks, public, supabase, config dosyaları
- Local build başarıyla test edildi (`pnpm build` → tüm route'lar OK)
- Git commit + push yapıldı (e517b06)

### Yarım Kalanlar
- **Vercel deployment hala 404 veriyor** — push yapıldı, Vercel Dashboard'da Root Directory boşaltıldı ama henüz doğrulanmadı
- Vercel build log'ları kontrol edilmeli — build başarılı mı?
- Vercel env variables kontrol edilmeli (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Sıradakiler
- **Vercel deployment'ı düzelt** — build log kontrol et, 404 sorununu çöz
- Framework Preset = Next.js olduğunu doğrula
- Site canlıya geçtikten sonra smoke test yap

### Dikkat Edilecekler
- Vercel Root Directory artık **boş** olmalı (app/ DEĞİL)
- package.json artık git root'ta — Vercel otomatik algılamalı
- Eski `app/` alt dizini yapısı tamamen kaldırıldı

---

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
