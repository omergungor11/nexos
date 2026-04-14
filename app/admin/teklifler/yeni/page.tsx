import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ShowcaseForm } from "@/components/admin/showcase-form";
import { getPropertiesForPicker } from "@/lib/queries/showcases";
import { getAgents } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Yeni Teklif",
};

export default async function YeniTeklifPage() {
  const [available, agentsRes] = await Promise.all([
    getPropertiesForPicker(),
    getAgents(),
  ]);

  const agents = (agentsRes.data ?? []).map((a) => ({
    id: a.id as string,
    name: a.name as string,
    phone: (a as { phone?: string | null }).phone ?? null,
  }));

  return (
    <div className="space-y-6">
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
        <h1 className="text-2xl font-bold text-foreground">
          Yeni Teklif Oluştur
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Müşteri bilgilerini ve göndereceğin ilanları seçerek WhatsApp
          paylaşımına hazır bir paket oluştur.
        </p>
      </div>

      <ShowcaseForm
        mode="create"
        availableProperties={available}
        agents={agents}
      />
    </div>
  );
}
