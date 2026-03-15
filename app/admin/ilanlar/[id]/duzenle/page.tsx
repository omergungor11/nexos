import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCities } from "@/lib/queries/locations";
import { getFeaturesByCategory, getPropertyFeatures } from "@/lib/queries/features";
import { getAgents } from "@/lib/queries/content";
import { PropertyForm } from "@/components/admin/property-form";
import { ImageManager } from "@/components/admin/image-manager";
import { PropertyAnalytics } from "@/components/admin/property-analytics";
import type { PropertyImage } from "@/types/property";

export const metadata: Metadata = {
  title: "İlan Düzenle — Admin",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminPropertyEditPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const [propertyResult, cities, featuresByCategory, propertyFeatures, agentsResult] =
    await Promise.all([
      supabase
        .from("properties")
        .select(
          `
          id, title, description, price, currency, type, status, transaction_type,
          area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms,
          floor, total_floors, year_built, heating_type,
          parking, furnished, elevator, pool, garden, security_24_7, balcony_count,
          lat, lng, address,
          city_id, district_id, neighborhood_id,
          is_featured, seo_title, seo_description, agent_id,
          images:property_images(id, url, alt_text, sort_order, is_cover, created_at, property_id)
        `
        )
        .eq("id", id)
        .single(),
      getCities(),
      getFeaturesByCategory(),
      getPropertyFeatures(id),
      getAgents(),
    ]);

  if (propertyResult.error || !propertyResult.data) {
    notFound();
  }

  const property = propertyResult.data;

  // Normalise featuresByCategory to shape PropertyForm expects
  const normalisedFeatures: Record<
    string,
    Array<{ id: number; name: string; icon: string | null }>
  > = {};

  for (const [cat, features] of Object.entries(featuresByCategory)) {
    normalisedFeatures[cat] = features.map((f) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
    }));
  }

  const cityOptions = cities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const featureIds = propertyFeatures.map((f) => f.id);

  // Map property images to PropertyImage type
  const rawImages = (
    property.images as Array<{
      id: string;
      url: string;
      alt_text: string | null;
      sort_order: number;
      is_cover: boolean;
      created_at: string;
      property_id: string;
    }>
  ) ?? [];

  const images: PropertyImage[] = rawImages.map((img) => ({
    id: img.id,
    property_id: img.property_id,
    url: img.url,
    alt_text: img.alt_text,
    sort_order: img.sort_order,
    is_cover: img.is_cover,
    created_at: img.created_at,
  }));

  const initialData = {
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price,
    currency: property.currency,
    type: property.type,
    status: property.status,
    transaction_type: property.transaction_type,
    area_sqm: property.area_sqm,
    gross_area_sqm: property.gross_area_sqm,
    rooms: property.rooms,
    living_rooms: property.living_rooms,
    bathrooms: property.bathrooms,
    floor: property.floor,
    total_floors: property.total_floors,
    year_built: property.year_built,
    heating_type: property.heating_type,
    parking: property.parking,
    furnished: property.furnished,
    elevator: property.elevator,
    pool: property.pool,
    garden: property.garden,
    security_24_7: property.security_24_7,
    balcony_count: property.balcony_count,
    lat: property.lat,
    lng: property.lng,
    address: property.address,
    city_id: property.city_id,
    district_id: property.district_id,
    neighborhood_id: property.neighborhood_id,
    is_featured: property.is_featured,
    seo_title: property.seo_title,
    seo_description: property.seo_description,
    agent_id: property.agent_id ?? null,
    feature_ids: featureIds,
  };

  const agentOptions = (agentsResult.data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    title: a.title,
  }));

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/ilanlar"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          İlanlar
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">İlan Düzenle</h1>
        <p className="mt-1 text-sm text-muted-foreground">{property.title}</p>
      </div>

      {/* Property form */}
      <PropertyForm
        cities={cityOptions}
        featuresByCategory={normalisedFeatures}
        agents={agentOptions}
        initialData={initialData}
        propertyId={id}
      />

      {/* Image manager */}
      <div className="border-t pt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Görseller</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            JPEG, PNG veya WebP formatında, maksimum 5 MB.
          </p>
        </div>
        <ImageManager propertyId={id} initialImages={images} />
      </div>

      {/* Property Analytics */}
      <div className="border-t pt-8">
        <PropertyAnalytics propertyId={id} />
      </div>
    </div>
  );
}
