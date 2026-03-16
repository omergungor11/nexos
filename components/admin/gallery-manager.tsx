"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Trash2,
  Star,
  CheckSquare,
  Square,
  Filter,
  ImageIcon,
  Calendar,
  ExternalLink,
} from "lucide-react";

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
import { deletePropertyImage } from "@/actions/images";
import type { GalleryImage } from "@/app/admin/galeri/page";

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

function formatFileSize(url: string): string {
  // We can't know the actual file size from URL alone
  // This is shown as placeholder — real size would need HEAD request
  return "—";
}

// ---------------------------------------------------------------------------
// Image Detail Dialog
// ---------------------------------------------------------------------------

function ImageDetailDialog({
  image,
  open,
  onClose,
}: {
  image: GalleryImage;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Görsel Detayı</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={image.url}
              alt={image.alt_text || "Görsel"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">İlan</p>
              <Link
                href={`/admin/ilanlar/${image.property_id}/duzenle`}
                className="mt-0.5 block font-medium text-primary hover:underline"
              >
                {image.property_title}
              </Link>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Yükleme Tarihi</p>
              <p className="mt-0.5">{formatDate(image.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Sıra</p>
              <p className="mt-0.5">{image.sort_order}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Kapak</p>
              <p className="mt-0.5">{image.is_cover ? "Evet ⭐" : "Hayır"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Alt Metin</p>
              <p className="mt-0.5 text-muted-foreground">{image.alt_text || "Belirtilmemiş"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">URL</p>
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block truncate text-xs text-primary hover:underline"
              >
                {image.url}
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <DialogClose render={<Button variant="outline" />}>
            Kapat
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface GalleryManagerProps {
  initialImages: GalleryImage[];
  properties: { id: string; title: string }[];
}

export function GalleryManager({ initialImages, properties }: GalleryManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [detailImage, setDetailImage] = useState<GalleryImage | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (propertyFilter === "all") return images;
    return images.filter((img) => img.property_id === propertyFilter);
  }, [images, propertyFilter]);

  // Group images by property
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
      images: imgs,
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

  // Property options for filter — only show those with images
  const propertyOptions = useMemo(() => {
    const ids = new Set(images.map((img) => img.property_id));
    return properties.filter((p) => ids.has(p.id));
  }, [images, properties]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={propertyFilter} onValueChange={(v) => setPropertyFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-64">
              <SelectValue placeholder="Tüm İlanlar" />
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
        </div>

        <div className="flex items-center gap-2">
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

      {/* Gallery grouped by property */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ImageIcon className="size-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium text-muted-foreground">
            Henüz görsel yüklenmemiş
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.propertyId}>
              {/* Property header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {group.images.length} görsel
                  </span>
                </div>
                <Link
                  href={`/admin/ilanlar/${group.propertyId}/duzenle`}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="size-3" />
                  İlanı Düzenle
                </Link>
              </div>

              {/* Image grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {group.images.map((img) => {
                  const isSelected = selectedIds.has(img.id);
                  return (
                    <div
                      key={img.id}
                      className={`group relative overflow-hidden rounded-lg border transition-all ${
                        isSelected
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-foreground/20"
                      }`}
                    >
                      {/* Selection checkbox */}
                      <button
                        className="absolute left-1.5 top-1.5 z-10 rounded bg-black/50 p-0.5 text-white transition-opacity group-hover:opacity-100"
                        style={{ opacity: isSelected ? 1 : undefined }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(img.id);
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

                      {/* Image */}
                      <button
                        className="block w-full"
                        onClick={() => setDetailImage(img)}
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
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      {detailImage && (
        <ImageDetailDialog
          image={detailImage}
          open={!!detailImage}
          onClose={() => setDetailImage(null)}
        />
      )}
    </div>
  );
}
