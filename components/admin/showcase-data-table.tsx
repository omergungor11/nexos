"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Eye,
  Search,
  CalendarClock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ShowcaseLinkActions } from "@/components/admin/showcase-link-actions";
import {
  archiveShowcase,
  deleteShowcase,
} from "@/actions/showcases";
import type { ShowcaseListRow } from "@/types/showcase";

interface ShowcaseDataTableProps {
  rows: ShowcaseListRow[];
}

type FilterTab = "active" | "archived" | "all";

const TABS: Array<{ key: FilterTab; label: string }> = [
  { key: "active", label: "Aktif" },
  { key: "archived", label: "Arşiv" },
  { key: "all", label: "Tümü" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function ShowcaseDataTable({ rows }: ShowcaseDataTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<FilterTab>("active");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ShowcaseListRow | null>(
    null
  );

  const counts = useMemo(() => {
    const active = rows.filter((r) => !r.is_archived).length;
    const archived = rows.filter((r) => r.is_archived).length;
    return { active, archived, all: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "active") list = list.filter((r) => !r.is_archived);
    else if (tab === "archived") list = list.filter((r) => r.is_archived);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_phone.includes(q)
      );
    }
    return list;
  }, [rows, tab, query]);

  function handleArchive(row: ShowcaseListRow) {
    startTransition(async () => {
      const result = await archiveShowcase(row.id, !row.is_archived);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(row.is_archived ? "Arşivden çıkarıldı" : "Arşivlendi");
        router.refresh();
      }
    });
  }

  function handleDelete(row: ShowcaseListRow) {
    startTransition(async () => {
      const result = await deleteShowcase(row.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Teklif silindi");
        setConfirmDelete(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Müşteri, başlık, telefon ara…"
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 text-left">Müşteri</th>
                <th className="px-3 py-2.5 text-left">Başlık</th>
                <th className="px-3 py-2.5 text-center">İlan</th>
                <th className="px-3 py-2.5 text-center">Görüntülenme</th>
                <th className="px-3 py-2.5 text-left">Bitiş</th>
                <th className="px-3 py-2.5 text-left">Oluşturma</th>
                <th className="px-3 py-2.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    Teklif bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const expired = isExpired(row.expires_at);
                  return (
                    <tr
                      key={row.id}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <div className="space-y-0.5">
                          <p className="font-medium">{row.customer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.customer_phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="max-w-[280px] space-y-0.5">
                          <p
                            className="truncate text-sm font-medium"
                            title={row.title}
                          >
                            {row.title}
                          </p>
                          {expired && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                              <CalendarClock className="size-3" />
                              Süresi doldu
                            </span>
                          )}
                          {row.is_archived && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              <Archive className="size-3" />
                              Arşivde
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          {row.property_count}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center text-xs">
                          <span className="font-medium">
                            {row.view_count}
                          </span>
                          {row.last_viewed_at && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatDateTime(row.last_viewed_at)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {formatDate(row.expires_at)}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <ShowcaseLinkActions
                            slug={row.slug}
                            customerName={row.customer_name}
                            customerPhone={row.customer_phone}
                            title={row.title}
                            size="sm"
                            showLabels={false}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={pending}>
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/teklif/${row.slug}`} target="_blank">
                                  <Eye className="size-3.5" />
                                  Önizle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/teklifler/${row.id}/duzenle`}>
                                  <Pencil className="size-3.5" />
                                  Düzenle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchive(row)}>
                                {row.is_archived ? (
                                  <>
                                    <ArchiveRestore className="size-3.5" />
                                    Arşivden Çıkar
                                  </>
                                ) : (
                                  <>
                                    <Archive className="size-3.5" />
                                    Arşivle
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setConfirmDelete(row)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teklifi sil</DialogTitle>
            <DialogDescription>
              {confirmDelete && (
                <>
                  &quot;{confirmDelete.title}&quot; ({confirmDelete.customer_name}
                  ) teklifini kalıcı olarak silmek istediğine emin misin? Bu
                  işlem geri alınamaz.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={pending}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              disabled={pending}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
