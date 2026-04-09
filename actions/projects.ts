"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ProjectInput = {
  title: string;
  description?: string;
  short_description?: string;
  cover_image?: string;
  gallery_images?: string[];
  location?: string;
  city_id?: number;
  district_id?: number;
  completion_date?: string;
  total_units?: number;
  starting_price?: number;
  currency?: string;
  features?: string[];
  status?: string;
  is_featured?: boolean;
  is_active?: boolean;
  lat?: number;
  lng?: number;
  video_url?: string;
};

export type ProjectUpdateInput = Partial<ProjectInput>;

// ---------------------------------------------------------------------------
// Action return types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProjectRow = Record<string, any>;

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ı: "i", İ: "i", ö: "o", Ö: "o", ü: "u", Ü: "u",
    ş: "s", Ş: "s", ç: "c", Ç: "c", ğ: "g", Ğ: "g",
  };

  return text
    .split("")
    .map((c) => turkishMap[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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
      .from("projects")
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
    const suffix = Math.random().toString(16).slice(2, 6);
    candidate = `${base}-${suffix}`;

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
// createProject
// ---------------------------------------------------------------------------

export async function createProject(
  data: ProjectInput
): Promise<ActionResult<ProjectRow>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const slug = await generateUniqueSlug(supabase, data.title);

  const payload = {
    title: data.title,
    slug,
    description: data.description ?? null,
    short_description: data.short_description ?? null,
    cover_image: data.cover_image ?? null,
    gallery_images: data.gallery_images ?? [],
    location: data.location ?? null,
    city_id: data.city_id ?? null,
    district_id: data.district_id ?? null,
    completion_date: data.completion_date ?? null,
    total_units: data.total_units ?? null,
    starting_price: data.starting_price ?? null,
    currency: data.currency ?? "GBP",
    features: data.features ?? [],
    status: data.status ?? "selling",
    is_featured: data.is_featured ?? false,
    is_active: data.is_active ?? true,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    video_url: data.video_url ?? null,
  };

  const { data: project, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("projects", {});
  void logAdminAction({ action: "create", entityType: "project", entityId: project.id });
  return { data: project };
}

// ---------------------------------------------------------------------------
// updateProject
// ---------------------------------------------------------------------------

export async function updateProject(
  id: string,
  data: ProjectUpdateInput
): Promise<ActionResult<ProjectRow>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {};

  if (data.title !== undefined) {
    payload.title = data.title;
    payload.slug = await generateUniqueSlug(supabase, data.title, id);
  }
  if (data.description !== undefined) payload.description = data.description;
  if (data.short_description !== undefined) payload.short_description = data.short_description;
  if (data.cover_image !== undefined) payload.cover_image = data.cover_image;
  if (data.gallery_images !== undefined) payload.gallery_images = data.gallery_images;
  if (data.location !== undefined) payload.location = data.location;
  if (data.city_id !== undefined) payload.city_id = data.city_id;
  if (data.district_id !== undefined) payload.district_id = data.district_id;
  if (data.completion_date !== undefined) payload.completion_date = data.completion_date;
  if (data.total_units !== undefined) payload.total_units = data.total_units;
  if (data.starting_price !== undefined) payload.starting_price = data.starting_price;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.features !== undefined) payload.features = data.features;
  if (data.status !== undefined) payload.status = data.status;
  if (data.is_featured !== undefined) payload.is_featured = data.is_featured;
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  if (data.lat !== undefined) payload.lat = data.lat;
  if (data.lng !== undefined) payload.lng = data.lng;
  if (data.video_url !== undefined) payload.video_url = data.video_url;

  const { data: project, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("projects", {});
  void logAdminAction({ action: "update", entityType: "project", entityId: id });
  return { data: project };
}

// ---------------------------------------------------------------------------
// deleteProject
// ---------------------------------------------------------------------------

export async function deleteProject(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("projects", {});
  void logAdminAction({ action: "delete", entityType: "project", entityId: id });
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// toggleProjectStatus
// ---------------------------------------------------------------------------

export async function toggleProjectStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ id: string; is_active: boolean }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("projects")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("projects", {});
  void logAdminAction({ action: "toggle_status", entityType: "project", entityId: id, metadata: { is_active: isActive } });
  return { data: { id, is_active: isActive } };
}

// ---------------------------------------------------------------------------
// toggleProjectFeatured
// ---------------------------------------------------------------------------

export async function toggleProjectFeatured(
  id: string,
  isFeatured: boolean
): Promise<ActionResult<{ id: string; is_featured: boolean }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("projects")
    .update({ is_featured: isFeatured })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("projects", {});
  void logAdminAction({ action: "toggle_featured", entityType: "project", entityId: id, metadata: { is_featured: isFeatured } });
  return { data: { id, is_featured: isFeatured } };
}
