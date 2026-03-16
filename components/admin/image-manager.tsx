"use client";

import { useState, useRef, useTransition, useCallback, useId } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { StarIcon, Trash2Icon, UploadIcon, LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  uploadPropertyImage,
  deletePropertyImage,
  setCoverImage,
} from "@/actions/images";
import type { PropertyImage } from "@/types/property";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageManagerProps {
  propertyId: string;
  initialImages: PropertyImage[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACCEPTED_MIME_TYPES = "image/jpeg,image/png,image/webp";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function sortImages(images: PropertyImage[]): PropertyImage[] {
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

const MAX_DIMENSION = 1920;

function getQuality(fileSize: number): number {
  // Adaptive quality: larger files get more compression
  if (fileSize > 5 * 1024 * 1024) return 0.65;
  if (fileSize > 3 * 1024 * 1024) return 0.7;
  if (fileSize > 1 * 1024 * 1024) return 0.75;
  return 0.8;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function compressImage(file: File): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let targetWidth = width;
  let targetHeight = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    targetWidth = Math.round(width * ratio);
    targetHeight = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { file, originalSize, compressedSize: originalSize };
  }

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const quality = getQuality(originalSize);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size >= originalSize) {
          resolve({ file, originalSize, compressedSize: originalSize });
          return;
        }
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const compressed = new File([blob], `${baseName}.webp`, { type: "image/webp" });
        resolve({ file: compressed, originalSize, compressedSize: compressed.size });
      },
      "image/webp",
      quality
    );
  });
}

// ---------------------------------------------------------------------------
// ImageCard sub-component
// ---------------------------------------------------------------------------

function ImageCard({
  image,
  onDelete,
  onSetCover,
  isDeleting,
  isSettingCover,
}: {
  image: PropertyImage;
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
  isDeleting: boolean;
  isSettingCover: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-muted">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image.url}
          alt={image.alt_text ?? "Emlak görseli"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
          unoptimized
        />

        {/* Cover badge */}
        {image.is_cover && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-900 shadow">
            <StarIcon className="size-3 fill-current" />
            Kapak
          </div>
        )}

        {/* Loading overlay */}
        {(isDeleting || isSettingCover) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <LoaderCircleIcon className="size-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 p-2">
        {!image.is_cover ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-1.5 text-xs"
            onClick={() => onSetCover(image.id)}
            disabled={isSettingCover || isDeleting}
            title="Kapak fotoğrafı olarak ayarla"
          >
            <StarIcon className="size-3.5" />
            Kapak Yap
          </Button>
        ) : (
          <span className="flex-1" />
        )}

        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          onClick={() => onDelete(image.id)}
          disabled={isDeleting || isSettingCover}
          title="Görseli sil"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload zone sub-component
// ---------------------------------------------------------------------------

function UploadZone({
  onFilesSelected,
  isUploading,
  inputId,
}: {
  onFilesSelected: (files: FileList) => void;
  isUploading: boolean;
  inputId: string;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input so the same file can be re-uploaded after deletion
      e.target.value = "";
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Görsel yükle"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          fileInputRef.current?.click();
        }
      }}
      className={[
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        isUploading ? "pointer-events-none opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        multiple
        className="sr-only"
        onChange={handleInputChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <LoaderCircleIcon className="size-8 animate-spin text-muted-foreground" />
      ) : (
        <UploadIcon className="size-8 text-muted-foreground" />
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium">
          {isUploading ? "Yükleniyor..." : "Görsel yüklemek için tıklayın"}
        </p>
        <p className="text-xs text-muted-foreground">
          veya dosyaları buraya sürükleyip bırakın
        </p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP — maks. {MAX_FILE_SIZE_MB} MB
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ImageManager({ propertyId, initialImages }: ImageManagerProps) {
  const [images, setImages] = useState<PropertyImage[]>(() =>
    sortImages(initialImages)
  );
  const [uploadPending, startUpload] = useTransition();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [coveringIds, setCoveringIds] = useState<Set<string>>(new Set());

  const uploadInputId = useId();

  // ---------------------------------------------------------------------------
  // Upload handler
  // ---------------------------------------------------------------------------

  const handleFilesSelected = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files);

      // Client-side validation
      for (const file of fileArray) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(
            `"${file.name}" dosyası ${MAX_FILE_SIZE_MB} MB sınırını aşıyor.`
          );
          return;
        }
      }

      startUpload(async () => {
        for (const file of fileArray) {
          const { file: compressed, originalSize, compressedSize } = await compressImage(file);
          const formData = new FormData();
          formData.append("file", compressed);
          formData.append("propertyId", propertyId);
          formData.append("isCover", images.length === 0 ? "true" : "false");

          const result = await uploadPropertyImage(formData);

          if (result.error !== undefined) {
            toast.error(`"${file.name}" yüklenemedi: ${result.error}`);
          } else {
            // Optimistic append — we don't have the full DB row so we build
            // a provisional PropertyImage from the returned data.
            const uploadedData = result.data as { id: string; url: string };
            const newImage: PropertyImage = {
              id: uploadedData.id,
              property_id: propertyId,
              url: uploadedData.url,
              alt_text: null,
              sort_order: images.length,
              is_cover: images.length === 0,
              created_at: new Date().toISOString(),
            };

            setImages((prev) => {
              const updated = [...prev, newImage];
              // If it is the first image, mark it as cover and unmark others
              if (newImage.is_cover) {
                return updated.map((img) => ({
                  ...img,
                  is_cover: img.id === newImage.id,
                }));
              }
              return sortImages(updated);
            });

            const saved = originalSize > compressedSize
              ? ` (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)})`
              : "";
            toast.success(`"${file.name}" yüklendi.${saved}`);
          }
        }
      });
    },
    [propertyId, images.length]
  );

  // ---------------------------------------------------------------------------
  // Delete handler
  // ---------------------------------------------------------------------------

  const handleDelete = useCallback(
    (imageId: string) => {
      setDeletingIds((prev) => new Set(prev).add(imageId));

      void (async () => {
        const result = await deletePropertyImage(imageId);

        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });

        if (result.error) {
          toast.error(`Görsel silinemedi: ${result.error}`);
        } else {
          setImages((prev) => {
            const remaining = prev.filter((img) => img.id !== imageId);
            // If the deleted image was the cover and there are remaining
            // images, automatically promote the first one as cover.
            const deletedWasCover = prev.find((img) => img.id === imageId)
              ?.is_cover;
            if (deletedWasCover && remaining.length > 0) {
              return remaining.map((img, idx) => ({
                ...img,
                is_cover: idx === 0,
                sort_order: idx,
              }));
            }
            return remaining.map((img, idx) => ({
              ...img,
              sort_order: idx,
            }));
          });
          toast.success("Görsel silindi.");
        }
      })();
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Set cover handler
  // ---------------------------------------------------------------------------

  const handleSetCover = useCallback(
    (imageId: string) => {
      setCoveringIds((prev) => new Set(prev).add(imageId));

      void (async () => {
        const result = await setCoverImage(imageId, propertyId);

        setCoveringIds((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });

        if (result.error) {
          toast.error(`Kapak görseli ayarlanamadı: ${result.error}`);
        } else {
          setImages((prev) =>
            prev.map((img) => ({
              ...img,
              is_cover: img.id === imageId,
            }))
          );
          toast.success("Kapak görseli güncellendi.");
        }
      })();
    },
    [propertyId]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <UploadZone
        onFilesSelected={handleFilesSelected}
        isUploading={uploadPending}
        inputId={uploadInputId}
      />

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={handleDelete}
              onSetCover={handleSetCover}
              isDeleting={deletingIds.has(image.id)}
              isSettingCover={coveringIds.has(image.id)}
            />
          ))}
        </div>
      )}

      {images.length === 0 && !uploadPending && (
        <p className="text-center text-sm text-muted-foreground">
          Henüz görsel eklenmedi.
        </p>
      )}
    </div>
  );
}
