"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Download, ImageIcon, Palette, RefreshCw, PenSquare, Star, X, ArrowLeft } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";
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

interface StoryGeneratorProps {
  property: {
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
    extra_images: string[];
  } | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SW = 1080; // Story width
const SH = 1920; // Story height
const SPAD = 60; // Story padding
const NEXOS_GOLD = "#ffca3e";
const FONT = "Montserrat, system-ui, sans-serif";

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

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
  office: "Ofis",
  hotel: "Hotel",
  warehouse: "Depo",
};

type StoryTemplateId =
  | "klasik"
  | "vitrin"
  | "galeri"
  | "fiyat"
  | "minimal";

interface StoryTemplate {
  id: StoryTemplateId;
  name: string;
}

const STORY_TEMPLATES: StoryTemplate[] = [
  { id: "klasik", name: "Klasik" },
  { id: "vitrin", name: "Vitrin" },
  { id: "galeri", name: "Galeri" },
  { id: "fiyat", name: "Fiyat Odaklı" },
  { id: "minimal", name: "Minimal" },
];

// ---------------------------------------------------------------------------
// Font loader (shared module-level flag)
// ---------------------------------------------------------------------------

let storyFontLoaded = false;
async function ensureMontserrat(): Promise<void> {
  if (storyFontLoaded) return;
  try {
    const weights = [
      {
        weight: "500",
        url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXp-p7K4KLg.woff2",
      },
      {
        weight: "600",
        url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu670w5aXp-p7K4KLg.woff2",
      },
      {
        weight: "700",
        url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w5aXp-p7K4KLg.woff2",
      },
    ];
    const timeout = (ms: number) =>
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), ms)
      );
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
    storyFontLoaded = true;
  } catch {
    storyFontLoaded = true;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtPrice(price: number, currency: string): string {
  const s = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${s}${new Intl.NumberFormat("tr-TR").format(price)}`;
}

function fmtRooms(rooms: number | null, lr: number | null): string | null {
  if (rooms == null) return null;
  return `${rooms}+${lr ?? 1}`;
}

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
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
    const timer = setTimeout(() => reject(new Error("timeout")), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("fail"));
    };
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -3) + "...";
  }
  return lines;
}

async function drawCoverImg(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fallbackBg: string
): Promise<void> {
  try {
    const img = await loadImg(src);
    ctx.save();
    rr(ctx, x, y, w, h, radius);
    ctx.clip();
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
  } catch {
    ctx.save();
    ctx.fillStyle = fallbackBg;
    rr(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.restore();
  }
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  align: "left" | "right" | "center" = "left"
): Promise<void> {
  try {
    const logoImg = await loadImg("/logo-trans.png");
    const logoW = h * (logoImg.width / logoImg.height);
    const lx =
      align === "right"
        ? x - logoW
        : align === "center"
          ? x - logoW / 2
          : x;
    ctx.drawImage(logoImg, lx, y, logoW, h);
  } catch {
    ctx.save();
    ctx.fillStyle = NEXOS_GOLD;
    ctx.font = `bold ${Math.round(h * 0.5)}px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.textAlign =
      align === "left" ? "left" : align === "right" ? "right" : "center";
    ctx.fillText("NEXOS", x, y + h / 2);
    ctx.textAlign = "start";
    ctx.restore();
  }
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  type: "pin" | "home" | "bed" | "ruler",
  x: number,
  y: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const s = size;
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r2 = s * 0.35;
  switch (type) {
    case "pin":
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, r2, Math.PI, 0);
      ctx.lineTo(cx, cy + s * 0.4);
      ctx.closePath();
      ctx.fill();
      break;
    case "home":
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
    case "bed":
      ctx.fillRect(x + 2, cy + 2, s - 4, 3);
      ctx.fillRect(x + 4, cy - 4, s * 0.35, 8);
      ctx.fillRect(x + 2, cy + 5, 3, 6);
      ctx.fillRect(x + s - 5, cy + 5, 3, 6);
      break;
    case "ruler":
      ctx.fillRect(x + 2, cy - 1, s - 4, 3);
      ctx.fillRect(x + 2, cy - 6, 3, 12);
      ctx.fillRect(x + s - 5, cy - 6, 3, 12);
      for (let i = 1; i < 4; i++) {
        ctx.fillRect(x + 2 + (s - 4) * (i / 4), cy - 4, 2, 6);
      }
      break;
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Shared property type for render functions
// ---------------------------------------------------------------------------

type PropertyData = NonNullable<StoryGeneratorProps["property"]>;

// ---------------------------------------------------------------------------
// Template 1 — "Klasik"
// Full-bleed cover image, strong top+bottom gradient, logo top, badge, title,
// price, location, stats, swipe-up indicator, footer
// ---------------------------------------------------------------------------

async function renderKlasik(
  ctx: CanvasRenderingContext2D,
  property: PropertyData,
  title: string,
  price: string
): Promise<void> {
  // Background
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, 0, 0, SW, SH, 0, "#0f172a");
  } else {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, SW, SH);
  }

  // Top gradient
  const topGrad = ctx.createLinearGradient(0, 0, 0, SH * 0.45);
  topGrad.addColorStop(0, "rgba(0,0,0,0.85)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, SW, SH * 0.45);

  // Bottom gradient
  const botGrad = ctx.createLinearGradient(0, SH * 0.45, 0, SH);
  botGrad.addColorStop(0, "rgba(0,0,0,0)");
  botGrad.addColorStop(0.4, "rgba(0,0,0,0.7)");
  botGrad.addColorStop(1, "rgba(0,0,0,0.95)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, SH * 0.45, SW, SH * 0.55);

  // Logo centered at top
  await drawLogo(ctx, SW / 2, 90, 180, "center");

  // Transaction badge below logo
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  ctx.font = `bold 34px ${FONT}`;
  const badgeTW = ctx.measureText(txLabel).width;
  const badgeW = badgeTW + 56;
  const badgeH = 64;
  const badgeX = (SW - badgeW) / 2;
  const badgeY = 280;
  ctx.fillStyle = NEXOS_GOLD;
  rr(ctx, badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(txLabel, SW / 2, badgeY + badgeH / 2);
  ctx.textAlign = "start";

  // Bottom content block — start from 55% down
  const contentY = SH * 0.58;

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 72px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const titleLines = wrapText(ctx, title, SW - SPAD * 2, 2);
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], SW / 2, contentY + i * 88);
  }
  ctx.textAlign = "start";
  let cy = contentY + titleLines.length * 88 + 24;

  // Price in gold
  ctx.fillStyle = NEXOS_GOLD;
  ctx.font = `bold 88px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(price, SW / 2, cy);
  ctx.textAlign = "start";
  cy += 104;

  // Gold accent line
  ctx.fillStyle = NEXOS_GOLD;
  ctx.fillRect((SW - 200) / 2, cy, 200, 4);
  cy += 32;

  // Location row
  const loc = property.district_name
    ? `${property.district_name}, ${property.city_name}`
    : property.city_name;
  const iconSize = 52;
  const locRowX = (SW - ctx.measureText(loc).width - iconSize - 16) / 2;
  // measure with correct font first
  ctx.font = `600 44px ${FONT}`;
  const locTextW = ctx.measureText(loc).width;
  const locRowXFinal = (SW - locTextW - iconSize - 16) / 2;
  drawIcon(ctx, "pin", locRowXFinal, cy + (iconSize - iconSize) / 2, iconSize, NEXOS_GOLD);
  ctx.fillStyle = "#e2e8f0";
  ctx.textBaseline = "top";
  ctx.fillText(loc, locRowXFinal + iconSize + 16, cy + 4);
  cy += iconSize + 32;

  // Stats row: rooms + area
  const stats: { icon: "bed" | "ruler"; text: string }[] = [];
  const roomStr = fmtRooms(property.rooms, property.living_rooms);
  if (roomStr) stats.push({ icon: "bed", text: `${roomStr} Oda` });
  if (property.area_sqm) stats.push({ icon: "ruler", text: `${property.area_sqm} m²` });

  if (stats.length > 0) {
    const statIconSize = 52;
    const statGap = 80;
    // measure each
    ctx.font = `600 44px ${FONT}`;
    const statWidths = stats.map(
      (s) => statIconSize + 16 + ctx.measureText(s.text).width
    );
    const totalStatW =
      statWidths.reduce((a, b) => a + b, 0) +
      (stats.length - 1) * statGap;
    let sx = (SW - totalStatW) / 2;

    for (let i = 0; i < stats.length; i++) {
      drawIcon(ctx, stats[i].icon, sx, cy, statIconSize, NEXOS_GOLD);
      ctx.fillStyle = "#e2e8f0";
      ctx.textBaseline = "top";
      ctx.fillText(stats[i].text, sx + statIconSize + 16, cy + 4);
      sx += statWidths[i] + statGap;
    }
    cy += statIconSize + 48;
  }

  // Swipe-up chevron indicator
  const chevX = SW / 2;
  const chevY = cy + 20;
  ctx.strokeStyle = NEXOS_GOLD;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(chevX - 40, chevY + 24);
  ctx.lineTo(chevX, chevY);
  ctx.lineTo(chevX + 40, chevY + 24);
  ctx.stroke();
  // second chevron
  ctx.beginPath();
  ctx.moveTo(chevX - 40, chevY + 60);
  ctx.lineTo(chevX, chevY + 36);
  ctx.lineTo(chevX + 40, chevY + 60);
  ctx.stroke();
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  // Footer: phone + website
  const footerY = SH - 100;
  ctx.fillStyle = "#94a3b8";
  ctx.font = `500 32px ${FONT}`;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "center";
  ctx.fillText("+90 548 860 40 30  •  nexosinvestment.com", SW / 2, footerY);
  ctx.textAlign = "start";
}

// ---------------------------------------------------------------------------
// Template 2 — "Vitrin"
// Top 60% image + gradient, bottom 40% solid dark card, gold separator,
// logo top-left, badge top-right, title+price+details in card, contact footer
// ---------------------------------------------------------------------------

async function renderVitrin(
  ctx: CanvasRenderingContext2D,
  property: PropertyData,
  title: string,
  price: string
): Promise<void> {
  const imgH = Math.round(SH * 0.60);
  const cardY = imgH;
  const cardH = SH - cardY;

  // Dark solid card background first (full canvas)
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, SW, SH);

  // Cover image top portion
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, 0, 0, SW, imgH, 0, "#1e293b");
    // Light ambient overlay
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, SW, imgH);
    // Gradient fade into card
    const grad = ctx.createLinearGradient(0, imgH - 300, 0, imgH);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(15,23,42,1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, imgH - 300, SW, 300);
  }

  // 2 extra thumbnails overlapping the image/card boundary
  const extras = property.extra_images ?? [];
  const thumbGap = 16;
  const thumbW = (SW - SPAD * 2 - thumbGap) / 2;
  const thumbH = 300;
  const thumbY = cardY - thumbH / 2;

  if (extras.length > 0) {
    for (let i = 0; i < Math.min(2, extras.length); i++) {
      const tx = SPAD + i * (thumbW + thumbGap);
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#1e293b"; rr(ctx, tx, thumbY, thumbW, thumbH, 20); ctx.fill();
      ctx.restore();
      await drawCoverImg(ctx, extras[i], tx, thumbY, thumbW, thumbH, 20, "#1e293b");
    }
  }

  // Logo top-left on image
  await drawLogo(ctx, SPAD, 70, 160, "left");

  // Transaction badge top-right on image
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  ctx.font = `bold 28px ${FONT}`;
  const badgeTW = ctx.measureText(txLabel).width;
  const badgeW = badgeTW + 44;
  const badgeH = 56;
  ctx.fillStyle = NEXOS_GOLD;
  rr(ctx, SW - SPAD - badgeW, 70, badgeW, badgeH, 14);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillText(txLabel, SW - SPAD - 22, 70 + badgeH / 2);
  ctx.textAlign = "start";

  // Card content
  let cy = cardY + 64;

  // Price
  ctx.fillStyle = NEXOS_GOLD;
  ctx.font = `bold 86px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.fillText(price, SPAD, cy);
  cy += 104;

  // Title
  ctx.fillStyle = "#f8fafc";
  ctx.font = `bold 62px ${FONT}`;
  const titleLines = wrapText(ctx, title, SW - SPAD * 2, 2);
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], SPAD, cy + i * 76);
  }
  cy += titleLines.length * 76 + 36;

  // Gold accent line
  ctx.fillStyle = NEXOS_GOLD;
  ctx.fillRect(SPAD, cy, 100, 5);
  cy += 36;

  // Detail rows
  const details: { icon: "pin" | "home" | "bed" | "ruler"; text: string }[] =
    [];
  const loc = property.district_name
    ? `${property.district_name}, ${property.city_name}`
    : property.city_name;
  if (loc) details.push({ icon: "pin", text: loc });
  details.push({
    icon: "home",
    text: TYPE_LABELS[property.type] ?? property.type,
  });
  const roomStr = fmtRooms(property.rooms, property.living_rooms);
  if (roomStr) details.push({ icon: "bed", text: `${roomStr} Oda` });
  if (property.area_sqm)
    details.push({ icon: "ruler", text: `${property.area_sqm} m²` });

  const icoSize = 48;
  const colW = (SW - SPAD * 2) / 2;
  ctx.font = `600 38px ${FONT}`;
  ctx.textBaseline = "middle";
  for (let i = 0; i < details.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const dx = SPAD + col * colW;
    const dy = cy + row * 72;
    ctx.fillStyle = NEXOS_GOLD + "30";
    ctx.beginPath();
    ctx.arc(dx + 28, dy + icoSize / 2, 28, 0, Math.PI * 2);
    ctx.fill();
    drawIcon(ctx, details[i].icon, dx + 4, dy, icoSize, NEXOS_GOLD);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(details[i].text, dx + icoSize + 20, dy + icoSize / 2);
  }
  cy += Math.ceil(details.length / 2) * 72 + 32;

  // (thumbnails already drawn above the separator)

  // Contact footer
  const footerY = SH - 80;
  ctx.fillStyle = "rgba(255,202,62,0.12)";
  ctx.fillRect(0, footerY - 16, SW, 96);
  ctx.fillStyle = "#94a3b8";
  ctx.font = `500 30px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(
    "+90 548 860 40 30  •  nexosinvestment.com",
    SW / 2,
    footerY + 32
  );
  ctx.textAlign = "start";
}

// ---------------------------------------------------------------------------
// Template 3 — "Galeri"
// 3 stacked images: top 55% main, bottom 45% two side-by-side.
// Overlays on all images. Title+price floating on main. Details strip bottom.
// Logo + branding
// ---------------------------------------------------------------------------

async function renderGaleri(
  ctx: CanvasRenderingContext2D,
  property: PropertyData,
  title: string,
  price: string
): Promise<void> {
  const mainH = Math.round(SH * 0.55);
  const bottomH = SH - mainH;
  const gap = 6;
  const halfW = (SW - gap) / 2;

  // Dark bg for safety
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, SW, SH);

  // Top main image
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, 0, 0, SW, mainH, 0, "#1e293b");
  } else {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, SW, mainH);
  }

  // Bottom left image
  const extra0 = property.extra_images[0] ?? property.cover_image;
  const extra1 = property.extra_images[1] ?? property.cover_image;
  if (extra0) {
    await drawCoverImg(ctx, extra0, 0, mainH + gap, halfW, bottomH - gap, 0, "#1e293b");
  } else {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, mainH + gap, halfW, bottomH - gap);
  }
  // Bottom right image
  if (extra1) {
    await drawCoverImg(
      ctx,
      extra1,
      halfW + gap,
      mainH + gap,
      halfW,
      bottomH - gap,
      0,
      "#1e293b"
    );
  } else {
    ctx.fillStyle = "#262626";
    ctx.fillRect(halfW + gap, mainH + gap, halfW, bottomH - gap);
  }

  // Overlay on all images — lighter tint
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, SW, SH);

  // Heavy gradient on main image bottom (for text legibility)
  const mainGrad = ctx.createLinearGradient(0, mainH * 0.45, 0, mainH);
  mainGrad.addColorStop(0, "rgba(0,0,0,0)");
  mainGrad.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = mainGrad;
  ctx.fillRect(0, mainH * 0.45, SW, mainH * 0.55);

  // Heavy gradient on bottom strip
  const botGrad = ctx.createLinearGradient(0, mainH + gap, 0, SH);
  botGrad.addColorStop(0, "rgba(0,0,0,0)");
  botGrad.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, mainH + gap, SW, bottomH);

  // Logo top-left
  await drawLogo(ctx, SPAD, 60, 150, "left");

  // Transaction badge top-right
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  ctx.font = `bold 28px ${FONT}`;
  const badgeTW = ctx.measureText(txLabel).width;
  const badgeW = badgeTW + 44;
  const badgeH = 56;
  ctx.fillStyle = NEXOS_GOLD;
  rr(ctx, SW - SPAD - badgeW, 60, badgeW, badgeH, 14);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillText(txLabel, SW - SPAD - 22, 60 + badgeH / 2);
  ctx.textAlign = "start";

  // Title floating on main image
  const titleY = mainH - 260;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 68px ${FONT}`;
  ctx.textBaseline = "top";
  const titleLines = wrapText(ctx, title, SW - SPAD * 2, 2);
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], SPAD, titleY + i * 82);
  }

  // Price in gold below title
  const priceY = titleY + titleLines.length * 82 + 16;
  ctx.fillStyle = NEXOS_GOLD;
  ctx.font = `bold 80px ${FONT}`;
  ctx.textBaseline = "top";

  // Price + location/details inline
  const loc = property.district_name
    ? `${property.district_name}, ${property.city_name}`
    : property.city_name;
  const roomStr = fmtRooms(property.rooms, property.living_rooms);
  const detailParts: string[] = [];
  if (loc) detailParts.push(loc);
  if (roomStr) detailParts.push(`${roomStr} Oda`);
  if (property.area_sqm) detailParts.push(`${property.area_sqm} m²`);

  ctx.fillText(price, SPAD, priceY);

  // Details right next to price or below
  const detailY = priceY + 96;
  ctx.font = `600 34px ${FONT}`;
  ctx.fillStyle = "#e2e8f0";
  ctx.textBaseline = "middle";
  if (detailParts.length > 0) {
    const icoSize = 40;
    drawIcon(ctx, "pin", SPAD, detailY - icoSize / 2, icoSize, NEXOS_GOLD);
    ctx.fillText(detailParts.join("  •  "), SPAD + icoSize + 12, detailY);
  }

  // Branding bar very bottom
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, SH - 80, SW, 80);
  ctx.fillStyle = "#94a3b8";
  ctx.font = `500 28px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("nexosinvestment.com", SW / 2, SH - 40);
  ctx.textAlign = "start";
}

// ---------------------------------------------------------------------------
// Template 4 — "Fiyat Odaklı"
// Full background, heavy dark overlay, giant price centered, small title above,
// location below, minimal details, strong CTA "Hemen Ara", logo at top
// ---------------------------------------------------------------------------

async function renderFiyat(
  ctx: CanvasRenderingContext2D,
  property: PropertyData,
  title: string,
  price: string
): Promise<void> {
  // Background image
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, 0, 0, SW, SH, 0, "#0f172a");
  } else {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, SW, SH);
  }

  // Heavy dark overlay
  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(0, 0, SW, SH);

  // Subtle radial light center
  const radGrad = ctx.createRadialGradient(
    SW / 2,
    SH * 0.52,
    0,
    SW / 2,
    SH * 0.52,
    SW * 0.7
  );
  radGrad.addColorStop(0, "rgba(255,202,62,0.07)");
  radGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, SW, SH);

  // Logo top center
  await drawLogo(ctx, SW / 2, 80, 170, "center");

  // Top decorative line
  ctx.fillStyle = NEXOS_GOLD;
  ctx.fillRect((SW - 140) / 2, 236, 140, 4);

  // Transaction label
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  ctx.font = `600 38px ${FONT}`;
  ctx.fillStyle = NEXOS_GOLD + "cc";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.fillText(txLabel, SW / 2, 268);
  ctx.textAlign = "start";

  // Small title above price
  const titleContentY = SH * 0.36;
  ctx.fillStyle = "#94a3b8";
  ctx.font = `600 44px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const titleLines = wrapText(ctx, title, SW - SPAD * 2, 2);
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], SW / 2, titleContentY + i * 56);
  }
  ctx.textAlign = "start";
  const afterTitle = titleContentY + titleLines.length * 56 + 32;

  // Giant price
  ctx.fillStyle = NEXOS_GOLD;
  ctx.font = `bold 120px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.fillText(price, SW / 2, afterTitle);
  ctx.textAlign = "start";
  const afterPrice = afterTitle + 144;

  // Gold accent lines around price
  ctx.fillStyle = NEXOS_GOLD;
  ctx.fillRect(SPAD, afterPrice + 8, SW - SPAD * 2, 3);

  // Location
  const loc = property.district_name
    ? `${property.district_name}, ${property.city_name}`
    : property.city_name;
  ctx.fillStyle = "#e2e8f0";
  ctx.font = `600 46px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.fillText(loc, SW / 2, afterPrice + 40);
  ctx.textAlign = "start";

  // Property type badge
  const typeLabel = TYPE_LABELS[property.type] ?? property.type;
  ctx.font = `500 36px ${FONT}`;
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.fillText(typeLabel, SW / 2, afterPrice + 104);
  ctx.textAlign = "start";

  // CTA button
  const ctaY = SH * 0.78;
  const ctaW = 540;
  const ctaH = 112;
  const ctaX = (SW - ctaW) / 2;
  ctx.save();
  ctx.shadowColor = NEXOS_GOLD + "66";
  ctx.shadowBlur = 32;
  ctx.fillStyle = NEXOS_GOLD;
  rr(ctx, ctaX, ctaY, ctaW, ctaH, 28);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#000000";
  ctx.font = `bold 52px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("Hemen Ara", SW / 2, ctaY + ctaH / 2);
  ctx.textAlign = "start";

  // Phone under CTA
  ctx.fillStyle = "#94a3b8";
  ctx.font = `500 36px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.fillText("+90 548 860 40 30", SW / 2, ctaY + ctaH + 28);
  ctx.textAlign = "start";

  // Website footer
  const footerY = SH - 80;
  ctx.fillStyle = "#475569";
  ctx.font = `500 28px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("nexosinvestment.com", SW / 2, footerY);
  ctx.textAlign = "start";
}

// ---------------------------------------------------------------------------
// Template 5 — "Minimal"
// Dark solid background, clean typography, optional small circular image,
// large title, price in gold, icon+text detail rows, centered logo
// ---------------------------------------------------------------------------

async function renderMinimal(
  ctx: CanvasRenderingContext2D,
  property: PropertyData,
  title: string,
  price: string
): Promise<void> {
  // Background: cover image with heavy dark overlay
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, 0, 0, SW, SH, 0, "#0d1117");
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, SW, SH);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, SW, SH);
    bgGrad.addColorStop(0, "#0d1117");
    bgGrad.addColorStop(1, "#161b22");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, SW, SH);
  }

  // 3 circular property images in a row
  const allImgs = [property.cover_image, ...(property.extra_images ?? [])].filter(Boolean) as string[];
  const circCount = Math.min(allImgs.length, 3);
  if (circCount > 0) {
    const circR = 130;
    const circGap = 40;
    const totalW = circCount * circR * 2 + (circCount - 1) * circGap;
    const startX = (SW - totalW) / 2 + circR;
    const circY = 340;

    for (let i = 0; i < circCount; i++) {
      const cx = startX + i * (circR * 2 + circGap);
      // Shadow
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
      ctx.fillStyle = "#1e293b";
      ctx.beginPath(); ctx.arc(cx, circY, circR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // Image in circle
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, circY, circR, 0, Math.PI * 2); ctx.clip();
      try {
        const img = await loadImg(allImgs[i]);
        const scale = Math.max((circR * 2) / img.width, (circR * 2) / img.height);
        const dw = img.width * scale; const dh = img.height * scale;
        ctx.drawImage(img, cx - dw / 2, circY - dh / 2, dw, dh);
      } catch { /* fallback already drawn */ }
      ctx.restore();
      // Gold ring
      ctx.strokeStyle = NEXOS_GOLD;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, circY, circR + 4, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // Logo centered at top
  await drawLogo(ctx, SW / 2, 80, 160, "center");

  // Transaction badge below logo
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  ctx.font = `700 32px ${FONT}`;
  ctx.fillStyle = NEXOS_GOLD;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.fillText(txLabel, SW / 2, 250);

  // Main content starts below circles
  const contentY = circCount > 0 ? 520 : Math.round(SH * 0.35);

  // Thin gold line
  ctx.fillStyle = NEXOS_GOLD + "60";
  ctx.fillRect(SPAD, contentY - 24, SW - SPAD * 2, 2);

  // Large title
  ctx.fillStyle = "#f1f5f9";
  ctx.font = `bold 76px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const titleLines = wrapText(ctx, title, SW - SPAD * 2, 3);
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], SPAD, contentY + i * 90);
  }
  let cy = contentY + titleLines.length * 90 + 32;

  // Price in gold
  ctx.fillStyle = NEXOS_GOLD;
  ctx.font = `bold 96px ${FONT}`;
  ctx.fillText(price, SPAD, cy);
  cy += 116;

  // Gold separator
  ctx.fillStyle = NEXOS_GOLD;
  ctx.fillRect(SPAD, cy, 80, 5);
  cy += 36;

  // Detail rows: icon + text
  const details: { icon: "pin" | "home" | "bed" | "ruler"; label: string }[] =
    [];
  const loc = property.district_name
    ? `${property.district_name}, ${property.city_name}`
    : property.city_name;
  if (loc) details.push({ icon: "pin", label: loc });
  details.push({
    icon: "home",
    label: TYPE_LABELS[property.type] ?? property.type,
  });
  const roomStr = fmtRooms(property.rooms, property.living_rooms);
  if (roomStr) details.push({ icon: "bed", label: `${roomStr} Oda` });
  if (property.area_sqm)
    details.push({ icon: "ruler", label: `${property.area_sqm} m²` });

  const rowH = 80;
  const icoSize = 44;
  for (let i = 0; i < details.length; i++) {
    const dy = cy + i * rowH;
    // Icon background pill
    ctx.fillStyle = NEXOS_GOLD + "22";
    rr(ctx, SPAD, dy + (rowH - icoSize) / 2, icoSize, icoSize, 12);
    ctx.fill();
    drawIcon(
      ctx,
      details[i].icon,
      SPAD,
      dy + (rowH - icoSize) / 2,
      icoSize,
      NEXOS_GOLD
    );
    ctx.fillStyle = "#cbd5e1";
    ctx.font = `600 40px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText(details[i].label, SPAD + icoSize + 24, dy + rowH / 2);
    // Subtle separator
    if (i < details.length - 1) {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(SPAD, dy + rowH - 1, SW - SPAD * 2, 1);
    }
  }
  cy += details.length * rowH + 40;

  // Bottom accent line
  ctx.fillStyle = NEXOS_GOLD + "40";
  ctx.fillRect(SPAD, SH - 120, SW - SPAD * 2, 2);

  // Footer
  ctx.fillStyle = "#475569";
  ctx.font = `500 28px ${FONT}`;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "center";
  ctx.fillText(
    "+90 548 860 40 30  •  nexosinvestment.com",
    SW / 2,
    SH - 70
  );
  ctx.textAlign = "start";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoryGenerator({ property }: StoryGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [templateId, setTemplateId] = useState<StoryTemplateId>("klasik");
  const [customTitle, setCustomTitle] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number>(0);

  // Sync fields when property changes
  useEffect(() => {
    if (property) {
      setCustomTitle(property.title);
      setCustomPrice(fmtPrice(property.price, property.currency));
      setCustomImages([
        property.cover_image ?? "",
        ...(property.extra_images ?? []),
      ].filter(Boolean));
    }
  }, [property]);

  const generateStory = useCallback(async () => {
    if (!property || !canvasRef.current) return;
    setGenerating(true);
    try {
      await ensureMontserrat();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = SW;
      canvas.height = SH;

      const title = customTitle || property.title;
      const price = customPrice || fmtPrice(property.price, property.currency);

      // Override property images with custom selections
      const propWithCustomImages: PropertyData = {
        ...property,
        cover_image: customImages[0] ?? property.cover_image,
        extra_images: customImages.length > 1 ? customImages.slice(1) : property.extra_images,
      };

      switch (templateId) {
        case "klasik":
          await renderKlasik(ctx, propWithCustomImages, title, price);
          break;
        case "vitrin":
          await renderVitrin(ctx, propWithCustomImages, title, price);
          break;
        case "galeri":
          await renderGaleri(ctx, propWithCustomImages, title, price);
          break;
        case "fiyat":
          await renderFiyat(ctx, propWithCustomImages, title, price);
          break;
        case "minimal":
          await renderMinimal(ctx, propWithCustomImages, title, price);
          break;
      }

      setGenerated(true);
    } catch (err) {
      console.error("Story generation failed:", err);
      toast.error("Story oluşturulamadı. Tekrar deneyin.");
    } finally {
      setGenerating(false);
    }
  }, [property, templateId, customTitle, customPrice, customImages]);

  // Auto-generate when property or template changes
  useEffect(() => {
    if (property) {
      setGenerated(false);
      void generateStory();
    }
  }, [property, templateId, generateStory]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    const slug =
      property?.title?.replace(/\s+/g, "-").toLowerCase() ?? "story";
    link.download = `nexos-story-${slug}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("Story görseli indirildi.");
  }

  if (!property) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
        <ImageIcon className="size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          Story görseli oluşturmak için yukarıdan bir ilan seçin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Instagram Story (1080×1920)
        </h3>
        {generated && (
          <Button size="sm" onClick={handleDownload} className="gap-1.5">
            <Download className="size-3.5" />
            İndir (PNG)
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Başlık
          </label>
          <Input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="İlan başlığı"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Fiyat
          </label>
          <Input
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="£285,000"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Şablon
          </label>
          <Select
            value={templateId}
            onValueChange={(v) => {
              if (v) setTemplateId(v as StoryTemplateId);
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <Palette className="mr-1.5 size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STORY_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image editor */}
      {customImages.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Görseller — ilk görsel ana görsel olur (tıkla: değiştir, yıldız: öne al)</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {customImages.map((img, i) => (
              <div key={i} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditingImageIndex(i); setMediaPickerOpen(true); }}
                  className={`group relative size-16 overflow-hidden rounded-lg border-2 transition-all hover:ring-2 hover:ring-primary ${i === 0 ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img} alt={`Görsel ${i + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                    <PenSquare className="size-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  {i === 0 && <span className="absolute left-0.5 top-0.5 rounded bg-primary px-1 text-[8px] font-bold text-primary-foreground">ANA</span>}
                </button>
                {/* Make cover + remove buttons */}
                <div className="mt-0.5 flex justify-center gap-0.5">
                  {i !== 0 && (
                    <button
                      type="button"
                      title="Ana görsel yap"
                      onClick={() => setCustomImages((prev) => {
                        const next = [...prev];
                        const [moved] = next.splice(i, 1);
                        next.unshift(moved);
                        return next;
                      })}
                      className="rounded p-0.5 text-muted-foreground hover:text-primary"
                    >
                      <Star className="size-3" />
                    </button>
                  )}
                  {customImages.length > 1 && (
                    <button
                      type="button"
                      title="Görseli kaldır"
                      onClick={() => setCustomImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => { setEditingImageIndex(customImages.length); setMediaPickerOpen(true); }}
              className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ImageIcon className="size-5" />
            </button>
          </div>
        </div>
      )}

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          setCustomImages((prev) => {
            const next = [...prev];
            if (editingImageIndex < next.length) {
              next[editingImageIndex] = url;
            } else {
              next.push(url);
            }
            return next;
          });
        }}
        currentUrl={customImages[editingImageIndex] ?? ""}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => void generateStory()}
        disabled={generating}
        className="gap-1.5"
      >
        <RefreshCw className={`size-3.5 ${generating ? "animate-spin" : ""}`} />
        {generating ? "Oluşturuluyor..." : "Yeniden Oluştur"}
      </Button>

      {/* Canvas preview — phone-sized 9:16 aspect ratio, max 320px wide */}
      <div className="flex justify-center">
        <div
          className="overflow-hidden rounded-2xl border-2 border-border bg-black shadow-lg"
          style={{ width: "100%", maxWidth: 320 }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: "100%", aspectRatio: "9/16", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
