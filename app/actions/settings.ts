"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SiteSettingRow = {
  key: string;
  value: string | null;
  label: string | null;
  category: string | null;
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
// updateSettings
// ---------------------------------------------------------------------------

export async function updateSettings(
  settings: Record<string, string>
): Promise<ActionResult<{ updated: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const entries = Object.entries(settings);
  if (entries.length === 0) {
    return { data: { updated: 0 } };
  }

  // Upsert each setting individually to preserve existing metadata (label, category)
  const upsertPayload = entries.map(([key, value]) => ({ key, value }));

  const { error } = await supabase
    .from("site_settings")
    .upsert(upsertPayload, { onConflict: "key" });

  if (error) {
    return { error: error.message };
  }

  revalidateTag("settings", {});
  return { data: { updated: entries.length } };
}
