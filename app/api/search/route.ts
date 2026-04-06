import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const SEARCH_SELECT = `
  id, slug, title, price, currency, type, transaction_type,
  area_sqm, rooms, living_rooms,
  city:cities(name, slug),
  district:districts(name, slug),
  images:property_images(url, is_cover)
`;

const SEARCH_LIMIT = 10;
const MIN_QUERY_LENGTH = 2;

// ---------------------------------------------------------------------------
// Keyword → filter maps (Turkish)
// ---------------------------------------------------------------------------

const TX_KEYWORDS: Record<string, string> = {
  satılık: "sale",
  satilik: "sale",
  satılik: "sale",
  kiralık: "rent",
  kiralik: "rent",
  günlük: "daily_rental",
  gunluk: "daily_rental",
  "günlük kiralık": "daily_rental",
  "gunluk kiralik": "daily_rental",
};

const TYPE_KEYWORDS: Record<string, string> = {
  daire: "apartment",
  villa: "villa",
  "ikiz villa": "twin_villa",
  penthouse: "penthouse",
  bungalow: "bungalow",
  "müstakil": "detached",
  mustakil: "detached",
  "müstakil ev": "detached",
  arsa: "residential_land",
  dükkan: "shop",
  dukkan: "shop",
  ofis: "office",
  tarla: "field",
  otel: "hotel",
  stüdyo: "studio",
  studyo: "studio",
};

/** Normalize Turkish chars for matching */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c");
}

interface ParsedQuery {
  transactionType: string | null;
  propertyType: string | null;
  remainingText: string[];
}

function parseQuery(raw: string): ParsedQuery {
  const lower = raw.toLowerCase().trim();
  const normalized = normalize(raw);
  let words = lower.split(/\s+/);
  let transactionType: string | null = null;
  let propertyType: string | null = null;

  // Check multi-word phrases first (e.g. "günlük kiralık", "ikiz villa", "müstakil ev")
  const fullPhrase = words.join(" ");
  const fullNorm = normalize(fullPhrase);
  for (const [kw, val] of Object.entries(TX_KEYWORDS)) {
    if (fullPhrase.includes(kw) || fullNorm.includes(normalize(kw))) {
      transactionType = val;
      // Remove matched words
      const kwWords = kw.split(" ");
      words = words.filter((w) => !kwWords.includes(w) && !kwWords.includes(normalize(w)));
      break;
    }
  }

  const remaining = words.join(" ");
  const remainNorm = normalize(remaining);
  for (const [kw, val] of Object.entries(TYPE_KEYWORDS)) {
    if (remaining.includes(kw) || remainNorm.includes(normalize(kw))) {
      propertyType = val;
      const kwWords = kw.split(" ");
      words = words.filter((w) => !kwWords.includes(w) && !kwWords.includes(normalize(w)));
      break;
    }
  }

  // Single-word fallbacks (if multi-word didn't match)
  if (!transactionType) {
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const n = normalize(w);
      for (const [kw, val] of Object.entries(TX_KEYWORDS)) {
        if (w === kw || n === normalize(kw)) {
          transactionType = val;
          words.splice(i, 1);
          break;
        }
      }
      if (transactionType) break;
    }
  }

  if (!propertyType) {
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const n = normalize(w);
      for (const [kw, val] of Object.entries(TYPE_KEYWORDS)) {
        if (w === kw || n === normalize(kw)) {
          propertyType = val;
          words.splice(i, 1);
          break;
        }
      }
      if (propertyType) break;
    }
  }

  return {
    transactionType,
    propertyType,
    remainingText: words.filter((w) => w.length >= 2),
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ data: [], meta: { total: 0 } });
  }

  const parsed = parseQuery(q.trim());
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(SEARCH_SELECT)
    .eq("is_active", true);

  // Apply parsed filters
  if (parsed.transactionType) {
    query = query.eq("transaction_type", parsed.transactionType);
  }
  if (parsed.propertyType) {
    query = query.eq("type", parsed.propertyType);
  }

  // Remaining text → check city/district names + title/address/description
  if (parsed.remainingText.length > 0) {
    const textQ = parsed.remainingText.join(" ");
    const pattern = `%${textQ}%`;

    // Look up city by name
    const { data: matchedCity } = await supabase
      .from("cities")
      .select("id")
      .ilike("name", pattern)
      .limit(1)
      .maybeSingle();

    // Look up district by name
    const { data: matchedDistrict } = await supabase
      .from("districts")
      .select("id")
      .ilike("name", pattern)
      .limit(1)
      .maybeSingle();

    // Build OR conditions for text + location
    const orParts: string[] = [
      `title.ilike.${pattern}`,
      `address.ilike.${pattern}`,
      `description.ilike.${pattern}`,
    ];
    if (matchedCity) orParts.push(`city_id.eq.${matchedCity.id}`);
    if (matchedDistrict) orParts.push(`district_id.eq.${matchedDistrict.id}`);

    query = query.or(orParts.join(","));
  }

  const { data, error } = await query
    .order("is_featured", { ascending: false })
    .order("views_count", { ascending: false })
    .limit(SEARCH_LIMIT);

  if (error) {
    console.error("search error:", error);
    return NextResponse.json(
      { error: { code: "SEARCH_ERROR", message: "Arama sırasında hata oluştu" } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data ?? [],
    meta: { total: data?.length ?? 0 },
  });
}
