export const INSTAGRAM_CHAR_LIMIT = 2200;
export const FACEBOOK_CHAR_LIMIT = 63206;

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  apartment: "Daire",
  twin_villa: "İkiz Villa",
  penthouse: "Penthouse",
  bungalow: "Bungalow",
  detached: "Müstakil Ev",
  residential_land: "Arsa",
  shop: "Dükkan",
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

export interface PropertyForSocial {
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  city_name: string;
  district_name: string | null;
}

function formatPrice(price: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = new Intl.NumberFormat("tr-TR").format(price);

  // Place symbol before or after based on convention
  if (currency === "TRY") {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
}

function formatRooms(rooms: number | null, livingRooms: number | null): string | null {
  if (rooms === null) return null;
  const lr = livingRooms ?? 1;
  return `${rooms}+${lr}`;
}

function formatLocation(cityName: string, districtName: string | null): string {
  if (districtName) {
    return `${districtName}, ${cityName}`;
  }
  return cityName;
}

function getTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

function getTransactionLabel(transactionType: string): string {
  return TRANSACTION_TYPE_LABELS[transactionType] ?? transactionType;
}

export function generateInstagramPost(property: PropertyForSocial): string {
  const typeLabel = getTypeLabel(property.type);
  const txLabel = getTransactionLabel(property.transaction_type);
  const location = formatLocation(property.city_name, property.district_name);
  const priceStr = formatPrice(property.price, property.currency);
  const roomStr = formatRooms(property.rooms, property.living_rooms);
  const hashtags = generateHashtags(property)
    .map((tag) => `#${tag}`)
    .join(" ");

  const lines: string[] = [];

  lines.push(`🏠 ${property.title}`);
  lines.push(`📍 ${location}`);
  lines.push(`💰 ${txLabel} — ${priceStr}`);

  if (property.area_sqm !== null) {
    lines.push(`📐 ${property.area_sqm} m²`);
  }

  if (roomStr !== null) {
    lines.push(`🛏️ ${roomStr}`);
  }

  lines.push("");
  lines.push(
    `${txLabel} ${typeLabel.toLowerCase()} arıyorsanız doğru yerdesiniz! Kuzey Kıbrıs'ın en güzel konumlarından biri olan ${location}'da bu eşsiz fırsatı kaçırmayın.`
  );
  lines.push("");
  lines.push(hashtags);

  const post = lines.join("\n");

  if (post.length > INSTAGRAM_CHAR_LIMIT) {
    return post.slice(0, INSTAGRAM_CHAR_LIMIT);
  }

  return post;
}

export function generateFacebookPost(property: PropertyForSocial): string {
  const typeLabel = getTypeLabel(property.type);
  const txLabel = getTransactionLabel(property.transaction_type);
  const location = formatLocation(property.city_name, property.district_name);
  const priceStr = formatPrice(property.price, property.currency);
  const roomStr = formatRooms(property.rooms, property.living_rooms);
  const hashtags = generateHashtags(property)
    .map((tag) => `#${tag}`)
    .join(" ");

  const lines: string[] = [];

  lines.push(`🏠 ${txLabel} ${typeLabel} — ${property.title}`);
  lines.push("");
  lines.push("📋 DETAYLAR");
  lines.push(`📍 Konum: ${location}`);
  lines.push(`💰 Fiyat: ${priceStr}`);
  lines.push(`🏷️ İlan Tipi: ${typeLabel} (${txLabel})`);

  if (property.area_sqm !== null) {
    lines.push(`📐 Alan: ${property.area_sqm} m²`);
  }

  if (roomStr !== null) {
    lines.push(`🛏️ Oda Sayısı: ${roomStr}`);
  }

  lines.push("");
  lines.push(
    `Kuzey Kıbrıs'ın en prestijli bölgelerinden ${location}'da yer alan bu ${typeLabel.toLowerCase()}, hem yatırım hem de yaşam için mükemmel bir fırsat sunmaktadır. Geniş alanı, kaliteli yapısı ve eşsiz konumuyla bu ilan sizin için özel olarak seçilmiştir.`
  );
  lines.push("");
  lines.push("📞 Detaylı bilgi ve görüntüleme randevusu için bize ulaşın!");
  lines.push("✉️ Detaylı bilgi için bize ulaşın!");
  lines.push("");
  lines.push(hashtags);

  const post = lines.join("\n");

  if (post.length > FACEBOOK_CHAR_LIMIT) {
    return post.slice(0, FACEBOOK_CHAR_LIMIT);
  }

  return post;
}

export function generateHashtags(property: PropertyForSocial): string[] {
  const tags: string[] = [];

  // Property type hashtags
  const typeTagMap: Record<string, string> = {
    villa: "Villa",
    apartment: "Daire",
    twin_villa: "İkizVilla",
    penthouse: "Penthouse",
    bungalow: "Bungalow",
    detached: "MüstakilEv",
    residential_land: "Arsa",
    mixed_land: "Arsa",
    commercial_land: "TicarıArsa",
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

  if (typeTagMap[property.type]) {
    tags.push(typeTagMap[property.type]);
  }

  // City hashtags
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
  if (cityTag) {
    tags.push(cityTag);
  } else {
    // Use city name directly, removing spaces
    tags.push(property.city_name.replace(/\s+/g, ""));
  }

  // District hashtag if available
  if (property.district_name) {
    tags.push(property.district_name.replace(/\s+/g, ""));
  }

  // Transaction type hashtags
  const txTagMap: Record<string, string> = {
    sale: "Satılık",
    rent: "Kiralık",
    daily_rental: "GünlükKiralık",
  };

  if (txTagMap[property.transaction_type]) {
    tags.push(txTagMap[property.transaction_type]);
  }

  // Generic hashtags
  tags.push(
    "KuzeyKıbrıs",
    "KKTC",
    "GayrimenkulYatırımı",
    "NexosEmlak",
    "Emlak"
  );

  return tags;
}
