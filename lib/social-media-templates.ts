// Social-media post templates for Nexos listings.
// A single long-form Turkish post (emoji-rich, hashtag block at the bottom)
// replaces the earlier Instagram/Facebook split — admins copy the same text
// to both platforms.

export const POST_CHAR_LIMIT = 2200; // Instagram's hard limit; Facebook is much higher.

// Back-compat exports — some callers still import these names.
export const INSTAGRAM_CHAR_LIMIT = POST_CHAR_LIMIT;
export const FACEBOOK_CHAR_LIMIT = POST_CHAR_LIMIT;

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  apartment: "Daire",
  twin_villa: "İkiz Villa",
  penthouse: "Penthouse",
  bungalow: "Bungalow",
  detached: "Müstakil Ev",
  residence: "Rezidans",
  building: "Bina",
  residential_land: "Arsa",
  mixed_land: "Arsa",
  commercial_land: "Ticari Arsa",
  industrial_land: "Sanayi Arsası",
  tourism_land: "Turizm Arsası",
  field: "Tarla",
  olive_grove: "Zeytinlik",
  shop: "Dükkan",
  hotel: "Hotel",
  workplace: "İş Yeri",
  warehouse: "Depo",
  office: "Ofis",
};

const TYPE_EMOJIS: Record<string, string> = {
  villa: "🏡",
  apartment: "🏢",
  twin_villa: "🏡",
  penthouse: "🌆",
  bungalow: "🏠",
  detached: "🏠",
  residence: "🏙️",
  building: "🏗️",
  residential_land: "🗺️",
  mixed_land: "🗺️",
  commercial_land: "🏪",
  industrial_land: "🏭",
  tourism_land: "🏖️",
  field: "🌾",
  olive_grove: "🌿",
  shop: "🛍️",
  hotel: "🏨",
  workplace: "💼",
  warehouse: "📦",
  office: "🏢",
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  sale: "Satılık",
  rent: "Kiralık",
  daily_rental: "Günlük Kiralık",
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertyForSocial {
  title: string;
  price: number | null;
  pricing_type?: string | null;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  city_name: string;
  district_name: string | null;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatPriceLine(p: PropertyForSocial): string {
  if (p.pricing_type === "exchange") return "TAKASA UYGUN";
  if (p.pricing_type === "offer") return "TEKLİF BEKLEYİN";
  if (p.pricing_type === "kat_karsiligi") return "KAT KARŞILIĞI";
  if (p.price == null || p.price <= 0) return "Fiyat için bize ulaşın";
  const symbol = CURRENCY_SYMBOLS[p.currency] ?? p.currency;
  const formatted = new Intl.NumberFormat("tr-TR").format(p.price);
  return p.currency === "TRY" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

function formatRooms(rooms: number | null, livingRooms: number | null): string | null {
  if (rooms === null) return null;
  const lr = livingRooms ?? 1;
  return `${rooms}+${lr}`;
}

function formatLocation(cityName: string, districtName: string | null): string {
  return districtName ? `${districtName}, ${cityName}` : cityName;
}

function getTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

function getTypeEmoji(type: string): string {
  return TYPE_EMOJIS[type] ?? "🏠";
}

function getTransactionLabel(transactionType: string): string {
  return TRANSACTION_TYPE_LABELS[transactionType] ?? transactionType;
}

// ---------------------------------------------------------------------------
// generatePost — long-form Turkish post, emoji bullets, hashtag block
// ---------------------------------------------------------------------------

export function generatePost(property: PropertyForSocial): string {
  const typeLabel = getTypeLabel(property.type);
  const typeEmoji = getTypeEmoji(property.type);
  const txLabel = getTransactionLabel(property.transaction_type);
  const locationName = property.district_name || property.city_name;
  const fullLocation = formatLocation(property.city_name, property.district_name);
  const priceStr = formatPriceLine(property);
  const roomStr = formatRooms(property.rooms, property.living_rooms);
  const hashtags = generateHashtags(property).map((t) => `#${t}`).join(" ");

  // ----- Headline --------------------------------------------------------
  const lines: string[] = [];
  lines.push(`${locationName}'da ${txLabel} ${typeLabel}: ${property.title} ${typeEmoji}✨`);
  lines.push("");

  // ----- Hook ------------------------------------------------------------
  lines.push(
    `Kuzey Kıbrıs'ın yükselen değeri ${fullLocation}'da, her detayı düşünülmüş özel bir ${typeLabel.toLowerCase()} fırsatı sunuyoruz!`
  );
  lines.push("");

  // ----- Highlights ------------------------------------------------------
  lines.push("🚀 Öne Çıkan Özellikler:");
  if (roomStr) lines.push(`✅ Oda: ${roomStr} düzenine sahip ferah yaşam alanı.`);
  if (property.area_sqm) {
    const formatted = new Intl.NumberFormat("tr-TR").format(property.area_sqm);
    lines.push(`✅ Alan: ${formatted} m² kullanım alanı.`);
  }
  lines.push(`✅ Konum: ${fullLocation} — ulaşım ve yaşam kolaylığı.`);
  lines.push(`✅ İşlem Türü: ${txLabel} — hemen devredilebilir durumda.`);
  lines.push(`✅ Yatırım: Yüksek kira getirisi ve değer artışı potansiyeli.`);
  lines.push("");

  // ----- Opportunity -----------------------------------------------------
  lines.push(`💎 Fırsat: ${priceStr}`);
  lines.push("");

  // ----- Call to action --------------------------------------------------
  lines.push(
    `📍 Modern yaşamı ${locationName}'ya taşımak ve bu karlı yatırımın bir parçası olmak için bizimle iletişime geçin.`
  );
  lines.push("📩 Detaylı bilgi, görseller ve randevu için DM üzerinden ulaşabilirsiniz.");
  lines.push("");

  // ----- Hashtags --------------------------------------------------------
  lines.push(hashtags);

  const post = lines.join("\n");
  return post.length > POST_CHAR_LIMIT ? post.slice(0, POST_CHAR_LIMIT) : post;
}

// Back-compat: keep the old names pointing at the new generator so any
// lingering caller still works.
export const generateInstagramPost = generatePost;
export const generateFacebookPost = generatePost;

// ---------------------------------------------------------------------------
// generateHashtags
// ---------------------------------------------------------------------------

export function generateHashtags(property: PropertyForSocial): string[] {
  const tags: string[] = [];

  const typeTagMap: Record<string, string> = {
    villa: "Villa",
    apartment: "Daire",
    twin_villa: "İkizVilla",
    penthouse: "Penthouse",
    bungalow: "Bungalow",
    detached: "MüstakilEv",
    residential_land: "Arsa",
    mixed_land: "Arsa",
    commercial_land: "TicariArsa",
    industrial_land: "SanayiArsası",
    tourism_land: "TurizmArsası",
    field: "Tarla",
    olive_grove: "Zeytinlik",
    shop: "Dükkan",
    hotel: "Hotel",
    workplace: "İşYeri",
    warehouse: "Depo",
    office: "Ofis",
  };

  if (typeTagMap[property.type]) tags.push(typeTagMap[property.type]);

  const cityTagMap: Record<string, string> = {
    Girne: "Girne",
    Kyrenia: "Girne",
    Lefkoşa: "Lefkoşa",
    Nicosia: "Lefkoşa",
    İskele: "İskele",
    Iskele: "İskele",
    Gazimağusa: "Gazimağusa",
    Famagusta: "Gazimağusa",
    Güzelyurt: "Güzelyurt",
    Morphou: "Güzelyurt",
  };

  const cityTag = cityTagMap[property.city_name];
  tags.push(cityTag ?? property.city_name.replace(/\s+/g, ""));

  if (property.district_name) {
    tags.push(property.district_name.replace(/\s+/g, ""));
  }

  const txTagMap: Record<string, string> = {
    sale: "Satılık",
    rent: "Kiralık",
    daily_rental: "GünlükKiralık",
  };
  if (txTagMap[property.transaction_type]) tags.push(txTagMap[property.transaction_type]);

  if (property.pricing_type === "kat_karsiligi") tags.push("KatKarşılığı");
  if (property.pricing_type === "exchange") tags.push("Takas");

  tags.push(
    "KıbrısEmlak",
    "KuzeyKıbrıs",
    "KKTC",
    "GayrimenkulYatırımı",
    "NorthCyprusInvestment",
    "NexosEmlak"
  );

  return tags;
}
