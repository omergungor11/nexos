import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local manually
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

// ─── Cities ──────────────────────────────────────────────────────────────────
const CITIES = [
  { name: "İstanbul", slug: "istanbul", plate_code: 34 },
  { name: "Ankara", slug: "ankara", plate_code: 6 },
  { name: "İzmir", slug: "izmir", plate_code: 35 },
  { name: "Antalya", slug: "antalya", plate_code: 7 },
  { name: "Bursa", slug: "bursa", plate_code: 16 },
];

const DISTRICTS = {
  istanbul: [
    { name: "Kadıköy", slug: "kadikoy" },
    { name: "Beşiktaş", slug: "besiktas" },
    { name: "Sarıyer", slug: "sariyer" },
    { name: "Ataşehir", slug: "atasehir" },
    { name: "Üsküdar", slug: "uskudar" },
    { name: "Bakırköy", slug: "bakirkoy" },
  ],
  ankara: [
    { name: "Çankaya", slug: "cankaya" },
    { name: "Keçiören", slug: "kecioren" },
    { name: "Etimesgut", slug: "etimesgut" },
  ],
  izmir: [
    { name: "Karşıyaka", slug: "karsiyaka" },
    { name: "Bornova", slug: "bornova" },
    { name: "Alsancak", slug: "alsancak" },
  ],
  antalya: [
    { name: "Konyaaltı", slug: "konyaalti" },
    { name: "Muratpaşa", slug: "muratpasa" },
    { name: "Lara", slug: "lara" },
  ],
  bursa: [
    { name: "Nilüfer", slug: "nilufer" },
    { name: "Osmangazi", slug: "osmangazi" },
  ],
};

// ─── Agents ──────────────────────────────────────────────────────────────────
const AGENTS = [
  {
    name: "Neşe Üzüm",
    slug: "nese-uzum",
    title: "Kıdemli Emlak Danışmanı",
    phone: "+90 548 850 50 50",
    email: "nese@nexos.com.tr",
    bio: "Kuzey Kıbrıs gayrimenkul sektöründe 12 yıllık deneyimi ile İskele ve çevresinde uzmanlaşmış danışman. Müşteri memnuniyetini ön planda tutarak güvenilir hizmet sunar.",
  },
  {
    name: "İsmail Pehlivan",
    slug: "ismail-pehlivan",
    title: "Gayrimenkul Yatırım Danışmanı",
    phone: "+90 548 850 60 60",
    email: "ismail@nexos.com.tr",
    bio: "Yatırım amaçlı gayrimenkul danışmanlığında uzmanlaşmış profesyonel. Kuzey Kıbrıs'ta yüksek getiri potansiyeli taşıyan projeleri müşterilerine sunmaktadır.",
  },
  {
    name: "Hakan Sürmeli",
    slug: "hakan-surmeli",
    title: "Kiralama ve Satış Uzmanı",
    phone: "+90 548 850 70 70",
    email: "hakan@nexos.com.tr",
    bio: "Konut ve ticari gayrimenkul kiralama ile satış süreçlerinde geniş tecrübeye sahip. Kıbrıs'ta yaşam ve yatırım konularında rehberlik eder.",
  },
];

// ─── Unsplash image URLs ──────────────────────────────────────────────────
const IMAGES = {
  apartment: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=75",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=75",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=75",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=75",
  ],
  villa: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=75",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=75",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=75",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=75",
  ],
  detached: [
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=75",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=75",
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=75",
  ],
  land: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=75",
    "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=75",
  ],
  office: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=75",
  ],
  shop: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=75",
    "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=75",
  ],
};

// ─── Properties ──────────────────────────────────────────────────────────────
const PROPERTIES = [
  // === SATILIK DAİRELER ===
  {
    title: "Kadıköy Moda'da Deniz Manzaralı 3+1 Daire",
    slug: "kadikoy-moda-deniz-manzarali-3-1-daire",
    description: "Moda sahiline yürüme mesafesinde, deniz manzaralı, yenilenmiş 3+1 daire. Geniş salon, açık mutfak ve her odadan deniz görünümü.",
    price: 8500000, currency: "TRY", type: "apartment", transaction_type: "sale",
    area_sqm: 145, gross_area_sqm: 160, rooms: 3, living_rooms: 1, bathrooms: 2,
    floor: 5, total_floors: 7, year_built: 2018, heating_type: "natural_gas",
    parking: true, furnished: false, balcony_count: 2, elevator: true,
    lat: 40.9834, lng: 29.0267, address: "Moda Cad. No:45",
    city: "istanbul", district: "kadikoy", is_featured: true,
    features: [1, 2, 6, 8, 9],
    imageType: "apartment",
  },
  {
    title: "Ataşehir Brandium'da Modern 2+1 Rezidans",
    slug: "atasehir-brandium-modern-2-1-rezidans",
    description: "Ataşehir'in merkezinde, metro yakınında, site içi havuz ve spor salonu olan modern rezidans dairesi.",
    price: 5200000, currency: "TRY", type: "apartment", transaction_type: "sale",
    area_sqm: 95, gross_area_sqm: 110, rooms: 2, living_rooms: 1, bathrooms: 1,
    floor: 12, total_floors: 25, year_built: 2021, heating_type: "central",
    parking: true, furnished: true, balcony_count: 1, elevator: true,
    lat: 40.9923, lng: 29.1244, address: "Ataşehir Bulvarı No:100",
    city: "istanbul", district: "atasehir", is_featured: true,
    features: [1, 2, 3, 5, 7, 8, 15],
    imageType: "apartment",
  },
  {
    title: "Çankaya GOP'ta Yatırımlık 1+1 Daire",
    slug: "cankaya-gop-yatirimlik-1-1-daire",
    description: "Ankara'nın en prestijli semtinde, üniversiteye yakın, yatırıma uygun bakımlı 1+1 daire.",
    price: 2800000, currency: "TRY", type: "apartment", transaction_type: "sale",
    area_sqm: 55, gross_area_sqm: 65, rooms: 1, living_rooms: 1, bathrooms: 1,
    floor: 3, total_floors: 8, year_built: 2015, heating_type: "natural_gas",
    parking: false, furnished: false, balcony_count: 1, elevator: true,
    lat: 39.8949, lng: 32.8476, address: "GOP Mah. 15. Cad. No:22",
    city: "ankara", district: "cankaya", is_featured: false,
    features: [1, 6, 8, 18, 19],
    imageType: "apartment",
  },
  {
    title: "Karşıyaka Sahilde Ferah 4+1 Daire",
    slug: "karsiyaka-sahilde-ferah-4-1-daire",
    description: "İzmir Karşıyaka sahilinde, geniş teraslı, 4+1 aile dairesi. Deniz ve dağ manzarası bir arada.",
    price: 7200000, currency: "TRY", type: "apartment", transaction_type: "sale",
    area_sqm: 180, gross_area_sqm: 200, rooms: 4, living_rooms: 1, bathrooms: 2,
    floor: 6, total_floors: 10, year_built: 2020, heating_type: "natural_gas",
    parking: true, furnished: false, balcony_count: 2, elevator: true,
    lat: 38.4562, lng: 27.1060, address: "Sahil Yolu No:78",
    city: "izmir", district: "karsiyaka", is_featured: true,
    features: [1, 2, 6, 8, 9, 13],
    imageType: "apartment",
  },
  // === SATILIK VİLLALAR ===
  {
    title: "Sarıyer'de Boğaz Manzaralı Lüks Villa",
    slug: "sariyer-bogaz-manzarali-luks-villa",
    description: "İstanbul Boğazı'nın eşsiz manzarasına sahip, özel havuzlu, 600 m² bahçeli müstesna villa. Akıllı ev sistemleri, özel asansör.",
    price: 45000000, currency: "TRY", type: "villa", transaction_type: "sale",
    area_sqm: 450, gross_area_sqm: 520, rooms: 6, living_rooms: 2, bathrooms: 5,
    floor: 0, total_floors: 3, year_built: 2022, heating_type: "floor_heating",
    parking: true, furnished: true, balcony_count: 4, elevator: true, pool: true, garden: true, security_24_7: true,
    lat: 41.1672, lng: 29.0545, address: "Yeniköy Mah. Boğaz Cad. No:15",
    city: "istanbul", district: "sariyer", is_featured: true,
    features: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    imageType: "villa",
  },
  {
    title: "Konyaaltı'nda Denize Sıfır Triplex Villa",
    slug: "konyaalti-denize-sifir-triplex-villa",
    description: "Antalya Konyaaltı'nda, denize sıfır konumda, panoramik manzaralı triplex villa. Infinity havuz ve özel plaj erişimi.",
    price: 28000000, currency: "TRY", type: "villa", transaction_type: "sale",
    area_sqm: 350, gross_area_sqm: 400, rooms: 5, living_rooms: 2, bathrooms: 4,
    floor: 0, total_floors: 3, year_built: 2023, heating_type: "floor_heating",
    parking: true, furnished: true, balcony_count: 3, elevator: false, pool: true, garden: true, security_24_7: true,
    lat: 36.8667, lng: 30.6333, address: "Sahil Sitesi No:5",
    city: "antalya", district: "konyaalti", is_featured: true,
    features: [2, 3, 4, 5, 7, 8, 11, 12, 13],
    imageType: "villa",
  },
  {
    title: "Nilüfer'de Bahçeli Modern Villa",
    slug: "nilufer-bahceli-modern-villa",
    description: "Bursa Nilüfer'de, 500 m² arsa üzerinde modern mimarili, 4+2 villa. Geniş bahçe ve açık otopark.",
    price: 12000000, currency: "TRY", type: "villa", transaction_type: "sale",
    area_sqm: 280, gross_area_sqm: 320, rooms: 4, living_rooms: 2, bathrooms: 3,
    floor: 0, total_floors: 2, year_built: 2021, heating_type: "natural_gas",
    parking: true, furnished: false, balcony_count: 2, elevator: false, pool: false, garden: true,
    lat: 40.2129, lng: 28.9489, address: "Nilüfer Villakent No:12",
    city: "bursa", district: "nilufer", is_featured: false,
    features: [2, 4, 6, 8, 9, 14, 17, 18],
    imageType: "villa",
  },
  // === MÜSTAKİL EVLER ===
  {
    title: "Beşiktaş'ta Tarihi Köşk Tarzı Müstakil Ev",
    slug: "besiktas-tarihi-kosk-tarzi-mustakil-ev",
    description: "Beşiktaş'ın arka sokaklarında, restore edilmiş tarihi köşk. Ahşap detaylar, bahçe ve otopark.",
    price: 22000000, currency: "TRY", type: "detached", transaction_type: "sale",
    area_sqm: 240, gross_area_sqm: 280, rooms: 5, living_rooms: 1, bathrooms: 3,
    floor: 0, total_floors: 2, year_built: 1960, heating_type: "natural_gas",
    parking: true, furnished: false, balcony_count: 1, elevator: false, garden: true,
    lat: 41.0437, lng: 29.0050, address: "Abbasağa Mah. Çiçek Sok. No:8",
    city: "istanbul", district: "besiktas", is_featured: false,
    features: [2, 4, 6, 12, 14],
    imageType: "detached",
  },
  // === ARSALAR ===
  {
    title: "Lara'da İmarlı Deniz Manzaralı Arsa",
    slug: "lara-imarli-deniz-manzarali-arsa",
    description: "Antalya Lara'da, konut imarlı, deniz manzaralı 500 m² arsa. Altyapısı hazır, yola cepheli.",
    price: 6500000, currency: "TRY", type: "land", transaction_type: "sale",
    area_sqm: 500, rooms: null, living_rooms: null, bathrooms: null,
    floor: null, total_floors: null, year_built: null, heating_type: "none",
    parking: false, furnished: false, balcony_count: 0,
    lat: 36.8572, lng: 30.7347, address: "Lara Mevkii",
    city: "antalya", district: "lara", is_featured: false,
    features: [],
    imageType: "land",
  },
  {
    title: "Etimesgut'ta Ticari İmarlı Arsa",
    slug: "etimesgut-ticari-imarli-arsa",
    description: "Ankara Etimesgut'ta ana cadde üzerinde, ticari imarlı 1200 m² arsa. Yüksek kat izni.",
    price: 15000000, currency: "TRY", type: "land", transaction_type: "sale",
    area_sqm: 1200, rooms: null, living_rooms: null, bathrooms: null,
    floor: null, total_floors: null, year_built: null, heating_type: "none",
    parking: false, furnished: false, balcony_count: 0,
    lat: 39.9433, lng: 32.6556, address: "Eryaman 4. Etap Cad.",
    city: "ankara", district: "etimesgut", is_featured: false,
    features: [],
    imageType: "land",
  },
  // === OFİSLER ===
  {
    title: "Beşiktaş Levent'te A+ Ofis Katı",
    slug: "besiktas-levent-a-plus-ofis-kati",
    description: "Levent'te prestijli iş merkezinde, komple 300 m² ofis katı. Toplantı odaları, resepsiyon alanı ve otopark dahil.",
    price: 18000000, currency: "TRY", type: "office", transaction_type: "sale",
    area_sqm: 300, gross_area_sqm: 340, rooms: 6, living_rooms: 0, bathrooms: 2,
    floor: 15, total_floors: 30, year_built: 2019, heating_type: "central",
    parking: true, furnished: true, balcony_count: 0, elevator: true, security_24_7: true,
    lat: 41.0812, lng: 29.0102, address: "Levent Mah. Büyükdere Cad. No:200",
    city: "istanbul", district: "besiktas", is_featured: false,
    features: [1, 2, 5, 8, 14, 15],
    imageType: "office",
  },
  // === DÜKKANLAR ===
  {
    title: "Bakırköy'de İşlek Cadde Üzeri Dükkan",
    slug: "bakirkoy-islek-cadde-uzeri-dukkan",
    description: "Bakırköy ana caddede, yoğun yaya trafiği olan, vitrinli 120 m² köşe dükkan. Her sektöre uygun.",
    price: 9500000, currency: "TRY", type: "shop", transaction_type: "sale",
    area_sqm: 120, gross_area_sqm: 130, rooms: 2, living_rooms: 0, bathrooms: 1,
    floor: 0, total_floors: 5, year_built: 2010, heating_type: "air_condition",
    parking: false, furnished: false, balcony_count: 0, elevator: false,
    lat: 40.9816, lng: 28.8722, address: "İstanbul Cad. No:55",
    city: "istanbul", district: "bakirkoy", is_featured: false,
    features: [8],
    imageType: "shop",
  },
  // === KİRALIK DAİRELER ===
  {
    title: "Üsküdar Çengelköy'de Eşyalı 2+1 Kiralık",
    slug: "uskudar-cengelkoy-esyali-2-1-kiralik",
    description: "Çengelköy'de yeşillikler içinde, full eşyalı, Boğaz manzaralı 2+1 daire. Hemen taşınmaya uygun.",
    price: 32000, currency: "TRY", type: "apartment", transaction_type: "rent",
    area_sqm: 85, gross_area_sqm: 95, rooms: 2, living_rooms: 1, bathrooms: 1,
    floor: 3, total_floors: 5, year_built: 2016, heating_type: "natural_gas",
    parking: false, furnished: true, balcony_count: 1, elevator: true,
    lat: 41.0490, lng: 29.0696, address: "Çengelköy Mah. Bahçe Sok. No:12",
    city: "istanbul", district: "uskudar", is_featured: false,
    features: [1, 6, 7, 8, 9],
    imageType: "apartment",
  },
  {
    title: "Bornova'da Öğrenciye Uygun 1+1 Kiralık",
    slug: "bornova-ogrenciye-uygun-1-1-kiralik",
    description: "Ege Üniversitesi'ne 5 dk yürüme mesafesinde, ekonomik 1+1 daire. Ulaşım çok kolay.",
    price: 12000, currency: "TRY", type: "apartment", transaction_type: "rent",
    area_sqm: 45, gross_area_sqm: 50, rooms: 1, living_rooms: 1, bathrooms: 1,
    floor: 2, total_floors: 6, year_built: 2012, heating_type: "natural_gas",
    parking: false, furnished: true, balcony_count: 1, elevator: true,
    lat: 38.4612, lng: 27.2180, address: "Kazımdirik Mah. Üniversite Cad.",
    city: "izmir", district: "bornova", is_featured: false,
    features: [1, 6, 7, 18, 19],
    imageType: "apartment",
  },
  // === KİRALIK VİLLA ===
  {
    title: "Muratpaşa'da Havuzlu Kiralık Villa",
    slug: "muratpasa-havuzlu-kiralik-villa",
    description: "Antalya Muratpaşa'da, özel havuzlu, bahçeli, lüks eşyalı villa. Kısa veya uzun dönem kiralama.",
    price: 85000, currency: "TRY", type: "villa", transaction_type: "rent",
    area_sqm: 300, gross_area_sqm: 340, rooms: 4, living_rooms: 2, bathrooms: 3,
    floor: 0, total_floors: 2, year_built: 2020, heating_type: "floor_heating",
    parking: true, furnished: true, balcony_count: 2, elevator: false, pool: true, garden: true,
    lat: 36.8880, lng: 30.7040, address: "Güzeloba Mah. Villa Sitesi No:8",
    city: "antalya", district: "muratpasa", is_featured: true,
    features: [2, 3, 4, 7, 8, 11, 13],
    imageType: "villa",
  },
  // === KİRALIK OFİS ===
  {
    title: "Alsancak'ta Deniz Manzaralı Kiralık Ofis",
    slug: "alsancak-deniz-manzarali-kiralik-ofis",
    description: "İzmir Alsancak'ta, Kordon'a yakın, 200 m² açık plan ofis. Modern tasarım, toplantı odası mevcut.",
    price: 45000, currency: "TRY", type: "office", transaction_type: "rent",
    area_sqm: 200, gross_area_sqm: 220, rooms: 4, living_rooms: 0, bathrooms: 1,
    floor: 8, total_floors: 12, year_built: 2017, heating_type: "central",
    parking: true, furnished: false, balcony_count: 0, elevator: true, security_24_7: true,
    lat: 38.4350, lng: 27.1400, address: "Alsancak İş Merkezi Kat:8",
    city: "izmir", district: "alsancak", is_featured: false,
    features: [1, 2, 5, 8, 14, 15],
    imageType: "office",
  },
  // === KİRALIK DÜKKAN ===
  {
    title: "Osmangazi'de Hazır Kiracılı Dükkan",
    slug: "osmangazi-hazir-kiracili-dukkan",
    description: "Bursa Osmangazi'de, kiracısı hazır, gelir getiren 80 m² cadde üzeri dükkan.",
    price: 25000, currency: "TRY", type: "shop", transaction_type: "rent",
    area_sqm: 80, gross_area_sqm: 85, rooms: 1, living_rooms: 0, bathrooms: 1,
    floor: 0, total_floors: 4, year_built: 2008, heating_type: "air_condition",
    parking: false, furnished: false, balcony_count: 0, elevator: false,
    lat: 40.1950, lng: 29.0600, address: "Çarşı Mah. Ana Cad. No:40",
    city: "bursa", district: "osmangazi", is_featured: false,
    features: [8],
    imageType: "shop",
  },
  // === USD FİYATLI ===
  {
    title: "Beşiktaş'ta Yabancıya Uygun Lüks 3+1",
    slug: "besiktas-yabanciya-uygun-luks-3-1",
    description: "Beşiktaş'ta, yabancı uyruklu alıcılar için ideal, tapulu, lüks 3+1 daire. Deniz manzarası ve site içi olanaklar.",
    price: 350000, currency: "USD", type: "apartment", transaction_type: "sale",
    area_sqm: 165, gross_area_sqm: 185, rooms: 3, living_rooms: 1, bathrooms: 2,
    floor: 10, total_floors: 20, year_built: 2023, heating_type: "central",
    parking: true, furnished: true, balcony_count: 2, elevator: true, pool: true, security_24_7: true,
    lat: 41.0442, lng: 29.0003, address: "Etiler Mah. Elit Rezidans",
    city: "istanbul", district: "besiktas", is_featured: true,
    features: [1, 2, 3, 5, 6, 7, 8, 9, 10, 15, 16],
    imageType: "apartment",
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Seeding demo data...\n");

  // 1) Cities
  console.log("1) Creating cities...");
  const { data: cityRows, error: cityErr } = await supabase
    .from("cities")
    .upsert(CITIES.map(c => ({ ...c, is_active: true })), { onConflict: "slug" })
    .select("id, slug");
  if (cityErr) throw cityErr;
  const cityMap = Object.fromEntries(cityRows.map(c => [c.slug, c.id]));
  console.log(`   ${cityRows.length} cities created`);

  // 2) Districts (upsert using city_id + slug unique constraint)
  console.log("2) Creating districts...");
  const districtInserts = [];
  for (const [citySlug, dists] of Object.entries(DISTRICTS)) {
    for (const d of dists) {
      districtInserts.push({ ...d, city_id: cityMap[citySlug], is_active: true });
    }
  }
  const districtMap = {};
  for (const d of districtInserts) {
    const { data: row, error: err } = await supabase
      .from("districts")
      .upsert(d, { onConflict: "city_id,slug" })
      .select("id, slug, city_id")
      .single();
    if (err) { console.error(`   District error for "${d.slug}":`, err.message); continue; }
    districtMap[row.slug] = { id: row.id, city_id: row.city_id };
  }
  console.log(`   ${Object.keys(districtMap).length} districts created/updated`);

  // 3) Agents
  console.log("3) Creating agents...");
  const { data: agentRows, error: agentErr } = await supabase
    .from("agents")
    .upsert(AGENTS.map(a => ({ ...a, is_active: true })), { onConflict: "slug" })
    .select("id, slug");
  if (agentErr) throw agentErr;
  const agentIds = agentRows.map(a => a.id);
  console.log(`   ${agentRows.length} agents created`);

  // 4) Properties
  console.log("4) Creating properties...");
  let created = 0;
  for (let i = 0; i < PROPERTIES.length; i++) {
    const p = PROPERTIES[i];
    const { features: featureIds, imageType, city, district, ...propData } = p;

    const propertyInsert = {
      ...propData,
      city_id: cityMap[city],
      district_id: district ? districtMap[district]?.id ?? null : null,
      agent_id: agentIds[i % agentIds.length],
      status: "available",
      is_active: true,
      views_count: Math.floor(Math.random() * 500) + 10,
    };

    const { data: prop, error: propErr } = await supabase
      .from("properties")
      .upsert(propertyInsert, { onConflict: "slug" })
      .select("id")
      .single();
    if (propErr) { console.error(`   Error on "${p.slug}":`, propErr.message); continue; }

    // Images
    const imgs = IMAGES[imageType] || IMAGES.apartment;
    const imageInserts = imgs.map((url, idx) => ({
      property_id: prop.id,
      url,
      alt_text: `${p.title} - Fotoğraf ${idx + 1}`,
      sort_order: idx,
      is_cover: idx === 0,
    }));

    // Delete old images first, then insert
    await supabase.from("property_images").delete().eq("property_id", prop.id);
    const { error: imgErr } = await supabase.from("property_images").insert(imageInserts);
    if (imgErr) console.error(`   Image error for "${p.slug}":`, imgErr.message);

    // Features
    if (featureIds.length > 0) {
      await supabase.from("property_features").delete().eq("property_id", prop.id);
      const featureInserts = featureIds.map(fid => ({
        property_id: prop.id,
        feature_id: fid,
      }));
      const { error: featErr } = await supabase.from("property_features").insert(featureInserts);
      if (featErr) console.error(`   Feature error for "${p.slug}":`, featErr.message);
    }

    created++;
  }
  console.log(`   ${created}/${PROPERTIES.length} properties created`);

  console.log("\nDone! Demo data seeded successfully.");
  console.log(`Summary: ${Object.keys(cityMap).length} cities, ${Object.keys(districtMap).length} districts, ${agentRows.length} agents, ${created} properties`);
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
