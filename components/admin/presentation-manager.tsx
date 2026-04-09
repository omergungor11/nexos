"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  lat: number | null;
  lng: number | null;
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
  | "photo"
  | "details"
  | "description"
  | "location"
  | "why_cyprus"
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
  photoIndex?: number;
  bannerText?: string;
  customDescription?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THEMES: Record<PresentationTheme, ThemeColors> = {
  dark: {
    bg: "#0f172a",
    cardBg: "#1e293b",
    text: "#f8fafc",
    accent: "#ffca3e",
    muted: "#94a3b8",
  },
  light: {
    bg: "#ffffff",
    cardBg: "#f1f5f9",
    text: "#0f172a",
    accent: "#ffca3e",
    muted: "#64748b",
  },
  gold: {
    bg: "#1a1207",
    cardBg: "#2a1f0e",
    text: "#fef9e7",
    accent: "#ffca3e",
    muted: "#c4a352",
  },
  minimal: {
    bg: "#fafafa",
    cardBg: "#ffffff",
    text: "#171717",
    accent: "#ffca3e",
    muted: "#737373",
  },
};

const THEME_LABELS: Record<PresentationTheme, string> = {
  dark: "Koyu",
  light: "Açık",
  gold: "Altın",
  minimal: "Minimal",
};

const THEME_PREVIEW_COLORS: Record<PresentationTheme, string> = {
  dark: "#0f172a",
  light: "#f1f5f9",
  gold: "#1a1207",
  minimal: "#fafafa",
};

const SLIDE_DEFINITIONS: SlideDefinition[] = [
  { type: "cover", label: "Kapak" },
  { type: "gallery", label: "Galeri" },
  { type: "photo", label: "Fotoğraflar" },
  { type: "details", label: "Detaylar" },
  { type: "description", label: "Açıklama" },
  { type: "location", label: "Konum" },
  { type: "why_cyprus", label: "Neden Kıbrıs?" },
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
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo-square.jpeg"
            alt="Nexos"
            width={36}
            height={36}
            className="rounded"
          />
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
            fontSize: "clamp(1.3rem, 2.8vw, 2rem)",
          }}
        >
          {property.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-2xl font-black" style={{ color: theme.accent }}>
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
        <h2 className="text-xl font-black" style={{ color: theme.text }}>
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

/** Slide — Full Page Photo */
function PhotoSlide({ property, theme, note, photoIndex = 0, bannerText }: SlideProps) {
  const img = property.images[photoIndex];

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      {img ? (
        <>
          <Image
            src={img}
            alt={`${property.title} — ${photoIndex + 1}`}
            fill
            className="object-cover"
          />
          {/* Subtle bottom gradient for text */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${theme.bg}cc 0%, transparent 25%)`,
            }}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Building2 className="size-16" style={{ color: `${theme.muted}44` }} />
        </div>
      )}

      {/* Custom banner text — shown above the price bar */}
      {bannerText && (
        <div
          className="absolute left-0 right-0 z-10 flex items-center justify-center px-8 py-2"
          style={{
            bottom: "72px",
            backgroundColor: `${theme.bg}cc`,
          }}
        >
          <p className="text-sm font-medium text-center" style={{ color: theme.text }}>
            {bannerText}
          </p>
        </div>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-8 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: `${theme.text}99` }}>
            {property.title}
          </p>
          <p className="text-lg font-black" style={{ color: theme.text }}>
            {formatPrice(property.price, property.currency)}
          </p>
        </div>
        <div
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: `${theme.bg}aa`, color: theme.text }}
        >
          {photoIndex + 1} / {property.images.length}
        </div>
      </div>

      {note && (
        <div
          className="absolute top-4 right-4 z-10 text-xs px-2 py-1 rounded-md max-w-[200px] text-right"
          style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

/** Slide 3 — Details */
function DetailsSlide({ property, theme, note }: SlideProps) {
  type DetailItem = { icon: React.ElementType; label: string; value: string };

  const items: DetailItem[] = [];

  if (property.area_sqm !== null) {
    items.push({ icon: Maximize2, label: "Brüt Alan", value: `${property.area_sqm} m²` });
  }
  if (property.rooms !== null) {
    items.push({
      icon: BedDouble,
      label: "Oda Sayısı",
      value: `${(property.living_rooms ?? 0) + property.rooms}+${property.rooms}`,
    });
  }
  if (property.bathrooms !== null) {
    items.push({ icon: Bath, label: "Banyo", value: `${property.bathrooms}` });
  }
  if (property.floor !== null) {
    items.push({
      icon: Layers,
      label: "Kat",
      value: property.total_floors
        ? `${property.floor} / ${property.total_floors}`
        : `${property.floor}. Kat`,
    });
  }
  if (property.year_built !== null) {
    items.push({ icon: CalendarDays, label: "Yapım Yılı", value: `${property.year_built}` });
  }
  items.push({
    icon: Home,
    label: "Gayrimenkul Tipi",
    value: labelForType(property.type),
  });
  items.push({
    icon: Building2,
    label: "Konum",
    value:
      [property.district_name, property.city_name].filter(Boolean).join(", ") || "—",
  });
  items.push({
    icon: Sparkles,
    label: "İşlem Türü",
    value: labelForTransaction(property.transaction_type),
  });

  return (
    <div
      className="flex flex-col h-full px-8 py-5 gap-3"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.accent }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black flex items-center gap-2" style={{ color: theme.text }}>
          <Sparkles className="size-5" style={{ color: theme.accent }} />
          Mülk Detayları
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2.5 content-start">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ backgroundColor: theme.cardBg }}
            >
              <div
                className="size-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${theme.accent}22` }}
              >
                <Icon className="size-5" style={{ color: theme.accent }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: theme.muted }}>
                  {item.label}
                </p>
                <p className="text-sm font-black truncate" style={{ color: theme.text }}>
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between rounded-xl px-5 py-3"
        style={{ backgroundColor: `${theme.accent}1a`, borderLeft: `3px solid ${theme.accent}` }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
          Fiyat
        </span>
        <span className="text-xl font-black" style={{ color: theme.accent }}>
          {formatPrice(property.price, property.currency)}
        </span>
      </div>

      {note && (
        <p className="text-[10px] text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Slide 5 — Description */
function DescriptionSlide({ property, theme, note, customDescription }: SlideProps) {
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");

  // Use custom description if provided, otherwise fall back to DB description
  const descriptionText = customDescription?.trim() || property.description;
  const bgImage = property.images[0];

  // Extract first sentence as pull-quote
  const firstSentence = descriptionText
    ? (descriptionText.match(/^[^.!?]+[.!?]/)?.[0] ?? descriptionText.slice(0, 120))
    : null;
  const restText = descriptionText && firstSentence
    ? descriptionText.slice(firstSentence.length).trim()
    : null;

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Background image with heavy overlay for editorial feel */}
      {bgImage && (
        <>
          <div className="absolute inset-0">
            <Image src={bgImage} alt="" fill className="object-cover" />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.bg}f0 0%, ${theme.bg}f0 50%, ${theme.bg}cc 100%)`,
            }}
          />
        </>
      )}

      <div className="relative flex flex-col h-full px-10 py-7 gap-4">
        {/* Header */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: theme.accent }}
          >
            {property.title}
          </p>
          <h2 className="text-2xl font-black" style={{ color: theme.text }}>
            Mülk Hakkında
          </h2>
          {location && (
            <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: theme.muted }}>
              <MapPin className="size-3" />
              {location}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
          {descriptionText ? (
            <>
              {/* Pull-quote: first sentence in larger italic */}
              {firstSentence && (
                <div className="relative pl-5">
                  <div
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <p
                    className="text-base italic leading-snug font-medium"
                    style={{ color: theme.text }}
                  >
                    {firstSentence}
                  </p>
                </div>
              )}
              {/* Rest of description */}
              {restText && (
                <div
                  className="flex-1 overflow-auto rounded-lg px-4 py-3"
                  style={{ backgroundColor: `${theme.cardBg}aa` }}
                >
                  <p
                    className="text-xs leading-relaxed whitespace-pre-line"
                    style={{ color: `${theme.text}d0` }}
                  >
                    {restText}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div
              className="flex-1 flex items-center justify-center rounded-xl"
              style={{ backgroundColor: `${theme.cardBg}aa` }}
            >
              <p className="text-sm" style={{ color: theme.muted }}>
                Açıklama bulunmamaktadır. Ayarlar panelinden özel metin ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3"
          style={{ backgroundColor: `${theme.accent}1a`, borderLeft: `3px solid ${theme.accent}` }}
        >
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: theme.accent, color: "#0f172a" }}
          >
            {labelForTransaction(property.transaction_type)}
          </span>
          <span className="font-black text-lg" style={{ color: theme.text }}>
            {formatPrice(property.price, property.currency)}
          </span>
        </div>

        {note && (
          <p className="text-[10px] text-right" style={{ color: theme.muted }}>
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

/** Slide 6 — Location with real map */
function LocationSlide({ property, theme, note }: SlideProps) {
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");
  const hasCoords = property.lat != null && property.lng != null;

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
        <h2 className="text-xl font-black flex items-center gap-2" style={{ color: theme.text }}>
          <MapPin className="size-5" style={{ color: theme.accent }} />
          Konum
        </h2>
      </div>

      {/* Map embed — Google Maps (no API key required) */}
      <div className="flex-1 rounded-2xl overflow-hidden relative min-h-0">
        {hasCoords ? (
          <iframe
            src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&z=14&output=embed`}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: theme.cardBg }}
          >
            <div
              className="size-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.accent}22` }}
            >
              <MapPin className="size-7" style={{ color: theme.accent }} />
            </div>
            <p className="text-sm font-medium" style={{ color: theme.muted }}>
              Koordinat bilgisi mevcut değil
            </p>
            {location && (
              <p className="text-xs" style={{ color: theme.muted }}>
                {location}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Location info bar */}
      <div className="flex items-center gap-4">
        <div
          className="flex-1 rounded-xl px-4 py-3"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-xs font-medium mb-0.5" style={{ color: theme.muted }}>Konum</p>
          <p className="font-bold text-sm" style={{ color: theme.text }}>
            {location || "—"}
          </p>
        </div>
        {hasCoords && (
          <div
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: `${theme.accent}1a` }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: theme.muted }}>Koordinat</p>
            <p className="font-bold text-xs font-mono" style={{ color: theme.accent }}>
              {property.lat!.toFixed(4)}, {property.lng!.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {note && (
        <p className="text-xs text-right" style={{ color: theme.muted }}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Slide — Why Buy Real Estate in Cyprus */
function WhyCyprusSlide({ theme, note }: { theme: ThemeColors; note?: string }) {
  // Key numeric KPIs (top row)
  const kpis = [
    { value: "%8-9", label: "Yıllık Değer Artışı", sub: "5 yıllık ortalama" },
    { value: "%6-9", label: "Kira Getirisi", sub: "Net yıllık" },
    { value: "7-10", label: "Yıl Geri Ödeme", sub: "Avrupa: 15-20 yıl" },
    { value: "320+", label: "Güneşli Gün", sub: "Yılda" },
  ];

  // Detailed reasons with concrete data
  const reasons = [
    {
      icon: Sparkles,
      title: "Güçlü Toplam Getiri",
      text: "%14-18 yıllık toplam getiri (kira + değer artışı). Avrupa ortalaması: %5-10. Son 5 yılda Girne villaları %40'ın üzerinde değer kazandı.",
    },
    {
      icon: Globe,
      title: "Düşük Vergi Yükü",
      text: "%0 yıllık emlak vergisi, %0 miras vergisi. Yeni gayrimenkulde %5 KDV (birincil konut), transfer ücreti net %1.5-4.",
    },
    {
      icon: Building2,
      title: "Yükselen Turizm",
      text: "2024'te 1.8M+ ziyaretçi, %18.6 büyüme. Ercan Havalimanı 2025'te 5.29M yolcu taşıdı (%19 artış). Kısa dönem kira talebi yüksek.",
    },
    {
      icon: Home,
      title: "Yabancıya Açık Pazar",
      text: "Türk, İngiliz, Rus, AB vatandaşları satın alabilir. 3 daire veya 1 villa + 1338m² arsa hakkı. Onay süreci 6-12 ay, pratikte standart prosedür.",
    },
    {
      icon: MapPin,
      title: "Stratejik Lokasyon",
      text: "İstanbul 1.5 saat, Londra 4.5 saat uçuş. Avrupa, Ortadoğu ve Afrika'nın kesişim noktası. 3 modern havalimanına yakınlık.",
    },
    {
      icon: CalendarDays,
      title: "Uygun Giriş Fiyatları",
      text: "Girne dairelerde £135K-£265K, İskele'de £60K'dan başlayan fiyatlar. 12-50 ay taksit seçenekleri. Avrupa'nın %25 altında yaşam maliyeti.",
    },
  ];

  return (
    <div
      className="flex flex-col h-full px-8 py-5 gap-3"
      style={{ backgroundColor: theme.bg }}
    >
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.accent }}
        >
          Yatırım Fırsatı
        </p>
        <h2 className="text-xl font-black" style={{ color: theme.text }}>
          Neden Kuzey Kıbrıs&apos;ta Gayrimenkul?
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: theme.muted }}>
          Akdeniz&apos;in yükselen yıldızı — veriler ile kanıtlanmış avantajlar
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-2">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="rounded-lg px-3 py-2 text-center"
            style={{ backgroundColor: `${theme.accent}15`, borderLeft: `2px solid ${theme.accent}` }}
          >
            <p className="text-lg font-black leading-none" style={{ color: theme.accent }}>
              {k.value}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wide mt-1" style={{ color: theme.text }}>
              {k.label}
            </p>
            <p className="text-[8px] mt-0.5" style={{ color: theme.muted }}>
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Reasons grid */}
      <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
        {reasons.map((r, i) => {
          const Icon = r.icon;
          return (
            <div
              key={i}
              className="rounded-lg px-3 py-2 flex gap-2.5 items-start"
              style={{ backgroundColor: theme.cardBg }}
            >
              <div
                className="size-7 rounded-md shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${theme.accent}22` }}
              >
                <Icon className="size-3.5" style={{ color: theme.accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black leading-tight mb-0.5" style={{ color: theme.text }}>
                  {r.title}
                </p>
                <p className="text-[10px] leading-snug" style={{ color: `${theme.text}99` }}>
                  {r.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom callout */}
      <div
        className="rounded-lg px-4 py-2 text-center"
        style={{ backgroundColor: theme.accent }}
      >
        <p className="text-[11px] font-black" style={{ color: "#0f172a" }}>
          Avrupa&apos;da 20 yıl, Kuzey Kıbrıs&apos;ta 7-10 yılda kendini amorti eden yatırım
        </p>
      </div>

      {note && (
        <p className="text-[10px] text-right" style={{ color: theme.muted }}>
          {note}
        </p>
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

  // Market-based calculations (Northern Cyprus averages)
  const yieldRate = 0.075; // 7.5% average annual rental yield
  const appreciationRate = 0.085; // 8.5% average annual appreciation
  const annualRent = Math.round(property.price * yieldRate);
  const monthlyRent = Math.round(annualRent / 12);
  const fiveYearAppreciation = Math.round(property.price * Math.pow(1 + appreciationRate, 5) - property.price);
  const totalFiveYearReturn = annualRent * 5 + fiveYearAppreciation;
  const roiPercent = Math.round((totalFiveYearReturn / property.price) * 100);

  // Use cover image as background
  const bgImage = property.images[0];

  return (
    <div
      className="flex flex-col h-full px-7 py-5 gap-3 relative"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Subtle background image */}
      {bgImage && (
        <div className="absolute inset-0 opacity-[0.08]">
          <Image src={bgImage} alt="" fill className="object-cover" />
        </div>
      )}

      <div className="relative">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: theme.accent }}
        >
          {property.title}
        </p>
        <h2 className="text-xl font-black flex items-center gap-2" style={{ color: theme.text }}>
          <Sparkles className="size-5" style={{ color: theme.accent }} />
          Yatırım Analizi
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: theme.muted }}>
          Kuzey Kıbrıs piyasa ortalamalarına dayalı 5 yıllık projeksiyon
        </p>
      </div>

      {/* Top row: Price + Price/m² + ROI */}
      <div className="grid grid-cols-3 gap-2 relative">
        <div
          className="rounded-xl p-3 flex flex-col gap-0.5"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-[10px] font-medium" style={{ color: theme.muted }}>
            Satış Fiyatı
          </p>
          <p className="text-base font-black leading-tight" style={{ color: theme.accent }}>
            {formatPrice(property.price, property.currency)}
          </p>
        </div>
        <div
          className="rounded-xl p-3 flex flex-col gap-0.5"
          style={{ backgroundColor: theme.cardBg }}
        >
          <p className="text-[10px] font-medium" style={{ color: theme.muted }}>
            m² Fiyatı
          </p>
          <p className="text-base font-black leading-tight" style={{ color: theme.text }}>
            {pricePerSqm ? formatPrice(pricePerSqm, property.currency) : "—"}
          </p>
        </div>
        <div
          className="rounded-xl p-3 flex flex-col gap-0.5"
          style={{ backgroundColor: `${theme.accent}22`, borderLeft: `2px solid ${theme.accent}` }}
        >
          <p className="text-[10px] font-medium" style={{ color: theme.muted }}>
            5 Yıl Toplam Getiri
          </p>
          <p className="text-base font-black leading-tight" style={{ color: theme.accent }}>
            %{roiPercent}
          </p>
        </div>
      </div>

      {/* Middle row: Rental income projection */}
      <div
        className="rounded-xl p-3 relative"
        style={{ backgroundColor: theme.cardBg }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>
          Kira Geliri Projeksiyonu (%7.5 ortalama)
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[9px] font-medium mb-0.5" style={{ color: theme.muted }}>Aylık Kira</p>
            <p className="text-sm font-black" style={{ color: theme.text }}>
              {formatPrice(monthlyRent, property.currency)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-medium mb-0.5" style={{ color: theme.muted }}>Yıllık Kira</p>
            <p className="text-sm font-black" style={{ color: theme.text }}>
              {formatPrice(annualRent, property.currency)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-medium mb-0.5" style={{ color: theme.muted }}>5 Yıllık Kira</p>
            <p className="text-sm font-black" style={{ color: theme.text }}>
              {formatPrice(annualRent * 5, property.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Value appreciation */}
      <div
        className="rounded-xl p-3 relative"
        style={{ backgroundColor: theme.cardBg }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>
          Değer Artışı Projeksiyonu (%8.5 yıllık ortalama)
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[9px] font-medium mb-0.5" style={{ color: theme.muted }}>Bugün</p>
            <p className="text-sm font-black" style={{ color: theme.text }}>
              {formatPrice(property.price, property.currency)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-medium mb-0.5" style={{ color: theme.muted }}>5 Yıl Sonra</p>
            <p className="text-sm font-black" style={{ color: theme.accent }}>
              {formatPrice(Math.round(property.price + fiveYearAppreciation), property.currency)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-medium mb-0.5" style={{ color: theme.muted }}>Artış</p>
            <p className="text-sm font-black" style={{ color: theme.accent }}>
              +{formatPrice(fiveYearAppreciation, property.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: advantages + disclaimer */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {["Yüksek Kira Getirisi", "Düşük Vergi", "Yükselen Piyasa", "Turizm Potansiyeli"].map((item) => (
            <span
              key={item}
              className="text-[9px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[8px] relative" style={{ color: theme.muted }}>
        * Projeksiyonlar Kuzey Kıbrıs gayrimenkul pazar ortalamalarına dayanmaktadır ve gelecekteki getiri garantisi değildir.
      </p>

      {note && (
        <p className="text-[10px] text-right relative" style={{ color: theme.muted }}>
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
      <Image
        src="/logo-square.jpeg"
        alt="Nexos Investment"
        width={80}
        height={80}
        className="rounded-2xl"
      />

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
  photoIndex,
  bannerText,
  customDescription,
}: {
  property: PropertyForPresentation;
  slideType: SlideType;
  theme: ThemeColors;
  note?: string;
  photoIndex?: number;
  bannerText?: string;
  customDescription?: string;
}) {
  switch (slideType) {
    case "cover":
      return <CoverSlide property={property} theme={theme} note={note} />;
    case "gallery":
      return <GallerySlide property={property} theme={theme} note={note} />;
    case "photo":
      return <PhotoSlide property={property} theme={theme} note={note} photoIndex={photoIndex} bannerText={bannerText} />;
    case "details":
      return <DetailsSlide property={property} theme={theme} note={note} />;
    case "description":
      return <DescriptionSlide property={property} theme={theme} note={note} customDescription={customDescription} />;
    case "location":
      return <LocationSlide property={property} theme={theme} note={note} />;
    case "why_cyprus":
      return <WhyCyprusSlide theme={theme} note={note} />;
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
    font-family: system-ui, -apple-system, sans-serif;
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

// ---------------------------------------------------------------------------
// Sortable Tab Item (for drag-and-drop slide reordering)
// ---------------------------------------------------------------------------

function SortableTab({
  id,
  label,
  isActive,
  onClick,
}: {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
      className={`text-xs px-2 py-0.5 rounded-md transition-colors select-none ${
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

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
  const [selectedPhotoIndices, setSelectedPhotoIndices] = useState<Set<number>>(new Set());

  // Slide ordering (drag-and-drop) — stores unique IDs, photo slides use "photo-{idx}"
  const [slideOrder, setSlideOrder] = useState<string[]>(
    SLIDE_DEFINITIONS.map((s) => s.type)
  );

  // Photo banners: keyed by "photo-{photoIndex}"
  const [photoBanners, setPhotoBanners] = useState<Record<string, string>>({});
  const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>({});

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

  // Build the full list of slide items with unique IDs, then sync slideOrder
  type SlideItem = SlideDefinition & { id: string; photoIndex?: number };

  const allSlideItems = useMemo<SlideItem[]>(() => {
    const items: SlideItem[] = [];
    for (const s of SLIDE_DEFINITIONS) {
      if (s.type === "photo") {
        const indices = Array.from(selectedPhotoIndices).sort((a, b) => a - b);
        const effectiveIndices =
          indices.length === 0 && activeProperty
            ? Array.from({ length: Math.min(3, activeProperty.images.length) }, (_, i) => i)
            : indices;
        for (const idx of effectiveIndices) {
          items.push({
            ...s,
            id: `photo-${idx}`,
            label: `Fotoğraf ${idx + 1}`,
            photoIndex: idx,
          });
        }
      } else {
        items.push({ ...s, id: s.type });
      }
    }
    return items;
  }, [selectedPhotoIndices, activeProperty]);

  // Sync slideOrder with allSlideItems: remove missing, append new
  useEffect(() => {
    setSlideOrder((prev) => {
      const allIds = new Set(allSlideItems.map((s) => s.id));
      const filtered = prev.filter((id) => allIds.has(id));
      const missing = allSlideItems
        .filter((s) => !prev.includes(s.id))
        .map((s) => s.id);
      return [...filtered, ...missing];
    });
  }, [allSlideItems]);

  // activeSlides: ordered by slideOrder, filtered by enabledSlides
  const activeSlides = useMemo(() => {
    const itemById = new Map(allSlideItems.map((s) => [s.id, s]));
    return slideOrder
      .map((id) => itemById.get(id))
      .filter((s): s is SlideItem => s !== undefined && enabledSlides.has(s.type));
  }, [slideOrder, allSlideItems, enabledSlides]);

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

  // DnD sensors for slide tab reordering
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleTabDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSlideOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
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

              {/* Slide tabs — hidden on small screens, drag-and-drop reorderable */}
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTabDragEnd}
              >
                <SortableContext
                  items={activeSlides.map((s) => s.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="hidden lg:flex items-center gap-0.5 flex-wrap">
                    {activeSlides.map((s, i) => (
                      <SortableTab
                        key={s.id}
                        id={s.id}
                        label={s.label}
                        isActive={i === slideIndex}
                        onClick={() => setSlideIndex(i)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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

              {/* Photo selection — only when photo slide is enabled */}
              {enabledSlides.has("photo") && activeProperty && activeProperty.images.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Fotoğraf Seçimi ({selectedPhotoIndices.size}/{activeProperty.images.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProperty.images.map((img, idx) => {
                      const selected = selectedPhotoIndices.has(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedPhotoIndices((prev) => {
                              const next = new Set(prev);
                              if (next.has(idx)) next.delete(idx);
                              else next.add(idx);
                              return next;
                            });
                          }}
                          className={`relative size-10 rounded overflow-hidden border-2 transition-all ${
                            selected
                              ? "border-primary ring-1 ring-primary"
                              : "border-transparent hover:border-muted-foreground/40"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`Fotoğraf ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                          {selected && (
                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                              <span className="text-white text-[9px] font-bold">{Array.from(selectedPhotoIndices).sort((a, b) => a - b).indexOf(idx) + 1}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Sunumda gösterilecek fotoğrafları seçin. Seçim yapılmazsa ilk 3 fotoğraf gösterilir.
                  </p>

                  {/* Banner text inputs for selected photos */}
                  {selectedPhotoIndices.size > 0 && (
                    <div className="mt-2 space-y-1.5 max-w-md">
                      <p className="text-xs font-medium text-muted-foreground">
                        Fotoğraf Banner Metni (opsiyonel)
                      </p>
                      {Array.from(selectedPhotoIndices).sort((a, b) => a - b).map((idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="relative size-8 shrink-0 rounded overflow-hidden border">
                            <Image
                              src={activeProperty.images[idx]}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="32px"
                              unoptimized
                            />
                          </div>
                          <Input
                            value={photoBanners[`photo-${idx}`] ?? ""}
                            onChange={(e) =>
                              setPhotoBanners((prev) => ({
                                ...prev,
                                [`photo-${idx}`]: e.target.value,
                              }))
                            }
                            placeholder={`Fotoğraf ${idx + 1} için banner (ör: Deniz Manzarası)`}
                            className="h-7 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom description — only when description slide is enabled */}
              {enabledSlides.has("description") && activeProperty && (
                <div className="flex flex-col gap-1.5 w-full">
                  <p className="text-xs font-medium text-muted-foreground">
                    Açıklama Metni (opsiyonel)
                  </p>
                  <textarea
                    value={customDescriptions[activeProperty.id] ?? ""}
                    onChange={(e) =>
                      setCustomDescriptions((prev) => ({
                        ...prev,
                        [activeProperty.id]: e.target.value,
                      }))
                    }
                    placeholder={
                      activeProperty.description
                        ? "Otomatik açıklamanın yerine özel metin yazın..."
                        : "Bu mülk için özel bir açıklama yazın..."
                    }
                    rows={3}
                    className="w-full max-w-2xl rounded-md border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Boş bırakılırsa mülk veritabanındaki açıklama kullanılır.
                  </p>
                </div>
              )}
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
                  photoIndex={currentSlide.photoIndex}
                  bannerText={
                    currentSlide.type === "photo" && currentSlide.photoIndex !== undefined
                      ? photoBanners[`photo-${currentSlide.photoIndex}`]
                      : undefined
                  }
                  customDescription={
                    currentSlide.type === "description"
                      ? customDescriptions[activeProperty.id]
                      : undefined
                  }
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

          {/* Mobile slide tabs — drag-and-drop reorderable */}
          <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleTabDragEnd}
          >
            <SortableContext
              items={activeSlides.map((s) => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex lg:hidden items-center justify-center gap-0.5 pt-2 pb-1 flex-wrap">
                {activeSlides.map((s, i) => (
                  <SortableTab
                    key={s.id}
                    id={s.id}
                    label={s.label}
                    isActive={i === slideIndex}
                    onClick={() => setSlideIndex(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

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
