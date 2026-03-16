import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ContactRequestsTable } from "@/components/admin/contact-requests-table";

export const metadata: Metadata = {
  title: "İletişim Talepleri",
};

export type ContactRequestRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: string;
  created_at: string;
  property_id: string | null;
  assigned_agent_id: string | null;
  admin_notes: string | null;
  property: { title: string; slug: string } | null;
  assigned_agent: { id: string; name: string } | null;
};

export type AgentOption = {
  id: string;
  name: string;
};

export default async function AdminTaleplerPage() {
  const supabase = await createClient();

  // Simple queries without FK joins to avoid RLS/FK issues
  const [contactResult, agentsResult, propertiesResult] = await Promise.all([
    supabase
      .from("contact_requests")
      .select("id, name, phone, email, message, status, created_at, property_id, assigned_agent_id, admin_notes")
      .order("created_at", { ascending: false }),
    supabase
      .from("agents")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("properties")
      .select("id, title, slug"),
  ]);

  if (contactResult.error) {
    console.error("[talepler] Query error:", contactResult.error.message);
  }

  const rawContacts = contactResult.data ?? [];
  const agents: AgentOption[] = (agentsResult.data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
  }));

  // Build lookup maps
  const propertyMap = new Map(
    (propertiesResult.data ?? []).map((p) => [p.id, { title: p.title, slug: p.slug }])
  );
  const agentMap = new Map(
    agents.map((a) => [a.id, { id: a.id, name: a.name }])
  );

  // Build rows
  const rows: ContactRequestRow[] = rawContacts.map((item) => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email,
    message: item.message,
    status: item.status,
    created_at: item.created_at,
    property_id: item.property_id,
    assigned_agent_id: item.assigned_agent_id,
    admin_notes: item.admin_notes,
    property: item.property_id ? propertyMap.get(item.property_id) ?? null : null,
    assigned_agent: item.assigned_agent_id ? agentMap.get(item.assigned_agent_id) ?? null : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          İletişim Talepleri
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} talep —{" "}
          {rows.filter((r) => r.status === "new").length} yeni
        </p>
      </div>

      <ContactRequestsTable initialData={rows} agents={agents} />
    </div>
  );
}
