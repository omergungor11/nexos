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
  property:
    | { title: string; slug: string }[]
    | { title: string; slug: string }
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
  property: { title: string; slug: string } | null;
};

export default async function AdminTaleplerPage() {
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("contact_requests")
    .select(
      "id, name, phone, email, message, status, created_at, property_id, property:properties(title, slug)"
    )
    .order("created_at", { ascending: false });

  // Normalize nested join (Supabase may return array for FK relations)
  const rows: ContactRequestRow[] = ((raw ?? []) as RawContactRow[]).map(
    (item) => {
      const rawProperty = item.property;
      const normalizedProperty = Array.isArray(rawProperty)
        ? (rawProperty[0] as { title: string; slug: string } | undefined) ??
          null
        : (rawProperty as { title: string; slug: string } | null);

      return {
        id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        message: item.message,
        status: item.status,
        created_at: item.created_at,
        property_id: item.property_id,
        property: normalizedProperty,
      };
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          İletişim Talepleri
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {rows.length} talep —{" "}
          {rows.filter((r) => r.status === "new").length} yeni
        </p>
      </div>

      {/* Table with filters */}
      <ContactRequestsTable initialData={rows} />
    </div>
  );
}
