import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PresentationManager } from "@/components/admin/presentation-manager";

export const metadata: Metadata = { title: "Sunumlar — Admin" };

type RawRow = {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  year_built: number | null;
  description: string | null;
  city: { name: string } | null;
  district: { name: string } | null;
  images: { url: string; is_cover: boolean; sort_order: number | null }[] | null;
};

export default async function SunumlarPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, title, price, currency, type, transaction_type, area_sqm, rooms, living_rooms, bathrooms, floor, total_floors, year_built, description, city:cities(name), district:districts(name), images:property_images(url, is_cover, sort_order)"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Veriler yüklenemedi: {error.message}</p>
      </div>
    );
  }

  const rows = (data ?? []) as unknown as RawRow[];

  const properties = rows.map((row) => {
    const sortedImages = (row.images ?? [])
      .slice()
      .sort((a, b) => {
        if (a.is_cover && !b.is_cover) return -1;
        if (!a.is_cover && b.is_cover) return 1;
        return (a.sort_order ?? 999) - (b.sort_order ?? 999);
      })
      .map((img) => img.url);

    return {
      id: row.id,
      title: row.title,
      price: row.price,
      currency: row.currency,
      type: row.type,
      transaction_type: row.transaction_type,
      area_sqm: row.area_sqm,
      rooms: row.rooms,
      living_rooms: row.living_rooms,
      bathrooms: row.bathrooms,
      floor: row.floor,
      total_floors: row.total_floors,
      year_built: row.year_built,
      description: row.description,
      city_name: row.city?.name ?? "",
      district_name: row.district?.name ?? null,
      images: sortedImages,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sunumlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          İlanlarınız için profesyonel slayt sunumları oluşturun ve PDF olarak indirin.
        </p>
      </div>

      <PresentationManager properties={properties} />
    </div>
  );
}
