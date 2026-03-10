import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const SEARCH_SELECT = `
  id, slug, title, price, currency, type, transaction_type,
  area_sqm, rooms, living_rooms,
  city:cities(name),
  district:districts(name),
  images:property_images(url, is_cover)
`;

const SEARCH_LIMIT = 20;
const MIN_QUERY_LENGTH = 2;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ data: [], meta: { total: 0 } });
  }

  const sanitisedQ = q.trim();
  const supabase = await createClient();

  // Primary path: Postgres full-text search with Turkish language config.
  const { data, error } = await supabase
    .from("properties")
    .select(SEARCH_SELECT)
    .eq("is_active", true)
    .textSearch("title", sanitisedQ, { type: "websearch", config: "turkish" })
    .limit(SEARCH_LIMIT);

  if (!error) {
    return NextResponse.json({
      data: data ?? [],
      meta: { total: data?.length ?? 0 },
    });
  }

  // Fallback path: textSearch failed (e.g. Turkish FTS config not installed on
  // the current Supabase instance). Use a case-insensitive LIKE match instead.
  console.error("search textSearch error, falling back to ilike:", error);

  const { data: fallback, error: fallbackError } = await supabase
    .from("properties")
    .select(SEARCH_SELECT)
    .eq("is_active", true)
    .ilike("title", `%${sanitisedQ}%`)
    .limit(SEARCH_LIMIT);

  if (fallbackError) {
    console.error("search ilike fallback error:", fallbackError);
    return NextResponse.json(
      { error: { code: "SEARCH_ERROR", message: "Arama sırasında hata oluştu" } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: fallback ?? [],
    meta: { total: fallback?.length ?? 0 },
  });
}
