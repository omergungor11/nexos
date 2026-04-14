"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Clapperboard,
  Flame,
  GripVertical,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  toggleHighlight,
  reorderHighlight,
  searchAvailableProperties,
  type HighlightFlag,
} from "@/actions/property-highlights";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HighlightedProperty = {
  id: string;
  listing_number: number;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  type: string;
  transaction_type: string;
  city_name: string;
  district_name: string | null;
  cover_image: string | null;
  is_slider: boolean;
  is_featured: boolean;
  is_showcase: boolean;
  is_deal: boolean;
  slider_order: number | null;
  featured_order: number | null;
  showcase_order: number | null;
  deal_order: number | null;
};

type SearchResult = {
  id: string;
  listing_number: number;
  title: string;
  price: number | null;
  currency: string;
  cover_image: string | null;
  city_name: string;
};

interface HighlightManagerProps {
  initialProperties: HighlightedProperty[];
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TAB_META: Array<{
  flag: HighlightFlag;
  label: string;
  icon: typeof Star;
  recommendedMax: number;
  flagField: "is_slider" | "is_featured" | "is_showcase" | "is_deal";
  orderField: "slider_order" | "featured_order" | "showcase_order" | "deal_order";
  description: string;
}> = [
  {
    flag: "slider",
    label: "Slider",
    icon: Clapperboard,
    recommendedMax: 5,
    flagField: "is_slider",
    orderField: "slider_order",
    description: "Anasayfa hero slider'ı — 3-5 premium ilan önerilir.",
  },
  {
    flag: "featured",
    label: "Öne Çıkan",
    icon: Star,
    recommendedMax: 12,
    flagField: "is_featured",
    orderField: "featured_order",
    description: "Listelerde yıldız rozeti + öne çıkan kartlar bölümü.",
  },
  {
    flag: "showcase",
    label: "Vitrin",
    icon: Sparkles,
    recommendedMax: 20,
    flagField: "is_showcase",
    orderField: "showcase_order",
    description: "/vitrin sayfasında gösterilen premium galeri.",
  },
  {
    flag: "deal",
    label: "Fırsat",
    icon: Flame,
    recommendedMax: 8,
    flagField: "is_deal",
    orderField: "deal_order",
    description: "Anasayfadaki fırsat ilanları bandı.",
  },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function formatListing(n: number) {
  return `#${String(n ?? 0).padStart(4, "0")}`;
}

function formatPrice(price: number | null, currency: string) {
  if (price == null || price <= 0) return "—";
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = new Intl.NumberFormat("tr-TR").format(price);
  return currency === "TRY" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function HighlightManager({ initialProperties }: HighlightManagerProps) {
  const searchParams = useSearchParams();
  const initialTab = ((): HighlightFlag => {
    const t = searchParams.get("tab");
    if (t === "slider" || t === "featured" || t === "showcase" || t === "deal") {
      return t;
    }
    return "slider";
  })();

  const [properties, setProperties] =
    useState<HighlightedProperty[]>(initialProperties);
  const [activeTab, setActiveTab] = useState<HighlightFlag>(initialTab);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v as HighlightFlag)}>
        <TabsList className="w-full">
          {TAB_META.map((m) => {
            const count = properties.filter((p) => p[m.flagField]).length;
            const Icon = m.icon;
            return (
              <TabsTrigger key={m.flag} value={m.flag} className="flex-1 gap-1.5">
                <Icon className="size-3.5" />
                {m.label}
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TAB_META.map((m) => (
          <TabsContent key={m.flag} value={m.flag} className="mt-4">
            <HighlightTab
              meta={m}
              properties={properties}
              setProperties={setProperties}
              onAdd={() => setAddOpen(true)}
            />
          </TabsContent>
        ))}
      </Tabs>

      {addOpen && (
        <AddPropertyDialog
          flag={activeTab}
          existingIds={new Set(
            properties
              .filter((p) => p[TAB_META.find((t) => t.flag === activeTab)!.flagField])
              .map((p) => p.id),
          )}
          otherFlagsByProperty={Object.fromEntries(
            properties.map((p) => [
              p.id,
              TAB_META.filter(
                (m) => m.flag !== activeTab && p[m.flagField],
              ).map((m) => m.flag),
            ]),
          )}
          onClose={() => setAddOpen(false)}
          onAdded={(searchResult, flag) => {
            const meta = TAB_META.find((t) => t.flag === flag)!;
            setProperties((prev) => {
              const existing = prev.find((p) => p.id === searchResult.id);
              if (existing) {
                // Flag already tracked — ONLY flip the single flag + its order.
                // Preserve every other flag/order so a listing sitting in
                // Slider + Fırsat doesn't lose its other memberships.
                return prev.map((p) =>
                  p.id === searchResult.id
                    ? ({
                        ...p,
                        [meta.flagField]: true,
                        [meta.orderField]: 9999,
                      } as HighlightedProperty)
                    : p,
                );
              }
              // Net-new row — other flags default to false.
              return [
                ...prev,
                {
                  id: searchResult.id,
                  listing_number: searchResult.listing_number,
                  slug: "",
                  title: searchResult.title,
                  price: searchResult.price,
                  currency: searchResult.currency,
                  type: "",
                  transaction_type: "",
                  city_name: searchResult.city_name,
                  district_name: null,
                  cover_image: searchResult.cover_image,
                  is_slider: flag === "slider",
                  is_featured: flag === "featured",
                  is_showcase: flag === "showcase",
                  is_deal: flag === "deal",
                  slider_order: flag === "slider" ? 9999 : null,
                  featured_order: flag === "featured" ? 9999 : null,
                  showcase_order: flag === "showcase" ? 9999 : null,
                  deal_order: flag === "deal" ? 9999 : null,
                },
              ];
            });
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-tab panel: sortable list + header + add button
// ---------------------------------------------------------------------------

interface HighlightTabProps {
  meta: (typeof TAB_META)[number];
  properties: HighlightedProperty[];
  setProperties: React.Dispatch<React.SetStateAction<HighlightedProperty[]>>;
  onAdd: () => void;
}

function HighlightTab({
  meta,
  properties,
  setProperties,
  onAdd,
}: HighlightTabProps) {
  const [, startTransition] = useTransition();
  const [removing, setRemoving] = useState<string | null>(null);

  const items = useMemo(
    () =>
      properties
        .filter((p) => p[meta.flagField])
        .sort((a, b) => {
          const ao = a[meta.orderField] ?? Infinity;
          const bo = b[meta.orderField] ?? Infinity;
          return ao - bo;
        }),
    [properties, meta],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const idOrder = reordered.map((p) => p.id);

    // Optimistic update
    setProperties((prev) =>
      prev.map((p) => {
        const idx = idOrder.indexOf(p.id);
        if (idx === -1) return p;
        return { ...p, [meta.orderField]: idx } as HighlightedProperty;
      }),
    );

    startTransition(async () => {
      const result = await reorderHighlight(meta.flag, idOrder);
      if (result.error) {
        toast.error(`Sıralama kaydedilemedi: ${result.error}`);
      }
    });
  };

  const handleRemove = (id: string) => {
    setRemoving(id);
    void (async () => {
      const result = await toggleHighlight(id, meta.flag, false);
      setRemoving(null);
      if (result.error) {
        toast.error(`Kaldırılamadı: ${result.error}`);
        return;
      }
      setProperties((prev) =>
        prev.map((p) =>
          p.id === id
            ? ({
                ...p,
                [meta.flagField]: false,
                [meta.orderField]: null,
              } as HighlightedProperty)
            : p,
        ),
      );
      toast.success("Listeden kaldırıldı.");
    })();
  };

  const overLimit = items.length > meta.recommendedMax;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/30 p-3">
        <div>
          <p className="text-sm font-medium">
            {items.length} ilan seçili
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (önerilen max {meta.recommendedMax})
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {meta.description}
          </p>
          {overLimit && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Önerilen limiti aştınız — gösterim yavaşlayabilir.
            </p>
          )}
        </div>
        <Button size="sm" onClick={onAdd} className="shrink-0 gap-1.5">
          <Plus className="size-3.5" />
          İlan Ekle
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10 text-center">
          <p className="text-sm text-muted-foreground">Henüz ilan eklenmemiş.</p>
          <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5">
            <Plus className="size-3.5" />
            İlk ilanı ekle
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {items.map((p, index) => (
                <SortableRow
                  key={p.id}
                  property={p}
                  index={index}
                  onRemove={handleRemove}
                  isRemoving={removing === p.id}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable row
// ---------------------------------------------------------------------------

function SortableRow({
  property,
  index,
  onRemove,
  isRemoving,
}: {
  property: HighlightedProperty;
  index: number;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: property.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-background p-2.5 shadow-sm"
    >
      <button
        type="button"
        aria-label="Sırala"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <span className="w-6 shrink-0 text-center text-xs font-mono font-semibold text-muted-foreground">
        {index + 1}
      </span>

      <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {property.cover_image ? (
          <Image
            src={property.cover_image}
            alt={property.title}
            width={56}
            height={56}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
            —
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          <span className="mr-2 font-mono text-xs text-muted-foreground">
            {formatListing(property.listing_number)}
          </span>
          {property.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {property.district_name
            ? `${property.district_name}, ${property.city_name}`
            : property.city_name}
        </p>
      </div>

      <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-primary">
        {formatPrice(property.price, property.currency)}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(property.id)}
        disabled={isRemoving}
        aria-label="Kaldır"
        className="shrink-0 text-destructive hover:bg-destructive/10"
      >
        {isRemoving ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </Button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Add-property dialog: searches active listings and toggles the flag on pick
// ---------------------------------------------------------------------------

function AddPropertyDialog({
  flag,
  existingIds,
  otherFlagsByProperty,
  onClose,
  onAdded,
}: {
  flag: HighlightFlag;
  existingIds: Set<string>;
  otherFlagsByProperty: Record<string, HighlightFlag[]>;
  onClose: () => void;
  onAdded: (searchResult: SearchResult, flag: HighlightFlag) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const runSearch = useCallback(async (value: string) => {
    setLoading(true);
    const res = await searchAvailableProperties(value, 30);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      setResults([]);
    } else {
      setResults(res.data ?? []);
    }
  }, []);

  // Debounced search
  const onSearchChange = useCallback(
    (val: string) => {
      setQ(val);
      const handle = setTimeout(() => runSearch(val), 250);
      return () => clearTimeout(handle);
    },
    [runSearch],
  );

  // Initial load
  useMemo(() => {
    runSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = TAB_META.find((m) => m.flag === flag)!;

  const handleAdd = async (r: SearchResult) => {
    setAdding(r.id);
    const result = await toggleHighlight(r.id, flag, true);
    setAdding(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    onAdded(r, flag);
    toast.success(`${meta.label} listesine eklendi.`);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <meta.icon className="size-4 text-primary" />
            {meta.label} listesine ilan ekle
          </DialogTitle>
          <DialogDescription>
            İlan no veya başlıkla ara, tıklayarak listeye ekle.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="İlan no veya başlık ara..."
            className="pl-9"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                runSearch("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
              aria-label="Temizle"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto rounded-md border">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sonuç bulunamadı.
            </p>
          ) : (
            <ul className="divide-y">
              {results.map((r) => {
                const already = existingIds.has(r.id);
                const otherFlags = otherFlagsByProperty[r.id] ?? [];
                return (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 p-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                      {r.cover_image ? (
                        <Image
                          src={r.cover_image}
                          alt={r.title}
                          width={44}
                          height={44}
                          className="size-full object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        <span className="mr-2 font-mono text-xs text-muted-foreground">
                          {formatListing(r.listing_number)}
                        </span>
                        {r.title}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {r.city_name}
                        {otherFlags.length > 0 && (
                          <span className="flex items-center gap-1">
                            {otherFlags.map((f) => {
                              const m = TAB_META.find((t) => t.flag === f)!;
                              const Icon = m.icon;
                              return (
                                <span
                                  key={f}
                                  className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                                  title={`${m.label} listesinde`}
                                >
                                  <Icon className="size-2.5" />
                                  {m.label}
                                </span>
                              );
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {formatPrice(r.price, r.currency)}
                    </span>
                    <Button
                      size="sm"
                      variant={already ? "outline" : "default"}
                      disabled={already || adding === r.id}
                      onClick={() => handleAdd(r)}
                      className="shrink-0"
                    >
                      {adding === r.id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : already ? (
                        "Eklendi"
                      ) : (
                        "Ekle"
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
