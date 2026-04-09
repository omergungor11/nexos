import { createClient } from "@/lib/supabase/server";
import {
  MapManagementTable,
  type MapManagementRow,
} from "@/components/admin/map-management-table";
import { FullScreenMap } from "@/components/property/full-screen-map";
import type { MapProperty } from "@/components/property/map-property-popup";

export const metadata = {
  title: "Harita Yönetimi — Admin",
};

// ---------------------------------------------------------------------------
// Fetch properties for the map preview — uses the same logic as the public
// /harita page with city/district coordinate fallback.
// ---------------------------------------------------------------------------
async function getMapPreviewProperties(): Promise<MapProperty[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id, slug, title, price, currency,
      type, transaction_type,
      rooms, living_rooms, area_sqm,
      lat, lng,
      city:cities(name, lat, lng),
      district:districts(lat, lng),
      images:property_images(url, is_cover)
    `
    )
    .eq("is_active", true)
    .eq("show_on_map", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((row) => {
      const city = row.city as unknown as {
        name: string;
        lat: number | null;
        lng: number | null;
      } | null;
      const district = row.district as unknown as {
        lat: number | null;
        lng: number | null;
      } | null;

      const lat = row.lat ?? district?.lat ?? city?.lat;
      const lng = row.lng ?? district?.lng ?? city?.lng;

      if (lat == null || lng == null) return null;

      const images =
        (row.images as { url: string; is_cover: boolean }[] | null) ?? [];
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
        city: city?.name ?? null,
      } satisfies MapProperty;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export default async function AdminHaritaPage() {
  const supabase = await createClient();

  const [mapPreview, tableResult] = await Promise.all([
    getMapPreviewProperties(),
    supabase
      .from("properties")
      .select(
        `
        id, title, slug, price, currency, type, transaction_type,
        is_active, show_on_map, lat, lng,
        city:cities(name, lat, lng),
        district:districts(name, lat, lng),
        images:property_images(url, is_cover)
      `
      )
      .order("created_at", { ascending: false }),
  ]);

  if (tableResult.error) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          Veriler yüklenemedi: {tableResult.error.message}
        </p>
      </div>
    );
  }

  const properties = (tableResult.data ?? []) as unknown as MapManagementRow[];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Harita Yönetimi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Haritada gösterilecek ilanları yönetin.
        </p>
      </div>

      {/* Map preview — same component used on public /harita page */}
      <FullScreenMap properties={mapPreview} />

      <MapManagementTable initialData={properties} />
    </div>
  );
}
