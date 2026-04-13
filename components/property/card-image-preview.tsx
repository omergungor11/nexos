"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCardImagePreview } from "@/hooks/use-card-image-preview";

interface CardImagePreviewProps {
  images: Array<{ url: string; alt_text?: string | null }>;
  title: string;
  priority?: boolean;
  /** Forwarded to `sizes` on next/image */
  sizes?: string;
  /** Called when user presses enter / clicks image area (not on controls) */
  onNavigate?: () => void;
}

const MAX_DOTS = 5;

export function CardImagePreview({
  images,
  title,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  onNavigate,
}: CardImagePreviewProps) {
  const total = images.length;
  const { index, isDragging, next, prev, goTo, pointerHandlers, onKeyDown } =
    useCardImagePreview({ total });

  if (total === 0) return null;

  const stopAndDo = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  // Dot visibility — sliding window around the current index
  const dotRange = (() => {
    if (total <= MAX_DOTS) return Array.from({ length: total }, (_, i) => i);
    const half = Math.floor(MAX_DOTS / 2);
    let start = Math.max(0, index - half);
    const end = Math.min(total - 1, start + MAX_DOTS - 1);
    start = Math.max(0, end - MAX_DOTS + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div
      className="absolute inset-0 touch-pan-y select-none"
      tabIndex={0}
      role="region"
      aria-label={`${title} — görsel galerisi`}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        // Suppress click-through after a swipe
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onNavigate?.();
      }}
      {...pointerHandlers}
    >
      {/* Slider track */}
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="relative h-full w-full shrink-0"
          >
            <Image
              src={img.url}
              alt={img.alt_text ?? title}
              fill
              sizes={sizes}
              // First slide eager-ish; others lazy
              priority={priority && i === 0}
              loading={priority && i === 0 ? undefined : "lazy"}
              draggable={false}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Arrows — visible on hover, touch: hidden by default (swipe works) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={stopAndDo(prev)}
            aria-label="Önceki görsel"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={stopAndDo(next)}
            aria-label="Sonraki görsel"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-10 flex justify-center gap-1">
          {dotRange.map((i) => (
            <button
              key={i}
              type="button"
              onClick={stopAndDo(() => goTo(i))}
              aria-label={`Görsel ${i + 1}`}
              aria-current={i === index}
              className={`pointer-events-auto size-1.5 rounded-full transition-all ${
                i === index
                  ? "w-4 bg-white"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
