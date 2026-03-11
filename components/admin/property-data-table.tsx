"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  PencilIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  togglePropertyStatus,
  togglePropertyFeatured,
  deleteProperty,
} from "@/actions/properties";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PropertyImage = {
  url: string;
  is_cover: boolean;
};

type City = {
  name: string;
};

export type AdminPropertyRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  status: string;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  city: City | null;
  district: { name: string } | null;
  images: PropertyImage[];
};

type SortKey = keyof Pick<
  AdminPropertyRow,
  "title" | "price" | "type" | "transaction_type" | "status" | "created_at" | "views_count"
>;

type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    sold: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    rented: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    reserved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        colorMap[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {PROPERTY_STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sort icon
// ---------------------------------------------------------------------------

function SortIcon({
  column,
  currentKey,
  currentDir,
}: {
  column: SortKey;
  currentKey: SortKey | null;
  currentDir: SortDir;
}) {
  if (currentKey !== column) {
    return <ChevronsUpDownIcon className="ml-1 inline size-3.5 text-muted-foreground" />;
  }
  return currentDir === "asc" ? (
    <ChevronUpIcon className="ml-1 inline size-3.5" />
  ) : (
    <ChevronDownIcon className="ml-1 inline size-3.5" />
  );
}

// ---------------------------------------------------------------------------
// Delete confirm dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  propertyId,
  propertyTitle,
  onDeleted,
}: {
  propertyId: string;
  propertyTitle: string;
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProperty(propertyId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("İlan silindi.");
        onDeleted(propertyId);
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
          <DialogTitle>İlanı Sil</DialogTitle>
          <DialogDescription>
            &ldquo;{propertyTitle}&rdquo; başlıklı ilan kalıcı olarak silinecek.
            Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" />}
          >
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

export function PropertyDataTable({
  initialData,
}: {
  initialData: AdminPropertyRow[];
}) {
  const [rows, setRows] = useState<AdminPropertyRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [transactionFilter, setTransactionFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey | null>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  // Filtering
  const filtered = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter((r) => r.is_active);
      } else if (statusFilter === "inactive") {
        result = result.filter((r) => !r.is_active);
      } else {
        result = result.filter((r) => r.status === statusFilter);
      }
    }

    if (typeFilter !== "all") {
      result = result.filter((r) => r.type === typeFilter);
    }

    if (transactionFilter !== "all") {
      result = result.filter((r) => r.transaction_type === transactionFilter);
    }

    return result;
  }, [rows, search, statusFilter, typeFilter, transactionFilter]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      const cmp = aStr.localeCompare(bStr, "tr");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string | null) => {
      setter(v ?? "all");
      setPage(1);
    };
  }

  function handleToggleActive(id: string, current: boolean) {
    startTransition(async () => {
      const result = await togglePropertyStatus(id, !current);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: !current } : r))
        );
        toast.success(!current ? "İlan yayına alındı." : "İlan yayından kaldırıldı.");
      }
    });
  }

  function handleToggleFeatured(id: string, current: boolean) {
    startTransition(async () => {
      const result = await togglePropertyFeatured(id, !current);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_featured: !current } : r))
        );
        toast.success(!current ? "Öne çıkarıldı." : "Öne çıkarma kaldırıldı.");
      }
    });
  }

  function handleDeleted(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";
  const thSortClass = `${thClass} cursor-pointer select-none hover:text-foreground`;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="İlan ara..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-8 w-48"
        />

        <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Yayında</SelectItem>
            <SelectItem value="inactive">Yayında Değil</SelectItem>
            <SelectItem value="available">Müsait</SelectItem>
            <SelectItem value="sold">Satıldı</SelectItem>
            <SelectItem value="rented">Kiralandı</SelectItem>
            <SelectItem value="reserved">Rezerve</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Tipler</SelectItem>
            <SelectItem value="apartment">Daire</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="detached">Müstakil Ev</SelectItem>
            <SelectItem value="land">Arsa</SelectItem>
            <SelectItem value="office">Ofis</SelectItem>
            <SelectItem value="shop">Dükkan</SelectItem>
            <SelectItem value="warehouse">Depo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={transactionFilter} onValueChange={handleFilterChange(setTransactionFilter)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="İşlem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Satılık & Kiralık</SelectItem>
            <SelectItem value="sale">Satılık</SelectItem>
            <SelectItem value="rent">Kiralık</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto self-center text-sm text-muted-foreground">
          {filtered.length} ilan
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Görsel</th>
              <th
                className={thSortClass}
                onClick={() => handleSort("title")}
              >
                Başlık
                <SortIcon column="title" currentKey={sortKey} currentDir={sortDir} />
              </th>
              <th
                className={thSortClass}
                onClick={() => handleSort("type")}
              >
                Tip
                <SortIcon column="type" currentKey={sortKey} currentDir={sortDir} />
              </th>
              <th
                className={thSortClass}
                onClick={() => handleSort("transaction_type")}
              >
                İşlem
                <SortIcon column="transaction_type" currentKey={sortKey} currentDir={sortDir} />
              </th>
              <th
                className={thSortClass}
                onClick={() => handleSort("price")}
              >
                Fiyat
                <SortIcon column="price" currentKey={sortKey} currentDir={sortDir} />
              </th>
              <th className={thClass}>Şehir</th>
              <th
                className={thSortClass}
                onClick={() => handleSort("status")}
              >
                Satış Durumu
                <SortIcon column="status" currentKey={sortKey} currentDir={sortDir} />
              </th>
              <th className={thClass}>Yayın</th>
              <th className={thClass}>Öne Çıkan</th>
              <th className={thClass}>İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  İlan bulunamadı.
                </td>
              </tr>
            ) : (
              paginated.map((row) => {
                const coverImage = row.images.find((img) => img.is_cover) ?? row.images[0];

                return (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {/* Image */}
                    <td className="px-3 py-2">
                      <div className="size-12 overflow-hidden rounded-md bg-muted flex-shrink-0">
                        {coverImage ? (
                          <Image
                            src={coverImage.url}
                            alt={row.title}
                            width={48}
                            height={48}
                            className="size-12 object-cover"
                          />
                        ) : (
                          <div className="size-12 flex items-center justify-center text-muted-foreground text-xs">
                            —
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-3 py-2 max-w-xs">
                      <Link
                        href={`/emlak/${row.slug}`}
                        className="font-medium hover:underline line-clamp-2"
                        target="_blank"
                      >
                        {row.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(row.created_at).toLocaleDateString("tr-TR")}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {PROPERTY_TYPE_LABELS[row.type] ?? row.type}
                    </td>

                    {/* Transaction */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Badge variant={row.transaction_type === "sale" ? "default" : "secondary"}>
                        {TRANSACTION_TYPE_LABELS[row.transaction_type] ?? row.transaction_type}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-2 whitespace-nowrap font-medium">
                      {formatPrice(row.price, row.currency)}
                    </td>

                    {/* City */}
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {row.city?.name ?? "—"}
                      {row.district ? ` / ${row.district.name}` : ""}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Active toggle */}
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={row.is_active ? "Yayından kaldır" : "Yayına al"}
                        onClick={() => handleToggleActive(row.id, row.is_active)}
                        title={row.is_active ? "Yayında — kaldırmak için tıkla" : "Yayında değil — yayına almak için tıkla"}
                      >
                        {row.is_active ? (
                          <EyeIcon className="size-4 text-green-600" />
                        ) : (
                          <EyeOffIcon className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={row.is_featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                        onClick={() => handleToggleFeatured(row.id, row.is_featured)}
                        title={row.is_featured ? "Öne çıkan — kaldırmak için tıkla" : "Öne çıkan değil — eklemek için tıkla"}
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

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/ilanlar/${row.id}/duzenle`}>
                          <Button variant="ghost" size="icon-sm" aria-label="Düzenle">
                            <PencilIcon className="size-4" />
                          </Button>
                        </Link>
                        <DeleteDialog
                          propertyId={row.id}
                          propertyTitle={row.title}
                          onDeleted={handleDeleted}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Sayfa {page} / {totalPages} — toplam {filtered.length} ilan
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Önceki
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
