"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  PencilIcon,
  Trash2Icon,
  MoreHorizontalIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteOffer, updateOfferStatus } from "@/actions/offers";
import { formatPrice } from "@/lib/format";
import type { OfferStatus } from "@/types/offer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PropertyRef = {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
};

type OfferRow = {
  id: string;
  property_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  offer_price: number;
  currency: string;
  notes: string | null;
  status: OfferStatus;
  expires_at: string | null;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  property: PropertyRef | null;
};

interface OfferDataTableProps {
  offers: OfferRow[];
  properties: { id: string; title: string; price: number; currency: string }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_TABS: { value: OfferStatus | "all"; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "draft", label: "Taslak" },
  { value: "sent", label: "Gönderildi" },
  { value: "accepted", label: "Kabul Edildi" },
  { value: "rejected", label: "Reddedildi" },
  { value: "expired", label: "Süresi Doldu" },
];

const STATUS_LABELS: Record<OfferStatus, string> = {
  draft: "Taslak",
  sent: "Gönderildi",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  expired: "Süresi Doldu",
};

const STATUS_CLASSES: Record<OfferStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-orange-100 text-orange-700",
};

const STATUS_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  draft: ["sent", "expired"],
  sent: ["accepted", "rejected", "expired"],
  accepted: ["rejected"],
  rejected: ["accepted"],
  expired: ["sent"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function calcDiscount(offerPrice: number, listingPrice: number): string {
  if (!listingPrice || offerPrice >= listingPrice) return "—";
  const pct = Math.round(((listingPrice - offerPrice) / listingPrice) * 100);
  return `%${pct}`;
}

// ---------------------------------------------------------------------------
// Delete dialog (standalone — opened via external state)
// ---------------------------------------------------------------------------

function DeleteDialog({
  offerId,
  customerName,
  open,
  onOpenChange,
  onDeleted,
}: {
  offerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOffer(offerId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Teklif silindi.");
        onDeleted(offerId);
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teklifi Sil</DialogTitle>
          <DialogDescription>
            &ldquo;{customerName}&rdquo; adına oluşturulan teklif kalıcı olarak
            silinecek. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Vazgeç</DialogClose>
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

export function OfferDataTable({ offers }: OfferDataTableProps) {
  const [rows, setRows] = useState<OfferRow[]>(offers);
  const [activeTab, setActiveTab] = useState<OfferStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [, startTransition] = useTransition();

  function handleStatusChange(id: string, status: OfferStatus) {
    startTransition(async () => {
      const result = await updateOfferStatus(id, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        toast.success(`Durum güncellendi: ${STATUS_LABELS[status]}`);
      }
    });
  }

  function handleDeleted(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  // Filtering
  const filtered = rows.filter((r) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch = r.customer_name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <>
    {/* Delete confirmation dialog — rendered once outside the table */}
    {deleteTarget && (
      <DeleteDialog
        offerId={deleteTarget.id}
        customerName={deleteTarget.name}
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onDeleted={handleDeleted}
      />
    )}
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? rows.length
              : rows.filter((r) => r.status === tab.value).length;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === tab.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  activeTab === tab.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Müşteri adına göre ara..."
          className="h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Müşteri</th>
              <th className={thClass}>İlan</th>
              <th className={thClass}>Teklif Fiyatı</th>
              <th className={thClass}>İlan Fiyatı</th>
              <th className={thClass}>İndirim %</th>
              <th className={thClass}>Durum</th>
              <th className={thClass}>Tarih</th>
              <th className={thClass}>İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  {search
                    ? "Arama sonucu bulunamadı."
                    : "Bu kategoride teklif bulunmuyor."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const listingPrice = row.property?.price ?? 0;
                const discount = calcDiscount(row.offer_price, listingPrice);
                const transitions = STATUS_TRANSITIONS[row.status] ?? [];

                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* Customer */}
                    <td className="px-3 py-2">
                      <p className="font-medium">{row.customer_name}</p>
                      {(row.customer_phone || row.customer_email) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {row.customer_phone ?? row.customer_email}
                        </p>
                      )}
                    </td>

                    {/* Property */}
                    <td className="px-3 py-2 max-w-[200px]">
                      {row.property ? (
                        <Link
                          href={`/emlak/${row.property.slug}`}
                          target="_blank"
                          className="line-clamp-2 text-sm hover:underline"
                        >
                          {row.property.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Offer price */}
                    <td className="px-3 py-2 whitespace-nowrap font-medium tabular-nums">
                      {formatPrice(row.offer_price, row.currency)}
                    </td>

                    {/* Listing price */}
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground tabular-nums">
                      {row.property
                        ? formatPrice(row.property.price, row.property.currency)
                        : "—"}
                    </td>

                    {/* Discount */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {discount !== "—" ? (
                        <span className="text-amber-600 font-medium">
                          {discount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[row.status]}`}
                      >
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {formatDate(row.created_at)}
                      {row.expires_at && (
                        <p className="text-xs">
                          Son: {formatDate(row.expires_at)}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="İşlemler"
                            />
                          }
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Edit */}
                          <Link href={`/admin/teklifler/${row.id}/duzenle`}>
                            <DropdownMenuItem>
                              <PencilIcon className="size-4" />
                              Düzenle
                            </DropdownMenuItem>
                          </Link>

                          {/* Status transitions */}
                          {transitions.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <RefreshCwIcon className="size-4" />
                                  Durumu Değiştir
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {transitions.map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onSelect={() =>
                                        handleStatusChange(row.id, s)
                                      }
                                    >
                                      <span
                                        className={`mr-2 inline-block size-2 rounded-full ${
                                          s === "accepted"
                                            ? "bg-green-500"
                                            : s === "rejected"
                                              ? "bg-red-500"
                                              : s === "sent"
                                                ? "bg-blue-500"
                                                : s === "expired"
                                                  ? "bg-orange-500"
                                                  : "bg-muted-foreground"
                                        }`}
                                      />
                                      {STATUS_LABELS[s]}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </>
                          )}

                          {/* Delete */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() =>
                              setDeleteTarget({
                                id: row.id,
                                name: row.customer_name,
                              })
                            }
                          >
                            <Trash2Icon className="size-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
