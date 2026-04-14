"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  GripVertical,
  LoaderCircle,
  Save,
  Upload,
  ImageIcon,
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
import { upsertFloorPlans, type FloorPlanInput } from "@/actions/floor-plans";
import { uploadMediaImage } from "@/actions/images";
import { MediaPicker } from "@/components/admin/media-picker";
import type { FloorPlan, FloorPlanParentType } from "@/types/property";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FloorPlansEditorProps {
  parentType: FloorPlanParentType;
  parentId: string;
  initial: FloorPlan[];
  /** Override default per-parent limit (default 20, 10 for sub-listings). */
  maxItems?: number;
}

const DEFAULT_MAX = 20;
const SUB_LISTING_MAX = 10;

// ---------------------------------------------------------------------------
// Draft
// ---------------------------------------------------------------------------

interface Draft {
  key: string;
  id?: string;
  url: string;
  label: string;
  alt_text: string;
  area_sqm: string;
  rooms: string;
}

function fromFloorPlan(fp: FloorPlan): Draft {
  return {
    key: fp.id,
    id: fp.id,
    url: fp.url,
    label: fp.label,
    alt_text: fp.alt_text ?? "",
    area_sqm: fp.area_sqm?.toString() ?? "",
    rooms: fp.rooms?.toString() ?? "",
  };
}

function toPayload(d: Draft, sort_order: number): FloorPlanInput {
  const toNum = (v: string): number | null => {
    const n = Number(v);
    return v === "" || Number.isNaN(n) ? null : n;
  };
  return {
    id: d.id,
    url: d.url,
    label: d.label.trim(),
    alt_text: d.alt_text.trim() || null,
    area_sqm: toNum(d.area_sqm),
    rooms: toNum(d.rooms),
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-md border bg-card p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label="Taşı"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Thumbnail */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-muted">
        {draft.url ? (
          <Image
            src={draft.url}
            alt={draft.alt_text || draft.label}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            —
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div>
          <label
            className={[
              "mb-1 block text-xs font-medium",
              draft.label.trim()
                ? "text-muted-foreground"
                : "text-destructive",
            ].join(" ")}
          >
            Başlık <span className="text-destructive">*</span>
            {!draft.label.trim() && (
              <span className="ml-1 font-normal">— bu alana bir başlık yazın</span>
            )}
          </label>
          <Input
            value={draft.label}
            onChange={(e) => update("label", e.target.value)}
            placeholder="ör. Zemin Kat, A Blok 2+1, Giriş Kat"
            required
            className={
              draft.label.trim()
                ? undefined
                : "border-destructive focus-visible:ring-destructive/30"
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Alan (m²)
            </label>
            <Input
              value={draft.area_sqm}
              onChange={(e) => update("area_sqm", e.target.value)}
              placeholder="0"
              type="number"
              step="0.01"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Oda Sayısı
            </label>
            <Input
              value={draft.rooms}
              onChange={(e) => update("rooms", e.target.value)}
              placeholder="0"
              type="number"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Alt Metin (SEO, opsiyonel)
          </label>
          <Input
            value={draft.alt_text}
            onChange={(e) => update("alt_text", e.target.value)}
            placeholder="Görselin açıklaması"
            className="text-xs"
          />
        </div>
      </div>

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
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FloorPlansEditor({
  parentType,
  parentId,
  initial,
  maxItems,
}: FloorPlansEditorProps) {
  const resolvedMax =
    maxItems ?? (parentType === "sub_listing" ? SUB_LISTING_MAX : DEFAULT_MAX);

  const [drafts, setDrafts] = useState<Draft[]>(() =>
    initial.map(fromFloorPlan)
  );
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (drafts.length + files.length > resolvedMax) {
      toast.error(`En fazla ${resolvedMax} kat planı eklenebilir.`);
      return;
    }
    setUploading(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadMediaImage(fd);
        if (res.error) {
          toast.error(`${file.name}: ${res.error}`);
          return null;
        }
        return res.data?.url ?? null;
      });
      const urls = (await Promise.all(uploads)).filter(
        (u): u is string => !!u
      );
      if (urls.length > 0) {
        setDrafts((prev) => [
          ...prev,
          ...urls.map((url) => ({
            key: crypto.randomUUID(),
            url,
            label: "",
            alt_text: "",
            area_sqm: "",
            rooms: "",
          })),
        ]);
        toast.success(
          `${urls.length} görsel yüklendi. Her plan için bir başlık giriniz.`,
        );
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
    const invalid = drafts.find((d) => !d.label.trim() || !d.url);
    if (invalid) {
      toast.error("Her kat planı için başlık ve görsel gerekli.");
      return;
    }

    startTransition(async () => {
      const payload = drafts.map((d, i) => toPayload(d, i));
      const result = await upsertFloorPlans(parentType, parentId, payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.data?.count ?? 0} kat planı kaydedildi.`);
      }
    });
  };

  const missingLabel = drafts.some((d) => !d.label.trim());
  const addFromGallery = (url: string) => {
    if (drafts.length >= resolvedMax) {
      toast.error(`En fazla ${resolvedMax} kat planı eklenebilir.`);
      return;
    }
    setDrafts((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        url,
        label: "",
        alt_text: "",
        area_sqm: "",
        rooms: "",
      },
    ]);
    toast.success("Galeriden görsel eklendi. Başlık girmeyi unutma.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {drafts.length} / {resolvedMax} kat planı
          {missingLabel && (
            <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Başlık eksik
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
            disabled={drafts.length >= resolvedMax}
          >
            <ImageIcon className="size-4" />
            Galeriden Seç
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || drafts.length >= resolvedMax}
          >
            {uploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Görsel Yükle
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
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
          Henüz kat planı yok. JPEG/PNG/WebP formatında yükleyebilirsiniz.
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
            <div className="space-y-2">
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

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => addFromGallery(url)}
      />
    </div>
  );
}
