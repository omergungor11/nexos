"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteLandingPage, updateLandingPage } from "@/actions/landing-pages";

type LandingPageRow = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function LandingPageTable({ initialData }: { initialData: LandingPageRow[] }) {
  const [rows, setRows] = useState(initialData);
  const [, startTransition] = useTransition();

  function handleTogglePublish(id: string, current: boolean) {
    startTransition(async () => {
      const result = await updateLandingPage(id, { is_published: !current });
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_published: !current } : r))
        );
        toast.success(!current ? "Yayınlandı" : "Yayından kaldırıldı");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Bu kampanya sayfası silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteLandingPage(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) => prev.filter((r) => r.id !== id));
        toast.success("Kampanya sayfası silindi.");
      }
    });
  }

  const thClass = "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className={thClass}>Başlık</th>
            <th className={thClass}>Slug</th>
            <th className={thClass}>Durum</th>
            <th className={thClass}>Görüntülenme</th>
            <th className={thClass}>Tarih</th>
            <th className={thClass}>İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                Henüz kampanya sayfası oluşturulmamış.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-medium">{row.title}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  /kampanya/{row.slug}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={row.is_published ? "default" : "secondary"}>
                    {row.is_published ? "Yayında" : "Taslak"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{row.views_count}</td>
                <td className="px-3 py-2 text-muted-foreground">{formatDate(row.created_at)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {row.is_published && (
                      <Link href={`/kampanya/${row.slug}`} target="_blank">
                        <Button variant="ghost" size="icon-sm" aria-label="Görüntüle">
                          <ExternalLink className="size-4 text-primary" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleTogglePublish(row.id, row.is_published)}
                      aria-label={row.is_published ? "Yayından kaldır" : "Yayınla"}
                    >
                      {row.is_published ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(row.id)}
                      aria-label="Sil"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
