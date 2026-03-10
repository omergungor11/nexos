import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { error: { code: "INVALID_SLUG", message: "Geçersiz ilan slug" } },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_property_views", {
    property_slug: slug,
  });

  if (error) {
    console.error("increment_property_views error:", error);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Görüntülenme güncellenemedi" } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { success: true } });
}
