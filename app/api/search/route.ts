import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const SEARCH_SELECT = `
  id, slug, title, price, currency, type, transaction_type,
  area_sqm, rooms, living_rooms,
  city:cities(name),
  district:districts(name),
  images:property_images(url, is_cover)
`;

const SEARCH_LIMIT = 10;
const MIN_QUERY_LENGTH = 2;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ data: [], meta: { total: 0 } });
  }

  const sanitisedQ = q.trim();
  const supabase = await createClient();

  // Use ilike for reliable partial matching across title, address, and description
  const pattern = `%${sanitisedQ}%`;

  const { data, error } = await supabase
    .from("properties")
    .select(SEARCH_SELECT)
    .eq("is_active", true)
    .or(`title.ilike.${pattern},address.ilike.${pattern},description.ilike.${pattern}`)
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
