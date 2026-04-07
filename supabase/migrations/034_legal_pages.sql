-- Legal pages: Privacy Policy, Terms of Use, KVKK
-- Updates existing pages or creates new ones with full content

-- 1. Gizlilik Politikası
INSERT INTO pages (slug, title, content, seo_title, seo_description, is_published) VALUES (
  'gizlilik-politikasi',
  'Gizlilik Politikası',
  '<h2>Gizlilik Politikası</h2>
<p><strong>Son Güncelleme:</strong> 08.04.2026</p>
<p>Nexos Investment ("Şirket", "biz") olarak, kişisel verilerinizin gizliliğini korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, web sitemiz <strong>nexosinvestment.com</strong> üzerinden topladığımız kişisel verilerin nasıl işlendiğini, korunduğunu ve haklarınızı açıklamaktadır.</p>

<h3>1. Toplanan Kişisel Veriler</h3>
<p>Web sitemizi kullanımınız sırasında aşağıdaki kişisel veriler toplanabilir:</p>
<ul>
<li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
<li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi</li>
<li><strong>Dijital Veriler:</strong> IP adresi, tarayıcı bilgileri, çerez verileri, ziyaret edilen sayfalar</li>
<li><strong>Talep Bilgileri:</strong> İlan sorguları, iletişim formu mesajları, emlak talepleri</li>
<li><strong>Hesap Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenmiş), favori ilanlar</li>
</ul>

<h3>2. Verilerin Toplanma Yöntemleri</h3>
<ul>
<li>İletişim ve talep formları</li>
<li>Üyelik kayıt işlemleri</li>
<li>Çerezler ve analitik araçlar (Vercel Analytics)</li>
<li>WhatsApp ve telefon iletişimi</li>
</ul>

<h3>3. Verilerin İşlenme Amaçları</h3>
<p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
<ul>
<li>Emlak danışmanlık hizmetlerinin sunulması</li>
<li>İlan ve proje bilgilendirmelerinin yapılması</li>
<li>Talep ve başvuruların değerlendirilmesi</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Web sitesi performansının iyileştirilmesi</li>
<li>Güvenlik ve dolandırıcılık önleme</li>
</ul>

<h3>4. Verilerin Paylaşımı</h3>
<p>Kişisel verileriniz aşağıdaki durumlar dışında üçüncü kişilerle paylaşılmaz:</p>
<ul>
<li>Yasal zorunluluklar (mahkeme kararları, resmi kurum talepleri)</li>
<li>Hizmet sağlayıcılarımız (barındırma: Vercel, veritabanı: Supabase) — yalnızca hizmet sunumu amacıyla</li>
<li>Açık rızanızın bulunması halinde</li>
</ul>

<h3>5. Veri Güvenliği</h3>
<p>Kişisel verilerinizin güvenliği için aşağıdaki önlemler alınmaktadır:</p>
<ul>
<li>SSL/TLS şifreleme ile güvenli veri iletimi</li>
<li>Şifrelerin hash algoritmaları ile korunması</li>
<li>Erişim kontrolü ve yetkilendirme mekanizmaları</li>
<li>Düzenli güvenlik güncellemeleri</li>
</ul>

<h3>6. Çerezler</h3>
<p>Web sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır:</p>
<ul>
<li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi, güvenlik</li>
<li><strong>Analitik Çerezler:</strong> Ziyaretçi istatistikleri (Vercel Analytics)</li>
<li><strong>Tercih Çerezleri:</strong> Dil, tema, para birimi tercihleri</li>
</ul>
<p>Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı site özellikleri düzgün çalışmayabilir.</p>

<h3>7. Haklarınız</h3>
<p>Kişisel verileriniz ile ilgili aşağıdaki haklara sahipsiniz:</p>
<ul>
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
<li>İşlenen verilere ilişkin bilgi talep etme</li>
<li>Verilerin düzeltilmesini veya silinmesini isteme</li>
<li>İşlemenin kısıtlanmasını talep etme</li>
<li>Veri taşınabilirliği hakkı</li>
<li>İşlemeye itiraz etme hakkı</li>
</ul>
<p>Bu haklarınızı kullanmak için <a href="mailto:info@nexosinvestment.com">info@nexosinvestment.com</a> adresine başvurabilirsiniz.</p>

<h3>8. Veri Saklama Süresi</h3>
<p>Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal zorunluluklar çerçevesinde saklanır. Süre sona erdiğinde veriler güvenli bir şekilde silinir veya anonim hale getirilir.</p>

<h3>9. Değişiklikler</h3>
<p>Bu Gizlilik Politikası gerekli görüldüğünde güncellenebilir. Güncel versiyon her zaman bu sayfada yayınlanır.</p>

<h3>10. İletişim</h3>
<p><strong>Nexos Investment</strong><br>
E-posta: <a href="mailto:info@nexosinvestment.com">info@nexosinvestment.com</a><br>
Telefon: +90 548 860 40 30<br>
Web: nexosinvestment.com</p>',
  'Gizlilik Politikası — Nexos Investment',
  'Nexos Investment gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında bilgi.',
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  is_published = TRUE;

-- 2. Kullanım Şartları
INSERT INTO pages (slug, title, content, seo_title, seo_description, is_published) VALUES (
  'kullanim-sartlari',
  'Kullanım Şartları',
  '<h2>Kullanım Şartları</h2>
<p><strong>Son Güncelleme:</strong> 08.04.2026</p>
<p>Bu kullanım şartları, <strong>nexosinvestment.com</strong> web sitesinin ("Site") kullanımına ilişkin koşulları düzenler. Siteyi kullanarak bu şartları kabul etmiş sayılırsınız.</p>

<h3>1. Hizmet Tanımı</h3>
<p>Nexos Investment, Kuzey Kıbrıs''ta gayrimenkul danışmanlık hizmeti sunan bir emlak firmasıdır. Site üzerinden emlak ilanları, proje bilgileri, danışmanlık hizmetleri ve iletişim imkânı sunulmaktadır.</p>

<h3>2. Kullanım Koşulları</h3>
<p>Site kullanıcıları aşağıdaki kurallara uymayı kabul eder:</p>
<ul>
<li>Siteyi yalnızca yasal amaçlarla kullanmak</li>
<li>Sahte, yanıltıcı veya zararlı içerik paylaşmamak</li>
<li>Başkalarının kişisel bilgilerini izinsiz kullanmamak</li>
<li>Sitenin teknik altyapısına zarar verecek eylemlerden kaçınmak</li>
<li>Otomatik veri toplama araçları (bot, scraper) kullanmamak</li>
</ul>

<h3>3. Hesap Güvenliği</h3>
<p>Üyelik oluşturduysanız, hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi güçlü tutmanız ve üçüncü kişilerle paylaşmamanız önerilir. Yetkisiz erişim şüphesi durumunda derhal bize bildirmeniz gerekmektedir.</p>

<h3>4. İlan ve İçerik Bilgileri</h3>
<ul>
<li>Sitedeki ilan bilgileri genel bilgilendirme amaçlıdır ve bağlayıcı teklif niteliğinde değildir.</li>
<li>Fiyatlar, özellikler ve mevcudiyet bilgileri önceden haber verilmeksizin değişebilir.</li>
<li>Görseller temsili olabilir; gerçek durumla farklılık gösterebilir.</li>
<li>Kesin bilgi için danışmanlarımızla iletişime geçmeniz önerilir.</li>
</ul>

<h3>5. Fikri Mülkiyet</h3>
<p>Sitedeki tüm içerikler (metinler, görseller, logolar, tasarım, yazılım) Nexos Investment''a aittir ve telif hakları ile korunmaktadır. İçeriklerin izinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır.</p>

<h3>6. Üçüncü Taraf Bağlantıları</h3>
<p>Sitemiz, üçüncü taraf web sitelerine bağlantılar içerebilir. Bu sitelerin içerik ve gizlilik uygulamalarından Nexos Investment sorumlu değildir.</p>

<h3>7. Sorumluluk Sınırı</h3>
<ul>
<li>Site "olduğu gibi" sunulmaktadır; kesintisiz veya hatasız çalışma garantisi verilmez.</li>
<li>Sitedeki bilgilere dayanarak alınan kararlardan doğabilecek zararlardan Nexos Investment sorumlu tutulamaz.</li>
<li>Gayrimenkul işlemlerinde profesyonel danışmanlık almanız tavsiye edilir.</li>
</ul>

<h3>8. Değişiklikler</h3>
<p>Nexos Investment, bu kullanım şartlarını önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar. Güncel versiyon her zaman bu sayfada yayınlanır. Değişikliklerden sonra siteyi kullanmaya devam etmeniz, güncel şartları kabul ettiğiniz anlamına gelir.</p>

<h3>9. Uygulanacak Hukuk</h3>
<p>Bu kullanım şartları, Kuzey Kıbrıs Türk Cumhuriyeti yasalarına tabidir. Uyuşmazlıklarda KKTC mahkemeleri yetkilidir.</p>

<h3>10. İletişim</h3>
<p><strong>Nexos Investment</strong><br>
E-posta: <a href="mailto:info@nexosinvestment.com">info@nexosinvestment.com</a><br>
Telefon: +90 548 860 40 30<br>
Web: nexosinvestment.com</p>',
  'Kullanım Şartları — Nexos Investment',
  'Nexos Investment web sitesi kullanım şartları ve koşulları.',
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  is_published = TRUE;

-- 3. KVKK Aydınlatma Metni
INSERT INTO pages (slug, title, content, seo_title, seo_description, is_published) VALUES (
  'kvkk',
  'KVKK Aydınlatma Metni',
  '<h2>Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</h2>
<p><strong>Son Güncelleme:</strong> 08.04.2026</p>
<p>Nexos Investment ("Veri Sorumlusu") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin işlenmesine ilişkin sizi bilgilendirmek isteriz.</p>

<h3>1. Veri Sorumlusu</h3>
<p><strong>Unvan:</strong> Nexos Investment<br>
<strong>Adres:</strong> Kuzey Kıbrıs<br>
<strong>E-posta:</strong> <a href="mailto:info@nexosinvestment.com">info@nexosinvestment.com</a><br>
<strong>Telefon:</strong> +90 548 860 40 30</p>

<h3>2. İşlenen Kişisel Veriler</h3>
<table>
<thead>
<tr><th>Veri Kategorisi</th><th>Veriler</th></tr>
</thead>
<tbody>
<tr><td>Kimlik</td><td>Ad, soyad</td></tr>
<tr><td>İletişim</td><td>Telefon, e-posta adresi</td></tr>
<tr><td>Müşteri İşlem</td><td>Emlak talepleri, ilan sorguları, favori listesi</td></tr>
<tr><td>Pazarlama</td><td>Çerez verileri, tercihler, iletişim izinleri</td></tr>
<tr><td>İşlem Güvenliği</td><td>IP adresi, log kayıtları, oturum bilgileri</td></tr>
</tbody>
</table>

<h3>3. Kişisel Verilerin İşlenme Amaçları</h3>
<ul>
<li>Gayrimenkul danışmanlık hizmetlerinin yürütülmesi</li>
<li>İlan ve proje bilgilendirmelerinin yapılması</li>
<li>Müşteri talep ve başvurularının işlenmesi</li>
<li>Sözleşme süreçlerinin yürütülmesi</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>İletişim faaliyetlerinin yürütülmesi</li>
<li>Bilgi güvenliği süreçlerinin yönetilmesi</li>
<li>Web sitesi kullanım analizlerinin yapılması</li>
</ul>

<h3>4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h3>
<p>Kişisel verileriniz KVKK''nın 5. maddesi kapsamında aşağıdaki hukuki sebeplerle işlenmektedir:</p>
<ul>
<li>Açık rızanızın bulunması</li>
<li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgi olması</li>
<li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi</li>
<li>Veri sorumlusunun meşru menfaati</li>
</ul>

<h3>5. Kişisel Verilerin Aktarılması</h3>
<p>Kişisel verileriniz aşağıdaki alıcı gruplarına aktarılabilir:</p>
<ul>
<li><strong>İş Ortakları:</strong> Gayrimenkul geliştirici firmalar (proje bilgilendirmesi kapsamında)</li>
<li><strong>Hizmet Sağlayıcılar:</strong> Barındırma (Vercel Inc., ABD), veritabanı (Supabase Inc., ABD) — veri işleme sözleşmeleri kapsamında</li>
<li><strong>Yetkili Kurumlar:</strong> Mevzuat gereği yetkili kamu kurum ve kuruluşları</li>
</ul>

<h3>6. Kişisel Veri Toplanma Yöntemleri</h3>
<ul>
<li>Web sitesi iletişim ve talep formları</li>
<li>Üyelik kayıt süreçleri</li>
<li>Çerezler ve otomatik izleme teknolojileri</li>
<li>Telefon ve WhatsApp iletişimi</li>
<li>E-posta yazışmaları</li>
</ul>

<h3>7. Veri Sahibi Olarak Haklarınız (KVKK Madde 11)</h3>
<p>KVKK''nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
<ol>
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
<li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
<li>Kişisel verilerinizin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
<li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
<li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
<li>KVKK''nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
<li>Düzeltme ve silme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
<li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
<li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
</ol>

<h3>8. Başvuru Yöntemi</h3>
<p>Haklarınızı kullanmak için aşağıdaki yöntemlerle bize başvurabilirsiniz:</p>
<ul>
<li><strong>E-posta:</strong> <a href="mailto:info@nexosinvestment.com">info@nexosinvestment.com</a> (konu satırına "KVKK Başvurusu" yazınız)</li>
<li><strong>Posta:</strong> Yazılı ve ıslak imzalı dilekçe ile şirket adresimize</li>
</ul>
<p>Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç <strong>30 (otuz) gün</strong> içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.</p>

<h3>9. Değişiklikler</h3>
<p>Bu aydınlatma metni, yasal düzenlemeler veya veri işleme süreçlerimizdeki değişiklikler doğrultusunda güncellenebilir. Güncel versiyon her zaman bu sayfada yayınlanır.</p>',
  'KVKK Aydınlatma Metni — Nexos Investment',
  'Nexos Investment KVKK aydınlatma metni. Kişisel verilerin korunması kanunu kapsamında haklarınız.',
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  is_published = TRUE;

-- Clean up old slugs if they exist
DELETE FROM pages WHERE slug = 'gizlilik' AND slug != 'gizlilik-politikasi';
