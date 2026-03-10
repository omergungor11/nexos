"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
};

export type DistrictInput = {
  name: string;
  city_id: number;
};

export type NeighborhoodInput = {
  name: string;
  district_id: number;
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

  const { data: city, error } = await supabase
    .from("cities")
    .update(payload)
    .eq("id", id)
    .select("id, name, slug")
    .single();

  if (error) {
    return { error: error.message };
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

  const { data: district, error } = await supabase
    .from("districts")
    .update(payload)
    .eq("id", id)
    .select("id, name, slug")
    .single();

  if (error) {
    return { error: error.message };
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

  const { data: neighborhood, error } = await supabase
    .from("neighborhoods")
    .update(payload)
    .eq("id", id)
    .select("id, name, slug")
    .single();

  if (error) {
    return { error: error.message };
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
