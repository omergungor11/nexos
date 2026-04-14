"use client";

import { useState, useTransition, useId } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  GripVertical,
  LoaderCircle,
  Save,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  upsertSubListings,
  type SubListingInput,
} from "@/actions/sub-listings";
import type {
  SubListing,
  SubListingParentType,
  SubListingAvailability,
  Currency,
} from "@/types/property";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SubListingsEditorProps {
  parentType: SubListingParentType;
  parentId: string;
  initial: SubListing[];
}

const MAX_ITEMS = 50;

const AVAILABILITY_LABELS: Record<SubListingAvailability, string> = {
  available: "Müsait",
  reserved: "Rezerve",
  sold: "Satıldı",
  rented: "Kiralandı",
};

// ---------------------------------------------------------------------------
// Internal draft shape — items without an id are new
// ---------------------------------------------------------------------------

interface Draft {
  key: string;
  id?: string;
  label: string;
  description: string;
  rooms: string;
  living_rooms: string;
  bathrooms: string;
  room_config: string;
  area_sqm: string;
  price: string;
  currency: Currency | "__none__";
  availability: SubListingAvailability;
  unit_count: string;
}

function emptyDraft(): Draft {
  return {
    key: crypto.randomUUID(),
    label: "",
    description: "",
    rooms: "",
    living_rooms: "",
    bathrooms: "",
    room_config: "",
    area_sqm: "",
    price: "",
    currency: "__none__",
    availability: "available",
    unit_count: "1",
  };
}

function fromSubListing(s: SubListing): Draft {
  return {
    key: s.id,
    id: s.id,
    label: s.label,
    description: s.description ?? "",
    rooms: s.rooms?.toString() ?? "",
    living_rooms: s.living_rooms?.toString() ?? "",
    bathrooms: s.bathrooms?.toString() ?? "",
    room_config: s.room_config ?? "",
    area_sqm: s.area_sqm?.toString() ?? "",
    price: s.price?.toString() ?? "",
    currency: s.currency ?? "__none__",
    availability: s.availability,
    unit_count: s.unit_count.toString(),
  };
}

function toPayload(d: Draft, sort_order: number): SubListingInput {
  const toNum = (v: string): number | null => {
    const n = Number(v);
    return v === "" || Number.isNaN(n) ? null : n;
  };
  return {
    id: d.id,
    label: d.label.trim(),
    description: d.description.trim() || null,
    rooms: toNum(d.rooms),
    living_rooms: toNum(d.living_rooms),
    bathrooms: toNum(d.bathrooms),
    room_config: d.room_config.trim() || null,
    area_sqm: toNum(d.area_sqm),
    price: toNum(d.price),
    currency: d.currency === "__none__" ? null : d.currency,
    availability: d.availability,
    unit_count: Math.max(1, toNum(d.unit_count) ?? 1),
    sort_order,
  };
}

// ---------------------------------------------------------------------------
// Sortable row
// ---------------------------------------------------------------------------

function SortableRow({
  draft,
  onChange,
  onRemove,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: draft.key });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    onChange({ ...draft, [key]: value });

  const rowId = useId();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border bg-card p-3"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Taşı"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex-1 space-y-3">
          {/* Row 1: label + availability + remove */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={draft.label}
              onChange={(e) => update("label", e.target.value)}
              placeholder="Başlık (ör. A Blok 2+1, Teras Daire)"
              className="min-w-[200px] flex-1"
            />
            <Select
              value={draft.availability}
              onValueChange={(v) =>
                update("availability", v as SubListingAvailability)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue>{AVAILABILITY_LABELS[draft.availability]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(AVAILABILITY_LABELS) as SubListingAvailability[]).map(
                  (k) => (
                    <SelectItem key={k} value={k}>
                      {AVAILABILITY_LABELS[k]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Sil"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>

          {/* Row 2: specs grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <LabeledInput
              id={`${rowId}-rooms`}
              label="Oda"
              value={draft.rooms}
              onChange={(v) => update("rooms", v)}
              type="number"
            />
            <LabeledInput
              id={`${rowId}-living`}
              label="Salon"
              value={draft.living_rooms}
              onChange={(v) => update("living_rooms", v)}
              type="number"
            />
            <LabeledInput
              id={`${rowId}-bath`}
              label="Banyo"
              value={draft.bathrooms}
              onChange={(v) => update("bathrooms", v)}
              type="number"
            />
            <LabeledInput
              id={`${rowId}-area`}
              label="m²"
              value={draft.area_sqm}
              onChange={(v) => update("area_sqm", v)}
              type="number"
              step="0.01"
            />
          </div>

          {/* Row 3: price + currency + unit_count */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <LabeledInput
              id={`${rowId}-price`}
              label="Fiyat"
              value={draft.price}
              onChange={(v) => update("price", v)}
              type="number"
              placeholder="Boş = üstten miras al"
              className="sm:col-span-2"
            />
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Para birimi
              </label>
              <Select
                value={draft.currency}
                onValueChange={(v) =>
                  update("currency", v as Draft["currency"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {draft.currency === "__none__"
                      ? "Miras al"
                      : draft.currency}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Miras al</SelectItem>
                  <SelectItem value="TRY">TRY</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <LabeledInput
              id={`${rowId}-count`}
              label="Adet"
              value={draft.unit_count}
              onChange={(v) => update("unit_count", v)}
              type="number"
              min="1"
            />
          </div>

          {/* Optional description */}
          <Textarea
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Notlar (opsiyonel)"
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
  id,
  label,
  value,
  onChange,
  className,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SubListingsEditor({
  parentType,
  parentId,
  initial,
}: SubListingsEditorProps) {
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    initial.map(fromSubListing)
  );
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = () => {
    if (drafts.length >= MAX_ITEMS) {
      toast.error(`En fazla ${MAX_ITEMS} alt ilan eklenebilir.`);
      return;
    }
    setDrafts((prev) => [...prev, emptyDraft()]);
  };

  const handleChange = (key: string, next: Draft) => {
    setDrafts((prev) => prev.map((d) => (d.key === key ? next : d)));
  };

  const handleRemove = (key: string) => {
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    setDrafts((prev) => {
      const oldIndex = prev.findIndex((d) => d.key === e.active.id);
      const newIndex = prev.findIndex((d) => d.key === e.over!.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    const invalid = drafts.find((d) => !d.label.trim());
    if (invalid) {
      toast.error("Her alt ilan için başlık gerekli.");
      return;
    }

    startTransition(async () => {
      const payload = drafts.map((d, i) => toPayload(d, i));
      const result = await upsertSubListings(parentType, parentId, payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.data?.count ?? 0} alt ilan kaydedildi.`);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {drafts.length} / {MAX_ITEMS} alt ilan
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={drafts.length >= MAX_ITEMS}
          >
            <Plus className="size-4" /> Ekle
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Kaydet
          </Button>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Henüz alt ilan yok. Site projelerinde daire tiplerini, tek ilanda farklı
          birimleri buradan ekleyebilirsin.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={drafts.map((d) => d.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {drafts.map((draft) => (
                <SortableRow
                  key={draft.key}
                  draft={draft}
                  onChange={(next) => handleChange(draft.key, next)}
                  onRemove={() => handleRemove(draft.key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
