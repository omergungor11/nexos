"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import type { FloorPlan, FloorPlanParentType } from "@/types/property";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

export interface FloorPlanInput {
  id?: string;
  url: string;
  alt_text?: string | null;
  label: string;
  area_sqm?: number | null;
  rooms?: number | null;
  sort_order: number;
}

const MAX_FLOOR_PLANS_PER_PARENT = 20;

// ---------------------------------------------------------------------------
// Admin guard
// ---------------------------------------------------------------------------

type AdminGuard =
  | { error: null; supabase: Awaited<ReturnType<typeof createClient>> }
  | { error: string; supabase: null };

async function requireAdmin(): Promise<AdminGuard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmanız gerekiyor", supabase: null };
  if (user.user_metadata?.role !== "admin") {
    return { error: "Yetkiniz yok", supabase: null };
  }
  return { error: null, supabase };
}

// ---------------------------------------------------------------------------
// listByParent
// ---------------------------------------------------------------------------

export async function listFloorPlansByParent(
  parentType: FloorPlanParentType,
  parentId: string
): Promise<ActionResult<FloorPlan[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("floor_plans")
    .select("*")
    .eq("parent_type", parentType)
    .eq("parent_id", parentId)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message };
  return { data: (data ?? []) as unknown as FloorPlan[] };
}

// ---------------------------------------------------------------------------
// listByParentIds — batch fetcher for a set of parents of the same type.
// Used on the public detail page to grab every sub-listing's plans in one
// query without N+1 round-trips.
// ---------------------------------------------------------------------------

export async function listFloorPlansByParentIds(
  parentType: FloorPlanParentType,
  parentIds: string[]
): Promise<ActionResult<FloorPlan[]>> {
  if (parentIds.length === 0) return { data: [] };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("floor_plans")
    .select("*")
    .eq("parent_type", parentType)
    .in("parent_id", parentIds)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message };
  return { data: (data ?? []) as unknown as FloorPlan[] };
}

// ---------------------------------------------------------------------------
// upsertMany — same diff strategy as sub-listings
// ---------------------------------------------------------------------------

export async function upsertFloorPlans(
  parentType: FloorPlanParentType,
  parentId: string,
  items: FloorPlanInput[]
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (items.length > MAX_FLOOR_PLANS_PER_PARENT) {
    return { error: `En fazla ${MAX_FLOOR_PLANS_PER_PARENT} kat planı ekleyebilirsiniz.` };
  }

  const { data: currentRows, error: fetchError } = await supabase
    .from("floor_plans")
    .select("id")
    .eq("parent_type", parentType)
    .eq("parent_id", parentId);

  if (fetchError) return { error: fetchError.message };

  const currentIds = new Set((currentRows ?? []).map((r) => r.id as string));
  const keptIds = new Set(items.filter((i) => i.id).map((i) => i.id as string));

  const toDelete = [...currentIds].filter((id) => !keptIds.has(id));
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("floor_plans")
      .delete()
      .in("id", toDelete);
    if (error) return { error: `Silme hatası: ${error.message}` };
  }

  for (const item of items) {
    const payload = {
      parent_type: parentType,
      parent_id: parentId,
      url: item.url,
      alt_text: item.alt_text ?? null,
      label: item.label,
      area_sqm: item.area_sqm ?? null,
      rooms: item.rooms ?? null,
      sort_order: item.sort_order,
    };

    if (item.id) {
      const { error } = await supabase
        .from("floor_plans")
        .update(payload)
        .eq("id", item.id);
      if (error) return { error: `Güncelleme hatası: ${error.message}` };
    } else {
      const { error } = await supabase.from("floor_plans").insert(payload);
      if (error) return { error: `Ekleme hatası: ${error.message}` };
    }
  }

  if (parentType === "property") revalidateTag("properties", {});
  else if (parentType === "project") revalidateTag("projects", {});

  void logAdminAction({
    action: "bulk_update",
    entityType: parentType === "sub_listing" ? "property" : parentType,
    entityId: parentId,
    metadata: { floor_plans_count: items.length },
  });

  return { data: { count: items.length } };
}

// ---------------------------------------------------------------------------
// deleteFloorPlan — single-item delete
// ---------------------------------------------------------------------------

export async function deleteFloorPlan(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase.from("floor_plans").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateTag("properties", {});
  revalidateTag("projects", {});
  return { data: { id } };
}
