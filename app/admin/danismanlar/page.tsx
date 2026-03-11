import { createClient } from "@/lib/supabase/server";
import {
  AgentDataTable,
  type AdminAgentRow,
} from "@/components/admin/agent-data-table";

export const metadata = {
  title: "Danışmanlar — Admin",
};

export default async function AdminDanismanlarPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, title, phone, email, photo_url, is_active, slug, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Veriler yüklenemedi: {error.message}</p>
      </div>
    );
  }

  const agents = (data ?? []) as AdminAgentRow[];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold">Danışmanlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Emlak danışmanlarını yönetin.
        </p>
      </div>

      {/* Data table */}
      <AgentDataTable initialData={agents} />
    </div>
  );
}
