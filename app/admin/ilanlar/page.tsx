import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  PropertyDataTable,
  type AdminPropertyRow,
} from "@/components/admin/property-data-table";

export const metadata = {
  title: "İlanlar — Admin",
};

export default async function AdminIlanlarPage() {
  const supabase = await createClient();

  const [{ data, error }, { data: agentsData }] = await Promise.all([
    supabase
      .from("properties")
      .select(
        `
        id, slug, title, price, currency, type, transaction_type, status,
        is_active, is_featured, views_count, created_at,
        city:cities(name),
        district:districts(name),
        images:property_images(url, is_cover),
        agent:agents(id, name)
      `
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("agents")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Veriler yüklenemedi: {error.message}</p>
      </div>
    );
  }

  const properties = (data ?? []) as unknown as AdminPropertyRow[];
  const agents = (agentsData ?? []) as Array<{ id: string; name: string }>;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">İlanlar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tüm emlak ilanlarını yönetin.
          </p>
        </div>
        <Link
          href="/admin/ilanlar/yeni"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <PlusIcon className="size-4" />
          Yeni İlan
        </Link>
      </div>

      {/* Data table */}
      <PropertyDataTable initialData={properties} agents={agents} />
    </div>
  );
}
