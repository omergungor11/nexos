import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)="?([^"]*)"?$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const POSTS = [
  {
    title: "Kuzey Kıbrıs'ta Gayrimenkul Yatırımı: 2026 Rehberi",
    slug: "kuzey-kibrista-gayrimenkul-yatirimi-2026-rehberi",
    author: "Nexos Emlak",
    excerpt: "Kuzey Kıbrıs'ta gayrimenkul yatırımı yapmayı düşünenler için kapsamlı bir rehber. Bölgeler, fiyat trendleri ve dikkat edilmesi gerekenler.",
    cover_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    content: `
<p>Kuzey Kıbrıs, son yıllarda gayrimenkul yatırımcılarının radarına giren en cazip bölgelerden biri haline geldi. Akdeniz iklimi, uygun fiyatlar ve gelişen altyapı ile hem yaşam hem de yatırım için ideal bir destinasyon sunuyor.</p>

<h2>Neden Kuzey Kıbrıs?</h2>
<p>Kuzey Kıbrıs, Avrupa'ya yakınlığı, İngilizce'nin yaygın kullanımı ve güvenli yaşam ortamı ile öne çıkıyor. Yıllık ortalama 340 güneşli gün, Akdeniz mutfağı ve zengin kültürel miras da cabası.</p>

<h2>En Popüler Yatırım Bölgeleri</h2>
<h3>İskele</h3>
<p>Long Beach sahili ile ünlü İskele, özellikle yabancı yatırımcılar arasında en çok tercih edilen bölge. Yeni konut projeleri ve modern yaşam alanları ile dikkat çekiyor. Sahile sıfır projeler yüksek kira getirisi sunuyor.</p>

<h3>Girne</h3>
<p>Tarihi limanı ve dağ manzaraları ile Girne, lüks segment gayrimenkul arayanlar için ideal. Restoran, kafe ve gece hayatı açısından en hareketli bölge.</p>

<h3>Lefkoşa</h3>
<p>Başkent Lefkoşa, iş dünyasına yakın olmak isteyenler ve öğrenci kiralama pazarından faydalanmak isteyen yatırımcılar için cazip fırsatlar sunuyor.</p>

<h2>Fiyat Trendleri</h2>
<p>2026 itibarıyla Kuzey Kıbrıs'ta gayrimenkul fiyatları son 3 yılda ortalama %40 değer kazandı. İskele bölgesinde 1+1 daireler 80.000 GBP'den başlarken, Girne'de lüks villalar 500.000 GBP'ye kadar çıkabiliyor.</p>

<h2>Yabancılar İçin Satın Alma Süreci</h2>
<ol>
<li><strong>Mülk seçimi</strong> — Güvenilir bir emlak danışmanı ile ihtiyaçlarınıza uygun mülkü belirleyin.</li>
<li><strong>Bakanlar Kurulu izni</strong> — Yabancı uyrukluların mülk alımı için Bakanlar Kurulu onayı gereklidir (3-6 ay).</li>
<li><strong>Sözleşme</strong> — Avukat eşliğinde satış sözleşmesi imzalanır ve Tapu Dairesi'ne tescil edilir.</li>
<li><strong>Tapu devri</strong> — İzin onaylandıktan sonra tapu alıcı adına devredilir.</li>
</ol>

<h2>Dikkat Edilmesi Gerekenler</h2>
<ul>
<li>Mutlaka bağımsız bir avukat ile çalışın</li>
<li>Tapunun türünü kontrol edin (Türk koçanı, eşdeğer koçan, tahsis)</li>
<li>Altyapı ve imar durumunu araştırın</li>
<li>Bölgenin gelecek projelerini inceleyin</li>
</ul>

<p>Nexos Investment olarak, Kuzey Kıbrıs'ta güvenilir gayrimenkul danışmanlığı hizmeti sunuyoruz. Yatırım sürecinizin her adımında yanınızdayız.</p>
`,
  },
  {
    title: "İskele Long Beach: Kuzey Kıbrıs'ın Yükselen Yıldızı",
    slug: "iskele-long-beach-kuzey-kibrisin-yukselen-yildizi",
    author: "Nexos Emlak",
    excerpt: "12 km'lik altın kumsalı, modern konut projeleri ve yüksek kira getirisi ile İskele Long Beach'in neden yatırımcıların gözdesi olduğunu keşfedin.",
    cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    content: `
<p>İskele'nin Long Beach bölgesi, 12 kilometrelik bozulmamış kumsalı ile Kuzey Kıbrıs'ın en uzun plajına ev sahipliği yapıyor. Son 5 yılda hızlı bir dönüşüm geçiren bölge, modern konut projeleri ve gelişen altyapısı ile yatırımcıların ilk tercihi haline geldi.</p>

<h2>Bölgenin Avantajları</h2>
<ul>
<li><strong>Eşsiz sahil</strong> — 12 km kesintisiz altın kumsal</li>
<li><strong>Yeni projeler</strong> — 5 yıldızlı otel konseptinde rezidanslar</li>
<li><strong>Kira getirisi</strong> — Yaz aylarında günlük 80-150 GBP kira potansiyeli</li>
<li><strong>Değer artışı</strong> — Son 3 yılda %50'ye varan değer artışı</li>
<li><strong>Altyapı</strong> — Yeni yollar, marina projesi ve alışveriş merkezleri</li>
</ul>

<h2>Konut Tipleri ve Fiyatlar</h2>
<p>Long Beach'te stüdyo dairelerden penthouse'lara kadar geniş bir yelpaze mevcut:</p>
<ul>
<li><strong>Stüdyo (1+0):</strong> 55.000 - 75.000 GBP</li>
<li><strong>1+1 Daire:</strong> 80.000 - 120.000 GBP</li>
<li><strong>2+1 Daire:</strong> 120.000 - 180.000 GBP</li>
<li><strong>Penthouse:</strong> 200.000 - 350.000 GBP</li>
</ul>

<h2>Kira Getirisi Analizi</h2>
<p>Long Beach'te ortalama yıllık kira getirisi %6-8 arasında değişiyor. Kısa dönem (Airbnb) kiralamada bu oran %10-12'ye kadar çıkabiliyor. Özellikle yaz sezonunda (Haziran-Eylül) doluluk oranları %90'ın üzerinde seyrediyor.</p>

<h2>Gelecek Projeler</h2>
<p>Bölgede planlanan marina projesi, 18 delikli golf sahası ve uluslararası hastane yatırımı, Long Beach'in değerini önümüzdeki 5 yılda daha da artıracak. Erken yatırım yapanlar bu değer artışından en çok faydalanacak.</p>

<p>İskele Long Beach'te yatırım fırsatlarını değerlendirmek için Nexos Investment ile iletişime geçin.</p>
`,
  },
  {
    title: "Kuzey Kıbrıs'ta Tapu Türleri: Hangisi Daha Güvenli?",
    slug: "kuzey-kibrista-tapu-turleri-hangisi-daha-guvenli",
    author: "Nexos Emlak",
    excerpt: "Türk koçanı, eşdeğer koçan ve tahsis tapusu arasındaki farkları öğrenin. Güvenli yatırım için doğru tapu türünü seçmek kritik önem taşıyor.",
    cover_image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    content: `
<p>Kuzey Kıbrıs'ta gayrimenkul satın alırken en önemli konulardan biri tapu türüdür. Farklı tapu türleri farklı güvenlik seviyeleri sunar ve yatırım kararınızı doğrudan etkiler.</p>

<h2>Tapu Türleri</h2>

<h3>1. Türk Koçanı (En Güvenli)</h3>
<p>1974 öncesi Kıbrıslı Türklere ait olan araziler üzerine düzenlenen tapudur. Uluslararası alanda en çok tanınan ve en güvenli tapu türüdür.</p>
<ul>
<li>Hukuki ihtilaf riski minimumdur</li>
<li>Bankalardan kredi kullanılabilir</li>
<li>Değeri diğer tapu türlerine göre daha yüksektir</li>
</ul>

<h3>2. Eşdeğer Koçan</h3>
<p>1974 sonrası, Güney Kıbrıs'taki mülklerinin karşılığı olarak Kıbrıslı Türklere verilen tapulardır. Hukuki açıdan güvenli kabul edilir.</p>
<ul>
<li>KKTC mahkemelerinde tanınır</li>
<li>Piyasada Türk koçanına yakın değerdedir</li>
<li>Çoğu banka tarafından kabul edilir</li>
</ul>

<h3>3. Tahsis Tapusu</h3>
<p>Devlet tarafından tahsis edilen araziler üzerine düzenlenir. Diğer tapu türlerine göre daha düşük fiyatlıdır ancak bazı kısıtlamalar içerir.</p>
<ul>
<li>Fiyatı daha uygun olabilir</li>
<li>Satış ve devir süreçleri daha uzun</li>
<li>Bazı bankalar kredi vermeyebilir</li>
</ul>

<h2>Yatırımcılar İçin Öneriler</h2>
<ol>
<li>Mümkünse <strong>Türk koçanı veya eşdeğer koçan</strong> tercih edin</li>
<li>Mutlaka <strong>bağımsız bir avukat</strong> ile tapuyu inceletin</li>
<li>Tapu Dairesi'nden güncel kayıtları doğrulayın</li>
<li>Üzerinde ipotek, haciz veya şerh olmadığından emin olun</li>
<li>Arazi kullanım izni ve imar durumunu kontrol edin</li>
</ol>

<p>Nexos Investment olarak, her mülk için detaylı tapu araştırması yapıyor ve müşterilerimizi olası risklerden koruyoruz. Güvenli yatırım için bize danışın.</p>
`,
  },
  {
    title: "Kıbrıs'ta Kiralık Gayrimenkul ile Pasif Gelir Elde Etmek",
    slug: "kibrista-kiralik-gayrimenkul-ile-pasif-gelir",
    author: "Nexos Emlak",
    excerpt: "Kuzey Kıbrıs'ta gayrimenkulünüzü kiraya vererek nasıl düzenli gelir elde edebilirsiniz? Kısa ve uzun dönem kiralama stratejileri.",
    cover_image: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=800&q=80",
    content: `
<p>Kuzey Kıbrıs'ta gayrimenkul yatırımının en büyük avantajlarından biri, düzenli kira geliri elde etme imkanıdır. Turizm sektörünün büyümesi ve üniversite öğrencilerinin artışı, kiralama pazarını oldukça canlı tutuyor.</p>

<h2>Kiralama Stratejileri</h2>

<h3>Kısa Dönem Kiralama (Airbnb / Booking)</h3>
<p>Özellikle sahil bölgelerinde yaz aylarında yüksek talep gören kısa dönem kiralama, en yüksek getiriyi sunar:</p>
<ul>
<li><strong>Sezon:</strong> Haziran - Eylül (pik), Nisan-Mayıs ve Ekim (orta sezon)</li>
<li><strong>Günlük fiyat:</strong> 1+1 daire için 40-80 GBP</li>
<li><strong>Doluluk oranı:</strong> Yaz %85-95, kış %30-50</li>
<li><strong>Yıllık brüt getiri:</strong> %8-12</li>
</ul>

<h3>Uzun Dönem Kiralama</h3>
<p>Daha istikrarlı ve garantili bir gelir akışı sunar:</p>
<ul>
<li><strong>Aylık kira (1+1):</strong> 400-600 GBP</li>
<li><strong>Aylık kira (2+1):</strong> 600-900 GBP</li>
<li><strong>Hedef kitle:</strong> Üniversite öğrencileri, çalışanlar, emekli aileler</li>
<li><strong>Yıllık brüt getiri:</strong> %5-7</li>
</ul>

<h3>Öğrenci Kiralaması</h3>
<p>KKTC'deki üniversitelerde 100.000'den fazla öğrenci eğitim görmektedir. Öğrenci kiralaması:</p>
<ul>
<li>10 ay garantili gelir</li>
<li>Genellikle peşin ödeme</li>
<li>Yüksek doluluk oranı</li>
</ul>

<h2>Kiralama Yönetimi İpuçları</h2>
<ol>
<li>Profesyonel fotoğraf çektirin</li>
<li>Temel mobilya ve beyaz eşya yatırımı yapın</li>
<li>Güvenilir bir yönetim şirketi ile çalışın</li>
<li>Kira sözleşmenizi avukat kontrolünde hazırlayın</li>
<li>Periyodik bakım ve temizlik programı oluşturun</li>
</ol>

<p>Nexos Investment, mülk yönetimi hizmeti ile kira sürecinizi kolaylaştırıyor. Detaylı bilgi için bizimle iletişime geçin.</p>
`,
  },
  {
    title: "Yabancıların Kuzey Kıbrıs'ta Mülk Edinme Rehberi",
    slug: "yabancilarin-kuzey-kibrista-mulk-edinme-rehberi",
    author: "Nexos Emlak",
    excerpt: "Türk vatandaşları ve yabancı uyruklular için Kuzey Kıbrıs'ta mülk satın alma süreci, gerekli belgeler ve yasal prosedürler hakkında bilmeniz gerekenler.",
    cover_image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80",
    content: `
<p>Kuzey Kıbrıs, yabancı yatırımcılara mülk edinme imkanı sunan cazip bir destinasyondur. Ancak sürecin doğru yönetilmesi büyük önem taşır. İşte adım adım rehberiniz.</p>

<h2>Kimler Mülk Edinebilir?</h2>
<p>KKTC vatandaşları sınırsız mülk edinebilir. Yabancı uyruklular ise belirli şartlar dahilinde mülk satın alabilir:</p>
<ul>
<li>Bir yabancı, en fazla <strong>1 dönüm (1.338 m²)</strong> arazi veya <strong>1 daire/ev</strong> satın alabilir</li>
<li>Şirket kurarak bu limiti aşmak mümkündür</li>
<li>Bakanlar Kurulu izni gereklidir</li>
</ul>

<h2>Satın Alma Adımları</h2>
<ol>
<li><strong>Mülk araştırması:</strong> İhtiyaçlarınıza uygun mülkü belirleyin</li>
<li><strong>Avukat seçimi:</strong> Bağımsız bir avukat tutun</li>
<li><strong>Tapu kontrolü:</strong> Avukatınız tapu ve imar durumunu inceler</li>
<li><strong>Sözleşme:</strong> Satış sözleşmesi hazırlanır, genellikle %10-30 kaparo ödenir</li>
<li><strong>Tapu Dairesi tescili:</strong> Sözleşme Tapu Dairesi'ne kaydedilir</li>
<li><strong>Bakanlar Kurulu başvurusu:</strong> İzin süreci başlatılır (3-6 ay)</li>
<li><strong>Tapu devri:</strong> İzin onaylandığında tapu adınıza çıkarılır</li>
</ol>

<h2>Gerekli Belgeler</h2>
<ul>
<li>Geçerli pasaport fotokopisi</li>
<li>Sabıka kaydı belgesi (apostilli)</li>
<li>Gelir belgesi veya banka hesap özeti</li>
<li>2 adet vesikalık fotoğraf</li>
<li>Avukat vekaletnamesi</li>
</ul>

<h2>Maliyetler</h2>
<ul>
<li><strong>Tapu harcı:</strong> Mülk değerinin %3'ü (ilk alımda) veya %6'sı</li>
<li><strong>KDV:</strong> %5</li>
<li><strong>Damga vergisi:</strong> %0,5</li>
<li><strong>Avukat ücreti:</strong> ~1.500-3.000 GBP</li>
<li><strong>Bakanlar Kurulu başvuru:</strong> ~300 GBP</li>
</ul>

<p>Nexos Investment olarak, tüm yasal süreçlerde danışmanlık hizmeti sunuyoruz. Güvenli ve sorunsuz bir mülk edinim süreci için bize ulaşın.</p>
`,
  },
  {
    title: "Kuzey Kıbrıs'ta Yaşam: Bilmeniz Gereken 10 Şey",
    slug: "kuzey-kibrista-yasam-bilmeniz-gereken-10-sey",
    author: "Nexos Emlak",
    excerpt: "Kuzey Kıbrıs'a taşınmayı düşünüyorsanız, iklimden sağlık sistemine, eğitimden günlük yaşama kadar bilmeniz gereken her şey bu yazıda.",
    cover_image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    content: `
<p>Kuzey Kıbrıs, sadece yatırım için değil, yaşam için de cazip bir destinasyon. İşte taşınmadan önce bilmeniz gereken 10 önemli konu.</p>

<h2>1. İklim</h2>
<p>Yılda ortalama 340 güneşli gün ile Akdeniz iklimi hakim. Yazlar sıcak ve kurak (30-40°C), kışlar ılıman ve yağışlı (10-18°C). Deniz suyu sıcaklığı yaz aylarında 28°C'ye kadar çıkar.</p>

<h2>2. Yaşam Maliyeti</h2>
<p>Avrupa'nın birçok ülkesine kıyasla oldukça uygun. Aylık ortalama harcama (kira hariç) tek kişi için 500-800 GBP, çift için 800-1.200 GBP civarındadır.</p>

<h2>3. Sağlık Hizmetleri</h2>
<p>Devlet hastaneleri ve özel klinikler mevcut. Özel sağlık sigortası yıllık 500-1.500 GBP arasında. Ciddi vakalar için Türkiye'ye transfer imkanı var.</p>

<h2>4. Eğitim</h2>
<p>İngilizce eğitim veren ilköğretim ve liseler mevcut. 20'den fazla üniversite bulunuyor. Uluslararası okullar da tercih edilebilir.</p>

<h2>5. Ulaşım</h2>
<p>Ercan Havalimanı üzerinden Türkiye'ye düzenli seferler. Larnaka (Güney) havalimanı da kullanılabilir. Ada içinde araç kullanmak en pratik ulaşım yöntemi. Trafik soldan akar (İngiliz sistemi).</p>

<h2>6. Güvenlik</h2>
<p>Kuzey Kıbrıs, dünyanın en güvenli bölgelerinden biri. Suç oranı çok düşük ve gece yürüyüşleri rahatlıkla yapılabilir.</p>

<h2>7. Dil</h2>
<p>Resmi dil Türkçe, ancak İngilizce çok yaygın. Turizm bölgelerinde ve üniversitelerde İngilizce ile iletişim kurmak kolay.</p>

<h2>8. Yemek Kültürü</h2>
<p>Türk ve Kıbrıs mutfağının harmanı. Taze deniz ürünleri, hellim peyniri, molehiya ve şeftali kebabı mutlaka denenmeli. Restoran fiyatları çok makul.</p>

<h2>9. Oturma İzni</h2>
<p>Mülk sahiplerine oturma izni verilir. Yıllık yenilenir. Başvuru için mülk tapusu, sağlık sigortası ve gelir belgesi gereklidir.</p>

<h2>10. Sosyal Hayat</h2>
<p>Expat toplulukları oldukça aktif. Golf, yürüyüş, dalış ve yelken gibi aktiviteler popüler. Girne ve İskele'de canlı bir sosyal hayat mevcut.</p>

<p>Kuzey Kıbrıs'ta hayalinizdeki yaşamı kurmak için Nexos Investment'ın deneyiminden faydalanın. Size en uygun mülkü birlikte bulalım.</p>
`,
  },
];

async function main() {
  console.log("Seeding blog posts...\n");

  let created = 0;
  for (const post of POSTS) {
    const { error } = await supabase.from("blog_posts").upsert(
      {
        ...post,
        is_published: true,
        published_at: new Date(
          Date.now() - created * 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        views_count: Math.floor(Math.random() * 300) + 20,
      },
      { onConflict: "slug" }
    );
    if (error) {
      console.error(`Error on "${post.slug}":`, error.message);
      continue;
    }
    console.log(`  ✓ ${post.title}`);
    created++;
  }

  console.log(`\nDone! ${created}/${POSTS.length} blog posts created.`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
