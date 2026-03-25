"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number, currency: string): string {
  const symbol = currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€";
  return `${symbol}${price.toLocaleString("tr-TR")}`;
}

function labelForType(type: string): string {
  const map: Record<string, string> = {
    apartment: "Daire",
    villa: "Villa",
    office: "Ofis",
    land: "Arsa",
    commercial: "Ticari",
    house: "Müstakil Ev",
  };
  return map[type] ?? type;
}

function labelForTransaction(t: string): string {
  return t === "sale" ? "Satılık" : "Kiralık";
}

// ---------------------------------------------------------------------------
// Slide definitions
// ---------------------------------------------------------------------------

type SlideType = "cover" | "gallery" | "details" | "description" | "contact";

interface Slide {
  type: SlideType;
  label: string;
}

const SLIDE_DEFINITIONS: Slide[] = [
  { type: "cover", label: "Kapak" },
  { type: "gallery", label: "Galeri" },
  { type: "details", label: "Detaylar" },
  { type: "description", label: "Açıklama" },
  { type: "contact", label: "İletişim" },
];

// ---------------------------------------------------------------------------
// Individual slide components
// ---------------------------------------------------------------------------

interface SlideProps {
  property: PropertyForPresentation;
}

/** Slide 1 — Cover */
function SlideCover({ property }: SlideProps) {
  const coverImage = property.images[0];
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="relative flex flex-col justify-end h-full overflow-hidden">
      {/* Background image */}
      {coverImage ? (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a]" />
      )}

      {/* Top bar — logo */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 pt-8">
        <div className="flex items-center gap-2">
          <div
            className="size-8 rounded flex items-center justify-center text-[#0f172a] font-black text-sm"
            style={{ backgroundColor: "#ffca3e" }}
          >
            N
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">
            NEXOS
          </span>
        </div>
        <span
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: "#ffca3e", color: "#0f172a" }}
        >
          {labelForTransaction(property.transaction_type)}
        </span>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 px-10 pb-10">
        <p
          className="text-sm font-medium mb-2 uppercase tracking-widest"
          style={{ color: "#ffca3e" }}
        >
          {labelForType(property.type)}
        </p>
        <h1 className="text-white font-bold leading-tight mb-4"
          style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)" }}>
          {property.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <span
            className="text-2xl font-black"
            style={{ color: "#ffca3e" }}
          >
            {formatPrice(property.price, property.currency)}
          </span>
          {location && (
            <span className="flex items-center gap-1.5 text-white/70 text-sm">
              <MapPin className="size-3.5" />
              {location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Slide 2 — Gallery */
function SlideGallery({ property }: SlideProps) {
  const galleryImages = property.images.slice(1, 5);
  const hasImages = galleryImages.length > 0;

  return (
    <div className="flex flex-col h-full px-8 py-7 gap-4">
      <p className="text-white/50 text-xs font-medium uppercase tracking-widest">
        {property.title}
      </p>
      <h2 className="text-white text-xl font-bold -mt-1">
        Fotoğraf Galerisi
      </h2>

      {hasImages ? (
        <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
          {[0, 1, 2, 3].map((idx) => {
            const url = galleryImages[idx];
            return (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden bg-white/5"
              >
                {url ? (
                  <Image
                    src={url}
                    alt={`${property.title} — ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="size-8 text-white/20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm">Ek fotoğraf bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
}

/** Slide 3 — Details */
function SlideDetails({ property }: SlideProps) {
  type DetailItem = {
    icon: React.ElementType;
    label: string;
    value: string;
  };

  const items: DetailItem[] = [
    {
      icon: Home,
      label: "Gayrimenkul Tipi",
      value: labelForType(property.type),
    },
    ...(property.rooms !== null
      ? [{ icon: BedDouble, label: "Oda Sayısı", value: `${property.rooms + (property.living_rooms ?? 0)}+${property.rooms}` }]
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
    <div className="flex flex-col h-full px-8 py-7 gap-5">
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest">
          {property.title}
        </p>
        <h2 className="text-white text-xl font-bold mt-1">
          Mülk Detayları
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 content-start">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-xl p-4"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <div
                className="size-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(255,202,62,0.15)" }}
              >
                <Icon className="size-5" style={{ color: "#ffca3e" }} />
              </div>
              <div className="min-w-0">
                <p className="text-white/50 text-xs mb-0.5">{item.label}</p>
                <p className="text-white font-semibold text-sm truncate">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between rounded-xl px-5 py-3.5"
        style={{ backgroundColor: "rgba(255,202,62,0.12)" }}
      >
        <span className="text-white/60 text-sm">Fiyat</span>
        <span className="font-black text-lg" style={{ color: "#ffca3e" }}>
          {formatPrice(property.price, property.currency)}
        </span>
      </div>
    </div>
  );
}

/** Slide 4 — Description */
function SlideDescription({ property }: SlideProps) {
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col h-full px-8 py-7 gap-5">
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest">
          {property.title}
        </p>
        <h2 className="text-white text-xl font-bold mt-1">Açıklama</h2>
      </div>

      {location && (
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" style={{ color: "#ffca3e" }} />
          <span className="text-white/70 text-sm">{location}</span>
        </div>
      )}

      <div
        className="flex-1 rounded-xl p-5 overflow-auto"
        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        {property.description ? (
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        ) : (
          <p className="text-white/30 text-sm">Açıklama bulunmamaktadır.</p>
        )}
      </div>

      <div
        className="flex items-center gap-3 rounded-xl px-5 py-3"
        style={{ backgroundColor: "rgba(255,202,62,0.12)" }}
      >
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#ffca3e", color: "#0f172a" }}
        >
          {labelForTransaction(property.transaction_type)}
        </span>
        <span className="text-white font-black text-base">
          {formatPrice(property.price, property.currency)}
        </span>
      </div>
    </div>
  );
}

/** Slide 5 — Contact */
function SlideContact() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-6 text-center">
      {/* Logo mark */}
      <div
        className="size-20 rounded-2xl flex items-center justify-center text-[#0f172a] font-black text-3xl"
        style={{ backgroundColor: "#ffca3e" }}
      >
        N
      </div>

      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">
          Gayrimenkul Danışmanlığı
        </p>
        <h2 className="text-white text-2xl font-black tracking-tight">
          NEXOS INVESTMENT
        </h2>
      </div>

      <div
        className="w-16 h-0.5 rounded-full"
        style={{ backgroundColor: "#ffca3e" }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 justify-center">
          <Phone className="size-4" style={{ color: "#ffca3e" }} />
          <span className="text-white font-semibold text-lg">
            +90 548 860 40 30
          </span>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <Globe className="size-4" style={{ color: "#ffca3e" }} />
          <span className="text-white/80 text-base">
            nexosinvestment.com
          </span>
        </div>
      </div>

      <div
        className="mt-2 px-8 py-3 rounded-xl font-semibold text-sm"
        style={{ backgroundColor: "#ffca3e", color: "#0f172a" }}
      >
        Bir Görüşme Planlayın
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF export helper
// ---------------------------------------------------------------------------

function buildPrintHTML(property: PropertyForPresentation): string {
  const location = [property.district_name, property.city_name]
    .filter(Boolean)
    .join(", ");

  const slideStyle = `
    width: 297mm;
    height: 167mm;
    background: #0f172a;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
    page-break-after: always;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  `;

  const accentColor = "#ffca3e";

  // Slide 1 - Cover
  const coverImageTag = property.images[0]
    ? `<img src="${property.images[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />`
    : "";

  const slide1 = `
    <div style="${slideStyle}">
      ${coverImageTag}
      <div style="position:absolute;inset:0;background:linear-gradient(to top, #0f172a 0%, rgba(15,23,42,0.55) 50%, transparent 100%);"></div>
      <div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:28px 36px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:30px;height:30px;border-radius:6px;background:${accentColor};display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:900;font-size:14px;">N</div>
          <span style="color:white;font-weight:700;font-size:16px;letter-spacing:2px;">NEXOS</span>
        </div>
        <span style="background:${accentColor};color:#0f172a;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:1px;">${labelForTransaction(property.transaction_type).toUpperCase()}</span>
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:0 36px 32px;">
        <p style="color:${accentColor};font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">${labelForType(property.type)}</p>
        <h1 style="color:white;font-size:28px;font-weight:900;margin:0 0 16px;line-height:1.2;">${property.title}</h1>
        <div style="display:flex;align-items:center;gap:20px;">
          <span style="color:${accentColor};font-size:22px;font-weight:900;">${formatPrice(property.price, property.currency)}</span>
          ${location ? `<span style="color:rgba(255,255,255,0.65);font-size:12px;">📍 ${location}</span>` : ""}
        </div>
      </div>
    </div>
  `;

  // Slide 2 - Gallery
  const galleryImages = property.images.slice(1, 5);
  const galleryGrid = [0, 1, 2, 3]
    .map((i) => {
      const url = galleryImages[i];
      return `<div style="position:relative;border-radius:10px;overflow:hidden;background:rgba(255,255,255,0.06);">
        ${url ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />` : ""}
      </div>`;
    })
    .join("");

  const slide2 = `
    <div style="${slideStyle}padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.45);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">${property.title}</p>
      <h2 style="color:white;font-size:18px;font-weight:800;margin:0 0 16px;">Fotoğraf Galerisi</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;height:calc(100% - 68px);">
        ${galleryGrid}
      </div>
    </div>
  `;

  // Slide 3 - Details
  type DetailPair = [string, string];
  const detailItems: DetailPair[] = [
    ["Gayrimenkul Tipi", labelForType(property.type)],
    ...(property.rooms !== null
      ? [["Oda Sayısı", `${property.rooms + (property.living_rooms ?? 0)}+${property.rooms}`] as DetailPair]
      : []),
    ...(property.bathrooms !== null
      ? [["Banyo", `${property.bathrooms}`] as DetailPair]
      : []),
    ...(property.area_sqm !== null
      ? [["Brüt Alan", `${property.area_sqm} m²`] as DetailPair]
      : []),
    ...(property.floor !== null
      ? [
          [
            "Kat",
            property.total_floors
              ? `${property.floor} / ${property.total_floors}`
              : `${property.floor}. Kat`,
          ] as DetailPair,
        ]
      : []),
    ...(property.year_built !== null
      ? [["Yapım Yılı", `${property.year_built}`] as DetailPair]
      : []),
  ];

  const detailCards = detailItems
    .map(
      ([label, value]) => `
    <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px;">
      <p style="color:rgba(255,255,255,0.45);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">${label}</p>
      <p style="color:white;font-size:14px;font-weight:700;margin:0;">${value}</p>
    </div>
  `
    )
    .join("");

  const slide3 = `
    <div style="${slideStyle}padding:28px 32px;display:flex;flex-direction:column;gap:14px;">
      <div>
        <p style="color:rgba(255,255,255,0.45);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">${property.title}</p>
        <h2 style="color:white;font-size:18px;font-weight:800;margin:0;">Mülk Detayları</h2>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;">
        ${detailCards}
      </div>
      <div style="background:rgba(255,202,62,0.14);border-radius:10px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;">
        <span style="color:rgba(255,255,255,0.55);font-size:12px;">Fiyat</span>
        <span style="color:${accentColor};font-size:18px;font-weight:900;">${formatPrice(property.price, property.currency)}</span>
      </div>
    </div>
  `;

  // Slide 4 - Description
  const slide4 = `
    <div style="${slideStyle}padding:28px 32px;display:flex;flex-direction:column;gap:14px;">
      <div>
        <p style="color:rgba(255,255,255,0.45);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">${property.title}</p>
        <h2 style="color:white;font-size:18px;font-weight:800;margin:0;">Açıklama</h2>
      </div>
      ${location ? `<p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">📍 ${location}</p>` : ""}
      <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:16px;flex:1;overflow:hidden;">
        <p style="color:rgba(255,255,255,0.8);font-size:11px;line-height:1.7;margin:0;white-space:pre-line;">
          ${(property.description ?? "Açıklama bulunmamaktadır.").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </p>
      </div>
      <div style="background:rgba(255,202,62,0.14);border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:12px;">
        <span style="background:${accentColor};color:#0f172a;font-size:9px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:1px;">${labelForTransaction(property.transaction_type).toUpperCase()}</span>
        <span style="color:white;font-size:16px;font-weight:900;">${formatPrice(property.price, property.currency)}</span>
      </div>
    </div>
  `;

  // Slide 5 - Contact (no page-break-after on last slide)
  const slide5 = `
    <div style="${slideStyle.replace("page-break-after: always;", "")}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center;">
      <div style="width:72px;height:72px;border-radius:16px;background:${accentColor};display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:900;font-size:28px;">N</div>
      <div>
        <p style="color:rgba(255,255,255,0.45);font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;">Gayrimenkul Danışmanlığı</p>
        <h2 style="color:white;font-size:22px;font-weight:900;letter-spacing:1px;margin:0;">NEXOS INVESTMENT</h2>
      </div>
      <div style="width:50px;height:2px;background:${accentColor};border-radius:2px;"></div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <p style="color:white;font-size:16px;font-weight:700;margin:0;">📞 +90 548 860 40 30</p>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">🌐 nexosinvestment.com</p>
      </div>
      <div style="margin-top:6px;background:${accentColor};color:#0f172a;font-size:13px;font-weight:700;padding:10px 28px;border-radius:10px;">
        Bir Görüşme Planlayın
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>${property.title} — Sunum</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #111827; }
    @media print {
      body { background: white; }
      @page { size: A4 landscape; margin: 0; }
    }
  </style>
</head>
<body>
  ${slide1}
  ${slide2}
  ${slide3}
  ${slide4}
  ${slide5}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Slide renderer (screen mode)
// ---------------------------------------------------------------------------

function SlideRenderer({
  property,
  slideIndex,
}: {
  property: PropertyForPresentation;
  slideIndex: number;
}) {
  const slide = SLIDE_DEFINITIONS[slideIndex];
  if (!slide) return null;

  switch (slide.type) {
    case "cover":
      return <SlideCover property={property} />;
    case "gallery":
      return <SlideGallery property={property} />;
    case "details":
      return <SlideDetails property={property} />;
    case "description":
      return <SlideDescription property={property} />;
    case "contact":
      return <SlideContact />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PresentationManager({ properties }: PresentationManagerProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return properties;
    const q = query.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.city_name.toLowerCase().includes(q) ||
        (p.district_name ?? "").toLowerCase().includes(q)
    );
  }, [properties, query]);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedId) ?? null,
    [properties, selectedId]
  );

  const totalSlides = SLIDE_DEFINITIONS.length;

  function handleSelect(id: string) {
    setSelectedId(id);
    setSlideIndex(0);
  }

  function handlePrev() {
    setSlideIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    setSlideIndex((i) => Math.min(totalSlides - 1, i + 1));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape" && fullscreen) setFullscreen(false);
  }

  function handleDownload() {
    if (!selectedProperty) return;
    const html = buildPrintHTML(selectedProperty);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  }

  // Viewer pane classes — fullscreen overlays the whole viewport
  const viewerWrapClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-[#0f172a]"
    : "flex flex-col";

  return (
    <div className="flex flex-col gap-6">
      {/* Property selector */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">İlan Seçin</h2>

        {/* Search */}
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

        {/* Property list */}
        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-3 text-center">
              Sonuç bulunamadı.
            </p>
          )}
          {filtered.map((p) => {
            const isSelected = p.id === selectedId;
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
                {/* Thumbnail */}
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
                    {[p.district_name, p.city_name].filter(Boolean).join(", ")} —{" "}
                    {formatPrice(p.price, p.currency)}
                  </p>
                </div>

                {isSelected && (
                  <span className="text-xs font-semibold shrink-0 text-primary-foreground/70">
                    Seçili
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Viewer */}
      {selectedProperty ? (
        <div
          className={viewerWrapClass}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Slayt görüntüleyici"
        >
          {/* Toolbar */}
          <div
            className={`flex items-center justify-between px-4 py-3 ${
              fullscreen
                ? "border-b border-white/10"
                : "rounded-t-xl border border-b-0 bg-card"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {selectedProperty.title}
              </span>
              {/* Slide tabs */}
              <div className="hidden sm:flex items-center gap-1">
                {SLIDE_DEFINITIONS.map((s, i) => (
                  <button
                    key={s.type}
                    onClick={() => setSlideIndex(i)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
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

            <div className="flex items-center gap-2">
              {/* Slide counter */}
              <span className="text-xs text-muted-foreground tabular-nums">
                {slideIndex + 1} / {totalSlides}
              </span>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDownload}
                title="PDF İndir"
                aria-label="PDF İndir"
              >
                <Download className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFullscreen((f) => !f)}
                title={fullscreen ? "Tam ekrandan çık" : "Tam ekran"}
                aria-label={fullscreen ? "Tam ekrandan çık" : "Tam ekran"}
              >
                {fullscreen ? (
                  <Minimize className="size-4" />
                ) : (
                  <Maximize className="size-4" />
                )}
              </Button>
            </div>
          </div>

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
              style={
                fullscreen
                  ? { aspectRatio: "16/9" }
                  : { aspectRatio: "16/9" }
              }
            >
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ backgroundColor: "#0f172a" }}
              >
                <SlideRenderer
                  property={selectedProperty}
                  slideIndex={slideIndex}
                />
              </div>

              {/* Navigation arrows — overlaid */}
              <button
                onClick={handlePrev}
                disabled={slideIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm"
                aria-label="Önceki slayt"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={slideIndex === totalSlides - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm"
                aria-label="Sonraki slayt"
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {SLIDE_DEFINITIONS.map((_, i) => (
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
            </div>
          </div>

          {/* Mobile slide tabs */}
          <div className="flex sm:hidden items-center justify-center gap-1 pt-2 pb-1">
            {SLIDE_DEFINITIONS.map((s, i) => (
              <button
                key={s.type}
                onClick={() => setSlideIndex(i)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  i === slideIndex
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Download CTA */}
          {!fullscreen && (
            <div className="mt-4 flex items-center justify-end">
              <Button onClick={handleDownload} size="sm" className="gap-2">
                <Download className="size-3.5" />
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
            Listeden bir ilan seçin. Slaytlar otomatik oluşturulacak ve PDF
            olarak indirilebilecektir.
          </p>
        </div>
      )}
    </div>
  );
}
