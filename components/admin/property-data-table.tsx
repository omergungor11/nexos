"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  PencilIcon,
  Trash2Icon,
  StarIcon,
  CopyIcon,
  XIcon,
  UserPlusIcon,
  BarChart3Icon,
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
  togglePropertyFeatured,
  deleteProperty,
  duplicateProperty,
  updatePropertyWorkflowStatus,
} from "@/actions/properties";
import {
  bulkDelete,
  bulkAssignAgent,
  bulkToggleFeatured,
  bulkUpdateWorkflowStatus,
} from "@/actions/properties-bulk";
import type { PropertyWorkflowStatus } from "@/types/property";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants";
import { parseSearchQuery } from "@/lib/search-parser";
import { formatPrice } from "@/lib/format";
import { PropertyExportButtons } from "./property-export";
import { PropertyImportDialog } from "./property-import-dialog";

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

type Agent = {
  id: string;
  name: string;
};

export type AdminPropertyRow = {
  id: string;
  listing_number: number;
  slug: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  status: string;
  is_active: boolean;
  workflow_status: PropertyWorkflowStatus;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  rooms: number | null;
  living_rooms: number | null;
  area_sqm: number | null;
  city: City | null;
  district: { name: string } | null;
  images: PropertyImage[];
  agent: Agent | null;
};

const WORKFLOW_LABELS: Record<PropertyWorkflowStatus, string> = {
  draft: "Taslak",
  published: "Yayında",
  passive: "Pasif",
  archived: "Arşiv",
};

const WORKFLOW_COLORS: Record<PropertyWorkflowStatus, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  passive: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  archived: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

type SortKey = keyof Pick<
  AdminPropertyRow,
  "title" | "price" | "type" | "transaction_type" | "status" | "created_at" | "views_count"
>;

type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

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
  agents = [],
  initialTypeFilter,
}: {
  initialData: AdminPropertyRow[];
  agents?: Agent[];
  initialTypeFilter?: string;
}) {
  const [rows, setRows] = useState<AdminPropertyRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter ?? "all");
  const [transactionFilter, setTransactionFilter] = useState<string>("all");

  // Unique cities present in the current data set.
  const cityOptions = useMemo(() => {
    const names = new Set<string>();
    for (const r of rows) if (r.city?.name) names.add(r.city.name);
    return Array.from(names).sort((a, b) => a.localeCompare(b, "tr"));
  }, [rows]);

  // Districts narrowed to the currently-selected city (falls back to every
  // district when "Tüm Şehirler" is active).
  const districtOptions = useMemo(() => {
    const names = new Set<string>();
    for (const r of rows) {
      if (!r.district?.name) continue;
      if (cityFilter !== "all" && r.city?.name !== cityFilter) continue;
      names.add(r.district.name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "tr"));
  }, [rows, cityFilter]);
  const [sortKey, setSortKey] = useState<SortKey | null>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);

  // Rows matching every filter EXCEPT workflow status — drives both the
  // final table and the status-chip counts (so "Yayında (5)" reflects the
  // 5 published items that still match the current search / city / type).
  const filteredExceptWorkflow = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const parsed = parseSearchQuery(search.trim());
      result = result.filter((r) => {
        // Structured: transaction type
        if (parsed.transactionType && r.transaction_type !== parsed.transactionType) return false;
        // Structured: property type
        if (parsed.propertyType && r.type !== parsed.propertyType) return false;
        // Structured: room count (e.g. "3+1")
        if (parsed.rooms !== null && r.rooms !== parsed.rooms) return false;
        if (parsed.livingRooms !== null && r.living_rooms !== parsed.livingRooms) return false;
        // Free text: search in title
        if (parsed.remainingText.length >= 2) {
          if (!r.title.toLowerCase().includes(parsed.remainingText.toLowerCase())) return false;
        }
        return true;
      });
    }

    if (cityFilter !== "all") {
      result = result.filter((r) => r.city?.name === cityFilter);
    }

    if (districtFilter !== "all") {
      result = result.filter((r) => r.district?.name === districtFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((r) => r.type === typeFilter);
    }

    if (transactionFilter !== "all") {
      result = result.filter((r) => r.transaction_type === transactionFilter);
    }

    return result;
  }, [rows, search, cityFilter, districtFilter, typeFilter, transactionFilter]);

  const workflowCounts = useMemo(() => {
    const counts: Record<PropertyWorkflowStatus, number> = {
      draft: 0,
      published: 0,
      passive: 0,
      archived: 0,
    };
    for (const r of filteredExceptWorkflow) counts[r.workflow_status]++;
    return counts;
  }, [filteredExceptWorkflow]);

  const filtered = useMemo(() => {
    if (workflowFilter === "all") return filteredExceptWorkflow;
    return filteredExceptWorkflow.filter(
      (r) => r.workflow_status === workflowFilter
    );
  }, [filteredExceptWorkflow, workflowFilter]);

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

  function handleWorkflowChange(id: string, next: PropertyWorkflowStatus) {
    startTransition(async () => {
      const result = await updatePropertyWorkflowStatus(id, next);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, workflow_status: next, is_active: next === "published" }
              : r
          )
        );
        toast.success(`Durum güncellendi: ${WORKFLOW_LABELS[next]}`);
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

  const router = useRouter();

  // Selection helpers
  const allPageIds = paginated.map((r) => r.id);
  const allSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));
  const someSelected = allPageIds.some((id) => selectedIds.has(id));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allPageIds.forEach((id) => next.delete(id));
      } else {
        allPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Bulk action handlers
  async function handleBulkWorkflow(next: PropertyWorkflowStatus) {
    setBulkPending(true);
    const ids = Array.from(selectedIds);
    const result = await bulkUpdateWorkflowStatus(ids, next);
    if (result.error) {
      toast.error(result.error);
    } else {
      setRows((prev) =>
        prev.map((r) =>
          selectedIds.has(r.id)
            ? { ...r, workflow_status: next, is_active: next === "published" }
            : r
        )
      );
      toast.success(`${ids.length} ilan → ${WORKFLOW_LABELS[next]}`);
      clearSelection();
    }
    setBulkPending(false);
  }

  async function handleBulkDelete() {
    setBulkPending(true);
    const ids = Array.from(selectedIds);
    const result = await bulkDelete(ids);
    if (result.error) {
      toast.error(result.error);
    } else {
      setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      toast.success(`${ids.length} ilan silindi.`);
      clearSelection();
    }
    setBulkPending(false);
  }

  async function handleBulkFeatured(isFeatured: boolean) {
    setBulkPending(true);
    const ids = Array.from(selectedIds);
    const result = await bulkToggleFeatured(ids, isFeatured);
    if (result.error) {
      toast.error(result.error);
    } else {
      setRows((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, is_featured: isFeatured } : r)));
      toast.success(`${ids.length} ilan ${isFeatured ? "öne çıkarıldı" : "öne çıkarma kaldırıldı"}.`);
      clearSelection();
    }
    setBulkPending(false);
  }

  async function handleBulkAssignAgent(agentId: string | null) {
    setBulkPending(true);
    const ids = Array.from(selectedIds);
    const result = await bulkAssignAgent(ids, agentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setRows((prev) =>
        prev.map((r) => {
          if (!selectedIds.has(r.id)) return r;
          const agent = agents.find((a) => a.id === agentId) ?? null;
          return { ...r, agent };
        })
      );
      toast.success(`${ids.length} ilana danışman atandı.`);
      clearSelection();
    }
    setBulkPending(false);
  }

  async function handleDuplicate(id: string) {
    startTransition(async () => {
      const result = await duplicateProperty(id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success("İlan kopyalandı.");
        router.push(`/admin/ilanlar/${result.data.id}/duzenle`);
      }
    });
  }

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";
  const thSortClass = `${thClass} cursor-pointer select-none hover:text-foreground`;

  const statusChips: Array<{
    key: "all" | PropertyWorkflowStatus;
    label: string;
    count: number;
    activeClass: string;
  }> = [
    {
      key: "all",
      label: "Tümü",
      count: filteredExceptWorkflow.length,
      activeClass: "bg-foreground text-background border-foreground",
    },
    {
      key: "published",
      label: "Yayında",
      count: workflowCounts.published,
      activeClass:
        "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500",
    },
    {
      key: "draft",
      label: "Taslak",
      count: workflowCounts.draft,
      activeClass:
        "bg-slate-600 text-white border-slate-600 dark:bg-slate-500 dark:border-slate-500",
    },
    {
      key: "passive",
      label: "Pasif",
      count: workflowCounts.passive,
      activeClass:
        "bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:border-amber-500",
    },
    {
      key: "archived",
      label: "Arşiv",
      count: workflowCounts.archived,
      activeClass:
        "bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:border-rose-500",
    },
  ];

  const statusChipsRow = (
    <div className="flex flex-wrap items-center gap-1.5">
      {statusChips.map((chip) => {
        const active = workflowFilter === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => {
              setWorkflowFilter(chip.key);
              setPage(1);
            }}
            className={
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors " +
              (active
                ? chip.activeClass
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
            }
          >
            <span>{chip.label}</span>
            <span
              className={
                "inline-flex min-w-[1.25rem] justify-center rounded-full px-1 text-[10px] font-semibold " +
                (active
                  ? "bg-white/20 text-current"
                  : "bg-muted text-foreground")
              }
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );

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

        <Select value={workflowFilter} onValueChange={handleFilterChange(setWorkflowFilter)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Yayın Durumu">
              {workflowFilter === "all"
                ? "Tüm Yayınlar"
                : WORKFLOW_LABELS[workflowFilter as PropertyWorkflowStatus] ?? workflowFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Yayınlar</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="published">Yayında</SelectItem>
            <SelectItem value="passive">Pasif</SelectItem>
            <SelectItem value="archived">Arşiv</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={cityFilter}
          onValueChange={(v: string | null) => {
            const next = v ?? "all";
            setCityFilter(next);
            // Reset district whenever city changes — its list depends on city.
            setDistrictFilter("all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Şehir">
              {cityFilter === "all" ? "Tüm Şehirler" : cityFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Şehirler</SelectItem>
            {cityOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={districtFilter}
          onValueChange={handleFilterChange(setDistrictFilter)}
          disabled={districtOptions.length === 0}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="İlçe">
              {districtFilter === "all" ? "Tüm İlçeler" : districtFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İlçeler</SelectItem>
            {districtOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
          <SelectTrigger className="h-8 w-48">
            <SelectValue placeholder="Tip">
              {typeFilter === "all" ? "Tüm Tipler" : PROPERTY_TYPE_LABELS[typeFilter as keyof typeof PROPERTY_TYPE_LABELS] ?? typeFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Tipler</SelectItem>
            {/* Konut */}
            <SelectItem value="__konut_header" disabled className="text-xs font-semibold text-muted-foreground uppercase pt-2">Konut</SelectItem>
            <SelectItem value="apartment">Daire</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="twin_villa">İkiz Villa</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
            <SelectItem value="residence">Residence</SelectItem>
            <SelectItem value="bungalow">Bungalow</SelectItem>
            <SelectItem value="detached">Müstakil Ev</SelectItem>
            <SelectItem value="building">Komple Bina</SelectItem>
            <SelectItem value="timeshare">Devremülk</SelectItem>
            <SelectItem value="derelict">Metruk Bina</SelectItem>
            <SelectItem value="unfinished">Yarım İnşaat</SelectItem>
            {/* Arsa */}
            <SelectItem value="__arsa_header" disabled className="text-xs font-semibold text-muted-foreground uppercase pt-2">Arsa</SelectItem>
            <SelectItem value="land">Arsa</SelectItem>
            <SelectItem value="residential_land">Konut İmarlı Arsa</SelectItem>
            <SelectItem value="mixed_land">Konut+Ticari İmarlı</SelectItem>
            <SelectItem value="commercial_land">Ticari İmarlı Arsa</SelectItem>
            <SelectItem value="industrial_land">Sanayi İmarlı Arsa</SelectItem>
            <SelectItem value="tourism_land">Turizm İmarlı Arsa</SelectItem>
            <SelectItem value="field">Tarla</SelectItem>
            <SelectItem value="olive_grove">Zeytinlik</SelectItem>
            {/* Ticari */}
            <SelectItem value="__ticari_header" disabled className="text-xs font-semibold text-muted-foreground uppercase pt-2">Ticari</SelectItem>
            <SelectItem value="shop">Dükkan</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="workplace">İş Yeri</SelectItem>
            <SelectItem value="warehouse">Depo</SelectItem>
            <SelectItem value="business_transfer">Devren Satılık</SelectItem>
            <SelectItem value="office">Ofis</SelectItem>
          </SelectContent>
        </Select>

        <Select value={transactionFilter} onValueChange={handleFilterChange(setTransactionFilter)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="İşlem">
              {transactionFilter === "all" ? "Tüm İşlemler" : transactionFilter === "sale" ? "Satılık" : transactionFilter === "rent" ? "Kiralık" : "Günlük Kiralık"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İşlemler</SelectItem>
            <SelectItem value="sale">Satılık</SelectItem>
            <SelectItem value="rent">Kiralık</SelectItem>
            <SelectItem value="daily_rental">Günlük Kiralık</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <PropertyExportButtons rows={filtered} />
          <PropertyImportDialog />
          <span className="self-center text-sm text-muted-foreground">
            {filtered.length} ilan
          </span>
        </div>
      </div>

      {/* Status chips — quick workflow filter, right under the filter row */}
      {statusChipsRow}

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} ilan seçili
          </span>
          <div className="flex flex-wrap items-center gap-1.5 ml-2">
            <Select onValueChange={(v: string | null) => { if (v) handleBulkWorkflow(v as PropertyWorkflowStatus); }}>
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Durum Değiştir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Yayına Al</SelectItem>
                <SelectItem value="passive">Pasife Al</SelectItem>
                <SelectItem value="draft">Taslağa Al</SelectItem>
                <SelectItem value="archived">Arşivle</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled={bulkPending} onClick={() => handleBulkFeatured(true)}>
              <StarIcon className="size-3.5" /> Öne Çıkar
            </Button>
            {agents.length > 0 && (
              <Select onValueChange={(v: string | null) => { if (v) handleBulkAssignAgent(v === "__none__" ? null : v); }}>
                <SelectTrigger className="h-8 w-44">
                  <UserPlusIcon className="size-3.5 mr-1" />
                  <SelectValue placeholder="Danışman Ata" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Danışman Kaldır</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="destructive" size="sm" disabled={bulkPending} onClick={handleBulkDelete}>
              <Trash2Icon className="size-3.5" /> Sil
            </Button>
          </div>
          <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={clearSelection}>
            <XIcon className="size-4" />
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleSelectAll}
                  className="size-4 rounded accent-primary"
                  aria-label="Tümünü seç"
                />
              </th>
              <th className={thClass}>No</th>
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
              <th className={thClass}>Danışman</th>
              <th className={thClass}>Yayın</th>
              <th className={thClass}>Öne Çıkan</th>
              <th className={thClass}>İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  İlan bulunamadı.
                </td>
              </tr>
            ) : (
              paginated.map((row) => {
                const coverImage = row.images.find((img) => img.is_cover) ?? row.images[0];

                return (
                  <tr key={row.id} className={`hover:bg-muted/30 transition-colors ${selectedIds.has(row.id) ? "bg-blue-50/50" : ""}`}>
                    {/* Checkbox */}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="size-4 rounded accent-primary"
                        aria-label={`${row.title} seç`}
                      />
                    </td>
                    {/* Listing Number */}
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      #{String(row.listing_number ?? 0).padStart(4, "0")}
                    </td>
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
                        title={row.title}
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
                      <Badge variant={row.transaction_type === "sale" ? "default" : row.transaction_type === "daily_rental" ? "outline" : "secondary"}>
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

                    {/* Agent */}
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {row.agent?.name ?? "—"}
                    </td>


                    {/* Workflow status dropdown */}
                    <td className="px-3 py-2">
                      <Select
                        value={row.workflow_status}
                        onValueChange={(v: string | null) => {
                          if (v && v !== row.workflow_status) {
                            handleWorkflowChange(row.id, v as PropertyWorkflowStatus);
                          }
                        }}
                      >
                        <SelectTrigger
                          className={`h-7 w-28 border-0 px-2 text-xs font-medium ${WORKFLOW_COLORS[row.workflow_status]}`}
                        >
                          <SelectValue>
                            {WORKFLOW_LABELS[row.workflow_status]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Taslak</SelectItem>
                          <SelectItem value="published">Yayında</SelectItem>
                          <SelectItem value="passive">Pasif</SelectItem>
                          <SelectItem value="archived">Arşiv</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Link href={`/admin/ilanlar/${row.id}/duzenle?tab=analiz`}>
                          <Button variant="ghost" size="icon-sm" aria-label="Analiz" title="İlan Analizi">
                            <BarChart3Icon className="size-4 text-primary" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Kopyala"
                          title="İlanı Kopyala"
                          onClick={() => handleDuplicate(row.id)}
                        >
                          <CopyIcon className="size-4 text-muted-foreground" />
                        </Button>
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
