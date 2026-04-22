"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  geocodeCity,
  geocodeDistrict,
  geocodeNeighborhood,
} from "@/lib/geocode";

// ---------------------------------------------------------------------------
// Helpers
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

type AdminCheckSuccess = {
  error: null;
  supabase: Awaited<ReturnType<typeof createClient>>;
};
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

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type CityInput = {
  name: string;
  plate_code?: number;
  lat?: number | null;
  lng?: number | null;
};

export type DistrictInput = {
  name: string;
  city_id: number;
  lat?: number | null;
  lng?: number | null;
};

export type NeighborhoodInput = {
  name: string;
  district_id: number;
  lat?: number | null;
  lng?: number | null;
};

// ---------------------------------------------------------------------------
// City actions
// ---------------------------------------------------------------------------

export async function createCity(
  data: CityInput
): Promise<ActionResult<{ id: number; name: string; slug: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { data: city, error } = await supabase
    .from("cities")
    .insert({
      name: data.name,
      slug: slugify(data.name),
      plate_code: data.plate_code ?? null,
    })
    .select("id, name, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Use manual coords if provided, otherwise auto-geocode
  if (data.lat != null && data.lng != null && city) {
    await supabase
      .from("cities")
      .update({ lat: data.lat, lng: data.lng })
      .eq("id", (city as { id: number }).id);
  } else {
    const coords = await geocodeCity(data.name);
    if (coords && city) {
      await supabase
        .from("cities")
        .update({ lat: coords.lat, lng: coords.lng })
        .eq("id", (city as { id: number }).id);
    }
  }

  revalidateTag("locations", {});
  return { data: city as { id: number; name: string; slug: string } };
}

export async function updateCity(
  id: number,
  data: Partial<CityInput>
): Promise<ActionResult<{ id: number; name: string; slug: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) {
    payload.name = data.name;
    payload.slug = slugify(data.name);
  }
  if (data.plate_code !== undefined) payload.plate_code = data.plate_code;
  if (data.lat != null) payload.lat = data.lat;
  if (data.lng != null) payload.lng = data.lng;

  // If only coords provided and no other fields, do direct update without .single()
  if (Object.keys(payload).length === 0) {
    revalidateTag("locations", {});
    return { error: "Güncellenecek alan bulunamadı" };
  }

  const { data: city, error } = await supabase
    .from("cities")
    .update(payload)
    .eq("id", id)
    .select("id, name, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Auto-geocode only if name changed and no manual coords provided
  if (data.name !== undefined && data.lat == null && city) {
    const coords = await geocodeCity(data.name);
    if (coords) {
      await supabase
        .from("cities")
        .update({ lat: coords.lat, lng: coords.lng })
        .eq("id", id);
    }
  }

  revalidateTag("locations", {});
  return { data: city as { id: number; name: string; slug: string } };
}

export async function deleteCity(
  id: number
): Promise<ActionResult<{ id: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase.from("cities").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("locations", {});
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// District actions
// ---------------------------------------------------------------------------

export async function createDistrict(
  data: DistrictInput
): Promise<ActionResult<{ id: number; name: string; slug: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { data: district, error } = await supabase
    .from("districts")
    .insert({
      name: data.name,
      slug: slugify(data.name),
      city_id: data.city_id,
    })
    .select("id, name, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Use manual coords if provided, otherwise auto-geocode with parent context
  if (data.lat != null && data.lng != null && district) {
    await supabase
      .from("districts")
      .update({ lat: data.lat, lng: data.lng })
      .eq("id", (district as { id: number }).id);
  } else {
    const { data: parentCity } = await supabase
      .from("cities")
      .select("name, lat, lng")
      .eq("id", data.city_id)
      .single();

    if (district && parentCity) {
      const cityName = (parentCity as { name: string }).name;
      const coords = await geocodeDistrict(data.name, cityName);
      const finalCoords =
        coords ??
        ((parentCity as { lat: number | null; lng: number | null }).lat != null
          ? {
              lat: (parentCity as { lat: number; lng: number }).lat,
              lng: (parentCity as { lat: number; lng: number }).lng,
            }
          : null);

      if (finalCoords) {
        await supabase
          .from("districts")
          .update({ lat: finalCoords.lat, lng: finalCoords.lng })
          .eq("id", (district as { id: number }).id);
      }
    }
  }

  revalidateTag("locations", {});
  return { data: district as { id: number; name: string; slug: string } };
}

export async function updateDistrict(
  id: number,
  data: Partial<DistrictInput>
): Promise<ActionResult<{ id: number; name: string; slug: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) {
    payload.name = data.name;
    payload.slug = slugify(data.name);
  }
  if (data.city_id !== undefined) payload.city_id = data.city_id;
  if (data.lat != null) payload.lat = data.lat;
  if (data.lng != null) payload.lng = data.lng;

  if (Object.keys(payload).length === 0) {
    revalidateTag("locations", {});
    return { error: "Güncellenecek alan bulunamadı" };
  }

  const { data: district, error } = await supabase
    .from("districts")
    .update(payload)
    .eq("id", id)
    .select("id, name, slug, city_id")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Auto-geocode only if name changed and no manual coords provided
  if (data.name !== undefined && data.lat == null && district) {
    const cityId = (district as { city_id: number }).city_id;
    const { data: parentCity } = await supabase
      .from("cities")
      .select("name")
      .eq("id", cityId)
      .single();

    const cityName = (parentCity as { name: string } | null)?.name ?? "";
    const coords = await geocodeDistrict(data.name, cityName);
    if (coords) {
      await supabase
        .from("districts")
        .update({ lat: coords.lat, lng: coords.lng })
        .eq("id", id);
    }
  }

  revalidateTag("locations", {});
  return { data: district as { id: number; name: string; slug: string } };
}

export async function deleteDistrict(
  id: number
): Promise<ActionResult<{ id: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase.from("districts").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("locations", {});
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// Neighborhood actions
// ---------------------------------------------------------------------------

export async function createNeighborhood(
  data: NeighborhoodInput
): Promise<ActionResult<{ id: number; name: string; slug: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { data: neighborhood, error } = await supabase
    .from("neighborhoods")
    .insert({
      name: data.name,
      slug: slugify(data.name),
      district_id: data.district_id,
    })
    .select("id, name, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Use manual coords if provided, otherwise auto-geocode with parent context
  if (data.lat != null && data.lng != null && neighborhood) {
    await supabase
      .from("neighborhoods")
      .update({ lat: data.lat, lng: data.lng })
      .eq("id", (neighborhood as { id: number }).id);
  } else {
    const { data: parentDistrict } = await supabase
      .from("districts")
      .select("name, lat, lng, city:cities(name)")
      .eq("id", data.district_id)
      .single();

    if (neighborhood && parentDistrict) {
      const districtName = (parentDistrict as { name: string }).name;
      const cityField = (parentDistrict as unknown as { city: { name: string } | { name: string }[] | null }).city;
      const cityName = Array.isArray(cityField)
        ? cityField[0]?.name ?? ""
        : cityField?.name ?? "";

      const coords = await geocodeNeighborhood(data.name, districtName, cityName);
      const finalCoords =
        coords ??
        ((parentDistrict as { lat: number | null; lng: number | null }).lat != null
          ? {
              lat: (parentDistrict as { lat: number; lng: number }).lat,
              lng: (parentDistrict as { lat: number; lng: number }).lng,
            }
          : null);

      if (finalCoords) {
        await supabase
          .from("neighborhoods")
          .update({ lat: finalCoords.lat, lng: finalCoords.lng })
          .eq("id", (neighborhood as { id: number }).id);
      }
    }
  }

  revalidateTag("locations", {});
  return { data: neighborhood as { id: number; name: string; slug: string } };
}

export async function updateNeighborhood(
  id: number,
  data: Partial<NeighborhoodInput>
): Promise<ActionResult<{ id: number; name: string; slug: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) {
    payload.name = data.name;
    payload.slug = slugify(data.name);
  }
  if (data.district_id !== undefined) payload.district_id = data.district_id;
  if (data.lat != null) payload.lat = data.lat;
  if (data.lng != null) payload.lng = data.lng;

  if (Object.keys(payload).length === 0) {
    revalidateTag("locations", {});
    return { error: "Güncellenecek alan bulunamadı" };
  }

  const { data: neighborhood, error } = await supabase
    .from("neighborhoods")
    .update(payload)
    .eq("id", id)
    .select("id, name, slug, district_id")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Auto-geocode only if name changed and no manual coords provided
  if (data.name !== undefined && data.lat == null && neighborhood) {
    const districtId = (neighborhood as { district_id: number }).district_id;
    const { data: parentDistrict } = await supabase
      .from("districts")
      .select("name, city:cities(name)")
      .eq("id", districtId)
      .single();

    const districtName = (parentDistrict as { name: string } | null)?.name ?? "";
    const cityField = (parentDistrict as unknown as { city: { name: string } | { name: string }[] | null } | null)?.city;
    const cityName = Array.isArray(cityField)
      ? cityField[0]?.name ?? ""
      : cityField?.name ?? "";

    const coords = await geocodeNeighborhood(data.name, districtName, cityName);
    if (coords) {
      await supabase
        .from("neighborhoods")
        .update({ lat: coords.lat, lng: coords.lng })
        .eq("id", id);
    }
  }

  revalidateTag("locations", {});
  return { data: neighborhood as { id: number; name: string; slug: string } };
}

export async function deleteNeighborhood(
  id: number
): Promise<ActionResult<{ id: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("neighborhoods")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("locations", {});
  return { data: { id } };
}
