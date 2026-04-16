import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { parseSearchQuery } from "@/lib/search-parser";

const SEARCH_SELECT = `
  id, slug, title, price, currency, type, transaction_type,
  area_sqm, rooms, living_rooms,
  city:cities(name, slug),
  district:districts(name, slug),
  images:property_images(url, is_cover)
`;

const SEARCH_LIMIT = 10;
const MIN_QUERY_LENGTH = 2;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ data: [], meta: { total: 0 } });
  }

  const parsed = parseSearchQuery(q.trim());
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
  if (parsed.rooms !== null) {
    query = query.eq("rooms", parsed.rooms);
  }
  if (parsed.livingRooms !== null) {
    query = query.eq("living_rooms", parsed.livingRooms);
  }

  // Remaining text → check city/district names + title/address/description
  if (parsed.remainingText.length > 0) {
    const textQ = parsed.remainingText;
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
