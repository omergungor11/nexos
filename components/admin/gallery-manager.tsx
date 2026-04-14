"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Trash2,
  Star,
  CheckSquare,
  Square,
  ImageIcon,
  Calendar,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Upload,
  Loader2,
} from "lucide-react";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { deletePropertyImage, reorderPropertyImages } from "@/actions/images";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import type { GalleryImage, GalleryCity, GalleryDistrict } from "@/app/admin/galeri/page";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

// ---------------------------------------------------------------------------
// Sortable Image Card
// ---------------------------------------------------------------------------

function SortableImageCard({
  img,
  isSelected,
  onToggleSelect,
  onShowDetail,
}: {
  img: GalleryImage;
  isSelected: boolean;
  onToggleSelect: () => void;
  onShowDetail: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-lg border transition-all ${
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-foreground/20"
      }`}
    >
      {/* Drag handle */}
      <button
        className="absolute left-1.5 bottom-1.5 z-10 cursor-grab rounded bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>

      {/* Selection checkbox */}
      <button
        className="absolute left-1.5 top-1.5 z-10 rounded bg-black/50 p-0.5 text-white transition-opacity group-hover:opacity-100"
        style={{ opacity: isSelected ? 1 : undefined }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
      >
        {isSelected ? (
          <CheckSquare className="size-4" />
        ) : (
          <Square className="size-4 opacity-60 group-hover:opacity-100" />
        )}
      </button>

      {/* Cover badge */}
      {img.is_cover && (
        <div className="absolute right-1.5 top-1.5 z-10 rounded bg-amber-500 p-0.5">
          <Star className="size-3 text-white" fill="white" />
        </div>
      )}

      {/* Sort order badge */}
      <div className="absolute right-1.5 bottom-1.5 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {img.sort_order + 1}
      </div>

      {/* Image */}
      <button
        className="block w-full"
        onClick={onShowDetail}
      >
        <div className="relative aspect-square bg-muted">
          <Image
            src={img.url}
            alt={img.alt_text || ""}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        </div>
      </button>

      {/* Info */}
      <div className="px-2 py-1.5">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="size-2.5" />
          {formatDate(img.created_at).split(",")[0]}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image Detail Dialog
// ---------------------------------------------------------------------------

// Detail info for property images or standalone media URLs
type DetailTarget =
  | { type: "property"; image: GalleryImage }
  | { type: "media"; url: string; name?: string; created_at?: string };

function ImageDetailDialog({
  target,
  open,
  onClose,
  onDelete,
}: {
  target: DetailTarget;
  open: boolean;
  onClose: () => void;
  onDelete: (target: DetailTarget) => void;
}) {
  const url = target.type === "property" ? target.image.url : target.url;
  const [deleting, setDeleting] = useState(false);
  const [imgMeta, setImgMeta] = useState<{ width: number; height: number; size: string } | null>(null);

  // Load image dimensions + estimate file size
  useEffect(() => {
    if (!open || !url) return;
    setImgMeta(null);
    const img = new window.Image();
    img.onload = () => {
      setImgMeta({ width: img.naturalWidth, height: img.naturalHeight, size: "" });
    };
    img.src = url;

    // Try HEAD request for file size
    fetch(url, { method: "HEAD" })
      .then((res) => {
        const len = res.headers.get("content-length");
        const type = res.headers.get("content-type");
        if (len) {
          const bytes = parseInt(len, 10);
          const sizeStr = bytes > 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
            : `${(bytes / 1024).toFixed(0)} KB`;
          setImgMeta((prev) => prev ? { ...prev, size: sizeStr, ...(type ? {} : {}) } : prev);
        }
      })
      .catch(() => {});
  }, [open, url]);

  // Extract filename from URL
  const fileName = url.split("/").pop()?.split("?")[0] ?? "—";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Görsel Detayı</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={url}
              alt={target.type === "property" ? (target.image.alt_text || "Görsel") : "Görsel"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
              unoptimized
            />
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* File name */}
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Dosya Adı</p>
              <p className="mt-0.5 font-mono text-xs break-all">{fileName}</p>
            </div>

            {/* Dimensions */}
            {imgMeta && (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Çözünürlük</p>
                <p className="mt-0.5">{imgMeta.width} × {imgMeta.height} px</p>
              </div>
            )}

            {/* File size */}
            {imgMeta?.size && (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Dosya Boyutu</p>
                <p className="mt-0.5">{imgMeta.size}</p>
              </div>
            )}

            {/* Property info (only for property images) */}
            {target.type === "property" && (
              <>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">İlan</p>
                  <Link
                    href={`/admin/ilanlar/${target.image.property_id}/duzenle`}
                    className="mt-0.5 block font-medium text-primary hover:underline"
                  >
                    {target.image.property_title}
                  </Link>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Sıra</p>
                  <p className="mt-0.5">{target.image.sort_order}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Kapak Görseli</p>
                  <p className="mt-0.5">{target.image.is_cover ? "Evet" : "Hayır"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Alt Metin</p>
                  <p className="mt-0.5 text-muted-foreground">{target.image.alt_text || "Belirtilmemiş"}</p>
                </div>
              </>
            )}

            {/* Created date */}
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Yükleme Tarihi</p>
              <p className="mt-0.5">
                {target.type === "property"
                  ? formatDate(target.image.created_at)
                  : target.created_at
                    ? formatDate(target.created_at)
                    : "—"}
              </p>
            </div>

            {/* URL */}
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">URL</p>
              <div className="mt-0.5 flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block flex-1 truncate text-xs text-primary hover:underline"
                >
                  {url}
                </a>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(url);
                    toast.success("URL kopyalandı.");
                  }}
                  title="URL Kopyala"
                >
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={() => {
              if (!confirm("Bu görsel kalıcı olarak silinecek. Emin misiniz?")) return;
              setDeleting(true);
              onDelete(target);
            }}
            className="gap-1.5"
          >
            <Trash2 className="size-3.5" />
            {deleting ? "Siliniyor..." : "Görseli Sil"}
          </Button>
          <DialogClose render={<Button variant="outline" />}>
            Kapat
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sortable Image Grid (per property group)
// ---------------------------------------------------------------------------

function SortableImageGrid({
  propertyId,
  images: groupImages,
  selectedIds,
  onToggleSelect,
  onShowDetail,
  onReorder,
}: {
  propertyId: string;
  images: GalleryImage[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onShowDetail: (img: GalleryImage) => void;
  onReorder: (propertyId: string, newImages: GalleryImage[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const imageIds = useMemo(() => groupImages.map((img) => img.id), [groupImages]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = groupImages.findIndex((img) => img.id === active.id);
    const newIndex = groupImages.findIndex((img) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(groupImages, oldIndex, newIndex).map((img, i) => ({
      ...img,
      sort_order: i,
    }));

    onReorder(propertyId, reordered);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={imageIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {groupImages.map((img) => (
            <SortableImageCard
              key={img.id}
              img={img}
              isSelected={selectedIds.has(img.id)}
              onToggleSelect={() => onToggleSelect(img.id)}
              onShowDetail={() => onShowDetail(img)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export type MediaFile = {
  name: string;
  url: string;
  created_at: string;
};

interface GalleryManagerProps {
  initialImages: GalleryImage[];
  properties: { id: string; title: string }[];
  cities: GalleryCity[];
  districts: GalleryDistrict[];
  mediaImages?: MediaFile[];
}

export function GalleryManager({ initialImages, properties, cities, districts, mediaImages = [] }: GalleryManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [recentFilter, setRecentFilter] = useState("10");
  const [cityFilter, setCityFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);
  const [isPending, startTransition] = useTransition();
  const [visibleCount, setVisibleCount] = useState(60);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["__media__"]));
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload handler — compress to WebP + direct Supabase Storage upload
  async function handleUploadFiles(files: FileList | File[]) {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) {
      toast.error("Sadece görsel dosyaları yüklenebilir.");
      return;
    }

    setUploading(true);
    let successCount = 0;
    const newUrls: string[] = [];
    const supabase = createClient();

    for (const file of fileArr) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name}: 15 MB sınırını aşıyor.`);
        continue;
      }

      try {
        // Compress and convert to WebP
        const compressed = await compressImage(file);

        const safeName = file.name
          .toLowerCase()
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const storagePath = `media/${Date.now()}-${safeName}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(storagePath, compressed, {
            contentType: "image/webp",
            upsert: false,
          });

        if (uploadError) {
          toast.error(`${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("property-images")
          .getPublicUrl(storagePath);

        successCount++;
        newUrls.push(publicUrl);
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        toast.error(`${file.name}: Sıkıştırma/yükleme hatası.`);
      }
    }

    setUploading(false);
    setUploadedUrls((prev) => [...newUrls, ...prev]);

    if (successCount > 0) {
      toast.success(`${successCount} görsel yüklendi.`);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void handleUploadFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      void handleUploadFiles(e.dataTransfer.files);
    }
  }

  // Districts filtered by selected city
  const filteredDistricts = useMemo(() => {
    if (cityFilter === "all") return [];
    return districts.filter((d) => d.city_id === Number(cityFilter));
  }, [districts, cityFilter]);

  // Cities that actually have images
  const citiesWithImages = useMemo(() => {
    const cityIds = new Set(images.map((img) => img.city_id).filter(Boolean));
    return cities.filter((c) => cityIds.has(c.id));
  }, [images, cities]);

  // Get unique property IDs ordered by most recent image
  const recentPropertyIds = useMemo(() => {
    const seen = new Map<string, string>();
    for (const img of images) {
      const existing = seen.get(img.property_id);
      if (!existing || img.created_at > existing) {
        seen.set(img.property_id, img.created_at);
      }
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1].localeCompare(a[1]))
      .map(([id]) => id);
  }, [images]);

  const filtered = useMemo(() => {
    let result = images;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (img) =>
          img.property_title.toLowerCase().includes(q) ||
          img.alt_text?.toLowerCase().includes(q)
      );
    }

    // City filter
    if (cityFilter !== "all") {
      result = result.filter((img) => img.city_id === Number(cityFilter));
    }

    // District filter
    if (districtFilter !== "all") {
      result = result.filter((img) => img.district_id === Number(districtFilter));
    }

    // Property filter
    if (propertyFilter !== "all") {
      result = result.filter((img) => img.property_id === propertyFilter);
    }

    // Recent N properties filter
    if (recentFilter !== "all") {
      const n = parseInt(recentFilter, 10);
      const allowedIds = new Set(recentPropertyIds.slice(0, n));
      result = result.filter((img) => allowedIds.has(img.property_id));
    }

    return result;
  }, [images, propertyFilter, recentFilter, cityFilter, districtFilter, search, recentPropertyIds]);

  // Group images by property — sort images within group by sort_order
  const grouped = useMemo(() => {
    const map = new Map<string, GalleryImage[]>();
    for (const img of filtered) {
      const key = img.property_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(img);
    }
    return Array.from(map.entries()).map(([propertyId, imgs]) => ({
      propertyId,
      title: imgs[0].property_title,
      slug: imgs[0].property_slug,
      images: imgs.sort((a, b) => a.sort_order - b.sort_order),
    }));
  }, [filtered]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((img) => img.id)));
    }
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;

    if (!confirm(`${count} görsel silinecek. Emin misiniz?`)) return;

    startTransition(async () => {
      let deleted = 0;
      for (const id of selectedIds) {
        const result = await deletePropertyImage(id);
        if (!result.error) deleted++;
      }
      setImages((prev) => prev.filter((img) => !selectedIds.has(img.id)));
      setSelectedIds(new Set());
      toast.success(`${deleted} görsel silindi.`);
    });
  }

  function handleReorder(propertyId: string, newImages: GalleryImage[]) {
    // Optimistic update
    setImages((prev) => {
      const otherImages = prev.filter((img) => img.property_id !== propertyId);
      return [...otherImages, ...newImages];
    });

    // Persist to DB
    startTransition(async () => {
      const result = await reorderPropertyImages(
        propertyId,
        newImages.map((img) => img.id)
      );
      if (result.error) {
        toast.error(`Sıralama kaydedilemedi: ${result.error}`);
        // Revert on error
        setImages(initialImages);
      } else {
        toast.success("Görsel sırası güncellendi.");
      }
    });
  }

  // Property options for filter
  const propertyOptions = useMemo(() => {
    const ids = new Set(images.map((img) => img.property_id));
    return properties.filter((p) => ids.has(p.id));
  }, [images, properties]);

  function toggleGroup(propertyId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });
  }

  function expandAll() {
    setExpandedGroups(new Set(grouped.map((g) => g.propertyId)));
  }

  function collapseAll() {
    setExpandedGroups(new Set());
  }

  const filteredGroupCount = grouped.length;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-6 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-muted-foreground/40"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Yükleniyor...</span>
          </>
        ) : (
          <>
            <Upload className="size-6 text-muted-foreground/50" />
            <div className="text-sm">
              <span className="font-medium">Görselleri sürükleyip bırakın</span>
              <span className="text-muted-foreground"> veya </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-primary hover:underline"
              >
                dosya seçin
              </button>
            </div>
            <span className="text-xs text-muted-foreground">JPEG, PNG, WebP — Maks. 15 MB</span>
          </>
        )}
      </div>

      {/* Son Eklenen Görseller — 2 satır grid, tıklanabilir */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Son Eklenen Görseller</p>
        <div className="grid grid-cols-10 gap-2">
          {uploadedUrls.map((url, i) => (
            <button
              key={`new-${i}`}
              type="button"
              onClick={() => setDetailTarget({ type: "media", url })}
              className="relative aspect-square overflow-hidden rounded-lg border hover:ring-2 hover:ring-primary transition-all cursor-pointer"
            >
              <Image src={url} alt="" fill className="object-cover" sizes="80px" unoptimized />
              <div className="absolute top-0.5 left-0.5 rounded bg-green-600 px-1 py-0.5 text-[8px] font-bold text-white leading-none">
                Yeni
              </div>
            </button>
          ))}
          {images.slice(0, Math.max(0, 20 - uploadedUrls.length)).map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setDetailTarget({ type: "property", image: img })}
              className="relative aspect-square overflow-hidden rounded-lg border hover:ring-2 hover:ring-primary transition-all cursor-pointer"
            >
              <Image src={img.url} alt={img.alt_text ?? ""} fill className="object-cover" sizes="80px" unoptimized />
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar Row 1: Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(60); }}
            placeholder="İlan adı ile ara..."
            className="flex h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* City filter */}
        <Select
          value={cityFilter}
          onValueChange={(v) => {
            setCityFilter(v ?? "all");
            setDistrictFilter("all");
            setVisibleCount(60);
          }}
        >
          <SelectTrigger className="h-8 w-44">
            <SelectValue>
              {cityFilter === "all"
                ? "Tüm İller"
                : citiesWithImages.find((c) => c.id === Number(cityFilter))?.name ?? "Seçiniz"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İller</SelectItem>
            {citiesWithImages.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District filter — only shown when a city is selected */}
        {cityFilter !== "all" && filteredDistricts.length > 0 && (
          <Select
            value={districtFilter}
            onValueChange={(v) => { setDistrictFilter(v ?? "all"); setVisibleCount(60); }}
          >
            <SelectTrigger className="h-8 w-44">
              <SelectValue>
                {districtFilter === "all"
                  ? "Tüm İlçeler"
                  : filteredDistricts.find((d) => d.id === Number(districtFilter))?.name ?? "Seçiniz"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm İlçeler</SelectItem>
              {filteredDistricts.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Property dropdown */}
        <Select value={propertyFilter} onValueChange={(v) => { setPropertyFilter(v ?? "all"); setVisibleCount(60); }}>
          <SelectTrigger className="h-8 w-56">
            <SelectValue placeholder="Tüm İlanlar">
              {propertyFilter === "all"
                ? `Tüm İlanlar (${images.length})`
                : propertyOptions.find((p) => p.id === propertyFilter)?.title ?? "Seçiniz"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İlanlar ({images.length} görsel)</SelectItem>
            {propertyOptions.map((p) => {
              const count = images.filter((img) => img.property_id === p.id).length;
              return (
                <SelectItem key={p.id} value={p.id}>
                  {p.title} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Recent filter */}
        <Select value={recentFilter} onValueChange={(v) => { setRecentFilter(v ?? "all"); setVisibleCount(60); }}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue>
              {recentFilter === "all" ? "Tümü" : `Son ${recentFilter} İlan`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="5">Son 5 İlan</SelectItem>
            <SelectItem value="10">Son 10 İlan</SelectItem>
            <SelectItem value="20">Son 20 İlan</SelectItem>
            <SelectItem value="50">Son 50 İlan</SelectItem>
            <SelectItem value="100">Son 100 İlan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toolbar Row 2: Selection + Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} görsel — {filteredGroupCount} ilan
          {search && ` ("${search}" araması)`}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandedGroups.size === grouped.length ? collapseAll : expandAll}
          >
            {expandedGroups.size === grouped.length ? "Tümünü Daralt" : "Tümünü Genişlet"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
          >
            {selectedIds.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="size-3.5" />
            ) : (
              <Square className="size-3.5" />
            )}
            {selectedIds.size > 0 ? `${selectedIds.size} seçili` : "Tümünü Seç"}
          </Button>

          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              <Trash2 className="size-3.5" />
              {selectedIds.size} Görsel Sil
            </Button>
          )}
        </div>
      </div>

      {/* Diğer Görseller — not linked to any property, always on top */}
      {(mediaImages.length > 0 || uploadedUrls.length > 0) && (
        <div className="rounded-lg border border-primary/20 bg-primary/5">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-primary/10 transition-colors"
            onClick={() => {
              setExpandedGroups((prev) => {
                const next = new Set(prev);
                if (next.has("__media__")) next.delete("__media__");
                else next.add("__media__");
                return next;
              });
            }}
          >
            <div className="flex items-center gap-2">
              {expandedGroups.has("__media__") ? (
                <ChevronDown className="size-4 text-primary" />
              ) : (
                <ChevronRight className="size-4 text-primary" />
              )}
              <h3 className="text-sm font-semibold text-primary">Diğer Görseller</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {mediaImages.length + uploadedUrls.length}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">İlana bağlı olmayan görseller</span>
          </button>

          {expandedGroups.has("__media__") && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
                {uploadedUrls.map((url, i) => (
                  <button
                    key={`uploaded-${i}`}
                    type="button"
                    onClick={() => setDetailTarget({ type: "media", url })}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="100px" unoptimized />
                    <div className="absolute top-1 left-1 rounded bg-green-600 px-1 py-0.5 text-[9px] font-bold text-white leading-none">
                      Yeni
                    </div>
                  </button>
                ))}
                {mediaImages.map((file) => (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => setDetailTarget({ type: "media", url: file.url, name: file.name, created_at: file.created_at })}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                  >
                    <Image src={file.url} alt={file.name} fill className="object-cover" sizes="100px" unoptimized />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery grouped by property */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ImageIcon className="size-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium text-muted-foreground">
            {search ? `"${search}" ile eşleşen görsel bulunamadı` : "Henüz görsel yüklenmemiş"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.slice(0, visibleCount).map((group) => {
            const isExpanded = expandedGroups.has(group.propertyId);
            return (
              <div key={group.propertyId} className="rounded-lg border">
                {/* Property header — clickable */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGroup(group.propertyId)}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                    <h3 className="text-sm font-semibold">{group.title}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {group.images.length} görsel
                    </span>
                  </div>
                  <Link
                    href={`/admin/ilanlar/${group.propertyId}/duzenle`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="size-3" />
                    İlanı Düzenle
                  </Link>
                </button>

                {/* Image grid — collapsible + sortable */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Sıralamak için görselleri sürükleyip bırakın
                    </p>
                    <SortableImageGrid
                      propertyId={group.propertyId}
                      images={group.images}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      onShowDetail={(img) => setDetailTarget({ type: "property", image: img })}
                      onReorder={handleReorder}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {grouped.length > visibleCount && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((v) => v + 30)}
          >
            Daha Fazla Göster ({grouped.length - visibleCount} ilan kaldı)
          </Button>
        </div>
      )}

      {/* Detail dialog */}
      {detailTarget && (
        <ImageDetailDialog
          target={detailTarget}
          open={!!detailTarget}
          onClose={() => setDetailTarget(null)}
          onDelete={async (t) => {
            if (t.type === "property") {
              const result = await deletePropertyImage(t.image.id);
              if (result.error) {
                toast.error(result.error);
              } else {
                setImages((prev) => prev.filter((img) => img.id !== t.image.id));
                toast.success("Görsel silindi.");
                setDetailTarget(null);
              }
            } else {
              // Media file — delete from Storage directly
              const bucketPrefix = "/storage/v1/object/public/property-images/";
              const idx = t.url.indexOf(bucketPrefix);
              const storagePath = idx >= 0 ? t.url.slice(idx + bucketPrefix.length) : null;

              if (storagePath) {
                const supabase = createClient();
                const { error } = await supabase.storage
                  .from("property-images")
                  .remove([storagePath]);
                if (error) {
                  toast.error(`Silme hatası: ${error.message}`);
                } else {
                  setUploadedUrls((prev) => prev.filter((u) => u !== t.url));
                  toast.success("Görsel silindi.");
                  setDetailTarget(null);
                }
              } else {
                toast.error("Dosya yolu bulunamadı.");
              }
            }
          }}
        />
      )}
    </div>
  );
}
