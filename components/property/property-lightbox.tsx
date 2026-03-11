"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PropertyLightboxProps {
  images: Array<{ url: string; alt_text: string | null }>;
  initialIndex?: number;
}

export function PropertyLightbox({ images, initialIndex = 0 }: PropertyLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Thumbnail grid trigger */}
      <div className="grid gap-2">
        {/* Main cover */}
        <button
          type="button"
          className="relative aspect-[16/10] w-full overflow-hidden rounded-xl cursor-pointer"
          onClick={() => { setIndex(0); setOpen(true); }}
        >
          <Image
            src={images[0].url}
            alt={images[0].alt_text || "Fotoğraf 1"}
            fill
            className="object-cover transition-transform hover:scale-[1.02]"
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
              {images.length} Fotoğraf
            </span>
          )}
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((img, i) => (
              <button
                key={img.url}
                type="button"
                className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => { setIndex(i + 1); setOpen(true); }}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || `Fotoğraf ${i + 2}`}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 1024px) 25vw, 16vw"
                />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    +{images.length - 5}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          {/* Close */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white">
            {index + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Önceki"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative h-[80vh] w-[90vw] max-w-5xl overflow-hidden rounded-2xl">
            <Image
              src={images[index].url}
              alt={images[index].alt_text || `Fotoğraf ${index + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={next}
              className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Sonraki"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
