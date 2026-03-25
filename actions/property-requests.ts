"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PropertyRequestStatus = "new" | "reviewing" | "matched" | "closed";

export type PropertyRequestInput = {
  name: string;
  phone?: string;
  email?: string;
  property_type?: string;
  transaction_type?: string;
  city_preference?: string;
  min_price?: number | null;
  max_price?: number | null;
  currency?: string;
  min_area?: number | null;
  rooms_preference?: string;
  notes?: string;
};

export type PropertyRequestRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  property_type: string | null;
  transaction_type: string | null;
  city_preference: string | null;
  min_price: number | null;
  max_price: number | null;
  currency: string | null;
  min_area: number | null;
  rooms_preference: string | null;
  notes: string | null;
  status: PropertyRequestStatus;
  created_at: string;
};

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// requireAdmin helper
// ---------------------------------------------------------------------------

async function requireAdmin(): Promise<
  | { error: null; supabase: Awaited<ReturnType<typeof createClient>> }
  | { error: string; supabase: null }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Giriş yapmanız gerekiyor", supabase: null };
  }

  if (user.user_metadata?.role !== "admin") {
    return { error: "Yetkiniz yok", supabase: null };
  }

  return { error: null, supabase };
}

// ---------------------------------------------------------------------------
// submitPropertyRequest — public, no auth required
// ---------------------------------------------------------------------------

export async function submitPropertyRequest(
  data: PropertyRequestInput
): Promise<ActionResult<{ id: string }>> {
  if (!data.name || data.name.trim().length === 0) {
    return { error: "Ad alanı zorunludur" };
  }

  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from("property_requests")
    .insert({
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      property_type: data.property_type || null,
      transaction_type: data.transaction_type || null,
      city_preference: data.city_preference || null,
      min_price: data.min_price ?? null,
      max_price: data.max_price ?? null,
      currency: data.currency || "GBP",
      min_area: data.min_area ?? null,
      rooms_preference: data.rooms_preference || null,
      notes: data.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: inserted.id } };
}

// ---------------------------------------------------------------------------
// getPropertyRequests — admin only
// ---------------------------------------------------------------------------

export async function getPropertyRequests(): Promise<
  ActionResult<PropertyRequestRow[]>
> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { data, error } = await supabase
    .from("property_requests")
    .select(
      "id, name, phone, email, property_type, transaction_type, city_preference, min_price, max_price, currency, min_area, rooms_preference, notes, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: (data ?? []) as PropertyRequestRow[] };
}

// ---------------------------------------------------------------------------
// updatePropertyRequestStatus — admin only
// ---------------------------------------------------------------------------

export async function updatePropertyRequestStatus(
  id: string,
  status: PropertyRequestStatus
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const valid: PropertyRequestStatus[] = [
    "new",
    "reviewing",
    "matched",
    "closed",
  ];
  if (!valid.includes(status)) {
    return { error: "Geçersiz durum değeri" };
  }

  const { error } = await supabase
    .from("property_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { data: { id } };
}
