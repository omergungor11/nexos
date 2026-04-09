"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  PencilIcon,
  Trash2Icon,
  PlusIcon,
  StarIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import {
  deleteProject,
  toggleProjectStatus,
  toggleProjectFeatured,
} from "@/actions/projects";
import { formatPrice } from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminProjectRow = {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  starting_price: number | null;
  currency: string;
  total_units: number | null;
  status: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  city: { name: string } | null;
  district: { name: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Yakında",
  under_construction: "Yapım Aşamasında",
  completed: "Tamamlandı",
  selling: "Satışta",
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  under_construction: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  selling: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

// ---------------------------------------------------------------------------
// Delete confirm dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  projectId,
  projectTitle,
  onDeleted,
}: {
  projectId: string;
  projectTitle: string;
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Proje silindi.");
        onDeleted(projectId);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Sil" />
        }
      >
        <Trash2Icon className="size-4 text-destructive" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Projeyi Sil</DialogTitle>
          <DialogDescription>
            &ldquo;{projectTitle}&rdquo; projesi kalıcı olarak silinecek. Bu
            işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Vazgeç
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProjectDataTable({
  initialData,
}: {
  initialData: AdminProjectRow[];
}) {
  const [rows, setRows] = useState<AdminProjectRow[]>(initialData);
  const [, startTransition] = useTransition();

  function handleToggleActive(id: string, current: boolean) {
    startTransition(async () => {
      const result = await toggleProjectStatus(id, !current);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: !current } : r))
        );
        toast.success(!current ? "Proje aktif edildi." : "Proje devre dışı bırakıldı.");
      }
    });
  }

  function handleToggleFeatured(id: string, current: boolean) {
    startTransition(async () => {
      const result = await toggleProjectFeatured(id, !current);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_featured: !current } : r))
        );
        toast.success(!current ? "Proje öne çıkarıldı." : "Öne çıkarma kaldırıldı.");
      }
    });
  }

  function handleDeleted(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{rows.length} proje</span>
        <Link
          href="/admin/projeler/yeni"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <PlusIcon className="size-4" />
          Yeni Proje
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Görsel</th>
              <th className={thClass}>Başlık</th>
              <th className={thClass}>Konum</th>
              <th className={thClass}>Durum</th>
              <th className={thClass}>Fiyat</th>
              <th className={thClass}>Birim</th>
              <th className={thClass}>Öne Çıkan</th>
              <th className={thClass}>Aktif</th>
              <th className={thClass}>İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Henüz proje eklenmemiş.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Cover image */}
                  <td className="px-3 py-2">
                    <div className="relative h-10 w-16 overflow-hidden rounded bg-muted">
                      {row.cover_image ? (
                        <Image
                          src={row.cover_image}
                          alt={row.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/projeler/${row.id}/duzenle`}
                      className="font-medium hover:underline"
                    >
                      {row.title}
                    </Link>
                  </td>

                  {/* Location */}
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.city?.name ?? "—"}
                    {row.district?.name ? `, ${row.district.name}` : ""}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${STATUS_COLORS[row.status] ?? ""}`}
                    >
                      {STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {row.starting_price
                      ? formatPrice(row.starting_price, row.currency)
                      : "—"}
                  </td>

                  {/* Units */}
                  <td className="px-3 py-2 text-center">
                    {row.total_units ?? "—"}
                  </td>

                  {/* Featured toggle */}
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={row.is_featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                      onClick={() => handleToggleFeatured(row.id, row.is_featured)}
                    >
                      <StarIcon
                        className={`size-4 ${
                          row.is_featured
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </td>

                  {/* Active toggle */}
                  <td className="px-3 py-2">
                    <Switch
                      checked={row.is_active}
                      onCheckedChange={() =>
                        handleToggleActive(row.id, row.is_active)
                      }
                      aria-label={row.is_active ? "Devre dışı bırak" : "Aktif et"}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/projeler/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon-sm" aria-label="Görüntüle">
                          <ExternalLinkIcon className="size-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/projeler/${row.id}/duzenle`}>
                        <Button variant="ghost" size="icon-sm" aria-label="Düzenle">
                          <PencilIcon className="size-4" />
                        </Button>
                      </Link>
                      <DeleteDialog
                        projectId={row.id}
                        projectTitle={row.title}
                        onDeleted={handleDeleted}
                      />
                    </div>
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
