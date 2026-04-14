import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowcaseDataTable } from "@/components/admin/showcase-data-table";
import { getShowcases } from "@/lib/queries/showcases";

export const metadata: Metadata = {
  title: "Teklifler",
};

export default async function AdminTekliflerPage() {
  const { data: rows, error } = await getShowcases();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teklifler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} teklif — müşterilere WhatsApp ile gönderilen ilan
            paketleri
          </p>
        </div>
        <Link href="/admin/teklifler/yeni">
          <Button>
            <Plus className="size-4" />
            Yeni Teklif
          </Button>
        </Link>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Veriler yüklenirken bir hata oluştu: {error}
        </p>
      )}

      <ShowcaseDataTable rows={rows} />
    </div>
  );
}
