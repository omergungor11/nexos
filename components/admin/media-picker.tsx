"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ImageIcon, Upload, Link2, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}

interface GalleryImage {
  id: string;
  url: string;
  alt_text: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MediaPicker({ open, onClose, onSelect, currentUrl }: MediaPickerProps) {
  const [tab, setTab] = useState<"gallery" | "upload" | "url">("gallery");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [search, setSearch] = useState("");
  const [urlInput, setUrlInput] = useState(currentUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("property_images")
        .select("id, url, alt_text, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (!cancelled) {
        setImages((data ?? []) as GalleryImage[]);
        setLoading(false);
        setUrlInput(currentUrl ?? "");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [open, currentUrl]);

  const filtered = search.trim()
    ? images.filter((img) => img.alt_text?.toLowerCase().includes(search.toLowerCase()) || img.url.toLowerCase().includes(search.toLowerCase()))
    : images;

  function handleSelectImage(url: string) {
    onSelect(url);
    onClose();
  }

  function handleUrlSubmit() {
    if (!urlInput.trim()) {
      toast.error("URL giriniz.");
      return;
    }
    onSelect(urlInput.trim());
    onClose();
  }

  // Upload handler — compress to WebP + direct Supabase Storage upload
  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece görsel dosyaları yüklenebilir.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Dosya boyutu 25 MB sınırını aşıyor.");
      return;
    }

    setUploading(true);

    try {
      // Compress and convert to WebP
      const compressed = await compressImage(file);

      const supabase = createClient();
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
        toast.error(`Yükleme hatası: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(storagePath);

      toast.success("Görsel yüklendi.");
      setUploading(false);
      onSelect(publicUrl);
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Görsel yüklenirken bir hata oluştu.");
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file);
    // Reset so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUpload(file);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Görsel Seç</DialogTitle>
        </DialogHeader>

        {/* Tab buttons */}
        <div className="flex gap-2 border-b pb-3">
          <Button
            variant={tab === "gallery" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("gallery")}
            className="gap-1.5"
          >
            <ImageIcon className="size-3.5" />
            Medya Kütüphanesi
          </Button>
          <Button
            variant={tab === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("upload")}
            className="gap-1.5"
          >
            <Upload className="size-3.5" />
            Yükle
          </Button>
          <Button
            variant={tab === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("url")}
            className="gap-1.5"
          >
            <Link2 className="size-3.5" />
            URL ile Ekle
          </Button>
        </div>

        {/* Gallery tab */}
        {tab === "gallery" && (
          <div className="flex-1 overflow-hidden flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Görsellerde ara..."
                className="h-8 pl-8 text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="size-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">Görsel bulunamadı</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() => setTab("upload")}
                  >
                    <Upload className="size-3.5" />
                    Yeni Görsel Yükle
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {filtered.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectImage(img.url)}
                      className={`group relative aspect-square overflow-hidden rounded-lg border transition-all hover:ring-2 hover:ring-primary ${
                        currentUrl === img.url ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt_text ?? ""}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                      {currentUrl === img.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                          <Check className="size-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload tab */}
        {tab === "upload" && (
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-10 animate-spin text-primary" />
                  <p className="mt-3 text-sm font-medium">Yükleniyor...</p>
                </>
              ) : (
                <>
                  <Upload className="size-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-medium">
                    Görseli sürükleyip bırakın
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    veya
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-3.5" />
                    Dosya Seç
                  </Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    JPEG, PNG veya WebP — Maks. 5 MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* URL tab */}
        {tab === "url" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Harici bir görsel URL&apos;si girin veya yapıştırın.
            </p>
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                type="url"
                className="flex-1"
              />
              <Button onClick={handleUrlSubmit}>Ekle</Button>
            </div>
            {urlInput && /^https?:\/\/.+/.test(urlInput) && (
              <div className="relative mx-auto h-48 w-72 overflow-hidden rounded-lg border">
                <Image
                  src={urlInput}
                  alt="Önizleme"
                  fill
                  className="object-contain"
                  sizes="288px"
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
