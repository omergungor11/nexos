import { createClient } from "@/lib/supabase/server";
import type { City, District, Neighborhood } from "@/types";

// ---------------------------------------------------------------------------
// Slim projection types — only the columns each query actually selects
// ---------------------------------------------------------------------------

export type CityRow = Pick<City, "id" | "name" | "slug" | "plate_code">;
export type DistrictRow = Pick<District, "id" | "name" | "slug" | "city_id">;
export type NeighborhoodRow = Pick<
  Neighborhood,
  "id" | "name" | "slug" | "district_id"
>;

export interface LocationBreadcrumb {
  city: CityRow | null;
  district?: DistrictRow | null;
  neighborhood?: NeighborhoodRow | null;
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

/**
 * Returns all active cities ordered by name.
 */
export async function getCities(): Promise<CityRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug, plate_code")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getCities]", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Returns a single active city matching the given slug, or null if not found.
 */
export async function getCityBySlug(slug: string): Promise<CityRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug, plate_code")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    // PGRST116 = no rows — not a real error, just a miss
    if (error.code !== "PGRST116") {
      console.error("[getCityBySlug]", error.message);
    }
    return null;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Districts
// ---------------------------------------------------------------------------

/**
 * Returns all active districts that belong to the given city, ordered by name.
 */
export async function getDistricts(cityId: number): Promise<DistrictRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("districts")
    .select("id, name, slug, city_id")
    .eq("city_id", cityId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getDistricts]", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Returns a single active district matching the given cityId + slug pair,
 * or null if not found. The cityId guard prevents slug collisions across cities.
 */
export async function getDistrictBySlug(
  cityId: number,
  slug: string
): Promise<DistrictRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("districts")
    .select("id, name, slug, city_id")
    .eq("city_id", cityId)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[getDistrictBySlug]", error.message);
    }
    return null;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Neighborhoods
// ---------------------------------------------------------------------------

/**
 * Returns all active neighborhoods that belong to the given district,
 * ordered by name.
 */
export async function getNeighborhoods(
  districtId: number
): Promise<NeighborhoodRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name, slug, district_id")
    .eq("district_id", districtId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getNeighborhoods]", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Returns a single active neighborhood matching the given districtId + slug
 * pair, or null if not found.
 */
export async function getNeighborhoodBySlug(
  districtId: number,
  slug: string
): Promise<NeighborhoodRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name, slug, district_id")
    .eq("district_id", districtId)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[getNeighborhoodBySlug]", error.message);
    }
    return null;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Breadcrumb helper
// ---------------------------------------------------------------------------

/**
 * Resolves city / district / neighborhood rows for breadcrumb rendering.
 *
 * All three lookups run in parallel with Promise.all when the IDs are provided.
 * Only the levels whose IDs are supplied are fetched; missing levels are
 * omitted from the returned object so callers can distinguish "not requested"
 * from "not found".
 *
 * @example
 * const breadcrumb = await getLocationBreadcrumb({ cityId: 34, districtId: 5 });
 * // => { city: { id: 34, ... }, district: { id: 5, ... } }
 */
export async function getLocationBreadcrumb({
  cityId,
  districtId,
  neighborhoodId,
}: {
  cityId?: number;
  districtId?: number;
  neighborhoodId?: number;
}): Promise<LocationBreadcrumb> {
  const supabase = await createClient();

  const [cityResult, districtResult, neighborhoodResult] = await Promise.all([
    cityId !== undefined
      ? supabase
          .from("cities")
          .select("id, name, slug, plate_code")
          .eq("id", cityId)
          .eq("is_active", true)
          .single()
      : Promise.resolve({ data: null, error: null }),

    districtId !== undefined
      ? supabase
          .from("districts")
          .select("id, name, slug, city_id")
          .eq("id", districtId)
          .eq("is_active", true)
          .single()
      : Promise.resolve({ data: null, error: null }),

    neighborhoodId !== undefined
      ? supabase
          .from("neighborhoods")
          .select("id, name, slug, district_id")
          .eq("id", neighborhoodId)
          .eq("is_active", true)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (cityResult.error && cityResult.error.code !== "PGRST116") {
    console.error("[getLocationBreadcrumb] city", cityResult.error.message);
  }
  if (districtResult.error && districtResult.error.code !== "PGRST116") {
    console.error(
      "[getLocationBreadcrumb] district",
      districtResult.error.message
    );
  }
  if (
    neighborhoodResult.error &&
    neighborhoodResult.error.code !== "PGRST116"
  ) {
    console.error(
      "[getLocationBreadcrumb] neighborhood",
      neighborhoodResult.error.message
    );
  }

  const breadcrumb: LocationBreadcrumb = {
    city: (cityResult.data as CityRow | null) ?? null,
  };

  if (districtId !== undefined) {
    breadcrumb.district = (districtResult.data as DistrictRow | null) ?? null;
  }

  if (neighborhoodId !== undefined) {
    breadcrumb.neighborhood =
      (neighborhoodResult.data as NeighborhoodRow | null) ?? null;
  }

  return breadcrumb;
}
