"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
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

  if (!user) return { error: "Giriş yapmanız gerekiyor", supabase: null };
  if (user.user_metadata?.role !== "admin")
    return { error: "Yetkiniz yok", supabase: null };
  return { error: null, supabase };
}

// ---------------------------------------------------------------------------
// getAdminUsers — list users with admin metadata
// Since we can't use supabase.auth.admin in server components without
// service role, we query the agents table as a proxy for admin users
// ---------------------------------------------------------------------------

export async function getAdminUsers(): Promise<ActionResult<AdminUser[]>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // Get agents who are linked to user accounts
  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, email, is_active, created_at, user_id")
    .order("name");

  const users: AdminUser[] = (agents ?? []).map((agent) => ({
    id: agent.id,
    email: agent.email ?? "",
    name: agent.name,
    role: agent.is_active ? "admin" : "inactive",
    created_at: agent.created_at,
    last_sign_in_at: null,
  }));

  return { data: users };
}
