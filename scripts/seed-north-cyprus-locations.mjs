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

// ─── North Cyprus Cities ─────────────────────────────────────────────────────
const CITIES = [
  { name: "Lefkoşa",    slug: "lefkosa" },
  { name: "Girne",      slug: "girne" },
  { name: "Gazimağusa", slug: "gazimagusa" },
  { name: "Güzelyurt",  slug: "guzelyurt" },
  { name: "İskele",     slug: "iskele" },
  { name: "Lefke",      slug: "lefke" },
];

// ─── Districts per city ──────────────────────────────────────────────────────
const DISTRICTS = {
  lefkosa: [
    { name: "Akıncılar", slug: "akincilar" },
    { name: "Alayköy", slug: "alaykoy" },
    { name: "Balıkesir", slug: "balikesir" },
    { name: "Batıkent", slug: "batikent" },
    { name: "Beyköy", slug: "beykoy" },
    { name: "Cihangir", slug: "cihangir" },
    { name: "Çağlayan", slug: "caglayan" },
    { name: "Çukurova", slug: "cukurova" },
    { name: "Değirmenlik", slug: "degirmenlik" },
    { name: "Demirhan", slug: "demirhan" },
    { name: "Dilekkaya", slug: "dilekkaya" },
    { name: "Dumlupınar", slug: "dumlupinar" },
    { name: "Düzova", slug: "duzova" },
    { name: "Erdemli", slug: "erdemli" },
    { name: "Gaziköy", slug: "gazikoy" },
    { name: "Gelibolu", slug: "gelibolu" },
    { name: "Göçmenköy", slug: "gocmenkoy" },
    { name: "Gökhan", slug: "gokhan" },
    { name: "Gönyeli", slug: "gonyeli" },
    { name: "Gürpınar", slug: "gurpinar" },
    { name: "Hamitköy", slug: "hamitkoy" },
    { name: "Haspolat", slug: "haspolat" },
    { name: "Kalavaç", slug: "kalavac" },
    { name: "Kanlıköy", slug: "kanlikoy" },
    { name: "Kırklar", slug: "kirklar" },
    { name: "Kızılbaş", slug: "kizilbas" },
    { name: "Köşklüçiftlik", slug: "koskluciftlik" },
    { name: "Kumsal", slug: "kumsal" },
    { name: "Küçük Kaymaklı", slug: "kucuk-kaymakli" },
    { name: "Lefkoşa Surlariçi", slug: "lefkosa-surlarici" },
    { name: "Marmara", slug: "marmara" },
    { name: "Meriç", slug: "meric" },
    { name: "Metehan", slug: "metehan" },
    { name: "Minareliköy", slug: "minarelikoy" },
    { name: "Ortaköy", slug: "ortakoy" },
    { name: "Sanayi Bölgesi", slug: "sanayi-bolgesi" },
    { name: "Taşkınköy", slug: "taskinkoy" },
    { name: "Türkeli", slug: "turkeli" },
    { name: "Yeniceköy", slug: "yenicekoy" },
    { name: "Yenikent", slug: "yenikent" },
    { name: "Yenişehir", slug: "yenisehir" },
    { name: "Yılmazköy", slug: "yilmazkoy" },
    { name: "Yiğitler", slug: "yigitler" },
  ],
  girne: [
    { name: "Ağırdağ", slug: "agirdag" },
    { name: "Akçiçek", slug: "akcicek" },
    { name: "Akdeniz", slug: "akdeniz" },
    { name: "Alemdağ", slug: "alemdag" },
    { name: "Alsancak", slug: "alsancak" },
    { name: "Arapköy", slug: "arapkoy" },
    { name: "Aşağı Dikmen", slug: "asagi-dikmen" },
    { name: "Aşağı Taşkent", slug: "asagi-taskent" },
    { name: "Bahçeli", slug: "bahceli" },
    { name: "Beşparmak", slug: "besparmak" },
    { name: "Beylerbeyi", slug: "beylerbeyi" },
    { name: "Boğazköy", slug: "bogazkoy" },
    { name: "Çamlıbel", slug: "camlibel" },
    { name: "Çatalköy", slug: "catalkoy" },
    { name: "Dağyolu", slug: "dagyolu" },
    { name: "Esentepe", slug: "esentepe" },
    { name: "Geçitköy", slug: "gecitkoy" },
    { name: "Girne Merkez", slug: "girne-merkez" },
    { name: "Göçeri", slug: "goceri" },
    { name: "Güngör", slug: "gungor" },
    { name: "Hisarköy", slug: "hisarkoy" },
    { name: "Ilgaz", slug: "ilgaz" },
    { name: "Karaağaç", slug: "karaagac" },
    { name: "Karaman", slug: "karaman" },
    { name: "Karpaşa", slug: "karpasa" },
    { name: "Karşıyaka", slug: "karsiyaka" },
    { name: "Kayalar", slug: "kayalar" },
    { name: "Kılıçarslan", slug: "kilicarslan" },
    { name: "Koruçam", slug: "korucam" },
    { name: "Kozanköy", slug: "kozankoy" },
    { name: "Kömürcü", slug: "komurcu" },
    { name: "Lapta", slug: "lapta" },
    { name: "Malatya", slug: "malatya" },
    { name: "Ozanköy", slug: "ozankoy" },
    { name: "Özhan", slug: "ozhan" },
    { name: "Pınarbaşı", slug: "pinarbasi" },
    { name: "Sadrazamköy", slug: "sadrazamkoy" },
    { name: "Şirinevler", slug: "sirinevler" },
    { name: "Tepebaşı", slug: "tepebasi" },
    { name: "Yeşiltepe", slug: "yesiltepe" },
    { name: "Yukarı Dikmen", slug: "yukari-dikmen" },
    { name: "Yukarı Taşkent", slug: "yukari-taskent" },
  ],
  gazimagusa: [
    { name: "Akdoğan", slug: "akdogan" },
    { name: "Akova", slug: "akova" },
    { name: "Alaniçi", slug: "alanici" },
    { name: "Arıdamı", slug: "aridami" },
    { name: "Aslanköy", slug: "aslankoy" },
    { name: "Beyarmudu", slug: "beyarmudu" },
    { name: "Çamlıca", slug: "camlica" },
    { name: "Çayönü", slug: "cayonu" },
    { name: "Çınarlı", slug: "cinarli" },
    { name: "Dörtyol", slug: "dortyol" },
    { name: "Düzce", slug: "duzce" },
    { name: "Ergenekon", slug: "ergenekon" },
    { name: "Gazimağusa Merkez", slug: "gazimagusa-merkez" },
    { name: "Geçitkale", slug: "gecitkale" },
    { name: "Gönendere", slug: "gonendere" },
    { name: "Görneç", slug: "gornec" },
    { name: "Güvercinlik", slug: "guvercinlik" },
    { name: "İncirli", slug: "incirli" },
    { name: "İnönü", slug: "inonu" },
    { name: "Korkuteli", slug: "korkuteli" },
    { name: "Köprü", slug: "kopru" },
    { name: "Kurudere", slug: "kurudere" },
    { name: "Mallıdağ", slug: "mallidag" },
    { name: "Mormenekşe", slug: "mormenekse" },
    { name: "Mutluyaka", slug: "mutluyaka" },
    { name: "Nergisli", slug: "nergisli" },
    { name: "Paşaköy", slug: "pasakoy" },
    { name: "Pile", slug: "pile" },
    { name: "Pınarlı", slug: "pinarli" },
    { name: "Pirhan", slug: "pirhan" },
    { name: "Serdarlı", slug: "serdarli" },
    { name: "Sütlüce", slug: "sutluce" },
    { name: "Şehitler", slug: "sehitler" },
    { name: "Tatlısu", slug: "tatlisu" },
    { name: "Tirmen", slug: "tirmen" },
    { name: "Turunçlu", slug: "turunclu" },
    { name: "Türkmenköy", slug: "turkmenkoy" },
    { name: "Ulukışla", slug: "ulukisla" },
    { name: "Vadili", slug: "vadili" },
    { name: "Yamaçköy", slug: "yamackoy" },
    { name: "Yeniboğaziçi", slug: "yenibogazici" },
    { name: "Yıldırım", slug: "yildirim" },
  ],
  guzelyurt: [
    { name: "Akçay", slug: "akcay" },
    { name: "Aydınköy", slug: "aydinkoy" },
    { name: "Gayretköy", slug: "gayretkoy" },
    { name: "Güneşköy", slug: "guneskoy" },
    { name: "Güzelyurt Merkez", slug: "guzelyurt-merkez" },
    { name: "Kalkanlı", slug: "kalkanli" },
    { name: "Mevlevi", slug: "mevlevi" },
    { name: "Serhatköy", slug: "serhatkoy" },
    { name: "Şahinler", slug: "sahinler" },
    { name: "Yayla", slug: "yayla" },
    { name: "Yuvacık", slug: "yuvacik" },
    { name: "Zümrütköy", slug: "zumrutkoy" },
  ],
  iskele: [
    { name: "Adaçay", slug: "adacay" },
    { name: "Ağıllar", slug: "agillar" },
    { name: "Altınova", slug: "altinova" },
    { name: "Ardahan", slug: "ardahan" },
    { name: "Avtepe", slug: "avtepe" },
    { name: "Aygün", slug: "aygun" },
    { name: "Bafra", slug: "bafra" },
    { name: "Balalan", slug: "balalan" },
    { name: "Boğaziçi", slug: "bogazici" },
    { name: "Boltaşlı", slug: "boltasli" },
    { name: "Büyükkonuk", slug: "buyukkonuk" },
    { name: "Çayırova", slug: "cayirova" },
    { name: "Derince", slug: "derince" },
    { name: "Dipkarpaz", slug: "dipkarpaz" },
    { name: "Ergazi", slug: "ergazi" },
    { name: "Esenköy", slug: "esenkoy" },
    { name: "Gelincik", slug: "gelincik" },
    { name: "İskele Merkez", slug: "iskele-merkez" },
    { name: "Kaleburnu", slug: "kaleburnu" },
    { name: "Kalecik", slug: "kalecik" },
    { name: "Kaplıca", slug: "kaplica" },
    { name: "Kilitkaya", slug: "kilitkaya" },
    { name: "Kumyalı", slug: "kumyali" },
    { name: "Kurtuluş", slug: "kurtulus" },
    { name: "Kuruova", slug: "kuruova" },
    { name: "Kuzucuk", slug: "kuzucuk" },
    { name: "Mehmetçik", slug: "mehmetcik" },
    { name: "Mersinlik", slug: "mersinlik" },
    { name: "Ötüken", slug: "otuken" },
    { name: "Pamuklu", slug: "pamuklu" },
    { name: "Sazlıköy", slug: "sazlikoy" },
    { name: "Sınırüstü", slug: "sinirustu" },
    { name: "Sipahi", slug: "sipahi" },
    { name: "Taşlıca", slug: "taslica" },
    { name: "Topçuköy", slug: "topcukoy" },
    { name: "Turnalar", slug: "turnalar" },
    { name: "Tuzluca", slug: "tuzluca" },
    { name: "Yarköy", slug: "yarkoy" },
    { name: "Yedikonuk", slug: "yedikonuk" },
    { name: "Yeni Erenköy", slug: "yeni-erenkoy" },
    { name: "Yeşilköy", slug: "yesilkoy" },
    { name: "Zeybekköy", slug: "zeybekkoy" },
    { name: "Ziyamet", slug: "ziyamet" },
  ],
  lefke: [
    { name: "Aşağı Kurtboğan", slug: "asagi-kurtbogan" },
    { name: "Bademliköy", slug: "bademlikoy" },
    { name: "Bademköy", slug: "bademkoy" },
    { name: "Bağlıköy", slug: "baglikoy" },
    { name: "Cengizköy", slug: "cengizkoy" },
    { name: "Çamlıköy", slug: "camlikoy" },
    { name: "Denizli", slug: "denizli" },
    { name: "Doğancı", slug: "doganci" },
    { name: "Erenköy", slug: "erenkoy" },
    { name: "Gaziveren", slug: "gaziveren" },
    { name: "Gemikonağı", slug: "gemikonagi" },
    { name: "Günebakan", slug: "gunebakan" },
    { name: "Kurutepe", slug: "kurutepe" },
    { name: "Lefke Merkez", slug: "lefke-merkez" },
    { name: "Madenliköy", slug: "madenkoy" },
    { name: "Ömerli", slug: "omerli" },
    { name: "Şirinköy", slug: "sirinkoy" },
    { name: "Süleymaniye", slug: "suleymaniye" },
    { name: "Taşköy", slug: "taskoy" },
    { name: "Taşpınar", slug: "taspinar" },
    { name: "Yağmuralan", slug: "yagmuralan" },
    { name: "Yeşilırmak", slug: "yesilirmak" },
    { name: "Yeşilyurt", slug: "yesilyurt" },
  ],
};

async function main() {
  console.log("🏝️  North Cyprus locations seed starting...\n");

  // 1. Deactivate existing locations
  console.log("Deactivating existing locations...");
  await supabase.from("neighborhoods").update({ is_active: false }).neq("id", 0);
  await supabase.from("districts").update({ is_active: false }).neq("id", 0);
  await supabase.from("cities").update({ is_active: false }).neq("id", 0);
  console.log("  Done.\n");

  // 2. Insert cities
  console.log("Inserting 6 North Cyprus cities...");
  const { data: insertedCities, error: cityError } = await supabase
    .from("cities")
    .upsert(
      CITIES.map((c) => ({ ...c, plate_code: null, is_active: true })),
      { onConflict: "slug" }
    )
    .select("id, name, slug");

  if (cityError) {
    console.error("City insert error:", cityError);
    process.exit(1);
  }
  console.log(`  Inserted: ${insertedCities.map((c) => c.name).join(", ")}\n`);

  // 3. Insert districts per city
  for (const city of insertedCities) {
    const districts = DISTRICTS[city.slug];
    if (!districts) {
      console.log(`  No districts for ${city.name}, skipping.`);
      continue;
    }

    const rows = districts.map((d) => ({
      city_id: city.id,
      name: d.name,
      slug: d.slug,
      is_active: true,
    }));

    const { error: distError, count } = await supabase
      .from("districts")
      .upsert(rows, { onConflict: "city_id,slug", count: "exact" });

    if (distError) {
      console.error(`District insert error for ${city.name}:`, distError);
    } else {
      console.log(`  ${city.name}: ${districts.length} districts inserted`);
    }
  }

  console.log("\n✅ North Cyprus locations seed complete!");
  console.log("Total: 6 cities, 205 districts");
}

main().catch(console.error);
