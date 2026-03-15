import type { Metadata } from "next";
import { Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  ActivityLog,
  type ActivityLogRow,
} from "@/components/admin/activity-log";

export const metadata: Metadata = {
  title: "Aktivite Kaydı",
};

export default async function AdminAktivitePage() {
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("admin_activity_log")
    .select("id, admin_user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows: ActivityLogRow[] = ((raw ?? []) as unknown[]).map((item) => {
    const r = item as Record<string, unknown>;
    return {
      id: r.id as number,
      admin_user_id: (r.admin_user_id as string) ?? null,
      action: r.action as string,
      entity_type: r.entity_type as string,
      entity_id: (r.entity_id as string) ?? null,
      metadata: (r.metadata as Record<string, unknown>) ?? {},
      created_at: r.created_at as string,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-700">
          <Activity className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aktivite Kaydı</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Admin panelinde gerçekleştirilen işlemlerin kaydı
          </p>
        </div>
      </div>

      <ActivityLog initialData={rows} />
    </div>
  );
}
