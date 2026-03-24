"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Download, ImageIcon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const W = 1080;
const H = 1350;
const PAD = 48;
const R = 24;
const NEXOS_GOLD = "#E5A800";
const FONT = "Montserrat, system-ui, sans-serif";

const CURRENCY_SYMBOLS: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£" };
const TX_LABELS: Record<string, string> = { sale: "SATILIK", rent: "KİRALIK", daily_rental: "GÜNLÜK KİRALIK" };
const TYPE_LABELS: Record<string, string> = {
  villa: "Villa", apartment: "Daire", twin_villa: "İkiz Villa", penthouse: "Penthouse",
  bungalow: "Bungalow", detached: "Müstakil Ev", residential_land: "Arsa", shop: "Dükkan",
  office: "Ofis", hotel: "Hotel", warehouse: "Depo",
};

// ---------------------------------------------------------------------------
// Design templates
// ---------------------------------------------------------------------------

interface DesignTemplate {
  id: string;
  name: string;
  bg: string;
  cardBg: string;
  cardBg2: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  gradientOverlay: [string, string];
}

const TEMPLATES: DesignTemplate[] = [
  {
    id: "dark-gold",
    name: "Koyu Altın",
    bg: "#0f172a",
    cardBg: "#1e293b",
    cardBg2: "#1e293b",
    accent: NEXOS_GOLD,
    textPrimary: "#f8fafc",
    textSecondary: NEXOS_GOLD,
    textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
  {
    id: "gold-premium",
    name: "Premium Altın",
    bg: "#1a1207",
    cardBg: "#2a1f0e",
    cardBg2: "#2a1f0e",
    accent: NEXOS_GOLD,
    textPrimary: "#fef9e7",
    textSecondary: NEXOS_GOLD,
    textMuted: "#c4a352",
    gradientOverlay: ["rgba(26,18,7,0)", "rgba(26,18,7,0.9)"],
  },
  {
    id: "white-clean",
    name: "Beyaz Minimal",
    bg: "#ffffff",
    cardBg: "#f1f5f9",
    cardBg2: "#f8fafc",
    accent: NEXOS_GOLD,
    textPrimary: "#0f172a",
    textSecondary: "#b8860b",
    textMuted: "#64748b",
    gradientOverlay: ["rgba(255,255,255,0)", "rgba(255,255,255,0.85)"],
  },
  {
    id: "dark-blue",
    name: "Koyu Mavi",
    bg: "#0a1628",
    cardBg: "#0f2240",
    cardBg2: "#0f2240",
    accent: "#3b82f6",
    textPrimary: "#f0f9ff",
    textSecondary: "#60a5fa",
    textMuted: "#7db4f5",
    gradientOverlay: ["rgba(10,22,40,0)", "rgba(10,22,40,0.9)"],
  },
  {
    id: "emerald",
    name: "Yeşil Doğa",
    bg: "#022c22",
    cardBg: "#064e3b",
    cardBg2: "#064e3b",
    accent: "#10b981",
    textPrimary: "#ecfdf5",
    textSecondary: "#34d399",
    textMuted: "#6ee7b7",
    gradientOverlay: ["rgba(2,44,34,0)", "rgba(2,44,34,0.9)"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let fontLoaded = false;
async function ensureMontserrat() {
  if (fontLoaded) return;
  try {
    const weights = [
      { weight: "500", url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXp-p7K4KLg.woff2" },
      { weight: "600", url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu670w5aXp-p7K4KLg.woff2" },
      { weight: "700", url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w5aXp-p7K4KLg.woff2" },
    ];
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
    await Promise.race([
      Promise.all(
        weights.map(async ({ weight, url }) => {
          const font = new FontFace("Montserrat", `url(${url})`, { weight });
          const loaded = await font.load();
          document.fonts.add(loaded);
        })
      ),
      timeout(5000),
    ]);
    fontLoaded = true;
  } catch {
    // Font load failed/timed out — will use system-ui fallback
    fontLoaded = true;
  }
}

function fmtPrice(price: number, currency: string): string {
  const s = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${s}${new Intl.NumberFormat("tr-TR").format(price)}`;
}

function fmtRooms(rooms: number | null, lr: number | null): string | null {
  if (rooms == null) return null;
  return `${rooms}+${lr ?? 1}`;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => reject(new Error("Image load timeout")), 8000);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error("Image load failed")); };
    img.src = src;
  });
}

// White SVG icon paths (simplified)
function drawIcon(ctx: CanvasRenderingContext2D, type: "pin" | "home" | "bed" | "ruler" | "area", x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const s = size;
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r2 = s * 0.35;

  switch (type) {
    case "pin": // Map pin
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, r2, Math.PI, 0);
      ctx.lineTo(cx, cy + s * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, r2 * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = ctx.canvas.getContext("2d")!.fillStyle === color ? "rgba(0,0,0,0.3)" : color;
      ctx.fill();
      break;
    case "home": // House
      ctx.beginPath();
      ctx.moveTo(cx, y + 2);
      ctx.lineTo(x + s - 4, cy);
      ctx.lineTo(x + s - 8, cy);
      ctx.lineTo(x + s - 8, y + s - 4);
      ctx.lineTo(x + 8, y + s - 4);
      ctx.lineTo(x + 8, cy);
      ctx.lineTo(x + 4, cy);
      ctx.closePath();
      ctx.fill();
      break;
    case "bed": // Bed
      ctx.fillRect(x + 2, cy + 2, s - 4, 3);
      ctx.fillRect(x + 4, cy - 4, s * 0.35, 8);
      ctx.fillRect(x + 2, cy + 5, 3, 6);
      ctx.fillRect(x + s - 5, cy + 5, 3, 6);
      break;
    case "ruler": // Area/ruler
      ctx.fillRect(x + 2, cy - 1, s - 4, 3);
      ctx.fillRect(x + 2, cy - 6, 3, 12);
      ctx.fillRect(x + s - 5, cy - 6, 3, 12);
      for (let i = 1; i < 4; i++) {
        const tx = x + 2 + (s - 4) * (i / 4);
        ctx.fillRect(tx, cy - 4, 2, 6);
      }
      break;
    case "area": // Maximize square
      ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);
      break;
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialMediaImageGenerator({ property }: SocialMediaImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [templateId, setTemplateId] = useState("dark-gold");
  const [customTitle, setCustomTitle] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];

  // Sync title/price when property changes
  useEffect(() => {
    if (property) {
      setCustomTitle(property.title);
      setCustomPrice(fmtPrice(property.price, property.currency));
      setCustomDesc("Detaylı bilgi için bize ulaşın.");
    }
  }, [property]);

  const generateImage = useCallback(async () => {
    if (!property || !canvasRef.current) return;
    setGenerating(true);
    try {
    await ensureMontserrat();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = W;
    canvas.height = H;
    const T = template;

    // -- Background --
    ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, W, H);

    const logoH = 70;
    const imgH = 560;
    const txBadgeH = 50;
    const contentStartY = PAD;

    // -- Logo --
    try {
      const logoImg = await loadImg("/logo-trans.png");
      const logoAspect = logoImg.width / logoImg.height;
      const logoW = logoH * logoAspect;
      ctx.drawImage(logoImg, PAD, contentStartY, logoW, logoH);
    } catch {
      ctx.fillStyle = T.accent;
      ctx.font = `bold 42px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.fillText("NEXOS", PAD, contentStartY + logoH / 2);
    }

    // -- Transaction type badge --
    const badgeY = contentStartY + logoH + 20;
    const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
    ctx.font = `bold 26px ${FONT}`;
    const badgeTextW = ctx.measureText(txLabel).width;
    const badgeW = badgeTextW + 36;

    ctx.fillStyle = T.accent;
    rr(ctx, PAD, badgeY, badgeW, txBadgeH, 10);
    ctx.fill();

    ctx.fillStyle = T.bg;
    ctx.textBaseline = "middle";
    ctx.fillText(txLabel, PAD + 18, badgeY + txBadgeH / 2);

    // -- Price beside badge --
    const priceText = customPrice || fmtPrice(property.price, property.currency);
    ctx.fillStyle = T.textSecondary;
    ctx.font = `bold 48px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText(priceText, PAD + badgeW + 24, badgeY + txBadgeH / 2);

    // -- Title --
    const titleY = badgeY + txBadgeH + 24;
    const titleBoxW = W - PAD * 2;

    ctx.fillStyle = T.textPrimary;
    ctx.font = `bold 44px ${FONT}`;
    ctx.textBaseline = "top";

    const titleText = customTitle || property.title;
    const words = titleText.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    const maxLineW = titleBoxW;

    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(test).width > maxLineW) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) lines.push(currentLine);
    if (lines.length > 2) {
      lines.length = 2;
      lines[1] = lines[1].slice(0, -3) + "...";
    }

    const lineHeight = 56;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], PAD, titleY + i * lineHeight);
    }
    const titleEndY = titleY + lines.length * lineHeight;

    // -- Cover image --
    const imgY = titleEndY + 24;
    const imgW = W - PAD * 2;

    if (property.cover_image) {
      try {
        const img = await loadImg(property.cover_image);
        ctx.save();
        rr(ctx, PAD, imgY, imgW, imgH, R);
        ctx.clip();

        const scale = Math.max(imgW / img.width, imgH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, PAD + (imgW - dw) / 2, imgY + (imgH - dh) / 2, dw, dh);

        const grad = ctx.createLinearGradient(PAD, imgY + imgH - 140, PAD, imgY + imgH);
        grad.addColorStop(0, T.gradientOverlay[0]);
        grad.addColorStop(1, T.gradientOverlay[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(PAD, imgY + imgH - 140, imgW, 140);

        ctx.restore();
      } catch {
        ctx.fillStyle = T.cardBg;
        rr(ctx, PAD, imgY, imgW, imgH, R);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = T.cardBg;
      rr(ctx, PAD, imgY, imgW, imgH, R);
      ctx.fill();
    }

    // -- Details section (below image) --
    const detailY = imgY + imgH + 24;
    const detailW = W - PAD * 2;

    // Detail items — horizontal layout with big icons
    const items: { icon: "pin" | "home" | "bed" | "ruler"; text: string }[] = [];

    if (property.city_name) {
      const loc = property.district_name ? `${property.district_name}, ${property.city_name}` : property.city_name;
      items.push({ icon: "pin", text: loc });
    }
    items.push({ icon: "home", text: TYPE_LABELS[property.type] ?? property.type });
    const roomStr = fmtRooms(property.rooms, property.living_rooms);
    if (roomStr) items.push({ icon: "bed", text: `${roomStr} Oda` });
    if (property.area_sqm) items.push({ icon: "ruler", text: `${property.area_sqm} m²` });

    const iconSize = 36;
    const iconCircleR = 28;
    const itemRowH = 60;

    // 2x2 grid layout for items
    ctx.font = `600 30px ${FONT}`;
    ctx.textBaseline = "middle";

    const colW = detailW / 2;
    for (let i = 0; i < items.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ix = PAD + col * colW;
      const iy = detailY + row * itemRowH;

      // Icon circle
      ctx.fillStyle = T.accent + "30";
      ctx.beginPath();
      ctx.arc(ix + iconCircleR, iy + itemRowH / 2, iconCircleR, 0, Math.PI * 2);
      ctx.fill();

      drawIcon(ctx, items[i].icon, ix + iconCircleR - iconSize / 2, iy + (itemRowH - iconSize) / 2, iconSize, T.textPrimary);

      ctx.fillStyle = T.textPrimary;
      ctx.fillText(items[i].text, ix + iconCircleR * 2 + 16, iy + itemRowH / 2);
    }

    const itemRows = Math.ceil(items.length / 2);
    const descY = detailY + itemRows * itemRowH + 16;

    // -- Description text --
    const descText = customDesc || "";
    if (descText) {
      ctx.fillStyle = T.textMuted;
      ctx.font = `500 28px ${FONT}`;
      ctx.textBaseline = "top";

      // Word wrap description
      const descWords = descText.split(" ");
      const descLines: string[] = [];
      let dLine = "";
      for (const w of descWords) {
        const test = dLine ? `${dLine} ${w}` : w;
        if (ctx.measureText(test).width > detailW) {
          if (dLine) descLines.push(dLine);
          dLine = w;
        } else {
          dLine = test;
        }
      }
      if (dLine) descLines.push(dLine);
      if (descLines.length > 2) {
        descLines.length = 2;
        descLines[1] = descLines[1].slice(0, -3) + "...";
      }

      for (let i = 0; i < descLines.length; i++) {
        ctx.fillText(descLines[i], PAD, descY + i * 36);
      }
    }

    // -- Bottom branding --
    const brandY = H - PAD;
    ctx.fillStyle = T.accent;
    ctx.fillRect(PAD, brandY - 40, 50, 4);

    ctx.fillStyle = T.textMuted;
    ctx.font = `600 24px ${FONT}`;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    ctx.fillText("nexosinvestment.com", W - PAD, brandY);
    ctx.textAlign = "start";

    setGenerated(true);
    } catch (err) {
      console.error("Image generation failed:", err);
      toast.error("Görsel oluşturulamadı. Tekrar deneyin.");
    } finally {
      setGenerating(false);
    }
  }, [property, template, customTitle, customPrice, customDesc]);

  // Auto-generate when property or template changes
  useEffect(() => {
    if (property) {
      setGenerated(false);
      void generateImage();
    }
  }, [property, template, generateImage]);

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
        <h3 className="text-sm font-semibold">Instagram Görseli (1080×1350)</h3>
        <div className="flex items-center gap-2">
          {generated && (
            <Button size="sm" onClick={handleDownload}>
              <Download className="size-3.5" />
              İndir (PNG)
            </Button>
          )}
        </div>
      </div>

      {/* Editable fields + template selector */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Başlık</label>
          <Input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="İlan başlığı"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Fiyat</label>
          <Input
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="£285,000"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Açıklama</label>
          <Input
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            placeholder="Detaylı bilgi için bize ulaşın."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Tasarım</label>
          <Select value={templateId} onValueChange={(v) => v && setTemplateId(String(v))}>
            <SelectTrigger className="h-8 text-sm">
              <Palette className="size-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-3 rounded-full border"
                      style={{ backgroundColor: t.accent }}
                    />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void generateImage()}
          disabled={generating}
        >
          {generating ? "Oluşturuluyor..." : "Yeniden Oluştur"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-muted">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxWidth: 480, aspectRatio: "1080/1350" }}
        />
      </div>
    </div>
  );
}
