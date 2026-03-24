import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OfferForm } from "@/components/admin/offer-form";

export const metadata: Metadata = {
  title: "Yeni Teklif",
};

export default async function YeniTeklifPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, price, currency")
    .eq("is_active", true)
    .order("title");

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/teklifler"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Teklifler
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Yeni Teklif Oluştur</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Müşteriye özel bir fiyat teklifi oluşturun.
        </p>
      </div>

      <OfferForm properties={properties ?? []} />
    </div>
  );
}
