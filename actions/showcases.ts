"use server";

import { revalidateTag } from "next/cache";
import { customAlphabet } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import type {
  PropertyShowcase,
  ShowcaseBulkCreateInput,
  ShowcaseCreateInput,
  ShowcaseUpdateInput,
} from "@/types/showcase";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// 10-char alphanumeric (no look-alikes) → 36^10 ≈ 3.7e15 combinations.
// Avoids 0/O/1/I/l confusion when read aloud.
const SLUG_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const SLUG_LENGTH = 10;
const generateSlug = customAlphabet(SLUG_ALPHABET, SLUG_LENGTH);

const MAX_PROPERTIES_PER_SHOWCASE = 30;

type AdminGuard =
  | { error: null; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { error: string; supabase: null; userId: null };

async function requireAdmin(): Promise<AdminGuard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { error: "Giriş yapmanız gerekiyor", supabase: null, userId: null };
  if (user.user_metadata?.role !== "admin")
    return { error: "Yetkiniz yok", supabase: null, userId: null };
  return { error: null, supabase, userId: user.id };
}

function bust() {
  revalidateTag("showcases", {});
}

// ---------------------------------------------------------------------------
// createShowcase — slug + items in one logical operation
// ---------------------------------------------------------------------------

export async function createShowcase(
  input: ShowcaseCreateInput
): Promise<ActionResult<PropertyShowcase>> {
  const { error: authError, supabase, userId } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (!input.title.trim()) return { error: "Başlık zorunludur." };
  if (!input.customer_name.trim()) return { error: "Müşteri adı zorunludur." };
  if (!input.customer_phone.trim()) return { error: "Telefon zorunludur." };
  if (input.property_ids.length === 0)
    return { error: "En az bir ilan seçmelisiniz." };
  if (input.property_ids.length > MAX_PROPERTIES_PER_SHOWCASE) {
    return {
      error: `En fazla ${MAX_PROPERTIES_PER_SHOWCASE} ilan eklenebilir.`,
    };
  }

  // Slug — best-effort uniqueness; nanoid collision over 36^10 is astronomical
  // but the unique constraint will catch it if it ever happens.
  const slug = generateSlug();

  const { data: showcaseRow, error: createErr } = await supabase
    .from("property_showcases")
    .insert({
      slug,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      customer_name: input.customer_name.trim(),
      customer_phone: input.customer_phone.trim(),
      agent_id: input.agent_id ?? null,
      created_by: userId,
      expires_at: input.expires_at ?? null,
    })
    .select()
    .single();

  if (createErr || !showcaseRow) {
    return { error: createErr?.message ?? "Teklif oluşturulamadı." };
  }

  const showcase = showcaseRow as unknown as PropertyShowcase;

  // Insert items in submitted order
  const itemRows = input.property_ids.map((pid, index) => ({
    showcase_id: showcase.id,
    property_id: pid,
    sort_order: index,
  }));

  const { error: itemsErr } = await supabase
    .from("property_showcase_items")
    .insert(itemRows);

  if (itemsErr) {
    // Rollback the showcase to keep things consistent
    await supabase.from("property_showcases").delete().eq("id", showcase.id);
    return { error: `İlanlar eklenemedi: ${itemsErr.message}` };
  }

  bust();
  void logAdminAction({
    action: "bulk_update",
    entityType: "property",
    metadata: {
      showcase_id: showcase.id,
      property_count: input.property_ids.length,
    },
  });

  return { data: showcase };
}

// ---------------------------------------------------------------------------
// createShowcasesBulk — one payload, N recipients, N rows with unique slugs.
// Rolls back all inserted rows if item-link inserts fail for any of them,
// so a half-created batch never ends up in the DB.
// ---------------------------------------------------------------------------

const MAX_RECIPIENTS_PER_BULK = 50;

export async function createShowcasesBulk(
  input: ShowcaseBulkCreateInput
): Promise<ActionResult<PropertyShowcase[]>> {
  const { error: authError, supabase, userId } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (!input.title.trim()) return { error: "Başlık zorunludur." };
  if (input.property_ids.length === 0)
    return { error: "En az bir ilan seçmelisiniz." };
  if (input.property_ids.length > MAX_PROPERTIES_PER_SHOWCASE) {
    return {
      error: `En fazla ${MAX_PROPERTIES_PER_SHOWCASE} ilan eklenebilir.`,
    };
  }
  if (!input.recipients.length)
    return { error: "En az bir müşteri eklemelisiniz." };
  if (input.recipients.length > MAX_RECIPIENTS_PER_BULK) {
    return {
      error: `Tek seferde en fazla ${MAX_RECIPIENTS_PER_BULK} müşteri eklenebilir.`,
    };
  }

  const cleaned = input.recipients.map((r) => ({
    customer_name: r.customer_name.trim(),
    customer_phone: r.customer_phone.trim(),
  }));

  for (const r of cleaned) {
    if (!r.customer_name) return { error: "Tüm müşterilerin adı dolu olmalı." };
    if (!r.customer_phone)
      return { error: "Tüm müşterilerin telefonu dolu olmalı." };
  }

  const titleTrim = input.title.trim();
  const descriptionTrim = input.description?.trim() || null;

  const rowsToInsert = cleaned.map((r) => ({
    slug: generateSlug(),
    title: titleTrim,
    description: descriptionTrim,
    customer_name: r.customer_name,
    customer_phone: r.customer_phone,
    agent_id: input.agent_id ?? null,
    created_by: userId,
    expires_at: input.expires_at ?? null,
  }));

  const { data: createdRows, error: createErr } = await supabase
    .from("property_showcases")
    .insert(rowsToInsert)
    .select();

  if (createErr || !createdRows) {
    return { error: createErr?.message ?? "Teklifler oluşturulamadı." };
  }

  const showcases = createdRows as unknown as PropertyShowcase[];

  // Fan out property_showcase_items for every created showcase.
  const itemRows = showcases.flatMap((s) =>
    input.property_ids.map((pid, index) => ({
      showcase_id: s.id,
      property_id: pid,
      sort_order: index,
    }))
  );

  const { error: itemsErr } = await supabase
    .from("property_showcase_items")
    .insert(itemRows);

  if (itemsErr) {
    await supabase
      .from("property_showcases")
      .delete()
      .in(
        "id",
        showcases.map((s) => s.id)
      );
    return { error: `İlanlar eklenemedi: ${itemsErr.message}` };
  }

  bust();
  void logAdminAction({
    action: "bulk_update",
    entityType: "property",
    metadata: {
      showcase_ids: showcases.map((s) => s.id),
      recipient_count: showcases.length,
      property_count: input.property_ids.length,
    },
  });

  return { data: showcases };
}

// ---------------------------------------------------------------------------
// updateShowcase — patch fields + diff items if property_ids supplied
// ---------------------------------------------------------------------------

export async function updateShowcase(
  id: string,
  input: ShowcaseUpdateInput
): Promise<ActionResult<PropertyShowcase>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (
    input.property_ids &&
    input.property_ids.length > MAX_PROPERTIES_PER_SHOWCASE
  ) {
    return {
      error: `En fazla ${MAX_PROPERTIES_PER_SHOWCASE} ilan eklenebilir.`,
    };
  }

  const updatePayload: Record<string, unknown> = {};
  if (input.title !== undefined) updatePayload.title = input.title.trim();
  if (input.description !== undefined)
    updatePayload.description = input.description?.trim() || null;
  if (input.customer_name !== undefined)
    updatePayload.customer_name = input.customer_name.trim();
  if (input.customer_phone !== undefined)
    updatePayload.customer_phone = input.customer_phone.trim();
  if (input.agent_id !== undefined) updatePayload.agent_id = input.agent_id;
  if (input.expires_at !== undefined) updatePayload.expires_at = input.expires_at;
  if (input.is_archived !== undefined)
    updatePayload.is_archived = input.is_archived;

  const { data: updatedRow, error: updateErr } = await supabase
    .from("property_showcases")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (updateErr || !updatedRow) {
    return { error: updateErr?.message ?? "Güncelleme başarısız." };
  }

  // Sync items if a new list was supplied. Simple strategy: nuke + reinsert.
  if (input.property_ids) {
    const { error: delErr } = await supabase
      .from("property_showcase_items")
      .delete()
      .eq("showcase_id", id);
    if (delErr) return { error: `Eski ilanlar silinemedi: ${delErr.message}` };

    if (input.property_ids.length > 0) {
      const itemRows = input.property_ids.map((pid, index) => ({
        showcase_id: id,
        property_id: pid,
        sort_order: index,
      }));
      const { error: insErr } = await supabase
        .from("property_showcase_items")
        .insert(itemRows);
      if (insErr) return { error: `İlanlar eklenemedi: ${insErr.message}` };
    }
  }

  bust();
  void logAdminAction({
    action: "bulk_update",
    entityType: "property",
    metadata: {
      showcase_id: id,
      property_count: input.property_ids?.length,
    },
  });

  return { data: updatedRow as unknown as PropertyShowcase };
}

// ---------------------------------------------------------------------------
// archiveShowcase — soft hide (public 404, list filter)
// ---------------------------------------------------------------------------

export async function archiveShowcase(
  id: string,
  archived = true
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }
  const { error } = await supabase
    .from("property_showcases")
    .update({ is_archived: archived })
    .eq("id", id);
  if (error) return { error: error.message };
  bust();
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// deleteShowcase — hard delete (cascades to items)
// ---------------------------------------------------------------------------

export async function deleteShowcase(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }
  const { error } = await supabase
    .from("property_showcases")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  bust();
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// trackShowcaseView — anon-callable RPC bump
// ---------------------------------------------------------------------------

export async function trackShowcaseView(
  slug: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_showcase_view", {
    p_slug: slug,
  });
  if (error) return { error: error.message };
  return { data: null };
}
