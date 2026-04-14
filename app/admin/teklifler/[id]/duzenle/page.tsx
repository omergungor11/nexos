import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowcaseForm } from "@/components/admin/showcase-form";
import { ShowcaseLinkActions } from "@/components/admin/showcase-link-actions";
import {
  getShowcaseById,
  getPropertiesForPicker,
} from "@/lib/queries/showcases";
import { getAgents } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Teklif Düzenle",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeklifDuzenlePage({ params }: Props) {
  const { id } = await params;

  const [showcaseRes, available, agentsRes] = await Promise.all([
    getShowcaseById(id),
    getPropertiesForPicker(),
    getAgents(),
  ]);

  if (!showcaseRes.data) notFound();
  const showcase = showcaseRes.data;

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

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teklif Düzenle</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {showcase.customer_name} — {showcase.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/teklif/${showcase.slug}`}
            target="_blank"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Eye className="size-3.5" />
            Önizle
          </Link>
          <ShowcaseLinkActions
            slug={showcase.slug}
            customerName={showcase.customer_name}
            customerPhone={showcase.customer_phone}
            title={showcase.title}
          />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Görüntülenme" value={`${showcase.view_count}`} />
        <Stat
          label="İlk Görüntüleme"
          value={
            showcase.first_viewed_at
              ? new Intl.DateTimeFormat("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(showcase.first_viewed_at))
              : "—"
          }
        />
        <Stat
          label="Son Görüntüleme"
          value={
            showcase.last_viewed_at
              ? new Intl.DateTimeFormat("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(showcase.last_viewed_at))
              : "—"
          }
        />
        <Stat label="İlan Sayısı" value={`${showcase.property_ids.length}`} />
      </div>

      <ShowcaseForm
        mode="edit"
        availableProperties={available}
        agents={agents}
        initial={{
          id: showcase.id,
          slug: showcase.slug,
          title: showcase.title,
          description: showcase.description,
          customer_name: showcase.customer_name,
          customer_phone: showcase.customer_phone,
          agent_id: showcase.agent_id,
          expires_at: showcase.expires_at,
          property_ids: showcase.property_ids,
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold">{value}</p>
    </div>
  );
}
