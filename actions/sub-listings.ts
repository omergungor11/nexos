"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import type {
  SubListing,
  SubListingParentType,
  SubListingAvailability,
  Currency,
} from "@/types/property";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

/** Payload for a single sub-listing in an upsert batch.
 *  `id` present → update; missing → insert. */
export interface SubListingInput {
  id?: string;
  label: string;
  description?: string | null;
  property_type?: string | null;
  cover_image?: string | null;
  gallery_images?: string[];
  rooms?: number | null;
  living_rooms?: number | null;
  bathrooms?: number | null;
  room_config?: string | null;
  area_sqm?: number | null;
  gross_area_sqm?: number | null;
  price?: number | null;
  currency?: Currency | null;
  availability?: SubListingAvailability;
  unit_count?: number;
  sort_order: number;
}

const MAX_SUB_LISTINGS = 50;

// ---------------------------------------------------------------------------
// Admin guard (same pattern as property-highlights.ts)
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
// listByParent — fetch all sub-listings for a single parent
// ---------------------------------------------------------------------------

export async function listSubListingsByParent(
  parentType: SubListingParentType,
  parentId: string
): Promise<ActionResult<SubListing[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sub_listings")
    .select("*")
    .eq("parent_type", parentType)
    .eq("parent_id", parentId)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message };
  return { data: (data ?? []) as unknown as SubListing[] };
}

// ---------------------------------------------------------------------------
// upsertMany — diff-based batch upsert for a parent's full sub-listing list
// ---------------------------------------------------------------------------
//
// Strategy:
//   1. Load current rows for the parent
//   2. Delete rows whose id is not in the new payload
//   3. Update rows that have an id (existing)
//   4. Insert rows that lack an id (new)
//
// All run sequentially to keep errors legible; list sizes are small (<50).

export async function upsertSubListings(
  parentType: SubListingParentType,
  parentId: string,
  items: SubListingInput[]
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (items.length > MAX_SUB_LISTINGS) {
    return { error: `En fazla ${MAX_SUB_LISTINGS} alt ilan ekleyebilirsiniz.` };
  }

  // 1. Current rows
  const { data: currentRows, error: fetchError } = await supabase
    .from("sub_listings")
    .select("id")
    .eq("parent_type", parentType)
    .eq("parent_id", parentId);

  if (fetchError) return { error: fetchError.message };

  const currentIds = new Set((currentRows ?? []).map((r) => r.id as string));
  const keptIds = new Set(
    items.filter((i) => i.id).map((i) => i.id as string)
  );

  // 2. Delete removed
  const toDelete = [...currentIds].filter((id) => !keptIds.has(id));
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("sub_listings")
      .delete()
      .in("id", toDelete);
    if (error) return { error: `Silme hatası: ${error.message}` };
  }

  // 3 & 4. Upsert (update existing, insert new)
  for (const item of items) {
    const payload = {
      parent_type: parentType,
      parent_id: parentId,
      label: item.label,
      description: item.description ?? null,
      property_type: item.property_type ?? null,
      cover_image: item.cover_image ?? null,
      gallery_images: item.gallery_images ?? [],
      rooms: item.rooms ?? null,
      living_rooms: item.living_rooms ?? null,
      bathrooms: item.bathrooms ?? null,
      room_config: item.room_config ?? null,
      area_sqm: item.area_sqm ?? null,
      gross_area_sqm: item.gross_area_sqm ?? null,
      price: item.price ?? null,
      currency: item.currency ?? null,
      availability: item.availability ?? "available",
      unit_count: item.unit_count ?? 1,
      sort_order: item.sort_order,
    };

    if (item.id) {
      const { error } = await supabase
        .from("sub_listings")
        .update(payload)
        .eq("id", item.id);
      if (error) return { error: `Güncelleme hatası: ${error.message}` };
    } else {
      const { error } = await supabase.from("sub_listings").insert(payload);
      if (error) return { error: `Ekleme hatası: ${error.message}` };
    }
  }

  // Cache bust
  if (parentType === "property") revalidateTag("properties", {});
  else revalidateTag("projects", {});

  void logAdminAction({
    action: "bulk_update",
    entityType: parentType,
    entityId: parentId,
    metadata: { sub_listings_count: items.length },
  });

  return { data: { count: items.length } };
}

// ---------------------------------------------------------------------------
// deleteSubListing — single-item delete (admin UI trash button)
// ---------------------------------------------------------------------------

export async function deleteSubListing(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase.from("sub_listings").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateTag("properties", {});
  revalidateTag("projects", {});
  return { data: { id } };
}
