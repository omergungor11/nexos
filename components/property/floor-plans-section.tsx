"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, LayoutGrid } from "lucide-react";
import type { FloorPlan } from "@/types/property";

interface FloorPlansSectionProps {
  plans: FloorPlan[];
  /** Render without outer heading (for nested usage in sub-listings). */
  bare?: boolean;
}

// ---------------------------------------------------------------------------
// Grid + modal lightbox — mirrors PropertyLightbox patterns but keyed on plan
// order rather than cover/thumb split.
// ---------------------------------------------------------------------------

export function FloorPlansSection({ plans, bare = false }: FloorPlansSectionProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const total = plans.length;

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);
  const next = useCallback(() => {
    setIndex((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

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

  if (total === 0) return null;

  const active = plans[index];

  const content = (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className="group block overflow-hidden rounded-lg border bg-muted text-left transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={plan.url}
                alt={plan.alt_text || plan.label}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <div className="space-y-0.5 border-t bg-background px-3 py-2">
              <p className="truncate text-sm font-medium">{plan.label}</p>
              {(plan.area_sqm || plan.rooms) && (
                <p className="text-xs text-muted-foreground">
                  {[
                    plan.rooms ? `${plan.rooms} oda` : null,
                    plan.area_sqm ? `${plan.area_sqm} m²` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {open && active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Önceki"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Sonraki"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.url}
              alt={active.alt_text || active.label}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-center text-sm text-white">
            <span className="font-medium">{active.label}</span>
            {total > 1 && (
              <span className="ml-2 text-white/60">
                {index + 1} / {total}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (bare) return <div>{content}</div>;

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <LayoutGrid className="size-5 text-primary" />
        Kat Planları
      </h2>
      {content}
    </div>
  );
}
