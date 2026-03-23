-- 017: Seed SEO-optimized blog posts for North Cyprus real estate guide
-- 12 articles across 6 categories — geo-targeted keywords for KKTC/Kıbrıs
-- Run this in Supabase Dashboard > SQL Editor

BEGIN;

-- Clear existing posts
DELETE FROM blog_post_tags;
DELETE FROM blog_posts;

-- ============================================================
-- CATEGORY 1: Yatırım Rehberi (2 posts)
-- ============================================================

INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, author, published_at, is_published, seo_title, seo_description, category_id) VALUES
(
  'Kuzey Kıbrıs''ta Gayrimenkul Yatırımı: 2026 Rehberi',
  'kuzey-kibrista-gayrimenkul-yatirimi-2026-rehberi',
  '<h2>Neden Kuzey Kıbrıs''ta Yatırım Yapmalısınız?</h2>
<p>Kuzey Kıbrıs, Akdeniz''in en hızlı büyüyen gayrimenkul pazarlarından biri haline geldi. Düşük başlangıç maliyetleri, yüksek kira getirisi ve artan turizm talebi, yatırımcılar için cazip fırsatlar sunuyor.</p>

<h3>2026''da Kuzey Kıbrıs Emlak Piyasası</h3>
<p>Girne, İskele ve Gazimağusa bölgeleri, özellikle yabancı yatırımcılar arasında en popüler lokasyonlar olmaya devam ediyor. İskele Long Beach bölgesindeki projeler, yıllık %8-12 kira getirisi sağlarken, Girne''deki lüks villalar değer artışında öne çıkıyor.</p>

<h3>Yatırım İçin En İyi Bölgeler</h3>
<ul>
<li><strong>Girne — Alsancak / Çatalköy:</strong> Deniz manzaralı villalar ve penthouse''lar. Ortalama m² fiyatı £1.200-1.800.</li>
<li><strong>İskele — Long Beach / Bafra:</strong> Tatil kompleksleri ve kira garantili daireler. m² fiyatı £800-1.400.</li>
<li><strong>Lefkoşa — Gönyeli / Hamitköy:</strong> Üniversite öğrencileri ve çalışanlar için kiralık daireler. m² fiyatı £600-900.</li>
<li><strong>Gazimağusa — Yeniboğaziçi:</strong> Yükselen değerler, uygun fiyatlı villalar. m² fiyatı £700-1.100.</li>
</ul>

<h3>Yatırım Getirisi Hesaplama</h3>
<p>Kuzey Kıbrıs''ta ortalama brüt kira getirisi %6-10 arasında değişmektedir. Girne''de bir 2+1 daire aylık £500-800, İskele Long Beach''te £400-650 kira geliri sağlayabilir. Günlük kiralık piyasasında ise yaz aylarında günlük £40-120 arasında gelir elde edilebilir.</p>

<h3>Dikkat Edilmesi Gerekenler</h3>
<p>Yatırım yapmadan önce koçan türünü (eşdeğer, Türk, tahsis), altyapı durumunu ve bölgenin gelecek projelerini mutlaka araştırın. Güvenilir bir emlak danışmanıyla çalışmak, riskleri minimize edecektir.</p>',
  'Kuzey Kıbrıs''ta gayrimenkul yatırımı için kapsamlı 2026 rehberi. En iyi bölgeler, kira getirisi ve yatırım ipuçları.',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '2 days',
  TRUE,
  'Kuzey Kıbrıs Gayrimenkul Yatırımı 2026 | Rehber ve İpuçları',
  'Kuzey Kıbrıs''ta emlak yatırımı yapmak isteyenler için kapsamlı 2026 rehberi. Girne, İskele, Lefkoşa bölge analizleri, kira getirisi ve yatırım stratejileri.',
  (SELECT id FROM blog_categories WHERE slug = 'yatirim-rehberi')
),
(
  'Kıbrıs''ta Kira Garantili Emlak Yatırımı: Avantajlar ve Riskler',
  'kibrista-kira-garantili-emlak-yatirimi',
  '<h2>Kira Garantili Yatırım Nedir?</h2>
<p>Kuzey Kıbrıs''taki birçok inşaat projesi, alıcılara belirli bir süre (genellikle 2-5 yıl) boyunca garantili kira geliri sunmaktadır. Bu model, özellikle uzaktan yatırım yapan alıcılar için cazip bir seçenektir.</p>

<h3>Nasıl Çalışır?</h3>
<p>Müteahhit firma, satış sözleşmesine ek olarak bir kira garanti sözleşmesi imzalar. Bu sözleşmede yıllık kira getirisi (genellikle %5-8), ödeme takvimi ve süre belirtilir. Yönetim şirketi, mülkün kiralanması, bakımı ve misafir yönetimini üstlenir.</p>

<h3>İskele Long Beach Örneği</h3>
<p>İskele Long Beach''teki bir 2+1 daire için tipik bir kira garanti modeli:</p>
<ul>
<li>Satış fiyatı: £120.000</li>
<li>Yıllık garanti kira: £7.200 (aylık £600)</li>
<li>Brüt getiri: %6</li>
<li>Garanti süresi: 3 yıl</li>
<li>Yönetim komisyonu: Kira gelirinin %15-20''si</li>
</ul>

<h3>Dikkat Edilmesi Gerekenler</h3>
<p>Kira garantisi veren firmanın mali gücünü, geçmiş projelerindeki performansını ve sözleşme şartlarını detaylıca inceleyin. Garantinin bitmesinden sonraki piyasa koşullarını da değerlendirin.</p>',
  'Kuzey Kıbrıs''ta kira garantili emlak yatırımının avantajları, riskleri ve dikkat edilmesi gerekenler.',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '5 days',
  TRUE,
  'Kıbrıs Kira Garantili Emlak Yatırımı | Avantajlar ve Riskler',
  'Kuzey Kıbrıs''ta kira garantili gayrimenkul yatırımı nasıl çalışır? İskele Long Beach örneği, getiri hesaplama ve dikkat edilmesi gerekenler.',
  (SELECT id FROM blog_categories WHERE slug = 'yatirim-rehberi')
);

-- ============================================================
-- CATEGORY 2: Yaşam Rehberi (2 posts)
-- ============================================================

INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, author, published_at, is_published, seo_title, seo_description, category_id) VALUES
(
  'Kuzey Kıbrıs''ta Yaşam: Yeni Başlayanlar İçin Rehber',
  'kuzey-kibrista-yasam-rehberi',
  '<h2>Kuzey Kıbrıs''ta Yaşam Nasıl?</h2>
<p>Yılda 340 gün güneş, Akdeniz iklimi, düşük yaşam maliyeti ve güvenli ortam — Kuzey Kıbrıs, emeklilik, uzaktan çalışma veya yeni bir hayat için ideal bir destinasyon.</p>

<h3>Yaşam Maliyeti (2026)</h3>
<p>Kuzey Kıbrıs''ta aylık yaşam maliyeti, yaşam tarzına göre değişmekle birlikte ortalama rakamlar:</p>
<ul>
<li><strong>Kira:</strong> 2+1 daire Girne''de £450-700, Lefkoşa''da £350-550</li>
<li><strong>Market:</strong> Tek kişi için aylık £200-350</li>
<li><strong>Elektrik + Su:</strong> £50-120 (klimaya bağlı)</li>
<li><strong>İnternet:</strong> £15-30</li>
<li><strong>Ulaşım:</strong> Benzin litresi yaklaşık £0.80, araba kullanımı yaygın</li>
<li><strong>Yemek dışarıda:</strong> Kişi başı £8-20</li>
</ul>

<h3>Sağlık Hizmetleri</h3>
<p>Kuzey Kıbrıs''ta hem devlet hem özel hastaneler mevcuttur. Yakın Doğu Üniversitesi Hastanesi ve Dr. Burhan Nalbantoğlu Hastanesi en büyük sağlık kuruluşlarıdır. Özel sağlık sigortası yıllık £500-1.500 arasında değişir.</p>

<h3>Eğitim</h3>
<p>6 üniversite ve çok sayıda uluslararası okul bulunmaktadır. İngilizce eğitim veren özel okullar Girne ve Lefkoşa''da yoğunlaşmıştır.</p>

<h3>Ulaşım ve Erişim</h3>
<p>Ercan Havalimanı''ndan Türkiye üzerinden dünya geneline bağlantı sağlanır. İstanbul''a uçuş süresi 1,5 saat, Ankara''ya 1 saattir. Ada içinde araç kullanımı en yaygın ulaşım yöntemidir.</p>',
  'Kuzey Kıbrıs''ta yaşam maliyeti, sağlık, eğitim ve günlük yaşam hakkında kapsamlı rehber.',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '3 days',
  TRUE,
  'Kuzey Kıbrıs''ta Yaşam Rehberi 2026 | Maliyet, Sağlık, Eğitim',
  'Kuzey Kıbrıs''a taşınmayı düşünenler için yaşam maliyeti, sağlık hizmetleri, eğitim imkanları ve günlük yaşam rehberi.',
  (SELECT id FROM blog_categories WHERE slug = 'yasam-rehberi')
),
(
  'Girne''de Yaşamak: Mahalle Mahalle Rehber',
  'girnede-yasamak-mahalle-rehberi',
  '<h2>Neden Girne?</h2>
<p>Girne, Kuzey Kıbrıs''ın turizm başkenti ve en çok tercih edilen yaşam bölgesidir. Tarihi liman, dağ manzaraları ve sahil yaşamı bir arada.</p>

<h3>Alsancak</h3>
<p>Girne''nin en gelişmiş bölgesi. Yeni yapı projeleri, süpermarketler, restoranlar ve sahil yürüyüş yolları. Yabancı nüfus yoğun. 2+1 daire kiraları £500-750.</p>

<h3>Çatalköy</h3>
<p>Villa yaşamının merkezi. Deniz manzaralı müstakil villalar, geniş arsalar ve sakin yaşam. Ailelere uygun. Villa kiraları £800-1.500.</p>

<h3>Lapta</h3>
<p>Otantik Kıbrıs köy hayatı ile modern yaşamın buluştuğu yer. Sahile yürüme mesafesi, yerel restoranlar ve uygun fiyatlı daireler. 2+1 daire kiraları £400-600.</p>

<h3>Esentepe</h3>
<p>Doğa ile iç içe yaşam arayanlar için. Golf sahası, dağ manzarası ve yeni bungalow projeleri. Şehir merkezine 25 dakika. Daha uygun fiyatlar.</p>

<h3>Girne Merkez</h3>
<p>Tarihi liman etrafında yoğunlaşan sosyal hayat. Restoranlar, barlar ve kültürel etkinlikler. Yürünebilir mesafede her şey. Kira fiyatları biraz daha yüksek.</p>',
  'Girne''nin en popüler mahallelerini karşılaştırmalı olarak tanıtan rehber. Alsancak, Çatalköy, Lapta ve Esentepe.',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '7 days',
  TRUE,
  'Girne''de Yaşamak: Mahalle Rehberi | Alsancak, Çatalköy, Lapta',
  'Girne''nin en popüler mahallelerini keşfedin. Alsancak, Çatalköy, Lapta ve Esentepe bölgelerinde yaşam, kira fiyatları ve yaşam kalitesi karşılaştırması.',
  (SELECT id FROM blog_categories WHERE slug = 'yasam-rehberi')
);

-- ============================================================
-- CATEGORY 3: Hukuki Bilgiler (2 posts)
-- ============================================================

INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, author, published_at, is_published, seo_title, seo_description, category_id) VALUES
(
  'Kuzey Kıbrıs''ta Koçan Türleri: Eşdeğer, Türk ve Tahsis Koçan Farkları',
  'kuzey-kibrista-kocan-turleri-rehberi',
  '<h2>Koçan Nedir?</h2>
<p>Koçan, Kuzey Kıbrıs''ta gayrimenkulün tapu belgesidir. Mülk satın alırken koçan türünü bilmek, yatırımınızın güvenliğini doğrudan etkiler.</p>

<h3>Eşdeğer Koçan (En Güvenli)</h3>
<p>1974 sonrasında KKTC hükümeti tarafından verilen tapu belgesidir. Rum mülklerine karşılık olarak Türk mülk sahiplerine tahsis edilen ve daha sonra eşdeğer statüsüne kavuşturulan tapulardır.</p>
<ul>
<li><strong>Güvenlik:</strong> En güvenli koçan türü</li>
<li><strong>Banka kredisi:</strong> Bankalar tarafından kabul edilir</li>
<li><strong>Fiyat:</strong> Diğer koçan türlerine göre %10-20 daha yüksek</li>
<li><strong>Tavsiye:</strong> İlk yatırımcılar için en ideal seçenek</li>
</ul>

<h3>Türk Koçan</h3>
<p>1974 öncesinden Türk vatandaşlarına ait olan mülklerin tapusudur. Kıbrıs Türklerine ait olduğu için herhangi bir anlaşmazlık riski taşımaz.</p>
<ul>
<li><strong>Güvenlik:</strong> Çok güvenli</li>
<li><strong>Banka kredisi:</strong> Kabul edilir</li>
<li><strong>Fiyat:</strong> Eşdeğer koçanla benzer</li>
</ul>

<h3>Tahsis Koçan</h3>
<p>Devlet tarafından tahsis edilen ancak tam mülkiyet devri yapılmamış araziler için verilen belgedir. Genellikle tarla ve arsa alımlarında karşılaşılır.</p>
<ul>
<li><strong>Güvenlik:</strong> Orta düzey — eşdeğere çevrilme süreci devam edebilir</li>
<li><strong>Banka kredisi:</strong> Bazı bankalar kabul etmeyebilir</li>
<li><strong>Fiyat:</strong> %20-30 daha uygun</li>
<li><strong>Tavsiye:</strong> Uzman avukat desteğiyle alınmalıdır</li>
</ul>

<h3>Yabancılara Satış</h3>
<p>Yabancı uyruklu kişiler KKTC''de bir adet konut satın alabilir (Bakanlar Kurulu izniyle). Satın alma süreci genellikle 3-6 ay sürer.</p>',
  'Kuzey Kıbrıs''ta eşdeğer, Türk ve tahsis koçan türlerinin farkları, güvenlik seviyeleri ve yatırımcılara öneriler.',
  'https://images.unsplash.com/photo-1450101499163-c8848e968838?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '4 days',
  TRUE,
  'KKTC Koçan Türleri: Eşdeğer, Türk, Tahsis Farkları | Kıbrıs Tapu Rehberi',
  'Kuzey Kıbrıs''ta gayrimenkul alırken bilmeniz gereken koçan türleri. Eşdeğer koçan, Türk koçan ve tahsis koçan farkları, güvenlik seviyeleri ve dikkat edilmesi gerekenler.',
  (SELECT id FROM blog_categories WHERE slug = 'hukuki-bilgiler')
),
(
  'Yabancıların KKTC''de Mülk Satın Alma Süreci',
  'yabancilarin-kktcde-mulk-satin-alma-sureci',
  '<h2>Yabancılar KKTC''de Mülk Alabilir mi?</h2>
<p>Evet. Yabancı uyruklu kişiler Kuzey Kıbrıs''ta gayrimenkul satın alabilir. Ancak belirli kurallar ve süreçler mevcuttur.</p>

<h3>Adım Adım Satın Alma Süreci</h3>
<ol>
<li><strong>Mülk Seçimi:</strong> Güvenilir bir emlak danışmanıyla bölge ve bütçeye uygun mülk belirleyin.</li>
<li><strong>Koçan Kontrolü:</strong> Avukat aracılığıyla koçan türü, ipotek ve haciz kontrolü yapın.</li>
<li><strong>Satış Sözleşmesi:</strong> Taraflar arasında sözleşme imzalanır. Genellikle %10-30 kaparo ödenir.</li>
<li><strong>Tapu Dairesi Tescili:</strong> Sözleşme Tapu Dairesi''ne tescil edilir (Stamp Duty: %0,5).</li>
<li><strong>Bakanlar Kurulu İzni:</strong> Yabancılar için satın alma izni başvurusu yapılır (3-12 ay sürebilir).</li>
<li><strong>Tapu Devri:</strong> İzin çıktıktan sonra tapu devri gerçekleştirilir.</li>
</ol>

<h3>Masraflar</h3>
<ul>
<li>Tapu devir harcı: %3-6 (ilk alım: %3, ikinci: %6)</li>
<li>KDV: %5</li>
<li>Damga vergisi: %0,5</li>
<li>Avukat ücreti: £1.000-2.500</li>
<li>Emlak komisyonu: Genellikle satıcıdan alınır (%3-5)</li>
</ul>

<h3>Önemli Notlar</h3>
<p>Bir yabancı kişi en fazla 1 dönüm (1.338 m²) arazi veya 1 adet konut satın alabilir. Şirket kurarak bu sınır aşılabilir. Alım sürecinde mutlaka bağımsız bir avukatla çalışın.</p>',
  'Yabancı uyruklu kişilerin Kuzey Kıbrıs''ta mülk satın alma süreci, masraflar ve dikkat edilmesi gerekenler.',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '6 days',
  TRUE,
  'KKTC''de Yabancılara Mülk Satışı | Süreç, Masraflar, Belgeler',
  'Yabancıların Kuzey Kıbrıs''ta gayrimenkul satın alma süreci adım adım. Tapu devir masrafları, Bakanlar Kurulu izni ve avukat desteği hakkında bilgiler.',
  (SELECT id FROM blog_categories WHERE slug = 'hukuki-bilgiler')
);

-- ============================================================
-- CATEGORY 4: Piyasa Analizi (2 posts)
-- ============================================================

INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, author, published_at, is_published, seo_title, seo_description, category_id) VALUES
(
  'Kuzey Kıbrıs Emlak Piyasası 2026: Fiyat Trendleri ve Beklentiler',
  'kuzey-kibris-emlak-piyasasi-2026-trendler',
  '<h2>2026''da Piyasa Durumu</h2>
<p>Kuzey Kıbrıs emlak piyasası, 2025''teki istikrarlı büyümenin ardından 2026''da da pozitif bir seyir izliyor. Özellikle yabancı yatırımcı talebi ve yeni altyapı projeleri fiyatları yukarı yönlü destekliyor.</p>

<h3>Bölge Bazlı Fiyat Analizi</h3>

<h4>Girne</h4>
<p>Girne, en yüksek m² fiyatlarına sahip bölge olmaya devam ediyor. Alsancak ve Çatalköy''de lüks segment güçlü. Ortalama daire fiyatı £95.000-195.000, villa fiyatı £200.000-500.000 aralığında.</p>

<h4>İskele</h4>
<p>En hızlı değer artışı yaşanan bölge. Long Beach ve Bafra''da yeni projeler devam ediyor. Son 2 yılda ortalama %25-35 değer artışı kaydedildi. Daire fiyatları £80.000-150.000.</p>

<h4>Lefkoşa</h4>
<p>Başkent olması nedeniyle istikrarlı talep. Gönyeli ve Hamitköy''de üniversite öğrencileri ve çalışanlar için kiralık pazar güçlü. Daire fiyatları £65.000-120.000.</p>

<h4>Gazimağusa</h4>
<p>Üniversite şehri olarak kiralık pazar güçlü. Yeniboğaziçi sahil bölgesinde yeni projeler artıyor. Villa fiyatları £140.000-250.000.</p>

<h3>2026 Beklentileri</h3>
<ul>
<li>Girne ve İskele''de %10-15 fiyat artışı bekleniyor</li>
<li>Yeni havalimanı projesi bölge değerlerini etkileyecek</li>
<li>Sterlin bazlı fiyatlar kur avantajı sağlamaya devam edecek</li>
<li>Kira getirileri %6-10 bandında seyretmesi bekleniyor</li>
</ul>',
  'Kuzey Kıbrıs emlak piyasasının 2026 analizi. Bölge bazlı fiyat trendleri ve gelecek beklentileri.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '1 day',
  TRUE,
  'KKTC Emlak Piyasası 2026 | Fiyat Trendleri ve Bölge Analizi',
  'Kuzey Kıbrıs emlak piyasası 2026 analizi. Girne, İskele, Lefkoşa ve Gazimağusa fiyat trendleri, değer artışı verileri ve yatırım beklentileri.',
  (SELECT id FROM blog_categories WHERE slug = 'piyasa-analizi')
),
(
  'Kuzey Kıbrıs''ta En Çok Değer Kazanan 5 Bölge',
  'kuzey-kibrista-en-cok-deger-kazanan-bolgeler',
  '<h2>Hangi Bölgeler Öne Çıkıyor?</h2>
<p>Gayrimenkul yatırımında doğru lokasyon seçimi, getirinin en önemli belirleyicisidir. İşte son 3 yılda en çok değer kazanan Kuzey Kıbrıs bölgeleri:</p>

<h3>1. İskele — Long Beach</h3>
<p><strong>3 yıllık değer artışı: %45-55</strong></p>
<p>Denize sıfır konumu, büyük ölçekli tatil kompleksleri ve artan turist sayısı Long Beach''i en çok değer kazanan bölge yaptı. Henüz uygun fiyatlı projeler mevcut ancak boş arsa sayısı hızla azalıyor.</p>

<h3>2. Girne — Esentepe</h3>
<p><strong>3 yıllık değer artışı: %35-45</strong></p>
<p>Kocareis Golf Sahası çevresi ve yeni bungalow projeleri bu sakin bölgeyi yatırımcıların radarına taşıdı. Girne merkezine göre %30-40 daha uygun fiyatlar.</p>

<h3>3. İskele — Bafra</h3>
<p><strong>3 yıllık değer artışı: %30-40</strong></p>
<p>Turizm bölgesi olarak gelişen Bafra, büyük otel projeleri ve sahil arsalarıyla dikkat çekiyor. Arsa yatırımı için en potansiyelli bölgelerden biri.</p>

<h3>4. Girne — Alsancak</h3>
<p><strong>3 yıllık değer artışı: %25-35</strong></p>
<p>Girne''nin en gelişmiş bölgesi istikrarlı bir şekilde değer kazanmaya devam ediyor. Altyapı ve sosyal olanaklar en üst düzeyde.</p>

<h3>5. Gazimağusa — Yeniboğaziçi</h3>
<p><strong>3 yıllık değer artışı: %20-30</strong></p>
<p>Sahil şeridindeki yeni villa projeleri ve iyileşen altyapı ile Yeniboğaziçi, gelecek vaat eden bölgeler arasında yerini aldı.</p>',
  'Kuzey Kıbrıs''ta son 3 yılda en çok değer kazanan 5 bölge ve yatırım potansiyelleri.',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '8 days',
  TRUE,
  'KKTC''de En Çok Değer Kazanan Bölgeler | Emlak Yatırım Analizi',
  'Kuzey Kıbrıs''ta son 3 yılda en çok değer kazanan 5 bölge: İskele Long Beach, Girne Esentepe, Bafra, Alsancak ve Yeniboğaziçi analizi.',
  (SELECT id FROM blog_categories WHERE slug = 'piyasa-analizi')
);

-- ============================================================
-- CATEGORY 5: Bölge Tanıtımı (2 posts)
-- ============================================================

INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, author, published_at, is_published, seo_title, seo_description, category_id) VALUES
(
  'İskele Rehberi: Long Beach, Bafra ve Çevre Köyler',
  'iskele-rehberi-long-beach-bafra',
  '<h2>İskele Hakkında</h2>
<p>İskele, Kuzey Kıbrıs''ın doğu kıyısında yer alan ve son yıllarda en hızlı gelişen bölgesidir. Karpaz Yarımadası''nın girişinde konumlanan İskele, bozulmamış doğası, uzun sahilleri ve yatırım fırsatlarıyla öne çıkıyor.</p>

<h3>Long Beach</h3>
<p>Kuzey Kıbrıs''ın en uzun kumsalı (yaklaşık 10 km) Long Beach, tatil kompleksleri ve apart otellerin yoğunlaştığı bölgedir. Yaz aylarında canlı bir turizm hayatı, kış aylarında sakin bir yaşam sunar.</p>
<ul>
<li>Denize sıfır kompleksler</li>
<li>Restoranlar ve beach club''lar</li>
<li>Kira garantili yatırım fırsatları</li>
<li>Gazimağusa''ya 20 dk, Ercan Havalimanı''na 45 dk</li>
</ul>

<h3>Bafra</h3>
<p>İskele''nin güney kıyısında turizm bölgesi olarak planlanan Bafra, büyük otel yatırımları ve geniş arsa fırsatlarıyla dikkat çekiyor. Henüz gelişim aşamasında olması, erken yatırımcılara avantaj sağlıyor.</p>

<h3>Boğaz</h3>
<p>Balıkçı köyü karakterini koruyan Boğaz, deniz ürünleri restoranları ve küçük marinasıyla tanınır. Sakin yaşam arayanlar için ideal.</p>

<h3>Dipkarpaz ve Karpaz</h3>
<p>Kuzey Kıbrıs''ın en doğal bölgesi. Altın Kumsal (Golden Beach) ve Karpaz Milli Parkı burada. Ekoturizm ve doğa tatili için benzersiz bir lokasyon.</p>',
  'İskele bölgesinin kapsamlı tanıtımı. Long Beach, Bafra, Boğaz ve Karpaz hakkında yaşam ve yatırım bilgileri.',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '9 days',
  TRUE,
  'İskele Rehberi: Long Beach, Bafra, Karpaz | Kuzey Kıbrıs Bölge Tanıtımı',
  'Kuzey Kıbrıs İskele bölge rehberi. Long Beach sahili, Bafra turizm bölgesi, Boğaz ve Karpaz Yarımadası hakkında detaylı bilgiler.',
  (SELECT id FROM blog_categories WHERE slug = 'bolge-tanitimi')
),
(
  'Gazimağusa Şehir Rehberi: Tarihi Surlardan Sahil Projelerine',
  'gazimagusa-sehir-rehberi',
  '<h2>Gazimağusa''yı Keşfedin</h2>
<p>Gazimağusa, Kuzey Kıbrıs''ın en büyük ikinci şehri ve tarih kokan sokakları, üniversiteleri ve gelişen sahil bölgesiyle çok yönlü bir yaşam sunuyor.</p>

<h3>Tarihi Suriçi</h3>
<p>Venedikliler döneminden kalma surlarla çevrili eski şehir, UNESCO Dünya Mirası geçici listesinde. Lala Mustafa Paşa Camii (eski St. Nicholas Katedrali), Othello Kalesi ve Namık Kemal Zindanı başlıca tarihi yapılar.</p>

<h3>Yeniboğaziçi Sahili</h3>
<p>Gazimağusa''nın gelişen sahil bölgesi. Yeni villa projeleri, restoranlar ve sahil tesisleri. Şehir merkezine 10 dakika, ancak deniz kenarında yaşam imkanı. Gayrimenkul fiyatları henüz Girne''nin altında.</p>

<h3>Üniversite Yaşamı</h3>
<p>Doğu Akdeniz Üniversitesi (DAÜ) ile şehir, binlerce öğrenciye ev sahipliği yapıyor. Bu durum kiralık piyasayı canlı tutuyor ve küçük yatırımcılar için güvenli bir gelir kaynağı oluşturuyor.</p>

<h3>Ulaşım</h3>
<ul>
<li>Lefkoşa''ya: 55 dakika</li>
<li>Ercan Havalimanı''na: 40 dakika</li>
<li>İskele Long Beach''e: 20 dakika</li>
<li>Girne''ye: 1 saat 15 dakika</li>
</ul>',
  'Gazimağusa şehir rehberi — tarihi surlardan Yeniboğaziçi sahiline, üniversite yaşamından yatırım fırsatlarına.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '10 days',
  TRUE,
  'Gazimağusa Rehberi: Tarih, Üniversite ve Sahil | KKTC Şehir Tanıtımı',
  'Gazimağusa şehir rehberi. Tarihi Suriçi, Yeniboğaziçi sahil projeleri, Doğu Akdeniz Üniversitesi ve gayrimenkul yatırım fırsatları.',
  (SELECT id FROM blog_categories WHERE slug = 'bolge-tanitimi')
);

-- ============================================================
-- CATEGORY 6: Haberler (2 posts)
-- ============================================================

INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, author, published_at, is_published, seo_title, seo_description, category_id) VALUES
(
  'KKTC''de Yeni Havalimanı Projesi: Gayrimenkul Piyasasına Etkileri',
  'kktc-yeni-havalimani-projesi-etkileri',
  '<h2>Yeni Havalimanı Projesi</h2>
<p>Kuzey Kıbrıs''ta planlanan yeni uluslararası havalimanı projesi, bölgenin gayrimenkul piyasasını doğrudan etkileyecek en önemli altyapı yatırımlarından biri olarak değerlendiriliyor.</p>

<h3>Proje Detayları</h3>
<p>Mevcut Ercan Havalimanı''nın kapasitesinin artırılması ve modern bir terminal binası inşası planlanıyor. Proje tamamlandığında yıllık yolcu kapasitesinin 10 milyonun üzerine çıkması hedefleniyor.</p>

<h3>Gayrimenkul Piyasasına Beklenen Etkiler</h3>
<ul>
<li><strong>Turizm artışı:</strong> Direkt uçuş bağlantılarının artması, turist sayısını ve dolayısıyla kısa dönem kiralık talebini yükseltecek</li>
<li><strong>Bölge değerleri:</strong> Havalimanına yakın bölgelerde (İskele, Gazimağusa) %15-25 değer artışı bekleniyor</li>
<li><strong>Yabancı yatırımcı:</strong> Ulaşım kolaylığı, yabancı alıcı talebini artıracak</li>
<li><strong>Kira getirileri:</strong> Özellikle tatil bölgelerinde günlük kira gelirleri yükselecek</li>
</ul>

<h3>Yatırımcılar İçin Öneriler</h3>
<p>Havalimanı projesinin etkilerini değerlendiren yatırımcılar, özellikle İskele ve Gazimağusa bölgelerindeki projelere erken dönemde yatırım yapmayı düşünebilir. Ulaşım altyapısı iyileştikçe bu bölgelerdeki değer artışı hızlanacaktır.</p>',
  'KKTC yeni havalimanı projesinin gayrimenkul piyasasına etkileri ve yatırımcılar için fırsatlar.',
  'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '1 day',
  TRUE,
  'KKTC Yeni Havalimanı Projesi ve Emlak Piyasasına Etkileri',
  'Kuzey Kıbrıs yeni havalimanı projesinin gayrimenkul değerlerine, kira getirilerine ve bölge gelişimine etkileri hakkında detaylı analiz.',
  (SELECT id FROM blog_categories WHERE slug = 'haberler')
),
(
  '2026 KKTC Emlak Fuarı: Öne Çıkan Projeler ve Fırsatlar',
  '2026-kktc-emlak-fuari-projeler',
  '<h2>KKTC Emlak Fuarı 2026</h2>
<p>Kuzey Kıbrıs''ın en büyük gayrimenkul fuarı bu yıl da yoğun katılımla gerçekleşti. Yerli ve yabancı inşaat firmaları yeni projelerini tanıtırken, özel fuar indirimleri yatırımcıların dikkatini çekti.</p>

<h3>Öne Çıkan Projeler</h3>

<h4>Girne Bölgesi</h4>
<p>Alsancak''ta denize 200 metre mesafede lüks residence projesi dikkat çekti. 1+1''den 3+1''e kadar seçenekler, ortak havuz, SPA ve fitness merkezi. Fiyatlar £85.000''den başlıyor.</p>

<h4>İskele Bölgesi</h4>
<p>Long Beach''te 5 yıldızlı otel konseptinde yeni bir tatil kompleksi tanıtıldı. Kira garantili daireler ve apart otel seçenekleri. Teslim tarihi 2027.</p>

<h4>Gazimağusa Bölgesi</h4>
<p>Yeniboğaziçi''nde denize sıfır villa projesi fuarın en çok ilgi gören projelerinden biri oldu. 3+1 ve 4+1 seçenekler, özel havuz ve bahçe.</p>

<h3>Fuar Trendleri</h3>
<ul>
<li>Sürdürülebilir ve enerji verimli projeler ön plana çıktı</li>
<li>Akıllı ev teknolojileri standart hale geliyor</li>
<li>Kira garantili modellere ilgi artıyor</li>
<li>Yabancı yatırımcı oranı geçen yıla göre %20 arttı</li>
</ul>',
  '2026 KKTC Emlak Fuarı''nda öne çıkan projeler, trendler ve yatırım fırsatları.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'Nexos Emlak',
  NOW() - INTERVAL '12 days',
  TRUE,
  '2026 KKTC Emlak Fuarı | Projeler, Fırsatlar ve Trendler',
  '2026 Kuzey Kıbrıs Emlak Fuarı''nda öne çıkan projeler. Girne, İskele ve Gazimağusa''dan yeni inşaat projeleri ve yatırım fırsatları.',
  (SELECT id FROM blog_categories WHERE slug = 'haberler')
);

-- ============================================================
-- Add tags
-- ============================================================

INSERT INTO blog_tags (name, slug) VALUES
  ('Girne', 'girne'),
  ('İskele', 'iskele'),
  ('Lefkoşa', 'lefkosa'),
  ('Gazimağusa', 'gazimagusa'),
  ('Güzelyurt', 'guzelyurt'),
  ('Long Beach', 'long-beach'),
  ('Yatırım', 'yatirim'),
  ('Koçan', 'kocan'),
  ('Kira Getirisi', 'kira-getirisi'),
  ('Villa', 'villa'),
  ('Daire', 'daire'),
  ('Arsa', 'arsa'),
  ('Yaşam', 'yasam'),
  ('Tapu', 'tapu'),
  ('Piyasa', 'piyasa')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
