"use client";

import { useState, useMemo } from "react";
import {
  BedDouble,
  Bath,
  Maximize2,
  Package,
  ChevronDown,
  Filter,
} from "lucide-react";
import { formatListingPrice } from "@/lib/format";
import type {
  SubListing,
  SubListingAvailability,
  Currency,
  FloorPlan,
} from "@/types/property";
import { FloorPlansSection } from "./floor-plans-section";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SubListingsSectionProps {
  subListings: SubListing[];
  /** Parent's currency — used as fallback when a sub-listing has no currency. */
  parentCurrency: Currency;
  /** All floor plans for the parent entity. We group sub-listing plans here
   *  to avoid a per-row round-trip. */
  floorPlans?: FloorPlan[];
  heading?: string;
}

const AVAILABILITY_LABELS: Record<SubListingAvailability, string> = {
  available: "Müsait",
  reserved: "Rezerve",
  sold: "Satıldı",
  rented: "Kiralandı",
};

const AVAILABILITY_STYLES: Record<SubListingAvailability, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  reserved: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  sold: "bg-muted text-muted-foreground",
  rented: "bg-muted text-muted-foreground",
};

type Filter = "all" | SubListingAvailability;

const FILTER_OPTIONS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "available", label: "Müsait" },
  { value: "reserved", label: "Rezerve" },
  { value: "sold", label: "Satıldı" },
  { value: "rented", label: "Kiralandı" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubListingsSection({
  subListings,
  parentCurrency,
  floorPlans = [],
  heading = "Birimler / Daire Tipleri",
}: SubListingsSectionProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return subListings;
    return subListings.filter((s) => s.availability === filter);
  }, [subListings, filter]);

  // Group floor plans by sub_listing parent_id for quick lookup.
  const plansBySub = useMemo(() => {
    const map = new Map<string, FloorPlan[]>();
    for (const fp of floorPlans) {
      if (fp.parent_type !== "sub_listing") continue;
      const list = map.get(fp.parent_id) ?? [];
      list.push(fp);
      map.set(fp.parent_id, list);
    }
    return map;
  }, [floorPlans]);

  if (subListings.length === 0) return null;

  const counts: Record<Filter, number> = {
    all: subListings.length,
    available: subListings.filter((s) => s.availability === "available").length,
    reserved: subListings.filter((s) => s.availability === "reserved").length,
    sold: subListings.filter((s) => s.availability === "sold").length,
    rented: subListings.filter((s) => s.availability === "rented").length,
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Package className="size-5 text-primary" />
          {heading}
          <span className="text-sm font-normal text-muted-foreground">
            ({subListings.length})
          </span>
        </h2>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1">
          <Filter className="mr-1 size-3.5 text-muted-foreground" />
          {FILTER_OPTIONS.map((opt) => {
            const count = counts[opt.value];
            if (opt.value !== "all" && count === 0) return null;
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((s) => {
          const plans = plansBySub.get(s.id) ?? [];
          const isOpen = expanded === s.id;
          const canExpand = !!s.description || plans.length > 0;
          const currency = s.currency ?? parentCurrency;
          const priceLabel =
            s.price != null
              ? formatListingPrice(s.price, currency, "fixed")
              : "Fiyat için sorun";

          return (
            <div
              key={s.id}
              className="rounded-lg border bg-card transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => canExpand && setExpanded(isOpen ? null : s.id)}
                className={`flex w-full flex-wrap items-center gap-3 p-4 text-left ${
                  canExpand ? "cursor-pointer" : "cursor-default"
                }`}
                aria-expanded={isOpen}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{s.label}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        AVAILABILITY_STYLES[s.availability]
                      }`}
                    >
                      {AVAILABILITY_LABELS[s.availability]}
                    </span>
                    {s.unit_count > 1 && (
                      <span className="text-xs text-muted-foreground">
                        × {s.unit_count} adet
                      </span>
                    )}
                  </div>

                  {/* Specs row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {s.rooms != null && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="size-3.5" />
                        {s.rooms}
                        {s.living_rooms != null ? `+${s.living_rooms}` : ""}
                      </span>
                    )}
                    {s.bathrooms != null && (
                      <span className="flex items-center gap-1">
                        <Bath className="size-3.5" />
                        {s.bathrooms}
                      </span>
                    )}
                    {s.area_sqm != null && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="size-3.5" />
                        {s.area_sqm} m²
                      </span>
                    )}
                    {s.room_config && <span>· {s.room_config}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-primary sm:text-lg">
                    {priceLabel}
                  </span>
                  {canExpand && (
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </button>

              {isOpen && canExpand && (
                <div className="space-y-4 border-t px-4 pb-4 pt-3">
                  {s.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {s.description}
                    </p>
                  )}
                  {plans.length > 0 && (
                    <FloorPlansSection plans={plans} bare />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Bu filtreye uyan birim yok.
          </div>
        )}
      </div>
    </div>
  );
}
