import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { OfferDataTable } from "@/components/admin/offer-data-table";

export const metadata: Metadata = {
  title: "Teklifler",
};

export default async function AdminTekliflerPage() {
  const supabase = await createClient();

  const { data: offers } = await supabase
    .from("custom_offers")
    .select("*, property:properties(id, title, slug, price, currency)")
    .order("created_at", { ascending: false });

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, price, currency")
    .eq("is_active", true)
    .order("title");

  const offerRows = (offers ?? []) as Parameters<
    typeof OfferDataTable
  >[0]["offers"];
  const propertyOptions = (properties ?? []) as Parameters<
    typeof OfferDataTable
  >[0]["properties"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teklifler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {offerRows.length} teklif — müşterilere özel fiyat teklifleri
          </p>
        </div>
        <Link href="/admin/teklifler/yeni">
          <Button>
            <Plus className="size-4" />
            Yeni Teklif
          </Button>
        </Link>
      </div>

      {/* Table */}
      <OfferDataTable offers={offerRows} properties={propertyOptions} />
    </div>
  );
}
