"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, Upload, Link2, Search, X, Check } from "lucide-react";
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
  const [tab, setTab] = useState<"gallery" | "url">("gallery");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [search, setSearch] = useState("");
  const [urlInput, setUrlInput] = useState(currentUrl ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      void loadImages();
      setUrlInput(currentUrl ?? "");
    }
  }, [open, currentUrl]);

  async function loadImages() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("property_images")
      .select("id, url, alt_text, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    setImages((data ?? []) as GalleryImage[]);
    setLoading(false);
  }

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
