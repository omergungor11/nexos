"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import type { PropertyWorkflowStatus } from "@/types/property";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

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
// bulkToggleActive
// ---------------------------------------------------------------------------

export async function bulkToggleActive(
  ids: string[],
  isActive: boolean
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (ids.length === 0) return { data: { count: 0 } };

  const { error } = await supabase
    .from("properties")
    .update({ is_active: isActive })
    .in("id", ids);

  if (error) return { error: error.message };

  revalidateTag("properties", {});
  void logAdminAction({ action: "bulk_update", entityType: "property", metadata: { ids, is_active: isActive } });
  return { data: { count: ids.length } };
}

// ---------------------------------------------------------------------------
// bulkUpdateWorkflowStatus
// ---------------------------------------------------------------------------
//
// Transition many properties to the same workflow state. No publish-gate
// validation is applied in bulk — callers should only offer this from an
// admin view where the trade-off is understood (e.g. reopening a batch of
// sold listings). Use the per-row updatePropertyWorkflowStatus when strict
// gating matters.

export async function bulkUpdateWorkflowStatus(
  ids: string[],
  status: PropertyWorkflowStatus
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (ids.length === 0) return { data: { count: 0 } };

  const { error } = await supabase
    .from("properties")
    .update({ workflow_status: status })
    .in("id", ids);

  if (error) return { error: error.message };

  revalidateTag("properties", {});
  void logAdminAction({
    action: "workflow_transition",
    entityType: "property",
    metadata: { ids, workflow_status: status },
  });
  return { data: { count: ids.length } };
}

// ---------------------------------------------------------------------------
// bulkDelete
// ---------------------------------------------------------------------------

export async function bulkDelete(
  ids: string[]
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (ids.length === 0) return { data: { count: 0 } };

  const { error } = await supabase
    .from("properties")
    .delete()
    .in("id", ids);

  if (error) return { error: error.message };

  revalidateTag("properties", {});
  void logAdminAction({ action: "bulk_delete", entityType: "property", metadata: { ids } });
  return { data: { count: ids.length } };
}

// ---------------------------------------------------------------------------
// bulkAssignAgent
// ---------------------------------------------------------------------------

export async function bulkAssignAgent(
  ids: string[],
  agentId: string | null
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (ids.length === 0) return { data: { count: 0 } };

  const { error } = await supabase
    .from("properties")
    .update({ agent_id: agentId })
    .in("id", ids);

  if (error) return { error: error.message };

  revalidateTag("properties", {});
  void logAdminAction({ action: "assign_agent", entityType: "property", metadata: { ids, agent_id: agentId } });
  return { data: { count: ids.length } };
}

// ---------------------------------------------------------------------------
// bulkToggleFeatured
// ---------------------------------------------------------------------------

export async function bulkToggleFeatured(
  ids: string[],
  isFeatured: boolean
): Promise<ActionResult<{ count: number }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (ids.length === 0) return { data: { count: 0 } };

  const { error } = await supabase
    .from("properties")
    .update({ is_featured: isFeatured })
    .in("id", ids);

  if (error) return { error: error.message };

  revalidateTag("properties", {});
  void logAdminAction({ action: "bulk_update", entityType: "property", metadata: { ids, is_featured: isFeatured } });
  return { data: { count: ids.length } };
}
