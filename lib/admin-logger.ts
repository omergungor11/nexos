import { createClient } from "@/lib/supabase/server";

export type AdminAction =
  | "create"
  | "update"
  | "delete"
  | "toggle_status"
  | "toggle_featured"
  | "toggle_published"
  | "workflow_transition"
  | "assign_agent"
  | "bulk_update"
  | "bulk_delete"
  | "duplicate"
  | "toggle_show_on_map"
  | "update_settings"
  | "update_contact_status";

export type EntityType =
  | "property"
  | "agent"
  | "blog_post"
  | "page"
  | "contact_request"
  | "project"
  | "settings";

export async function logAdminAction(params: {
  action: AdminAction;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("admin_activity_log").insert({
      admin_user_id: user?.id ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch {
    // Logging should never break the main flow
    console.error("Failed to log admin action:", params);
  }
}
