"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  MapPinIcon,
  MapPinOffIcon,
  SearchIcon,
  ExternalLinkIcon,
  ChevronLeft,
  ChevronRight,
  Building2,
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

import { togglePropertyShowOnMap } from "@/actions/properties";
import { formatPrice } from "@/lib/format";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PropertyImage = {
  url: string;
  is_cover: boolean;
};

export type MapManagementRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  is_active: boolean;
  show_on_map: boolean;
  lat: number | null;
  lng: number | null;
  city: { name: string; lat?: number | null; lng?: number | null } | null;
  district: { name: string; lat?: number | null; lng?: number | null } | null;
  images: PropertyImage[];
};

export type MapManagementProject = {
  id: string;
  title: string;
  slug: string;
  starting_price: number | null;
  currency: string;
  status: string;
  is_active: boolean;
  lat: number | null;
  lng: number | null;
  city: { name: string; lat?: number | null; lng?: number | null } | null;
  cover_image: string | null;
};

type UnifiedRow =
  | ({ kind: "property" } & MapManagementRow)
  | ({ kind: "project" } & MapManagementProject);

type MapFilter = "all" | "on_map" | "off_map";
type KindFilter = "all" | "property" | "project";

const FILTER_LABELS: Record<MapFilter, string> = {
  all: "Tümü",
  on_map: "Haritada",
  off_map: "Haritada Değil",
};

const KIND_LABELS: Record<KindFilter, string> = {
  all: "Tüm kayıtlar",
  property: "Sadece ilanlar",
  project: "Sadece projeler",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MapManagementTableProps {
  initialData: MapManagementRow[];
  initialProjects?: MapManagementProject[];
}

export function MapManagementTable({
  initialData,
  initialProjects = [],
}: MapManagementTableProps) {
  const [rows, setRows] = useState(initialData);
  const [projects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [mapFilter, setMapFilter] = useState<MapFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [txFilter, setTxFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Resolve coordinates with city/district fallback (same as public map)
  function resolvePropertyCoords(r: MapManagementRow): { lat: number; lng: number } | null {
    const lat = r.lat ?? r.district?.lat ?? r.city?.lat;
    const lng = r.lng ?? r.district?.lng ?? r.city?.lng;
    if (lat == null || lng == null) return null;
    return { lat, lng };
  }

  function resolveProjectCoords(p: MapManagementProject): { lat: number; lng: number } | null {
    const lat = p.lat ?? p.city?.lat;
    const lng = p.lng ?? p.city?.lng;
    if (lat == null || lng == null) return null;
    return { lat, lng };
  }

  // Unified rows for the table (properties + projects)
  const unifiedRows = useMemo<UnifiedRow[]>(
    () => [
      ...rows.map((r) => ({ kind: "property" as const, ...r })),
      ...projects.map((p) => ({ kind: "project" as const, ...p })),
    ],
    [rows, projects]
  );

  // Project is "on map" if active + has coordinates (no toggle)
  function isProjectOnMap(p: MapManagementProject): boolean {
    return p.is_active && resolveProjectCoords(p) != null;
  }

  // Stats (count properties + projects)
  const onMapCount =
    rows.filter((r) => r.show_on_map).length +
    projects.filter((p) => isProjectOnMap(p)).length;
  const hasCoords =
    rows.filter((r) => resolvePropertyCoords(r) != null).length +
    projects.filter((p) => resolveProjectCoords(p) != null).length;

  // Filtered rows
  const filtered = useMemo(() => {
    return unifiedRows.filter((row) => {
      // Kind filter
      if (kindFilter === "property" && row.kind !== "property") return false;
      if (kindFilter === "project" && row.kind !== "project") return false;

      // Transaction type filter (properties only — hides projects if active)
      if (txFilter !== "all") {
        if (row.kind !== "property") return false;
        if (row.transaction_type !== txFilter) return false;
      }

      // Property type filter (properties only — hides projects if active)
      if (typeFilter !== "all") {
        if (row.kind !== "property") return false;
        if (row.type !== typeFilter) return false;
      }

      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = row.title.toLowerCase().includes(q);
        const matchCity = row.city?.name?.toLowerCase().includes(q);
        const matchDistrict =
          row.kind === "property" && row.district?.name?.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchDistrict) return false;
      }

      // Map status filter
      const onMap =
        row.kind === "property" ? row.show_on_map : isProjectOnMap(row);
      if (mapFilter === "on_map" && !onMap) return false;
      if (mapFilter === "off_map" && onMap) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unifiedRows, search, mapFilter, kindFilter, txFilter, typeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleToggleShowOnMap(id: string, current: boolean) {
    startTransition(async () => {
      const result = await togglePropertyShowOnMap(id, !current);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, show_on_map: !current } : r))
        );
        toast.success(!current ? "İlan haritaya eklendi." : "İlan haritadan kaldırıldı.");
      }
    });
  }

  function handleBulkToggle(showOnMap: boolean) {
    // Only properties can be toggled (projects are readonly)
    const ids = Array.from(selectedIds).filter((id) =>
      rows.some((r) => r.id === id)
    );
    if (ids.length === 0) return;

    startTransition(async () => {
      let successCount = 0;
      for (const id of ids) {
        const result = await togglePropertyShowOnMap(id, showOnMap);
        if (!result.error) successCount++;
      }
      setRows((prev) =>
        prev.map((r) =>
          selectedIds.has(r.id) ? { ...r, show_on_map: showOnMap } : r
        )
      );
      setSelectedIds(new Set());
      toast.success(`${successCount} ilan ${showOnMap ? "haritaya eklendi" : "haritadan kaldırıldı"}.`);
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

  function toggleSelectAll() {
    // Only property IDs can be selected
    const pageIds = paginated
      .filter((r) => r.kind === "property")
      .map((r) => r.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function getCoverImage(row: UnifiedRow): string {
    if (row.kind === "project") {
      return row.cover_image ?? "/placeholder-property.svg";
    }
    return (
      row.images.find((img) => img.is_cover)?.url ??
      row.images[0]?.url ??
      "/placeholder-property.svg"
    );
  }

  // Page buttons
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const pagePropertyIds = paginated.filter((r) => r.kind === "property").map((r) => r.id);
  const allPageSelected =
    pagePropertyIds.length > 0 && pagePropertyIds.every((id) => selectedIds.has(id));

  const totalCount = rows.length + projects.length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="gap-1.5">
          <MapPinIcon className="size-3.5 text-green-600" />
          {onMapCount} haritada
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          {hasCoords} koordinatlı
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          {rows.length} ilan
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Building2 className="size-3.5 text-violet-600" />
          {projects.length} proje
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          {totalCount} toplam
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="İlan, proje, şehir veya ilçe ara..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9"
          />
        </div>

        {/* Kind filter */}
        <Select
          value={kindFilter}
          onValueChange={(v) => { setKindFilter((v ?? "all") as KindFilter); setPage(1); }}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue>{KIND_LABELS[kindFilter]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kayıtlar</SelectItem>
            <SelectItem value="property">Sadece ilanlar</SelectItem>
            <SelectItem value="project">Sadece projeler</SelectItem>
          </SelectContent>
        </Select>

        {/* Transaction filter */}
        <Select
          value={txFilter}
          onValueChange={(v) => { setTxFilter(v ?? "all"); setPage(1); }}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue>
              {txFilter === "all"
                ? "İşlem: Tümü"
                : TRANSACTION_TYPE_LABELS[txFilter] ?? txFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">İşlem: Tümü</SelectItem>
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Property type filter */}
        <Select
          value={typeFilter}
          onValueChange={(v) => { setTypeFilter(v ?? "all"); setPage(1); }}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue>
              {typeFilter === "all"
                ? "Tip: Tümü"
                : PROPERTY_TYPE_LABELS[typeFilter] ?? typeFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Tip: Tümü</SelectItem>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Map status filter */}
        <Select
          value={mapFilter}
          onValueChange={(v) => { setMapFilter((v ?? "all") as MapFilter); setPage(1); }}
        >
          <SelectTrigger className="w-[170px] h-9">
            <SelectValue>{`Harita: ${FILTER_LABELS[mapFilter]}`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="on_map">Haritada</SelectItem>
            <SelectItem value="off_map">Haritada Değil</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset filters */}
        {(search || kindFilter !== "all" || txFilter !== "all" || typeFilter !== "all" || mapFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => {
              setSearch("");
              setKindFilter("all");
              setTxFilter("all");
              setTypeFilter("all");
              setMapFilter("all");
              setPage(1);
            }}
          >
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">
            {selectedIds.size} ilan seçili
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => handleBulkToggle(true)}
            disabled={isPending}
          >
            <MapPinIcon className="size-3.5" />
            Haritaya Ekle
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => handleBulkToggle(false)}
            disabled={isPending}
          >
            <MapPinOffIcon className="size-3.5" />
            Haritadan Kaldır
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2.5 text-left w-10">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  className="size-4 rounded border-gray-300"
                />
              </th>
              <th className="px-3 py-2.5 text-left">Başlık</th>
              <th className="px-3 py-2.5 text-left">Konum</th>
              <th className="px-3 py-2.5 text-left">Fiyat</th>
              <th className="px-3 py-2.5 text-center">Koordinat</th>
              <th className="px-3 py-2.5 text-center">Durum</th>
              <th className="px-3 py-2.5 text-center">Harita</th>
              <th className="px-3 py-2.5 text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => {
              const isProject = row.kind === "project";
              const onMap = isProject ? isProjectOnMap(row) : row.show_on_map;
              const price = isProject ? row.starting_price : row.price;
              const editHref = isProject
                ? `/admin/projeler/${row.id}/duzenle`
                : `/admin/ilanlar/${row.id}/duzenle`;

              return (
                <tr
                  key={`${row.kind}-${row.id}`}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  {/* Checkbox (only for properties) */}
                  <td className="px-3 py-2">
                    {isProject ? (
                      <div className="size-4" aria-hidden />
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="size-4 rounded border-gray-300"
                      />
                    )}
                  </td>

                  {/* Info */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded">
                        <Image
                          src={getCoverImage(row)}
                          alt={row.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-sm">{row.title}</p>
                        <div className="flex gap-1 mt-0.5">
                          {isProject ? (
                            <Badge variant="outline" className="h-4 px-1 text-[10px] text-violet-700 border-violet-300">
                              Proje
                            </Badge>
                          ) : (
                            <>
                              <span className="text-[10px] text-muted-foreground">
                                {TRANSACTION_TYPE_LABELS[row.transaction_type] ?? row.transaction_type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">
                                {PROPERTY_TYPE_LABELS[row.type] ?? row.type}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-3 py-2">
                    <span className="text-sm">
                      {row.city?.name ?? "—"}
                      {!isProject && row.district?.name ? `, ${row.district.name}` : ""}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-2">
                    <span className="text-sm font-medium">
                      {price != null ? formatPrice(price, row.currency) : "—"}
                    </span>
                  </td>

                  {/* Coordinates */}
                  <td className="px-3 py-2 text-center">
                    {row.lat != null && row.lng != null ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {row.lat.toFixed(4)}, {row.lng.toFixed(4)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Yok</span>
                    )}
                  </td>

                  {/* Active status */}
                  <td className="px-3 py-2 text-center">
                    <Badge
                      variant={row.is_active ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {row.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </td>

                  {/* Map toggle / status */}
                  <td className="px-3 py-2 text-center">
                    {isProject ? (
                      <span
                        title={
                          onMap
                            ? "Haritada (aktif + koordinat)"
                            : "Haritada değil"
                        }
                      >
                        {onMap ? (
                          <MapPinIcon className="inline size-4 fill-green-500 text-green-600" />
                        ) : (
                          <MapPinOffIcon className="inline size-4 text-muted-foreground" />
                        )}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={row.show_on_map ? "Haritadan kaldır" : "Haritaya ekle"}
                        onClick={() => handleToggleShowOnMap(row.id, row.show_on_map)}
                        disabled={isPending}
                        title={
                          row.show_on_map
                            ? "Haritada — kaldırmak için tıkla"
                            : "Haritada değil — eklemek için tıkla"
                        }
                      >
                        {row.show_on_map ? (
                          <MapPinIcon className="size-4 fill-green-500 text-green-600" />
                        ) : (
                          <MapPinOffIcon className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </td>

                  {/* External link */}
                  <td className="px-3 py-2 text-center">
                    <Link
                      href={editHref}
                      className="inline-flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors"
                      title="Düzenle"
                    >
                      <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Sonuç bulunamadı.
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue>{pageSize} / sayfa</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / sayfa</SelectItem>
                <SelectItem value="20">20 / sayfa</SelectItem>
                <SelectItem value="50">50 / sayfa</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              Sayfa {safePage} / {totalPages} — toplam {filtered.length} kayıt
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-1.5 text-xs text-muted-foreground">...</span>
              ) : (
                <Button
                  key={p}
                  variant={p === safePage ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
