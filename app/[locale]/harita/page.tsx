import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FullScreenMap } from "@/components/property/full-screen-map";
import type { MapProperty } from "@/components/property/map-property-popup";

export const metadata: Metadata = {
  title: "Harita",
  description:
    "Tüm ilanları interaktif harita üzerinde görüntüleyin. Konuma göre emlak arayın.",
};

// ---------------------------------------------------------------------------
// Fetch only the columns needed for the map markers — keeps the payload lean.
// We filter for active properties that have valid coordinates.
// ---------------------------------------------------------------------------
async function getMapProperties(): Promise<MapProperty[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id, slug, title, price, currency,
      type, transaction_type,
      rooms, living_rooms, area_sqm,
      lat, lng,
      images:property_images(url, is_cover)
    `
    )
    .eq("is_active", true)
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    // Log on the server; return empty list so the page renders gracefully.
    console.error("[harita] Failed to fetch map properties:", error.message);
    return [];
  }

  if (!data) return [];

  return data.map((row) => {
    // `lat` and `lng` are guaranteed non-null due to the `.not()` filters above,
    // but TypeScript still sees them as `number | null` from the generated types.
    const lat = row.lat as number;
    const lng = row.lng as number;

    // Resolve the cover image URL from the joined property_images array.
    const images = (
      row.images as { url: string; is_cover: boolean }[] | null
    ) ?? [];
    const cover =
      images.find((img) => img.is_cover)?.url ?? images[0]?.url ?? null;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      price: row.price,
      currency: row.currency,
      type: row.type,
      transaction_type: row.transaction_type,
      rooms: row.rooms,
      living_rooms: row.living_rooms,
      area_sqm: row.area_sqm,
      lat,
      lng,
      cover_image: cover,
    } satisfies MapProperty;
  });
}

export default async function HaritaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const properties = await getMapProperties();

  return (
    <main>
      <FullScreenMap properties={properties} />
    </main>
  );
}
