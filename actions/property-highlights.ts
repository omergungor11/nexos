"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import type { TablesUpdate } from "@/types/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HighlightFlag = "slider" | "featured" | "showcase" | "deal";

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

const FLAG_COLUMN: Record<HighlightFlag, keyof TablesUpdate<"properties">> = {
  slider: "is_slider",
  featured: "is_featured",
  showcase: "is_showcase",
  deal: "is_deal",
};

const ORDER_COLUMN: Record<HighlightFlag, keyof TablesUpdate<"properties">> = {
  slider: "slider_order",
  featured: "featured_order",
  showcase: "showcase_order",
  deal: "deal_order",
};

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
// toggleHighlight — flip a single flag on a single property
// ---------------------------------------------------------------------------
//
// When adding to a list, the property is appended at the end (order =
// current max + 1). When removing, the order column is cleared so gaps don't
// linger. reorderHighlight compresses them anyway on the next drag.

export async function toggleHighlight(
  id: string,
  flag: HighlightFlag,
  value: boolean
): Promise<ActionResult<{ id: string; flag: HighlightFlag; value: boolean }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? "Kimlik doğrulama hatası" };

  const flagCol = FLAG_COLUMN[flag];
  const orderCol = ORDER_COLUMN[flag];

  let nextOrder: number | null = null;
  if (value) {
    // Append at the end of the current ordered list.
    const { data: maxRow } = await supabase
      .from("properties")
      .select(orderCol as string)
      .eq(flagCol as string, true)
      .order(orderCol as string, { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    const current = (maxRow as Record<string, number | null> | null)?.[
      orderCol as string
    ];
    nextOrder = (current ?? -1) + 1;
  }

  const payload: TablesUpdate<"properties"> = {
    [flagCol]: value,
    [orderCol]: nextOrder,
  } as TablesUpdate<"properties">;

  const { error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateTag("properties", {});
  void logAdminAction({
    action: "bulk_update",
    entityType: "property",
    entityId: id,
    metadata: { highlight: flag, value },
  });
  return { data: { id, flag, value } };
}

// ---------------------------------------------------------------------------
// reorderHighlight — rewrites the order column for a given flag to match the
// caller-supplied list.
// ---------------------------------------------------------------------------
//
// Updates run in parallel. Any id not in the list is left alone (its flag
// and order stay as they were, so "removed from list" should go through
// toggleHighlight first).

export async function reorderHighlight(
  flag: HighlightFlag,
  orderedIds: string[]
): Promise<ActionResult<{ flag: HighlightFlag; count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? "Kimlik doğrulama hatası" };

  if (orderedIds.length === 0) return { data: { flag, count: 0 } };

  const orderCol = ORDER_COLUMN[flag];

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("properties")
      .update({ [orderCol]: index } as TablesUpdate<"properties">)
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return { error: `Sıralama güncellenemedi: ${firstError.error.message}` };
  }

  revalidateTag("properties", {});
  void logAdminAction({
    action: "bulk_update",
    entityType: "property",
    metadata: { highlight: flag, reordered: orderedIds.length },
  });
  return { data: { flag, count: orderedIds.length } };
}

// ---------------------------------------------------------------------------
// getHighlightedProperties — used by the admin page to populate every tab in
// one round-trip. Returns a flat list with all four order fields and flags,
// the caller filters per tab client-side.
// ---------------------------------------------------------------------------

export async function getHighlightedProperties(): Promise<
  ActionResult<
    Array<{
      id: string;
      listing_number: number;
      slug: string;
      title: string;
      price: number | null;
      currency: string;
      type: string;
      transaction_type: string;
      city_name: string;
      district_name: string | null;
      cover_image: string | null;
      is_slider: boolean;
      is_featured: boolean;
      is_showcase: boolean;
      is_deal: boolean;
      slider_order: number | null;
      featured_order: number | null;
      showcase_order: number | null;
      deal_order: number | null;
    }>
  >
> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? "Kimlik doğrulama hatası" };

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id, listing_number, slug, title, price, currency, type, transaction_type,
      is_slider, is_featured, is_showcase, is_deal,
      slider_order, featured_order, showcase_order, deal_order,
      city:cities(name),
      district:districts(name),
      images:property_images(url, is_cover)
      `
    )
    .eq("is_active", true)
    .or("is_slider.eq.true,is_featured.eq.true,is_showcase.eq.true,is_deal.eq.true");

  if (error) return { error: error.message };

  type Raw = {
    id: string;
    listing_number: number;
    slug: string;
    title: string;
    price: number | null;
    currency: string;
    type: string;
    transaction_type: string;
    is_slider: boolean;
    is_featured: boolean;
    is_showcase: boolean;
    is_deal: boolean;
    slider_order: number | null;
    featured_order: number | null;
    showcase_order: number | null;
    deal_order: number | null;
    city: { name: string } | null;
    district: { name: string } | null;
    images: { url: string; is_cover: boolean }[] | null;
  };

  const rows = (data ?? []) as unknown as Raw[];
  return {
    data: rows.map((r) => ({
      id: r.id,
      listing_number: r.listing_number,
      slug: r.slug,
      title: r.title,
      price: r.price,
      currency: r.currency,
      type: r.type,
      transaction_type: r.transaction_type,
      is_slider: r.is_slider,
      is_featured: r.is_featured,
      is_showcase: r.is_showcase,
      is_deal: r.is_deal,
      slider_order: r.slider_order,
      featured_order: r.featured_order,
      showcase_order: r.showcase_order,
      deal_order: r.deal_order,
      city_name: r.city?.name ?? "",
      district_name: r.district?.name ?? null,
      cover_image:
        (r.images ?? []).find((i) => i.is_cover)?.url ??
        (r.images ?? [])[0]?.url ??
        null,
    })),
  };
}

// ---------------------------------------------------------------------------
// searchAvailableProperties — used by the "İlan Ekle" modal. Returns active
// listings matching `q` (title or listing_number). Caller decides which flag
// is being added.
// ---------------------------------------------------------------------------

export async function searchAvailableProperties(
  q: string,
  limit = 20
): Promise<
  ActionResult<
    Array<{
      id: string;
      listing_number: number;
      title: string;
      price: number | null;
      currency: string;
      cover_image: string | null;
      city_name: string;
    }>
  >
> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? "Kimlik doğrulama hatası" };

  const query = supabase
    .from("properties")
    .select(
      `
      id, listing_number, title, price, currency,
      city:cities(name),
      images:property_images(url, is_cover)
      `
    )
    .eq("is_active", true)
    .limit(limit)
    .order("listing_number", { ascending: false });

  const trimmed = q.trim();
  const { data, error } = trimmed
    ? await query.or(`title.ilike.%${trimmed}%,listing_number.eq.${Number(trimmed) || 0}`)
    : await query;

  if (error) return { error: error.message };

  type Raw = {
    id: string;
    listing_number: number;
    title: string;
    price: number | null;
    currency: string;
    city: { name: string } | null;
    images: { url: string; is_cover: boolean }[] | null;
  };

  const rows = (data ?? []) as unknown as Raw[];
  return {
    data: rows.map((r) => ({
      id: r.id,
      listing_number: r.listing_number,
      title: r.title,
      price: r.price,
      currency: r.currency,
      city_name: r.city?.name ?? "",
      cover_image:
        (r.images ?? []).find((i) => i.is_cover)?.url ??
        (r.images ?? [])[0]?.url ??
        null,
    })),
  };
}
