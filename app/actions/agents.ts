"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";
import type { Agent } from "@/types/property";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type AgentInput = {
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  bio?: string;
  photo_url?: string;
  is_active?: boolean;
};

// ---------------------------------------------------------------------------
// Action return types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ü: "u",
    Ü: "u",
    ş: "s",
    Ş: "s",
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
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
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let attempt = 0;

  while (true) {
    let query = supabase
      .from("agents")
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
// createAgent
// ---------------------------------------------------------------------------

export async function createAgent(
  data: AgentInput
): Promise<ActionResult<Agent>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const slug = await generateUniqueSlug(supabase, data.name);

  const payload: TablesInsert<"agents"> = {
    name: data.name,
    slug,
    title: data.title ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    bio: data.bio ?? null,
    photo_url: data.photo_url ?? null,
    is_active: data.is_active ?? true,
  };

  const { data: agent, error } = await supabase
    .from("agents")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("agents", {});
  return { data: agent as Agent };
}

// ---------------------------------------------------------------------------
// updateAgent
// ---------------------------------------------------------------------------

export async function updateAgent(
  id: string,
  data: Partial<AgentInput>
): Promise<ActionResult<Agent>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const payload: TablesUpdate<"agents"> = {};

  if (data.name !== undefined) {
    payload.name = data.name;
    payload.slug = await generateUniqueSlug(supabase, data.name, id);
  }
  if (data.title !== undefined) payload.title = data.title;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.email !== undefined) payload.email = data.email;
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.photo_url !== undefined) payload.photo_url = data.photo_url;
  if (data.is_active !== undefined) payload.is_active = data.is_active;

  const { data: agent, error } = await supabase
    .from("agents")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("agents", {});
  return { data: agent as Agent };
}

// ---------------------------------------------------------------------------
// deleteAgent
// ---------------------------------------------------------------------------

export async function deleteAgent(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase.from("agents").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("agents", {});
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// toggleAgentStatus
// ---------------------------------------------------------------------------

export async function toggleAgentStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ id: string; is_active: boolean }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase
    .from("agents")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("agents", {});
  return { data: { id, is_active: isActive } };
}
