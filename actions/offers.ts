"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";
import type { OfferCreateInput, OfferUpdateInput, OfferStatus, CustomOffer } from "@/types/offer";

// ---------------------------------------------------------------------------
// Action return types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

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
// createOffer
// ---------------------------------------------------------------------------

export async function createOffer(
  data: OfferCreateInput
): Promise<ActionResult<CustomOffer>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload: TablesInsert<"custom_offers"> = {
    property_id: data.property_id,
    customer_name: data.customer_name,
    customer_phone: data.customer_phone ?? null,
    customer_email: data.customer_email ?? null,
    offer_price: data.offer_price,
    currency: (data.currency ?? "GBP") as TablesInsert<"custom_offers">["currency"],
    notes: data.notes ?? null,
    expires_at: data.expires_at ?? null,
    created_by: user?.id ?? null,
  };

  const { data: offer, error } = await supabase
    .from("custom_offers")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("offers", {});
  return { data: offer as CustomOffer };
}

// ---------------------------------------------------------------------------
// updateOffer
// ---------------------------------------------------------------------------

export async function updateOffer(
  id: string,
  data: OfferUpdateInput
): Promise<ActionResult<CustomOffer>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const payload: TablesUpdate<"custom_offers"> = {};

  if (data.property_id !== undefined) payload.property_id = data.property_id;
  if (data.customer_name !== undefined) payload.customer_name = data.customer_name;
  if (data.customer_phone !== undefined) payload.customer_phone = data.customer_phone ?? null;
  if (data.customer_email !== undefined) payload.customer_email = data.customer_email ?? null;
  if (data.offer_price !== undefined) payload.offer_price = data.offer_price;
  if (data.currency !== undefined)
    payload.currency = data.currency as TablesUpdate<"custom_offers">["currency"];
  if (data.notes !== undefined) payload.notes = data.notes ?? null;
  if (data.expires_at !== undefined) payload.expires_at = data.expires_at ?? null;
  if (data.status !== undefined)
    payload.status = data.status as TablesUpdate<"custom_offers">["status"];

  const { data: offer, error } = await supabase
    .from("custom_offers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("offers", {});
  return { data: offer as CustomOffer };
}

// ---------------------------------------------------------------------------
// deleteOffer
// ---------------------------------------------------------------------------

export async function deleteOffer(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("custom_offers")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("offers", {});
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// updateOfferStatus
// ---------------------------------------------------------------------------

export async function updateOfferStatus(
  id: string,
  status: OfferStatus
): Promise<ActionResult<CustomOffer>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const now = new Date().toISOString();

  const payload: TablesUpdate<"custom_offers"> = {
    status: status as TablesUpdate<"custom_offers">["status"],
  };

  // Set sent_at when transitioning to 'sent'
  if (status === "sent") {
    payload.sent_at = now;
  }

  // Set responded_at when transitioning to a terminal response state
  if (status === "accepted" || status === "rejected") {
    payload.responded_at = now;
  }

  const { data: offer, error } = await supabase
    .from("custom_offers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("offers", {});
  return { data: offer as CustomOffer };
}
