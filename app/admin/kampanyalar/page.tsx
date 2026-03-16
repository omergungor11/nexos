import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LandingPageTable } from "@/components/admin/landing-page-table";

export const metadata: Metadata = {
  title: "Kampanya Sayfaları",
};

export default async function AdminKampanyalarPage() {
  const supabase = await createClient();

  const { data: pages } = await supabase
    .from("landing_pages")
    .select("id, title, slug, is_published, views_count, created_at")
    .order("created_at", { ascending: false });

  const rows = (pages ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    views_count: number;
    created_at: string;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kampanya Sayfaları</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} sayfa — {rows.filter((r) => r.is_published).length} yayında
          </p>
        </div>
        <Link href="/admin/kampanyalar/yeni">
          <Button>
            <Plus className="size-4" />
            Yeni Kampanya
          </Button>
        </Link>
      </div>

      <LandingPageTable initialData={rows} />
    </div>
  );
}
