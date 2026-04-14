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
import { SocialMediaGenerator } from "@/components/admin/social-media-generator";
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
          id, title, description, price, pricing_type, price_per_donum,
          currency, type, status, transaction_type,
          area_sqm, gross_area_sqm, rooms, living_rooms, bathrooms,
          floor, total_floors, year_built, heating_type,
          parking, furnished, elevator, pool, garden, security_24_7, balcony_count,
          lat, lng, address,
          city_id, district_id, neighborhood_id,
          is_featured, is_slider, is_showcase, is_deal,
          workflow_status, show_on_map, seo_title, seo_description, agent_id,
          video_url, virtual_tour_url,
          pool_type, parking_type, land_area_sqm, title_deed_type, internal_notes,
          has_road_access, has_electricity, has_water, zoning_status, floor_area_ratio,
          min_rental_period, rental_payment_interval,
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

  // Pull extra land/pricing/rental fields that the narrow `Property` Row type
  // in types/supabase.ts doesn't expose yet. They exist in the DB (migrations
  // 018, 039, 040, 041) and must be forwarded to the form so they aren't
  // re-initialized to their defaults and overwritten on save.
  const extra = property as Record<string, unknown>;

  const initialData = {
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price,
    pricing_type: (extra.pricing_type as string | null) ?? "fixed",
    price_per_donum: (extra.price_per_donum as number | null) ?? null,
    has_road_access: (extra.has_road_access as boolean | null) ?? false,
    has_electricity: (extra.has_electricity as boolean | null) ?? false,
    has_water: (extra.has_water as boolean | null) ?? false,
    zoning_status: (extra.zoning_status as string | null) ?? null,
    floor_area_ratio: (extra.floor_area_ratio as number | null) ?? null,
    min_rental_period: (extra.min_rental_period as string | null) ?? null,
    rental_payment_interval: (extra.rental_payment_interval as string | null) ?? null,
    show_on_map: (extra.show_on_map as boolean | null) ?? false,
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
    is_slider: (extra.is_slider as boolean | null) ?? false,
    is_showcase: (extra.is_showcase as boolean | null) ?? false,
    is_deal: (extra.is_deal as boolean | null) ?? false,
    seo_title: property.seo_title,
    seo_description: property.seo_description,
    agent_id: property.agent_id ?? null,
    video_url: property.video_url ?? null,
    virtual_tour_url: property.virtual_tour_url ?? null,
    pool_type: property.pool_type ?? null,
    parking_type: property.parking_type ?? null,
    land_area_sqm: property.land_area_sqm ?? null,
    title_deed_type: property.title_deed_type ?? null,
    internal_notes: property.internal_notes ?? null,
    feature_ids: featureIds,
  };

  const agentOptions = (agentsResult.data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    title: a.title,
  }));

  // Social media data
  const cityName = cities.find((c) => c.id === property.city_id)?.name ?? "";
  const sortedImgs = [...rawImages].sort((a, b) => (a.is_cover ? -1 : 0) - (b.is_cover ? -1 : 0));
  const socialProperty = {
    id: property.id as string,
    listing_number: (extra.listing_number as number | null) ?? 0,
    title: property.title as string,
    price: (property.price as number | null) ?? null,
    pricing_type: (extra.pricing_type as string | null) ?? null,
    currency: property.currency as string,
    type: property.type as string,
    transaction_type: property.transaction_type as string,
    area_sqm: property.area_sqm as number | null,
    rooms: property.rooms as number | null,
    living_rooms: property.living_rooms as number | null,
    city_name: cityName,
    district_name: null as string | null,
    cover_image: sortedImgs[0]?.url ?? null,
    extra_images: sortedImgs.slice(1, 5).map((i) => i.url),
  };

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
        <h1 className="text-2xl font-bold text-foreground">
          {property.title === "Taslak İlan" ? "Yeni İlan Oluştur" : "İlan Düzenle"}
        </h1>
        {property.title !== "Taslak İlan" && (
          <p className="mt-1 text-sm text-muted-foreground">{property.title}</p>
        )}
      </div>

      {/* Property form */}
      <PropertyForm
        cities={cityOptions}
        featuresByCategory={normalisedFeatures}
        agents={agentOptions}
        initialData={initialData}
        propertyId={id}
        mediaSlot={<ImageManager propertyId={id} initialImages={images} />}
        analyticsSlot={<PropertyAnalytics propertyId={id} />}
        socialMediaSlot={<SocialMediaGenerator properties={[socialProperty]} />}
      />
    </div>
  );
}
