"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Download, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyForImage {
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  city_name: string;
  district_name: string | null;
  cover_image: string | null;
}

interface SocialMediaImageGeneratorProps {
  property: PropertyForImage | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;
const PADDING = 48;
const BORDER_RADIUS = 24;

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const TRANSACTION_LABELS: Record<string, string> = {
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
  office: "Ofis",
  hotel: "Hotel",
  warehouse: "Depo",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = new Intl.NumberFormat("tr-TR").format(price);
  return `${symbol}${formatted}`;
}

function formatRooms(rooms: number | null, livingRooms: number | null): string | null {
  if (rooms == null) return null;
  return `${rooms}+${livingRooms ?? 1}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialMediaImageGenerator({ property }: SocialMediaImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateImage = useCallback(async () => {
    if (!property || !canvasRef.current) return;

    setGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // -- Background --
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // -- Cover image (top portion) --
    if (property.cover_image) {
      try {
        const img = await loadImage(property.cover_image);
        const imgH = 620;
        const imgW = CANVAS_WIDTH - PADDING * 2;
        const imgX = PADDING;
        const imgY = PADDING;

        // Clip with rounded corners
        ctx.save();
        roundRect(ctx, imgX, imgY, imgW, imgH, BORDER_RADIUS);
        ctx.clip();

        // Draw image cover-fit
        const scale = Math.max(imgW / img.width, imgH / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = imgX + (imgW - drawW) / 2;
        const drawY = imgY + (imgH - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        // Gradient overlay at bottom of image
        const grad = ctx.createLinearGradient(imgX, imgY + imgH - 150, imgX, imgY + imgH);
        grad.addColorStop(0, "rgba(15,23,42,0)");
        grad.addColorStop(1, "rgba(15,23,42,0.85)");
        ctx.fillStyle = grad;
        ctx.fillRect(imgX, imgY + imgH - 150, imgW, 150);

        ctx.restore();

        // Transaction type badge on image
        const txLabel = TRANSACTION_LABELS[property.transaction_type] ?? "SATILIK";
        ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
        const badgeW = ctx.measureText(txLabel).width + 28;
        const badgeH = 38;
        const badgeX = imgX + 20;
        const badgeY = imgY + 20;

        ctx.fillStyle = "#2563eb";
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 10);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(txLabel, badgeX + 14, badgeY + badgeH / 2);
      } catch {
        // Image load failed — show placeholder
        const imgH = 620;
        const imgW = CANVAS_WIDTH - PADDING * 2;
        ctx.fillStyle = "#1e293b";
        roundRect(ctx, PADDING, PADDING, imgW, imgH, BORDER_RADIUS);
        ctx.fill();
        ctx.fillStyle = "#475569";
        ctx.font = "48px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("📷", PADDING + imgW / 2, PADDING + imgH / 2);
        ctx.textAlign = "start";
      }
    }

    // -- Title box --
    const titleBoxY = PADDING + 620 + 20;
    const titleBoxH = 80;
    const titleBoxW = CANVAS_WIDTH - PADDING * 2;

    ctx.fillStyle = "#1e293b";
    roundRect(ctx, PADDING, titleBoxY, titleBoxW, titleBoxH, 16);
    ctx.fill();

    // Title text
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 30px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "middle";

    // Truncate title if needed
    let titleText = property.title;
    const maxTitleWidth = titleBoxW - 40;
    while (ctx.measureText(titleText).width > maxTitleWidth && titleText.length > 3) {
      titleText = titleText.slice(0, -4) + "...";
    }
    ctx.fillText(titleText, PADDING + 20, titleBoxY + titleBoxH / 2);

    // -- Details box --
    const detailBoxY = titleBoxY + titleBoxH + 16;
    const detailBoxH = 240;
    const detailBoxW = CANVAS_WIDTH - PADDING * 2;

    ctx.fillStyle = "#1e293b";
    roundRect(ctx, PADDING, detailBoxY, detailBoxW, detailBoxH, 16);
    ctx.fill();

    // Price — big
    const priceText = formatPrice(property.price, property.currency);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(priceText, PADDING + 24, detailBoxY + 24);

    // Detail items row
    const detailY = detailBoxY + 90;
    const items: { label: string; value: string }[] = [];

    if (property.city_name) {
      const loc = property.district_name
        ? `${property.district_name}, ${property.city_name}`
        : property.city_name;
      items.push({ label: "📍", value: loc });
    }

    const typeLabel = TYPE_LABELS[property.type] ?? property.type;
    items.push({ label: "🏠", value: typeLabel });

    const roomStr = formatRooms(property.rooms, property.living_rooms);
    if (roomStr) items.push({ label: "🛏️", value: roomStr });

    if (property.area_sqm) items.push({ label: "📐", value: `${property.area_sqm} m²` });

    ctx.font = "26px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.textBaseline = "top";

    let detailX = PADDING + 24;
    for (const item of items) {
      const text = `${item.label} ${item.value}`;
      ctx.fillText(text, detailX, detailY);
      detailX += ctx.measureText(text).width + 32;

      // Wrap to next line if overflow
      if (detailX > CANVAS_WIDTH - PADDING - 24) {
        detailX = PADDING + 24;
      }
    }

    // Nexos branding
    ctx.fillStyle = "#64748b";
    ctx.font = "20px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    ctx.fillText("nexosinvestment.com", CANVAS_WIDTH - PADDING - 24, detailBoxY + detailBoxH - 16);
    ctx.textAlign = "start";

    setGenerating(false);
    setGenerated(true);
  }, [property]);

  // Auto-generate when property changes
  useEffect(() => {
    if (property) {
      setGenerated(false);
      void generateImage();
    }
  }, [property, generateImage]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `nexos-${property?.title?.replace(/\s+/g, "-").toLowerCase() ?? "post"}-instagram.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("Görsel indirildi.");
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <ImageIcon className="size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          Görsel oluşturmak için yukarıdan bir ilan seçin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Instagram Görseli (1080×1080)</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void generateImage()}
            disabled={generating}
          >
            {generating ? "Oluşturuluyor..." : "Yeniden Oluştur"}
          </Button>
          {generated && (
            <Button size="sm" onClick={handleDownload}>
              <Download className="size-3.5" />
              İndir (PNG)
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-muted">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxWidth: 540, aspectRatio: "1/1" }}
        />
      </div>
    </div>
  );
}
