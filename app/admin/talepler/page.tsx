import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ContactRequestsTable } from "@/components/admin/contact-requests-table";

export const metadata: Metadata = {
  title: "İletişim Talepleri",
};

type RawContactRow = {
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
  property:
    | { title: string; slug: string }[]
    | { title: string; slug: string }
    | null;
  assigned_agent:
    | { id: string; name: string }[]
    | { id: string; name: string }
    | null;
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

  const [{ data: raw }, { data: agentsRaw }] = await Promise.all([
    supabase
      .from("contact_requests")
      .select(
        "id, name, phone, email, message, status, created_at, property_id, assigned_agent_id, admin_notes, property:properties(title, slug), assigned_agent:agents!contact_requests_assigned_agent_id_fkey(id, name)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("agents")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  // Normalize nested joins
  const rows: ContactRequestRow[] = ((raw ?? []) as RawContactRow[]).map(
    (item) => {
      const rawProperty = item.property;
      const normalizedProperty = Array.isArray(rawProperty)
        ? (rawProperty[0] as { title: string; slug: string } | undefined) ?? null
        : (rawProperty as { title: string; slug: string } | null);

      const rawAgent = item.assigned_agent;
      const normalizedAgent = Array.isArray(rawAgent)
        ? (rawAgent[0] as { id: string; name: string } | undefined) ?? null
        : (rawAgent as { id: string; name: string } | null);

      return {
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
        property: normalizedProperty,
        assigned_agent: normalizedAgent,
      };
    }
  );

  const agents: AgentOption[] = (agentsRaw ?? []).map((a) => ({
    id: a.id,
    name: a.name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          İletişim Talepleri
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} talep —{" "}
          {rows.filter((r) => r.status === "new").length} yeni
        </p>
      </div>

      {/* Table with filters */}
      <ContactRequestsTable initialData={rows} agents={agents} />
    </div>
  );
}
