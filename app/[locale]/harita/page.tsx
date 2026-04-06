import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FullScreenMap } from "@/components/property/full-screen-map";
import type { MapProperty } from "@/components/property/map-property-popup";
import type { MapProject } from "@/components/property/map-project-popup";

export const metadata: Metadata = {
  title: "Harita",
  description:
    "Tüm ilanları interaktif harita üzerinde görüntüleyin. Konuma göre emlak arayın.",
};

// ---------------------------------------------------------------------------
// Fetch only the columns needed for the map markers — keeps the payload lean.
// We filter for active properties that have show_on_map enabled.
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
      city:cities(lat, lng),
      district:districts(lat, lng),
      images:property_images(url, is_cover)
    `
    )
    .eq("is_active", true)
    .eq("show_on_map", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[harita] Failed to fetch map properties:", error.message);
    return [];
  }

  if (!data) return [];

  return data
    .map((row) => {
      const city = row.city as unknown as { lat: number | null; lng: number | null } | null;
      const district = row.district as unknown as { lat: number | null; lng: number | null } | null;

      const lat = row.lat ?? district?.lat ?? city?.lat;
      const lng = row.lng ?? district?.lng ?? city?.lng;

      if (lat == null || lng == null) return null;

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
    })
    .filter((p): p is NonNullable<typeof p> => p !== null) as MapProperty[];
}

// ---------------------------------------------------------------------------
// Fetch active projects with coordinates for map pins.
// ---------------------------------------------------------------------------
async function getMapProjects(): Promise<MapProject[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, cover_image, starting_price, currency, developer, status, lat, lng")
    .eq("is_active", true)
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (error) {
    console.error("[harita] Failed to fetch map projects:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    cover_image: row.cover_image,
    starting_price: row.starting_price,
    currency: row.currency ?? "GBP",
    developer: row.developer,
    status: row.status ?? "selling",
    lat: row.lat as number,
    lng: row.lng as number,
  }));
}

export default async function HaritaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [properties, projects] = await Promise.all([
    getMapProperties(),
    getMapProjects(),
  ]);

  return (
    <main>
      <FullScreenMap properties={properties} projects={projects} />
    </main>
  );
}
