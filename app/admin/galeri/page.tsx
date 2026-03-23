import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const metadata: Metadata = {
  title: "Galeri",
};

type RawImage = {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
  property_id: string;
};

type RawProperty = {
  id: string;
  title: string;
  slug: string;
  city_id: number | null;
  district_id: number | null;
};

export type GalleryImage = {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
  property_id: string;
  property_title: string;
  property_slug: string;
  city_id: number | null;
  district_id: number | null;
};

export type GalleryCity = { id: number; name: string };
export type GalleryDistrict = { id: number; name: string; city_id: number };

export default async function AdminGaleriPage() {
  const supabase = await createClient();

  const [imagesResult, propertiesResult, citiesResult, districtsResult] = await Promise.all([
    supabase
      .from("property_images")
      .select("id, url, alt_text, sort_order, is_cover, created_at, property_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("properties")
      .select("id, title, slug, city_id, district_id"),
    supabase
      .from("cities")
      .select("id, name")
      .order("name"),
    supabase
      .from("districts")
      .select("id, name, city_id")
      .order("name"),
  ]);

  const rawImages = (imagesResult.data ?? []) as RawImage[];
  const properties = (propertiesResult.data ?? []) as RawProperty[];
  const cities = (citiesResult.data ?? []) as GalleryCity[];
  const districts = (districtsResult.data ?? []) as GalleryDistrict[];

  const propertyMap = new Map(
    properties.map((p) => [p.id, { title: p.title, slug: p.slug, city_id: p.city_id, district_id: p.district_id }])
  );

  const images: GalleryImage[] = rawImages.map((img) => {
    const prop = propertyMap.get(img.property_id);
    return {
      ...img,
      property_title: prop?.title ?? "Bilinmeyen İlan",
      property_slug: prop?.slug ?? "",
      city_id: prop?.city_id ?? null,
      district_id: prop?.district_id ?? null,
    };
  });

  // Group by property for summary stats
  const propertyStats = new Map<string, number>();
  for (const img of images) {
    propertyStats.set(img.property_id, (propertyStats.get(img.property_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Galeri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {images.length} görsel — {propertyStats.size} ilan
        </p>
      </div>

      <GalleryManager
        initialImages={images}
        properties={properties.map((p) => ({ id: p.id, title: p.title }))}
        cities={cities}
        districts={districts}
      />
    </div>
  );
}
