"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { MapPin, BedDouble, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroSlide {
  image: string;
  title: string;
  price: string;
  location: string;
  rooms: string | null;
  area: string | null;
  slug: string;
  type: string;
  transactionType: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INTERVAL = 6000;
const FALLBACK_IMAGE = "/images/hero-bg.jpg";

const TX_LABELS: Record<string, string> = {
  sale: "SATILIK",
  rent: "KİRALIK",
  daily_rental: "GÜNLÜK KİRALIK",
};

const TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  apartment: "Daire",
  twin_villa: "İkiz Villa",
  penthouse: "Penthouse",
  bungalow: "Bungalow",
  detached: "Müstakil Ev",
  residential_land: "Arsa",
  shop: "Dükkan",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroSlider({ slides, children }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const hasSlides = slides.length > 0;
  const totalSlides = hasSlides ? slides.length : 1;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next, totalSlides]);

  const currentSlide = hasSlides ? slides[current] : null;

  return (
    <section className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center overflow-hidden">
      {/* Background images */}
      {hasSlides ? (
        slides.map((slide, i) => (
          <div
            key={slide.slug}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={slide.image || FALLBACK_IMAGE}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))
      ) : (
        <div className="absolute inset-0">
          <Image src={FALLBACK_IMAGE} alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />

      {/* Property info overlay — bottom left */}
      {currentSlide && (
        <div className="absolute bottom-24 left-0 z-20 w-full px-4 sm:bottom-28 sm:px-8 lg:px-16">
          <div className="max-w-xl space-y-3">
            {/* Transaction + Type badges */}
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {TX_LABELS[currentSlide.transactionType] ?? "SATILIK"}
              </span>
              <span className="rounded-md bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {TYPE_LABELS[currentSlide.type] ?? currentSlide.type}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
              {currentSlide.title}
            </h2>

            {/* Location */}
            <p className="flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="h-4 w-4 text-primary" />
              {currentSlide.location}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm text-white/70">
              {currentSlide.rooms && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-4 w-4 text-primary" />
                  {currentSlide.rooms}
                </span>
              )}
              {currentSlide.area && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="h-4 w-4 text-primary" />
                  {currentSlide.area}
                </span>
              )}
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-primary sm:text-3xl">
              {currentSlide.price}
            </p>
          </div>
        </div>
      )}

      {/* Navigation arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:left-6"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:right-6"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-3 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Center content (search bar etc.) */}
      <div className="relative z-10 px-4">
        {children}
      </div>
    </section>
  );
}
