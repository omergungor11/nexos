import type { Metadata } from "next";
import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "CMS Sayfalar",
};

type CmsPageRow = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  updated_at: string;
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default async function AdminSayfalarPage() {
  const supabase = await createClient();

  const { data: pages } = await supabase
    .from("cms_pages")
    .select("id, title, slug, is_published, updated_at")
    .order("title", { ascending: true });

  const rows = (pages ?? []) as CmsPageRow[];

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sayfalar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} sayfa — statik içerik yönetimi
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Başlık</th>
              <th className={thClass}>Slug</th>
              <th className={thClass}>Durum</th>
              <th className={thClass}>Son Güncelleme</th>
              <th className={thClass}>İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Henüz CMS sayfası bulunmuyor.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-3 py-2 font-medium">{row.title}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    /{row.slug}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {row.is_published ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDate(row.updated_at)}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/sayfalar/${row.id}`}>
                      <Button variant="ghost" size="icon-sm" aria-label="Düzenle">
                        <PencilIcon className="size-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
