"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useComparisonStore } from "@/store/comparison-store";
import { formatPrice, formatArea, formatRooms } from "@/lib/format";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants";
import type { PropertyListItem } from "@/types";

// -----------------------------------------------------------------------
// useSyncExternalStore-based client-only guard
// Returns true only on the client, preventing hydration mismatches caused
// by persisted Zustand state that isn't available during SSR.
// -----------------------------------------------------------------------

// useSyncExternalStore requires a subscribe function; we never actually subscribe
// to anything here — the store snapshot changes are enough to detect client mount.
const subscribe: Parameters<typeof useSyncExternalStore>[0] = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,   // client snapshot
    () => false   // server snapshot
  );
}

// -----------------------------------------------------------------------
// Row definitions for the comparison spec table
// -----------------------------------------------------------------------

type RowRenderer = (p: PropertyListItem) => React.ReactNode;

interface SpecRow {
  label: string;
  render: RowRenderer;
}

function BoolCell({ value }: { value: boolean | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return value ? (
    <CheckCircle2 className="mx-auto size-5 text-green-500" />
  ) : (
    <XCircle className="mx-auto size-5 text-muted-foreground/50" />
  );
}

const SPEC_ROWS: SpecRow[] = [
  {
    label: "Fiyat",
    render: (p) => (
      <span className="font-bold text-primary">
        {formatPrice(p.price ?? 0, p.currency)}
      </span>
    ),
  },
  {
    label: "İşlem Türü",
    render: (p) =>
      TRANSACTION_TYPE_LABELS[p.transaction_type] ?? p.transaction_type,
  },
  {
    label: "İlan Türü",
    render: (p) => PROPERTY_TYPE_LABELS[p.type] ?? p.type,
  },
  {
    label: "Alan",
    render: (p) => formatArea(p.area_sqm),
  },
  {
    label: "Oda Sayısı",
    render: (p) => formatRooms(p.rooms, p.living_rooms),
  },
  {
    label: "Kat",
    render: (p) =>
      p.floor !== null ? (
        `${p.floor}. kat`
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    label: "Konum",
    render: (p) =>
      [p.district?.name, p.city?.name].filter(Boolean).join(", ") || "—",
  },
];

// -----------------------------------------------------------------------
// ComparisonTable component
// -----------------------------------------------------------------------

export function ComparisonTable() {
  const { items, removeItem, clear } = useComparisonStore();
  const isClient = useIsClient();

  // Show spinner until client-side Zustand state is available
  if (!isClient) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          Karşılaştırma listeniz boş.
        </p>
        <p className="text-sm text-muted-foreground">
          İlan kartlarındaki &quot;Karşılaştır&quot; butonuna tıklayarak
          buraya ilan ekleyebilirsiniz.
        </p>
        <Link
          href="/emlak"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          İlanlara Göz At
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} ilan karşılaştırılıyor (maksimum 4)
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-destructive hover:underline focus-visible:outline-none"
        >
          Tümünü Temizle
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          {/* Property header row */}
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="w-36 p-4 text-left font-medium text-muted-foreground">
                Özellik
              </th>
              {items.map((property) => (
                <th key={property.id} className="p-4 align-top">
                  <div className="flex flex-col gap-3">
                    {/* Cover image */}
                    <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px] overflow-hidden rounded-lg">
                      <Image
                        src={property.cover_image ?? "/placeholder-property.svg"}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                    </div>

                    {/* Title + remove */}
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/emlak/${property.slug}`}
                        className="line-clamp-2 text-left text-xs font-semibold hover:text-primary transition-colors"
                      >
                        {property.title}
                      </Link>
                      <button
                        type="button"
                        aria-label="Karşılaştırmadan kaldır"
                        onClick={() => removeItem(property.id)}
                        className="mt-0.5 shrink-0 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}

              {/* Empty placeholder columns to maintain 4-column layout */}
              {Array.from({ length: 4 - items.length }).map((_, i) => (
                <th
                  key={`empty-${i}`}
                  className="p-4 align-top text-center text-xs text-muted-foreground/50"
                >
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4">
                    <span>Boş Slot</span>
                    <Link
                      href="/emlak"
                      className="text-primary hover:underline"
                    >
                      İlan ekle
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Spec rows */}
          <tbody>
            {SPEC_ROWS.map((row, index) => (
              <tr
                key={row.label}
                className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}
              >
                <td className="p-4 font-medium text-muted-foreground">
                  {row.label}
                </td>
                {items.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {row.render(property)}
                  </td>
                ))}
                {Array.from({ length: 4 - items.length }).map((_, i) => (
                  <td key={`empty-cell-${i}`} className="p-4" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick links to each property's detail page */}
      <div className="flex flex-wrap gap-3">
        {items.map((property) => (
          <Link
            key={property.id}
            href={`/emlak/${property.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {property.title}
            <ArrowRight className="size-3.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Re-export BoolCell so it can be used in future extended rows
export { BoolCell };
