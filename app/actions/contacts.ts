"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContactStatus = "new" | "in_progress" | "resolved" | "spam";

export type ContactRequestRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: ContactStatus;
  created_at: string;
  property_id: string | null;
  property: { title: string; slug: string } | null;
};

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// getContactRequests
// ---------------------------------------------------------------------------

export async function getContactRequests(
  status?: string
): Promise<ActionResult<ContactRequestRow[]>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  let query = supabase
    .from("contact_requests")
    .select(
      "id, name, phone, email, message, status, created_at, property_id, property:properties(title, slug)"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  // Normalize nested property join (Supabase returns array for one-to-many)
  const rows = ((data ?? []) as unknown[]).map((item) => {
    const row = item as Record<string, unknown>;
    const rawProperty = row.property;
    const normalizedProperty = Array.isArray(rawProperty)
      ? (rawProperty[0] as { title: string; slug: string } | undefined) ?? null
      : (rawProperty as { title: string; slug: string } | null);

    return {
      ...row,
      property: normalizedProperty,
    } as ContactRequestRow;
  });

  return { data: rows };
}

// ---------------------------------------------------------------------------
// updateContactStatus
// ---------------------------------------------------------------------------

export async function updateContactStatus(
  id: string,
  status: string
): Promise<ActionResult<{ id: string; status: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const validStatuses: ContactStatus[] = [
    "new",
    "in_progress",
    "resolved",
    "spam",
  ];
  if (!validStatuses.includes(status as ContactStatus)) {
    return { error: "Geçersiz durum değeri" };
  }

  const { error } = await supabase
    .from("contact_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("contacts", {});
  return { data: { id, status } };
}
