"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationItem = {
  id: string;
  name: string;
  message: string | null;
  created_at: string;
  property_title: string | null;
};

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// getUnreadNotifications
// ---------------------------------------------------------------------------

export async function getUnreadNotifications(): Promise<
  ActionResult<{ items: NotificationItem[]; count: number }>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    return { error: "Yetkiniz yok" };
  }

  // Count new (unread) contact requests
  const { count } = await supabase
    .from("contact_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  // Get latest 5 new requests
  const { data: requests } = await supabase
    .from("contact_requests")
    .select("id, name, message, created_at, property:properties(title)")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(5);

  const items: NotificationItem[] = ((requests ?? []) as unknown[]).map((r) => {
    const row = r as Record<string, unknown>;
    const property = Array.isArray(row.property) ? row.property[0] : row.property;
    return {
      id: row.id as string,
      name: row.name as string,
      message: row.message as string | null,
      created_at: row.created_at as string,
      property_title: property ? (property as { title: string }).title : null,
    };
  });

  return { data: { items, count: count ?? 0 } };
}
