"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const SLIDES = [
  "/images/hero-bg.jpg",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80",
];

const INTERVAL = 5000; // 5 seconds

interface HeroSliderProps {
  children: React.ReactNode;
}

export function HeroSlider({ children }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
      setIsTransitioning(false);
    }, 700);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-20 overflow-hidden">
      {/* Slide images */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current && !isTransitioning ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-slate-800/80" />

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setIsTransitioning(false); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-primary" : "w-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
