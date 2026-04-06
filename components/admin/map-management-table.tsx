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
  city: { name: string } | null;
  district: { name: string } | null;
  images: PropertyImage[];
};

type MapFilter = "all" | "on_map" | "off_map";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MapManagementTableProps {
  initialData: MapManagementRow[];
}

export function MapManagementTable({ initialData }: MapManagementTableProps) {
  const [rows, setRows] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [mapFilter, setMapFilter] = useState<MapFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Stats
  const onMapCount = rows.filter((r) => r.show_on_map).length;
  const hasCoords = rows.filter((r) => r.lat != null && r.lng != null).length;

  // Filtered rows
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = row.title.toLowerCase().includes(q);
        const matchCity = row.city?.name?.toLowerCase().includes(q);
        const matchDistrict = row.district?.name?.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchDistrict) return false;
      }
      if (mapFilter === "on_map" && !row.show_on_map) return false;
      if (mapFilter === "off_map" && row.show_on_map) return false;
      return true;
    });
  }, [rows, search, mapFilter]);

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
    const ids = Array.from(selectedIds);
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
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  }

  function getCoverImage(images: PropertyImage[]): string {
    return images.find((img) => img.is_cover)?.url ?? images[0]?.url ?? "/placeholder-property.svg";
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="gap-1.5">
          <MapPinIcon className="size-3.5 text-green-600" />
          {onMapCount} ilan haritada
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          {hasCoords} ilanın koordinatı var
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          {rows.length} toplam ilan
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="İlan, şehir veya ilçe ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={mapFilter}
          onValueChange={(v) => setMapFilter((v ?? "all") as MapFilter)}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Harita durumu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="on_map">Haritada</SelectItem>
            <SelectItem value="off_map">Haritada Değil</SelectItem>
          </SelectContent>
        </Select>
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
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="size-4 rounded border-gray-300"
                />
              </th>
              <th className="px-3 py-2.5 text-left">İlan</th>
              <th className="px-3 py-2.5 text-left">Konum</th>
              <th className="px-3 py-2.5 text-left">Fiyat</th>
              <th className="px-3 py-2.5 text-center">Koordinat</th>
              <th className="px-3 py-2.5 text-center">Durum</th>
              <th className="px-3 py-2.5 text-center">Harita</th>
              <th className="px-3 py-2.5 text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    className="size-4 rounded border-gray-300"
                  />
                </td>

                {/* Property info */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded">
                      <Image
                        src={getCoverImage(row.images)}
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
                        <span className="text-[10px] text-muted-foreground">
                          {TRANSACTION_TYPE_LABELS[row.transaction_type] ?? row.transaction_type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">
                          {PROPERTY_TYPE_LABELS[row.type] ?? row.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-3 py-2">
                  <span className="text-sm">
                    {row.city?.name ?? "—"}
                    {row.district?.name ? `, ${row.district.name}` : ""}
                  </span>
                </td>

                {/* Price */}
                <td className="px-3 py-2">
                  <span className="text-sm font-medium">
                    {formatPrice(row.price, row.currency)}
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

                {/* Map toggle */}
                <td className="px-3 py-2 text-center">
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
                </td>

                {/* External link */}
                <td className="px-3 py-2 text-center">
                  <Link
                    href={`/admin/ilanlar/${row.id}/duzenle`}
                    className="inline-flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors"
                    title="Düzenle"
                  >
                    <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Sonuç bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
