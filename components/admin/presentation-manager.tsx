"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Layers,
  CalendarDays,
  Home,
  Phone,
  Globe,
  Building2,
  FileDown,
  ImageDown,
  Settings2,
  Eye,
  EyeOff,
  Plus,
  StickyNote,
  Palette,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertyForPresentation {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  year_built: number | null;
  description: string | null;
  city_name: string;
  district_name: string | null;
  images: string[];
}

interface PresentationManagerProps {
  properties: PropertyForPresentation[];
}

type PresentationTheme = "dark" | "light" | "gold" | "minimal";

type SlideType =
  | "cover"
  | "gallery"
  | "details"
  | "features"
  | "description"
  | "location"
  | "investment"
  | "contact";

type TransitionType = "fade" | "slide" | "zoom";

interface ThemeColors {
  bg: string;
  cardBg: string;
  text: string;
  accent: string;
  muted: string;
}

interface SlideDefinition {
  type: SlideType;
  label: string;
}

interface SlideProps {
  property: PropertyForPresentation;
  theme: ThemeColors;
  note?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THEMES: Record<PresentationTheme, ThemeColors> = {
  dark: {
    bg: "#0a0a0a",
    cardBg: "#161616",
    text: "#f5f0eb",
    accent: "#c9a96e",
    muted: "#6b6b6b",
  },
  light: {
    bg: "#faf8f5",
    cardBg: "#ffffff",
    text: "#1a1a1a",
    accent: "#1a1a1a",
    muted: "#8c8c8c",
  },
  gold: {
    bg: "#1a150d",
    cardBg: "#241e14",
    text: "#f5edd6",
    accent: "#d4a853",
    muted: "#9a8a6a",
  },
  minimal: {
    bg: "#ffffff",
    cardBg: "#f7f7f7",
    text: "#111111",
    accent: "#111111",
    muted: "#999999",
  },
};

const THEME_LABELS: Record<PresentationTheme, string> = {
  dark: "Koyu",
  light: "Açık",
  gold: "Altın",
  minimal: "Minimal",
};

const THEME_PREVIEW_COLORS: Record<PresentationTheme, string> = {
  dark: "#0a0a0a",
  light: "#faf8f5",
  gold: "#1a150d",
  minimal: "#ffffff",
};

const SLIDE_DEFINITIONS: SlideDefinition[] = [
  { type: "cover", label: "Kapak" },
  { type: "gallery", label: "Galeri" },
  { type: "details", label: "Detaylar" },
  { type: "features", label: "Özellikler" },
  { type: "description", label: "Açıklama" },
  { type: "location", label: "Konum" },
  { type: "investment", label: "Yatırım" },
  { type: "contact", label: "İletişim" },
];

const DEFAULT_ENABLED_SLIDES: Set<SlideType> = new Set([
  "cover",
  "gallery",
  "details",
  "description",
  "contact",
]);

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const TRANSACTION_LABELS: Record<string, string> = {
  sale: "Satılık",
  rent: "Kiralık",
  daily_rental: "Günlük Kiralık",
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
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${price.toLocaleString("tr-TR")}`;
}

function labelForType(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

function labelForTransaction(t: string): string {
  return TRANSACTION_LABELS[t] ?? t;
}

// Estimate monthly rent as ~0.35% of price (rough Turkish market yield)
function estimateMonthlyRent(price: number): number {
  return Math.round((price * 0.0035) / 100) * 100;
}

function estimateAnnualYield(price: number): string {
  const monthly = estimateMonthlyRent(price);
  const annual = monthly * 12;
  const yield_ = (annual / price) * 100;
  return yield_.toFixed(1);
}

// ---------------------------------------------------------------------------
// Slide Components
// ---------------------------------------------------------------------------

/** Slide 1 — Cover */
function CoverSlide({ property, theme, note }: SlideProps) {
  const coverImage = property.images[0];
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="relative flex flex-col justify-end h-full overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      {coverImage ? (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${theme.bg} 0%, ${theme.bg}e6 15%, ${theme.bg}80 30%, transparent 50%)`,
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.cardBg}, ${theme.bg})`,
          }}
        />
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 pt-8">
        <div className="flex items-center gap-2">
          <div
            className="size-8 rounded flex items-center justify-center font-black text-sm"
            style={{ backgroundColor: theme.accent, color: "#0f172a" }}
          >
            N
          </div>
          <span className="font-semibold text-lg tracking-wide" style={{ color: theme.text }}>
            NEXOS
          </span>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
          style={{ backgroundColor: theme.accent, color: "#0f172a" }}
        >
          {labelForTransaction(property.transaction_type)}
        </span>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 px-10 pb-10">
        <p
          className="text-xs font-bold mb-2 uppercase tracking-widest"
          style={{ color: theme.accent }}
        >
          {labelForType(property.type)}
        </p>
        <h1
          className="font-black leading-tight mb-3"
          style={{
            color: theme.text,
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {property.title}
        </h1>
        <div className="w-16 h-0.5 mb-4" style={{ backgroundColor: theme.accent }} />
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-3xl font-black" style={{ color: theme.accent, fontFamily: "'Playfair Display', serif" }}>
            {formatPrice(property.price, property.currency)}
          </span>
          {location && (
            <span
              className="flex items-center gap-1.5 text-sm"
              style={{ color: `${theme.text}b3` }}
            >
              <MapPin className="size-3.5" />
              {location}
            </span>
          )}
        </div>
      </div>

      {note && (
        <div
          className="absolute bottom-3 right-4 text-xs px-2 py-1 rounded-md max-w-[220px] text-right"
          style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

/** Slide 2 — Gallery */
function GallerySlide({ property, theme, note }: SlideProps) {
  const galleryImages = property.images.slice(1, 5);

  return (
    <div
      className="flex flex-col h-full px-8 py-6 gap-4"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.muted }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
          Fotoğraf Galerisi
        </h2>
      </div>

      {galleryImages.length > 0 ? (
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 min-h-0">
          {/* Hero image — 2 cols, 2 rows */}
          <div
            className="col-span-2 row-span-2 relative rounded-xl overflow-hidden"
            style={{ backgroundColor: theme.cardBg }}
          >
            {galleryImages[0] ? (
              <Image
                src={galleryImages[0]}
                alt={`${property.title} — 2`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="size-8" style={{ color: `${theme.muted}55` }} />
              </div>
            )}
            {property.images.length > 5 && (
              <div
                className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: `${theme.bg}cc`, color: theme.text }}
              >
                +{property.images.length - 5} fotoğraf
              </div>
            )}
          </div>
          {/* 2 supporting images stacked */}
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden"
              style={{ backgroundColor: theme.cardBg }}
            >
              {galleryImages[idx] ? (
                <Image
                  src={galleryImages[idx]}
                  alt={`${property.title} — ${idx + 2}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="size-8" style={{ color: `${theme.muted}55` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-xl" style={{ backgroundColor: theme.cardBg }}>
          <p className="text-sm" style={{ color: theme.muted }}>
            Ek fotoğraf bulunmamaktadır.
          </p>
        </div>
      )}

      {note && (
        <p className="text-xs text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Slide 3 — Details */
function DetailsSlide({ property, theme, note }: SlideProps) {
  type DetailItem = { icon: React.ElementType; label: string; value: string };

  const items: DetailItem[] = [
    { icon: Home, label: "Gayrimenkul Tipi", value: labelForType(property.type) },
    ...(property.rooms !== null
      ? [
          {
            icon: BedDouble,
            label: "Oda Sayısı",
            value: `${(property.living_rooms ?? 0) + property.rooms}+${property.rooms}`,
          },
        ]
      : []),
    ...(property.bathrooms !== null
      ? [{ icon: Bath, label: "Banyo", value: `${property.bathrooms}` }]
      : []),
    ...(property.area_sqm !== null
      ? [{ icon: Maximize2, label: "Brüt Alan", value: `${property.area_sqm} m²` }]
      : []),
    ...(property.floor !== null
      ? [
          {
            icon: Layers,
            label: "Kat",
            value: property.total_floors
              ? `${property.floor} / ${property.total_floors}`
              : `${property.floor}. Kat`,
          },
        ]
      : []),
    ...(property.year_built !== null
      ? [{ icon: CalendarDays, label: "Yapım Yılı", value: `${property.year_built}` }]
      : []),
  ];

  return (
    <div
      className="flex flex-col h-full px-8 py-6 gap-4"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.muted }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
          Mülk Detayları
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 content-start">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl p-4"
              style={{ backgroundColor: theme.cardBg }}
            >
              <div
                className="size-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${theme.accent}22` }}
              >
                <Icon className="size-4" style={{ color: theme.accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs mb-0.5" style={{ color: theme.muted }}>
                  {item.label}
                </p>
                <p className="font-bold text-sm truncate" style={{ color: theme.text }}>
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between rounded-xl px-5 py-3"
        style={{ backgroundColor: `${theme.accent}1a` }}
      >
        <span className="text-sm" style={{ color: theme.muted }}>
          Fiyat
        </span>
        <span className="font-black text-lg" style={{ color: theme.accent }}>
          {formatPrice(property.price, property.currency)}
        </span>
      </div>

      {note && (
        <p className="text-xs text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Slide 4 — Features */
function FeaturesSlide({ property, theme, note }: SlideProps) {
  const features: string[] = [];

  if (property.area_sqm) features.push(`${property.area_sqm} m² brüt alan`);
  if (property.rooms) features.push(`${(property.living_rooms ?? 0) + property.rooms}+${property.rooms} oda`);
  if (property.bathrooms) features.push(`${property.bathrooms} banyo`);
  if (property.year_built) features.push(`${property.year_built} yılında inşa edildi`);
  if (property.floor && property.total_floors) features.push(`${property.floor}/${property.total_floors}. kat`);
  if (property.district_name) features.push(`${property.district_name} konumunda`);
  if (property.city_name) features.push(`${property.city_name} ili`);

  const typeLabel = labelForType(property.type);
  if (typeLabel) features.push(typeLabel);

  const txLabel = labelForTransaction(property.transaction_type);
  if (txLabel) features.push(`${txLabel} statüsünde`);

  // Pad to at least 6
  while (features.length < 6) features.push("—");

  return (
    <div
      className="flex flex-col h-full px-8 py-6 gap-5"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.muted }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black flex items-center gap-2" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
          <Sparkles className="size-5" style={{ color: theme.accent }} />
          Öne Çıkan Özellikler
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 content-start">
        {features.map((feat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: theme.cardBg }}
          >
            <div
              className="size-5 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.accent }}
            >
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4l2.5 2.5L9 1"
                  stroke="#0f172a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: theme.text }}>
              {feat}
            </span>
          </div>
        ))}
      </div>

      {note && (
        <p className="text-xs text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Slide 5 — Description */
function DescriptionSlide({ property, theme, note }: SlideProps) {
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="flex flex-col h-full px-8 py-6 gap-4"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.muted }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
          Açıklama
        </h2>
      </div>

      {location && (
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" style={{ color: theme.accent }} />
          <span className="text-sm" style={{ color: theme.muted }}>
            {location}
          </span>
        </div>
      )}

      <div
        className="flex-1 rounded-xl p-5 overflow-auto"
        style={{ backgroundColor: theme.cardBg }}
      >
        {property.description ? (
          <p
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: `${theme.text}cc` }}
          >
            {property.description}
          </p>
        ) : (
          <p className="text-sm" style={{ color: theme.muted }}>
            Açıklama bulunmamaktadır.
          </p>
        )}
      </div>

      <div
        className="flex items-center gap-3 rounded-xl px-5 py-3"
        style={{ backgroundColor: `${theme.accent}1a` }}
      >
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ backgroundColor: theme.accent, color: "#0f172a" }}
        >
          {labelForTransaction(property.transaction_type)}
        </span>
        <span className="font-black text-base" style={{ color: theme.text }}>
          {formatPrice(property.price, property.currency)}
        </span>
      </div>

      {note && (
        <p className="text-xs text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Slide 6 — Location */
function LocationSlide({ property, theme, note }: SlideProps) {
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="flex flex-col h-full px-8 py-6 gap-5"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.muted }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black flex items-center gap-2" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
          <MapPin className="size-5" style={{ color: theme.accent }} />
          Konum Bilgisi
        </h2>
      </div>

      {/* Map placeholder */}
      <div
        className="flex-1 rounded-2xl overflow-hidden relative flex items-center justify-center"
        style={{ backgroundColor: theme.cardBg }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(${theme.muted} 1px, transparent 1px), linear-gradient(90deg, ${theme.muted} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }} />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <div
            className="size-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${theme.accent}22` }}
          >
            <MapPin className="size-7" style={{ color: theme.accent }} />
          </div>
          <div>
            {property.district_name && (
              <p className="text-lg font-black" style={{ color: theme.text }}>
                {property.district_name}
              </p>
            )}
            <p className="font-semibold" style={{ color: theme.muted }}>
              {property.city_name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl px-4 py-3"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: theme.muted }}>
            İl
          </p>
          <p className="font-bold text-sm" style={{ color: theme.text }}>
            {property.city_name || "—"}
          </p>
        </div>
        <div
          className="rounded-xl px-4 py-3"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: theme.muted }}>
            İlçe
          </p>
          <p className="font-bold text-sm" style={{ color: theme.text }}>
            {property.district_name || "—"}
          </p>
        </div>
      </div>

      {note && (
        <p className="text-xs text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}

      {location && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5"
          style={{ backgroundColor: `${theme.accent}1a` }}
        >
          <MapPin className="size-3.5 shrink-0" style={{ color: theme.accent }} />
          <span className="text-sm font-medium" style={{ color: theme.text }}>
            {location}
          </span>
        </div>
      )}
    </div>
  );
}

/** Slide 7 — Investment */
function InvestmentSlide({ property, theme, note }: SlideProps) {
  const pricePerSqm =
    property.area_sqm && property.area_sqm > 0
      ? Math.round(property.price / property.area_sqm)
      : null;

  return (
    <div
      className="flex flex-col h-full px-8 py-6 gap-5"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.muted }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black flex items-center gap-2" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
          <Sparkles className="size-5" style={{ color: theme.accent }} />
          Yatırım Analizi
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-5 flex flex-col gap-1"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-xs font-medium" style={{ color: theme.muted }}>
            Satış Fiyatı
          </p>
          <p className="text-xl font-black" style={{ color: theme.accent, fontFamily: "'Playfair Display', serif" }}>
            {formatPrice(property.price, property.currency)}
          </p>
        </div>
        <div
          className="rounded-2xl p-5 flex flex-col gap-1"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-xs font-medium" style={{ color: theme.muted }}>
            İşlem Türü
          </p>
          <p className="text-xl font-black" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
            {labelForTransaction(property.transaction_type)}
          </p>
        </div>
        <div
          className="rounded-2xl p-5 flex flex-col gap-2 col-span-2"
          style={{ backgroundColor: `${theme.accent}1a` }}
        >
          <p className="text-xs font-medium" style={{ color: theme.muted }}>
            Kuzey Kıbrıs Yatırım Avantajları
          </p>
          <div className="flex flex-wrap gap-3">
            {["Yüksek Kira Getirisi", "Düşük Vergi Oranları", "Yükselen Piyasa", "Turizm Potansiyeli", "AB Yakınlığı"].map((item) => (
              <span
                key={item}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div
          className="rounded-2xl p-5 flex flex-col gap-1"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-xs font-medium" style={{ color: theme.muted }}>
            m² Fiyatı
          </p>
          <p className="text-xl font-black" style={{ color: theme.text, fontFamily: "'Playfair Display', serif" }}>
            {pricePerSqm
              ? formatPrice(pricePerSqm, property.currency)
              : "—"}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: theme.cardBg }}
      >
        <p className="text-xs leading-relaxed" style={{ color: theme.muted }}>
          * Tahmini kira değerleri piyasa ortalamasına göre hesaplanmıştır. Gerçek getiri bölgeye ve
          mülk özelliklerine göre değişiklik gösterebilir.
        </p>
      </div>

      {note && (
        <p className="text-xs text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Slide 8 — Contact */
function ContactSlide({ theme, note }: { theme: ThemeColors; note?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 py-10 gap-5 text-center"
      style={{ backgroundColor: theme.bg }}
    >
      <div
        className="size-20 rounded-2xl flex items-center justify-center font-black text-3xl"
        style={{ backgroundColor: theme.accent, color: "#0f172a" }}
      >
        N
      </div>

      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: theme.muted }}
        >
          Gayrimenkul Danışmanlığı
        </p>
        <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.text }}>
          NEXOS INVESTMENT
        </h2>
      </div>

      <div
        className="w-16 h-0.5 rounded-full"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 justify-center">
          <Phone className="size-4" style={{ color: theme.accent }} />
          <span className="font-bold text-lg" style={{ color: theme.text }}>
            +90 548 860 40 30
          </span>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <Globe className="size-4" style={{ color: theme.accent }} />
          <span className="text-base" style={{ color: theme.muted }}>
            nexosinvestment.com
          </span>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <span className="size-4 flex items-center justify-center" style={{ color: theme.accent }}>
            @
          </span>
          <span className="text-sm" style={{ color: theme.muted }}>
            info@nexosinvestment.com
          </span>
        </div>
      </div>

      <div
        className="mt-1 px-8 py-3 rounded-xl font-bold text-sm"
        style={{ backgroundColor: theme.accent, color: "#0f172a" }}
      >
        Bir Görüşme Planlayın
      </div>

      {note && (
        <p className="text-xs absolute bottom-3 right-4" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide Renderer
// ---------------------------------------------------------------------------

function SlideRenderer({
  property,
  slideType,
  theme,
  note,
}: {
  property: PropertyForPresentation;
  slideType: SlideType;
  theme: ThemeColors;
  note?: string;
}) {
  switch (slideType) {
    case "cover":
      return <CoverSlide property={property} theme={theme} note={note} />;
    case "gallery":
      return <GallerySlide property={property} theme={theme} note={note} />;
    case "details":
      return <DetailsSlide property={property} theme={theme} note={note} />;
    case "features":
      return <FeaturesSlide property={property} theme={theme} note={note} />;
    case "description":
      return <DescriptionSlide property={property} theme={theme} note={note} />;
    case "location":
      return <LocationSlide property={property} theme={theme} note={note} />;
    case "investment":
      return <InvestmentSlide property={property} theme={theme} note={note} />;
    case "contact":
      return <ContactSlide theme={theme} note={note} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// PDF Export Helper
// ---------------------------------------------------------------------------

function buildPrintHTML(
  properties: PropertyForPresentation[],
  enabledSlides: Set<SlideType>,
  theme: ThemeColors
): string {
  const accentColor = theme.accent;

  const slideStyle = `
    width: 297mm;
    height: 210mm;
    background: ${theme.bg};
    color: ${theme.text};
    font-family: 'Space Grotesk', sans-serif;
    page-break-after: always;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  `;

  function buildPropertySlides(property: PropertyForPresentation): string {
    const location = [property.district_name, property.city_name]
      .filter(Boolean)
      .join(", ");

    const slides: string[] = [];

    if (enabledSlides.has("cover")) {
      const coverImg = property.images[0]
        ? `<img src="${property.images[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />`
        : "";
      slides.push(`
        <div style="${slideStyle}">
          ${coverImg}
          <div style="position:absolute;inset:0;background:linear-gradient(to top,${theme.bg} 0%,${theme.bg}99 45%,transparent 100%);"></div>
          <div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:28px 36px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:30px;height:30px;border-radius:6px;background:${accentColor};display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:900;font-size:14px;">N</div>
              <span style="color:${theme.text};font-weight:700;font-size:16px;letter-spacing:2px;">NEXOS</span>
            </div>
            <span style="background:${accentColor};color:#0f172a;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;">${labelForTransaction(property.transaction_type).toUpperCase()}</span>
          </div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:0 36px 32px;">
            <p style="color:${accentColor};font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">${labelForType(property.type)}</p>
            <h1 style="color:${theme.text};font-size:28px;font-weight:900;margin:0 0 16px;line-height:1.2;">${property.title}</h1>
            <div style="display:flex;align-items:center;gap:20px;">
              <span style="color:${accentColor};font-size:22px;font-weight:900;">${formatPrice(property.price, property.currency)}</span>
              ${location ? `<span style="color:${theme.text}99;font-size:12px;">📍 ${location}</span>` : ""}
            </div>
          </div>
        </div>
      `);
    }

    if (enabledSlides.has("gallery")) {
      const galleryImages = property.images.slice(1, 5);
      const galleryGrid = [0, 1, 2, 3]
        .map((i) => {
          const url = galleryImages[i];
          return `<div style="position:relative;border-radius:10px;overflow:hidden;background:${theme.cardBg};">
            ${url ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />` : ""}
          </div>`;
        })
        .join("");
      slides.push(`
        <div style="${slideStyle}padding:28px 32px;">
          <p style="color:${theme.muted};font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">${property.title}</p>
          <h2 style="color:${theme.text};font-size:18px;font-weight:800;margin:0 0 16px;">Fotoğraf Galerisi</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;height:calc(100% - 68px);">
            ${galleryGrid}
          </div>
        </div>
      `);
    }

    if (enabledSlides.has("details")) {
      type DetailPair = [string, string];
      const detailItems: DetailPair[] = [
        ["Gayrimenkul Tipi", labelForType(property.type)],
        ...(property.rooms !== null
          ? [["Oda Sayısı", `${(property.living_rooms ?? 0) + property.rooms}+${property.rooms}`] as DetailPair]
          : []),
        ...(property.bathrooms !== null ? [["Banyo", `${property.bathrooms}`] as DetailPair] : []),
        ...(property.area_sqm !== null ? [["Brüt Alan", `${property.area_sqm} m²`] as DetailPair] : []),
        ...(property.floor !== null
          ? [[
              "Kat",
              property.total_floors ? `${property.floor} / ${property.total_floors}` : `${property.floor}. Kat`,
            ] as DetailPair]
          : []),
        ...(property.year_built !== null ? [["Yapım Yılı", `${property.year_built}`] as DetailPair] : []),
      ];
      const detailCards = detailItems
        .map(
          ([label, value]) =>
            `<div style="background:${theme.cardBg};border-radius:10px;padding:14px 16px;">
              <p style="color:${theme.muted};font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">${label}</p>
              <p style="color:${theme.text};font-size:14px;font-weight:700;margin:0;">${value}</p>
            </div>`
        )
        .join("");
      slides.push(`
        <div style="${slideStyle}padding:28px 32px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <p style="color:${theme.muted};font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">${property.title}</p>
            <h2 style="color:${theme.text};font-size:18px;font-weight:800;margin:0;">Mülk Detayları</h2>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;">${detailCards}</div>
          <div style="background:${accentColor}1a;border-radius:10px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;">
            <span style="color:${theme.muted};font-size:12px;">Fiyat</span>
            <span style="color:${accentColor};font-size:18px;font-weight:900;">${formatPrice(property.price, property.currency)}</span>
          </div>
        </div>
      `);
    }

    if (enabledSlides.has("description")) {
      slides.push(`
        <div style="${slideStyle}padding:28px 32px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <p style="color:${theme.muted};font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">${property.title}</p>
            <h2 style="color:${theme.text};font-size:18px;font-weight:800;margin:0;">Açıklama</h2>
          </div>
          ${location ? `<p style="color:${theme.muted};font-size:12px;margin:0;">📍 ${location}</p>` : ""}
          <div style="background:${theme.cardBg};border-radius:10px;padding:16px;flex:1;overflow:hidden;">
            <p style="color:${theme.text}cc;font-size:11px;line-height:1.7;margin:0;white-space:pre-line;">
              ${(property.description ?? "Açıklama bulunmamaktadır.").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </p>
          </div>
          <div style="background:${accentColor}1a;border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:12px;">
            <span style="background:${accentColor};color:#0f172a;font-size:9px;font-weight:700;padding:3px 10px;border-radius:20px;">${labelForTransaction(property.transaction_type).toUpperCase()}</span>
            <span style="color:${theme.text};font-size:16px;font-weight:900;">${formatPrice(property.price, property.currency)}</span>
          </div>
        </div>
      `);
    }

    if (enabledSlides.has("contact")) {
      slides.push(`
        <div style="${slideStyle.replace("page-break-after: always;", "")}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;">
          <div style="width:72px;height:72px;border-radius:16px;background:${accentColor};display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:900;font-size:28px;">N</div>
          <div>
            <p style="color:${theme.muted};font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;">Gayrimenkul Danışmanlığı</p>
            <h2 style="color:${theme.text};font-size:22px;font-weight:900;letter-spacing:1px;margin:0;">NEXOS INVESTMENT</h2>
          </div>
          <div style="width:50px;height:2px;background:${accentColor};border-radius:2px;"></div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <p style="color:${theme.text};font-size:16px;font-weight:700;margin:0;">📞 +90 548 860 40 30</p>
            <p style="color:${theme.muted};font-size:13px;margin:0;">🌐 nexosinvestment.com</p>
            <p style="color:${theme.muted};font-size:12px;margin:0;">info@nexosinvestment.com</p>
          </div>
          <div style="background:${accentColor};color:#0f172a;font-size:13px;font-weight:700;padding:10px 28px;border-radius:10px;">Bir Görüşme Planlayın</div>
        </div>
      `);
    }

    return slides.join("");
  }

  const allSlides = properties.map(buildPropertySlides).join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>Sunum — Nexos Investment</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${theme.bg}; }
    @media print {
      body { background: white; }
      @page { size: A4 landscape; margin: 0; }
    }
  </style>
</head>
<body>
  ${allSlides}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Transition hook
// ---------------------------------------------------------------------------

type TransitionPhase = "idle" | "exit" | "enter";

function useSlideTransition(
  transition: TransitionType,
  onSlideChange: (direction: "next" | "prev") => void
) {
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const pendingDirection = useRef<"next" | "prev" | null>(null);

  const navigate = useCallback(
    (dir: "next" | "prev") => {
      if (phase !== "idle") return;
      pendingDirection.current = dir;
      setDirection(dir);
      setPhase("exit");
    },
    [phase]
  );

  useEffect(() => {
    if (phase === "exit") {
      const t = setTimeout(() => {
        if (pendingDirection.current) {
          onSlideChange(pendingDirection.current);
          pendingDirection.current = null;
        }
        setPhase("enter");
      }, 160);
      return () => clearTimeout(t);
    }
    if (phase === "enter") {
      const t = setTimeout(() => setPhase("idle"), 160);
      return () => clearTimeout(t);
    }
  }, [phase, onSlideChange]);

  function getTransitionStyle(): React.CSSProperties {
    if (transition === "fade") {
      return {
        opacity: phase === "exit" ? 0 : phase === "enter" ? 1 : 1,
        transition: "opacity 0.16s ease",
      };
    }
    if (transition === "slide") {
      const offset =
        phase === "exit"
          ? direction === "next"
            ? "-6%"
            : "6%"
          : phase === "enter"
          ? "0%"
          : "0%";
      const opacity = phase === "exit" ? 0 : 1;
      return {
        transform: `translateX(${offset})`,
        opacity,
        transition: "transform 0.16s ease, opacity 0.16s ease",
      };
    }
    if (transition === "zoom") {
      const scale = phase === "exit" ? 0.96 : 1;
      const opacity = phase === "exit" ? 0 : 1;
      return {
        transform: `scale(${scale})`,
        opacity,
        transition: "transform 0.16s ease, opacity 0.16s ease",
      };
    }
    return {};
  }

  return { phase, navigate, getTransitionStyle };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PresentationManager({ properties }: PresentationManagerProps) {
  // Property selection
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [portfolioMode, setPortfolioMode] = useState(false);

  // Navigation
  const [propertyIndex, setPropertyIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  // Presentation settings
  const [theme, setTheme] = useState<PresentationTheme>("dark");
  const [transitionType, setTransitionType] = useState<TransitionType>("fade");
  const [enabledSlides, setEnabledSlides] = useState<Set<SlideType>>(
    new Set(DEFAULT_ENABLED_SLIDES)
  );

  // UI state
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [slideNotes, setSlideNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const viewerRef = useRef<HTMLDivElement>(null);

  // Derived
  const themeColors = THEMES[theme];

  const filteredProperties = useMemo(() => {
    if (!query.trim()) return properties;
    const q = query.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.city_name.toLowerCase().includes(q) ||
        (p.district_name ?? "").toLowerCase().includes(q)
    );
  }, [properties, query]);

  const selectedProperties = useMemo(
    () => properties.filter((p) => selectedIds.includes(p.id)),
    [properties, selectedIds]
  );

  const activeProperty = selectedProperties[propertyIndex] ?? null;

  const activeSlides = useMemo(
    () => SLIDE_DEFINITIONS.filter((s) => enabledSlides.has(s.type)),
    [enabledSlides]
  );

  const totalSlides = activeSlides.length;
  const currentSlide = activeSlides[slideIndex];

  // Note key: "propertyId-slideType"
  const noteKey = activeProperty && currentSlide
    ? `${activeProperty.id}-${currentSlide.type}`
    : null;
  const currentNote = noteKey ? slideNotes[noteKey] : undefined;

  // Transition handler
  const handleSlideChange = useCallback(
    (dir: "next" | "prev") => {
      if (dir === "next") {
        if (slideIndex < totalSlides - 1) {
          setSlideIndex((i) => i + 1);
        } else if (propertyIndex < selectedProperties.length - 1) {
          setPropertyIndex((i) => i + 1);
          setSlideIndex(0);
        }
      } else {
        if (slideIndex > 0) {
          setSlideIndex((i) => i - 1);
        } else if (propertyIndex > 0) {
          setPropertyIndex((i) => i - 1);
          setSlideIndex(totalSlides - 1);
        }
      }
    },
    [slideIndex, totalSlides, propertyIndex, selectedProperties.length]
  );

  const { navigate, getTransitionStyle } = useSlideTransition(
    transitionType,
    handleSlideChange
  );

  const canPrev = slideIndex > 0 || propertyIndex > 0;
  const canNext =
    slideIndex < totalSlides - 1 ||
    propertyIndex < selectedProperties.length - 1;

  function handleSelect(id: string) {
    if (portfolioMode) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
      setPropertyIndex(0);
      setSlideIndex(0);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") navigate("prev");
    if (e.key === "ArrowRight") navigate("next");
    if (e.key === "Escape" && fullscreen) setFullscreen(false);
  }

  function toggleSlide(type: SlideType) {
    setEnabledSlides((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      if (slideIndex >= activeSlides.filter((s) => next.has(s.type)).length) {
        setSlideIndex(0);
      }
      return next;
    });
  }

  function handleDownloadPDF() {
    if (selectedProperties.length === 0) return;
    const html = buildPrintHTML(selectedProperties, enabledSlides, themeColors);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  }

  function handleDownloadCurrentPNG() {
    if (!viewerRef.current) return;
    const slideEl = viewerRef.current.querySelector("[data-slide-canvas]") as HTMLElement | null;
    if (!slideEl) return;
    // Basic screenshot approach using the native print method for current slide
    const html = `<!DOCTYPE html>
<html><head><style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { width:1280px;height:720px;overflow:hidden; }
  @media print { @page { size: 1280px 720px; margin:0; } }
</style></head><body>
  <div style="width:1280px;height:720px;overflow:hidden;">${slideEl.innerHTML}</div>
</body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  }

  function handleDownloadAllPNG() {
    if (selectedProperties.length === 0) return;
    // Export all enabled slides for all selected properties
    const slideDivs = activeSlides
      .map((s) => `<div style="width:1280px;height:720px;page-break-after:always;overflow:hidden;">Slayt: ${s.label}</div>`)
      .join("");
    const html = `<!DOCTYPE html><html><head><style>
      * { margin:0;padding:0;box-sizing:border-box; }
      @media print { @page { size: 1280px 720px; margin:0; } }
    </style></head><body>${slideDivs}</body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  }

  function openNoteEditor() {
    if (!noteKey) return;
    setNoteInput(slideNotes[noteKey] ?? "");
    setEditingNote(noteKey);
  }

  function saveNote() {
    if (!editingNote) return;
    setSlideNotes((prev) => ({ ...prev, [editingNote]: noteInput }));
    setEditingNote(null);
    setNoteInput("");
  }

  // Viewer container classes
  const viewerWrapClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-[#0f172a]"
    : "flex flex-col";

  return (
    <div className="flex flex-col gap-6">
      {/* ----------------------------------------------------------------- */}
      {/* Property selector                                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">İlan Seçin</h2>
          <button
            onClick={() => {
              setPortfolioMode((v) => !v);
              setSelectedIds([]);
              setPropertyIndex(0);
              setSlideIndex(0);
            }}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              portfolioMode
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Building2 className="size-3" />
            Portföy Sunumu
          </button>
        </div>

        {portfolioMode && (
          <p className="text-xs text-muted-foreground -mt-1">
            Birden fazla ilan seçebilirsiniz. Her ilan için ayrı slayt destesi oluşturulur.
          </p>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İlan adı veya konum ara..."
            className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
          {filteredProperties.length === 0 && (
            <p className="text-sm text-muted-foreground py-3 text-center">
              Sonuç bulunamadı.
            </p>
          )}
          {filteredProperties.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            const cover = p.images[0];
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="size-10 shrink-0 rounded-md overflow-hidden bg-muted">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={p.title}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center">
                      <Building2 className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${isSelected ? "text-primary-foreground" : ""}`}
                  >
                    {p.title}
                  </p>
                  <p
                    className={`text-xs truncate ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {[p.district_name, p.city_name].filter(Boolean).join(", ")}{" "}
                    — {formatPrice(p.price, p.currency)}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-xs font-semibold shrink-0 text-primary-foreground/70">
                    {portfolioMode
                      ? `#${selectedIds.indexOf(p.id) + 1}`
                      : "Seçili"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Viewer                                                              */}
      {/* ----------------------------------------------------------------- */}
      {activeProperty ? (
        <div
          ref={viewerRef}
          className={viewerWrapClass}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Slayt görüntüleyici"
        >
          {/* Toolbar */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 gap-2 ${
              fullscreen
                ? "border-b border-white/10"
                : "rounded-t-xl border border-b-0 bg-card"
            }`}
          >
            {/* Left: title + slide tabs */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold truncate max-w-[160px]">
                {activeProperty.title}
              </span>

              {/* Slide tabs — hidden on small screens */}
              <div className="hidden lg:flex items-center gap-0.5 flex-wrap">
                {activeSlides.map((s, i) => (
                  <button
                    key={s.type}
                    onClick={() => setSlideIndex(i)}
                    className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                      i === slideIndex
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Portfolio counter */}
              {selectedProperties.length > 1 && (
                <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                  İlan {propertyIndex + 1}/{selectedProperties.length} —
                </span>
              )}

              {/* Slide counter */}
              <span className="text-xs text-muted-foreground tabular-nums">
                {slideIndex + 1}/{totalSlides}
              </span>

              {/* Theme picker */}
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`size-7 rounded-md flex items-center justify-center transition-colors ${
                  showSettings ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                title="Ayarlar"
              >
                <Settings2 className="size-3.5" />
              </button>

              {/* Notes toggle */}
              <button
                onClick={() => setShowNotes((v) => !v)}
                className={`size-7 rounded-md flex items-center justify-center transition-colors ${
                  showNotes ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                title="Notlar"
              >
                <StickyNote className="size-3.5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={() => setFullscreen((f) => !f)}
                className="size-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                title={fullscreen ? "Tam ekrandan çık" : "Tam ekran"}
              >
                {fullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div
              className={`px-4 py-3 border border-t-0 flex flex-wrap gap-4 items-start ${
                fullscreen ? "border-white/10 bg-white/5" : "bg-card border-b-0"
              }`}
            >
              {/* Theme */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Palette className="size-3" />
                  Tema
                </p>
                <div className="flex items-center gap-1.5">
                  {(Object.keys(THEMES) as PresentationTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      title={THEME_LABELS[t]}
                      className={`size-7 rounded-full border-2 transition-all ${
                        theme === t ? "border-primary scale-110" : "border-transparent hover:border-muted-foreground/40"
                      }`}
                      style={{ backgroundColor: THEME_PREVIEW_COLORS[t] }}
                    />
                  ))}
                </div>
              </div>

              {/* Transition */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">Geçiş</p>
                <Select
                  value={transitionType}
                  onValueChange={(v) => setTransitionType(v as TransitionType)}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Soluklaşma</SelectItem>
                    <SelectItem value="slide">Kaydırma</SelectItem>
                    <SelectItem value="zoom">Yakınlaşma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Slide toggles */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Eye className="size-3" />
                  Slaytlar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SLIDE_DEFINITIONS.map((s) => {
                    const on = enabledSlides.has(s.type);
                    return (
                      <button
                        key={s.type}
                        onClick={() => toggleSlide(s.type)}
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-colors ${
                          on
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {on ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Slide canvas — 16:9 */}
          <div
            className={`relative ${
              fullscreen ? "flex-1 flex items-center justify-center p-6" : ""
            }`}
          >
            <div
              className={
                fullscreen
                  ? "relative w-full max-w-5xl"
                  : "relative w-full border border-t-0 rounded-b-xl overflow-hidden"
              }
              style={{ aspectRatio: "16/9" }}
            >
              {/* Slide content with transition */}
              <div
                data-slide-canvas
                className="absolute inset-0 overflow-hidden"
                style={{
                  backgroundColor: themeColors.bg,
                  ...getTransitionStyle(),
                }}
              >
                <SlideRenderer
                  property={activeProperty}
                  slideType={currentSlide.type}
                  theme={themeColors}
                  note={currentNote}
                />
              </div>

              {/* Navigation arrows */}
              <button
                onClick={() => navigate("prev")}
                disabled={!canPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm z-10"
                aria-label="Önceki slayt"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => navigate("next")}
                disabled={!canNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm z-10"
                aria-label="Sonraki slayt"
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {activeSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === slideIndex ? 20 : 6,
                      height: 6,
                      backgroundColor:
                        i === slideIndex
                          ? "#ffca3e"
                          : "rgba(255,255,255,0.35)",
                    }}
                    aria-label={`Slayt ${i + 1}`}
                  />
                ))}
              </div>

              {/* Note editor overlay */}
              {editingNote && (
                <div className="absolute inset-0 bg-black/60 flex items-end z-20 p-4">
                  <div className="w-full bg-background rounded-xl p-3 flex items-center gap-2">
                    <StickyNote className="size-4 text-muted-foreground shrink-0" />
                    <Input
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Bu slayt için not ekle..."
                      className="flex-1 h-7 text-xs border-0 bg-transparent focus-visible:ring-0 p-0"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveNote();
                        if (e.key === "Escape") setEditingNote(null);
                      }}
                    />
                    <Button size="xs" onClick={saveNote}>
                      Kaydet
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setEditingNote(null)}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes panel */}
          {showNotes && !fullscreen && (
            <div className="mt-2 rounded-xl border bg-card p-3 flex items-start gap-3">
              <StickyNote className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1">
                  {currentSlide.label} — Not
                </p>
                {currentNote ? (
                  <p className="text-xs text-muted-foreground">{currentNote}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Bu slayt için henüz not eklenmedi.
                  </p>
                )}
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={openNoteEditor}
                className="shrink-0 gap-1"
              >
                <Plus className="size-3" />
                Not Ekle
              </Button>
            </div>
          )}

          {/* Mobile slide tabs */}
          <div className="flex lg:hidden items-center justify-center gap-0.5 pt-2 pb-1 flex-wrap">
            {activeSlides.map((s, i) => (
              <button
                key={s.type}
                onClick={() => setSlideIndex(i)}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                  i === slideIndex
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Export buttons */}
          {!fullscreen && (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCurrentPNG}
                className="gap-1.5"
              >
                <ImageDown className="size-3.5" />
                Slaytı PNG İndir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAllPNG}
                className="gap-1.5"
              >
                <Download className="size-3.5" />
                Tümünü İndir
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPDF}
                className="gap-1.5"
              >
                <FileDown className="size-3.5" />
                PDF İndir
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
            <Building2 className="size-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Sunum Oluştur</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Yukarıdan bir ilan seçerek profesyonel slayt sunumu oluşturmaya başlayın.
          </p>
        </div>
      )}
    </div>
  );
}
