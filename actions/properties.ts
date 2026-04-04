"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";
import type { Property } from "@/types/property";
import { logAdminAction } from "@/lib/admin-logger";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type PropertyCreateInput = {
  title: string;
  description?: string;
  price: number;
  currency?: "TRY" | "USD" | "EUR" | "GBP";
  type: string;
  transaction_type: string;
  area_sqm?: number;
  gross_area_sqm?: number;
  rooms?: number;
  living_rooms?: number;
  bathrooms?: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  heating_type?: string;
  parking?: boolean;
  furnished?: boolean;
  balcony_count?: number;
  elevator?: boolean;
  pool?: boolean;
  pool_type?: string;
  garden?: boolean;
  security_24_7?: boolean;
  land_area_sqm?: number;
  title_deed_type?: string | null;
  parking_type?: string;
  lat?: number;
  lng?: number;
  address?: string;
  city_id: number;
  district_id?: number;
  neighborhood_id?: number;
  agent_id?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  seo_title?: string;
  seo_description?: string;
  video_url?: string;
  virtual_tour_url?: string;
  // Land-specific
  has_road_access?: boolean;
  has_electricity?: boolean;
  has_water?: boolean;
  zoning_status?: string | null;
  // Rental-specific
  min_rental_period?: string | null;
  rental_payment_interval?: string | null;
  // Internal
  internal_notes?: string | null;
};

export type PropertyUpdateInput = Partial<PropertyCreateInput>;

// ---------------------------------------------------------------------------
// Action return types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ü: "u",
    Ü: "u",
    ş: "s",
    Ş: "s",
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
  };

  return text
    .split("")
    .map((c) => turkishMap[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generates a URL-safe slug from `title` that is unique within the
 * `properties` table. Appends a short random hex suffix on collision.
 */
async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let attempt = 0;

  while (true) {
    let query = supabase
      .from("properties")
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      return candidate;
    }

    attempt += 1;
    // Use a short random hex segment to avoid sequential guessing
    const suffix = Math.random().toString(16).slice(2, 6);
    candidate = `${base}-${suffix}`;

    // Safety valve: prevent infinite loops in pathological cases
    if (attempt > 10) {
      candidate = `${base}-${Date.now()}`;
      return candidate;
    }
  }
}

type AdminCheckSuccess = { error: null; supabase: Awaited<ReturnType<typeof createClient>> };
type AdminCheckFailure = { error: string; supabase: null };
type AdminCheckResult = AdminCheckSuccess | AdminCheckFailure;

async function requireAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Giriş yapmanız gerekiyor", supabase: null };
  }

  const isAdmin = user.user_metadata?.role === "admin";
  if (!isAdmin) {
    return { error: "Yetkiniz yok", supabase: null };
  }

  return { error: null, supabase };
}

// ---------------------------------------------------------------------------
// createDraftProperty
// ---------------------------------------------------------------------------

/**
 * Creates a minimal draft property so that images can be uploaded immediately.
 * Returns the new property's ID for redirect to the edit page.
 */
export async function createDraftProperty(
  cityId: number
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const slug = await generateUniqueSlug(supabase, "taslak-ilan");

  const payload: TablesInsert<"properties"> = {
    title: "Taslak İlan",
    slug,
    price: 0,
    city_id: cityId,
    type: "apartment" as TablesInsert<"properties">["type"],
    transaction_type: "sale" as TablesInsert<"properties">["transaction_type"],
    is_active: false,
    status: "available" as TablesInsert<"properties">["status"],
  };

  const { data: property, error } = await supabase
    .from("properties")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: property.id } };
}

// ---------------------------------------------------------------------------
// createProperty
// ---------------------------------------------------------------------------

export async function createProperty(
  data: PropertyCreateInput
): Promise<ActionResult<Property>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const slug = await generateUniqueSlug(supabase, data.title);

  // Build a strictly-typed insert payload. We cast the string-typed enum
  // fields through `as` because PropertyCreateInput intentionally uses
  // plain `string` to avoid coupling callers to the DB enum literals, but
  // the DB will reject invalid values at runtime anyway.
  const payload: TablesInsert<"properties"> = {
    title: data.title,
    slug,
    price: data.price,
    city_id: data.city_id,
    type: data.type as TablesInsert<"properties">["type"],
    transaction_type:
      data.transaction_type as TablesInsert<"properties">["transaction_type"],
    description: data.description ?? null,
    currency: data.currency ?? "TRY",
    area_sqm: data.area_sqm ?? null,
    gross_area_sqm: data.gross_area_sqm ?? null,
    rooms: data.rooms ?? null,
    living_rooms: data.living_rooms ?? null,
    bathrooms: data.bathrooms ?? null,
    floor: data.floor ?? null,
    total_floors: data.total_floors ?? null,
    year_built: data.year_built ?? null,
    heating_type: (data.heating_type || "none") as TablesInsert<"properties">["heating_type"],
    parking: data.parking ?? null,
    furnished: data.furnished ?? null,
    balcony_count: data.balcony_count ?? 0,
    elevator: data.elevator ?? null,
    pool: data.pool ?? null,
    pool_type: data.pool_type ?? "none",
    garden: data.garden ?? null,
    security_24_7: data.security_24_7 ?? null,
    land_area_sqm: data.land_area_sqm ?? null,
    title_deed_type: data.title_deed_type ?? null,
    has_road_access: data.has_road_access ?? null,
    has_electricity: data.has_electricity ?? null,
    has_water: data.has_water ?? null,
    zoning_status: data.zoning_status ?? null,
    min_rental_period: data.min_rental_period ?? null,
    rental_payment_interval: data.rental_payment_interval ?? null,
    internal_notes: data.internal_notes ?? null,
    parking_type: data.parking_type ?? "none",
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    address: data.address ?? null,
    district_id: data.district_id ?? null,
    neighborhood_id: data.neighborhood_id ?? null,
    agent_id: data.agent_id ?? null,
    is_featured: data.is_featured ?? false,
    seo_title: data.seo_title ?? null,
    seo_description: data.seo_description ?? null,
    video_url: data.video_url ?? null,
    virtual_tour_url: data.virtual_tour_url ?? null,
  };

  const { data: property, error } = await supabase
    .from("properties")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("properties", {});
  void logAdminAction({ action: "create", entityType: "property", entityId: property.id });
  return { data: property as Property };
}

// ---------------------------------------------------------------------------
// updateProperty
// ---------------------------------------------------------------------------

export async function updateProperty(
  id: string,
  data: PropertyUpdateInput
): Promise<ActionResult<Property>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // Build the update payload, only including fields that were provided.
  // `undefined` values are intentionally omitted so we don't overwrite DB
  // columns with null when the caller simply did not supply those fields.
  const payload: TablesUpdate<"properties"> = {};

  if (data.title !== undefined) {
    payload.title = data.title;
    // Re-generate slug only when title changes, preserving the existing
    // slug for all other update scenarios.
    payload.slug = await generateUniqueSlug(supabase, data.title, id);
  }
  if (data.description !== undefined) payload.description = data.description;
  if (data.price !== undefined) payload.price = data.price;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.type !== undefined)
    payload.type = data.type as TablesUpdate<"properties">["type"];
  if (data.transaction_type !== undefined)
    payload.transaction_type =
      data.transaction_type as TablesUpdate<"properties">["transaction_type"];
  if (data.area_sqm !== undefined) payload.area_sqm = data.area_sqm;
  if (data.gross_area_sqm !== undefined)
    payload.gross_area_sqm = data.gross_area_sqm;
  if (data.rooms !== undefined) payload.rooms = data.rooms;
  if (data.living_rooms !== undefined) payload.living_rooms = data.living_rooms;
  if (data.bathrooms !== undefined) payload.bathrooms = data.bathrooms;
  if (data.floor !== undefined) payload.floor = data.floor;
  if (data.total_floors !== undefined) payload.total_floors = data.total_floors;
  if (data.year_built !== undefined) payload.year_built = data.year_built;
  if (data.heating_type !== undefined)
    payload.heating_type =
      data.heating_type as TablesUpdate<"properties">["heating_type"];
  if (data.parking !== undefined) payload.parking = data.parking;
  if (data.furnished !== undefined) payload.furnished = data.furnished;
  if (data.balcony_count !== undefined)
    payload.balcony_count = data.balcony_count;
  if (data.elevator !== undefined) payload.elevator = data.elevator;
  if (data.pool !== undefined) payload.pool = data.pool;
  if (data.pool_type !== undefined) payload.pool_type = data.pool_type;
  if (data.garden !== undefined) payload.garden = data.garden;
  if (data.security_24_7 !== undefined)
    payload.security_24_7 = data.security_24_7;
  if (data.land_area_sqm !== undefined) payload.land_area_sqm = data.land_area_sqm;
  if (data.title_deed_type !== undefined) payload.title_deed_type = data.title_deed_type;
  if (data.has_road_access !== undefined) payload.has_road_access = data.has_road_access;
  if (data.has_electricity !== undefined) payload.has_electricity = data.has_electricity;
  if (data.has_water !== undefined) payload.has_water = data.has_water;
  if (data.zoning_status !== undefined) payload.zoning_status = data.zoning_status;
  if (data.min_rental_period !== undefined) payload.min_rental_period = data.min_rental_period;
  if (data.rental_payment_interval !== undefined) payload.rental_payment_interval = data.rental_payment_interval;
  if (data.internal_notes !== undefined) payload.internal_notes = data.internal_notes;
  if (data.parking_type !== undefined) payload.parking_type = data.parking_type;
  if (data.lat !== undefined) payload.lat = data.lat;
  if (data.lng !== undefined) payload.lng = data.lng;
  if (data.address !== undefined) payload.address = data.address;
  if (data.city_id !== undefined) payload.city_id = data.city_id;
  if (data.district_id !== undefined) payload.district_id = data.district_id;
  if (data.neighborhood_id !== undefined)
    payload.neighborhood_id = data.neighborhood_id;
  if (data.agent_id !== undefined) payload.agent_id = data.agent_id ?? null;
  if (data.is_featured !== undefined) payload.is_featured = data.is_featured;
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  if (data.seo_title !== undefined) payload.seo_title = data.seo_title;
  if (data.seo_description !== undefined)
    payload.seo_description = data.seo_description;
  if (data.video_url !== undefined) payload.video_url = data.video_url;
  if (data.virtual_tour_url !== undefined)
    payload.virtual_tour_url = data.virtual_tour_url;

  const { data: property, error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("properties", {});
  void logAdminAction({ action: "update", entityType: "property", entityId: id });
  return { data: property as Property };
}

// ---------------------------------------------------------------------------
// deleteProperty
// ---------------------------------------------------------------------------

export async function deleteProperty(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("properties", {});
  void logAdminAction({ action: "delete", entityType: "property", entityId: id });
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// togglePropertyStatus
// ---------------------------------------------------------------------------

export async function togglePropertyStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ id: string; is_active: boolean }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("properties")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("properties", {});
  void logAdminAction({ action: "toggle_status", entityType: "property", entityId: id, metadata: { is_active: isActive } });
  return { data: { id, is_active: isActive } };
}

// ---------------------------------------------------------------------------
// togglePropertyFeatured
// ---------------------------------------------------------------------------

export async function togglePropertyFeatured(
  id: string,
  isFeatured: boolean
): Promise<ActionResult<{ id: string; is_featured: boolean }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("properties")
    .update({ is_featured: isFeatured })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("properties", {});
  void logAdminAction({ action: "toggle_featured", entityType: "property", entityId: id, metadata: { is_featured: isFeatured } });
  return { data: { id, is_featured: isFeatured } };
}

// ---------------------------------------------------------------------------
// duplicateProperty
// ---------------------------------------------------------------------------

export async function duplicateProperty(
  sourceId: string
): Promise<ActionResult<Property>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // Fetch the source property
  const { data: source, error: fetchError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", sourceId)
    .single();

  if (fetchError || !source) {
    return { error: fetchError?.message ?? "İlan bulunamadı" };
  }

  const newTitle = `Kopya — ${source.title}`;
  const slug = await generateUniqueSlug(supabase, newTitle);

  // Build a new property with same details but inactive and new slug
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, slug: _slug, title: _title, created_at: _ca, updated_at: _ua, views_count: _vc, is_active: _ia, ...rest } = source;

  const { data: newProperty, error: insertError } = await supabase
    .from("properties")
    .insert({
      ...rest,
      title: newTitle,
      slug,
      is_active: false,
      views_count: 0,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  revalidateTag("properties", {});
  void logAdminAction({ action: "duplicate", entityType: "property", entityId: newProperty.id, metadata: { source_id: sourceId } });
  return { data: newProperty as Property };
}

// ---------------------------------------------------------------------------
// syncPropertyFeatures
// ---------------------------------------------------------------------------

export async function syncPropertyFeatures(
  propertyId: string,
  featureIds: number[]
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // Delete existing features
  const { error: deleteError } = await supabase
    .from("property_features")
    .delete()
    .eq("property_id", propertyId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Insert new features
  if (featureIds.length > 0) {
    const rows = featureIds.map((fid) => ({
      property_id: propertyId,
      feature_id: fid,
    }));

    const { error: insertError } = await supabase
      .from("property_features")
      .insert(rows);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  revalidateTag("properties", {});
  return { data: { count: featureIds.length } };
}
