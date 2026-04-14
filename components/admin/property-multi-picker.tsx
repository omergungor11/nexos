"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Plus, X, GripVertical } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatListingPrice } from "@/lib/format";
import type { PickerProperty } from "@/lib/queries/showcases";
import type { Currency } from "@/types/property";

interface PropertyMultiPickerProps {
  available: PickerProperty[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxItems?: number;
}

const DEFAULT_MAX = 30;

export function PropertyMultiPicker({
  available,
  selectedIds,
  onChange,
  maxItems = DEFAULT_MAX,
}: PropertyMultiPickerProps) {
  const [query, setQuery] = useState("");

  const byId = useMemo(
    () => new Map(available.map((p) => [p.id, p])),
    [available]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.city_name.toLowerCase().includes(q) ||
        (p.district_name?.toLowerCase().includes(q) ?? false) ||
        String(p.listing_number).includes(q)
    );
  }, [available, query]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isFull = selectedIds.length >= maxItems;

  function add(id: string) {
    if (selectedIds.includes(id) || isFull) return;
    onChange([...selectedIds, id]);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  function handleDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIndex = selectedIds.indexOf(String(e.active.id));
    const newIndex = selectedIds.indexOf(String(e.over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(selectedIds, oldIndex, newIndex));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      {/* Sol: arama + mevcut listesi */}
      <div className="space-y-2 rounded-md border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">Mevcut İlanlar</h4>
          <span className="text-xs text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Başlık, ilan no, şehir, ilçe ara…"
            className="pl-8"
          />
        </div>
        <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1 admin-scroll">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Eşleşen ilan yok.
            </p>
          ) : (
            filtered.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => (isSelected ? remove(p.id) : add(p.id))}
                  disabled={!isSelected && isFull}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-md border p-2 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                  ].join(" ")}
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded bg-muted">
                    {p.cover_image && (
                      <Image
                        src={p.cover_image}
                        alt={p.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      <span className="text-muted-foreground">
                        #{p.listing_number}
                      </span>{" "}
                      {p.title}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {p.district_name ?? p.city_name} —{" "}
                      {formatListingPrice(p.price, p.currency as Currency, "fixed")}
                    </p>
                  </div>
                  {isSelected ? (
                    <X className="size-4 text-destructive" />
                  ) : (
                    <Plus className="size-4 text-muted-foreground" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Sağ: seçilenler (sortable) */}
      <div className="space-y-2 rounded-md border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">Seçilen İlanlar</h4>
          <span className="text-xs text-muted-foreground">
            {selectedIds.length} / {maxItems}
          </span>
        </div>
        {selectedIds.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
            Soldan ekleyerek başla. Sürükleyerek sıralayabilirsin.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {selectedIds.map((id) => {
                  const p = byId.get(id);
                  if (!p) return null;
                  return (
                    <SortableSelectedRow
                      key={id}
                      property={p}
                      onRemove={() => remove(id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortableSelectedRow({
  property,
  onRemove,
}: {
  property: PickerProperty;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: property.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-background p-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label="Sırala"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="relative size-12 shrink-0 overflow-hidden rounded bg-muted">
        {property.cover_image && (
          <Image
            src={property.cover_image}
            alt={property.title}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">
          <span className="text-muted-foreground">
            #{property.listing_number}
          </span>{" "}
          {property.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {property.district_name ?? property.city_name} —{" "}
          {formatListingPrice(
            property.price,
            property.currency as Currency,
            "fixed"
          )}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label="Çıkar"
      >
        <X className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
