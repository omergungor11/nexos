"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Download, ImageIcon, Palette } from "lucide-react";
import { SocialMediaPreview } from "@/components/admin/social-media-preview";
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
  extra_images: string[];
}

interface SocialMediaImageGeneratorProps {
  property: PropertyForImage | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const W = 1080;
const H = 1350;
const PAD = 80;
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
// Layout types
// ---------------------------------------------------------------------------

type LayoutType = "classic" | "fullimage" | "split" | "showcase";

interface DesignTemplate {
  id: string;
  name: string;
  layout: LayoutType;
  bg: string;
  cardBg: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  gradientOverlay: [string, string];
}

const TEMPLATES: DesignTemplate[] = [
  // Classic layouts
  {
    id: "classic-gold", name: "Klasik Altın", layout: "classic",
    bg: "#0f172a", cardBg: "#1e293b", accent: NEXOS_GOLD,
    textPrimary: "#f8fafc", textSecondary: NEXOS_GOLD, textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
  {
    id: "classic-white", name: "Klasik Beyaz", layout: "classic",
    bg: "#ffffff", cardBg: "#f1f5f9", accent: NEXOS_GOLD,
    textPrimary: "#0f172a", textSecondary: "#b8860b", textMuted: "#64748b",
    gradientOverlay: ["rgba(255,255,255,0)", "rgba(255,255,255,0.85)"],
  },
  // Full image overlay
  {
    id: "fullimage-dark", name: "Tam Görsel Koyu", layout: "fullimage",
    bg: "#000000", cardBg: "rgba(0,0,0,0.6)", accent: NEXOS_GOLD,
    textPrimary: "#ffffff", textSecondary: NEXOS_GOLD, textMuted: "#d1d5db",
    gradientOverlay: ["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"],
  },
  {
    id: "fullimage-gold", name: "Tam Görsel Altın", layout: "fullimage",
    bg: "#000000", cardBg: "rgba(26,18,7,0.7)", accent: NEXOS_GOLD,
    textPrimary: "#fef9e7", textSecondary: NEXOS_GOLD, textMuted: "#c4a352",
    gradientOverlay: ["rgba(0,0,0,0)", "rgba(26,18,7,0.9)"],
  },
  // Split layout
  {
    id: "split-blue", name: "Bölünmüş Mavi", layout: "split",
    bg: "#0a1628", cardBg: "#0f2240", accent: "#3b82f6",
    textPrimary: "#f0f9ff", textSecondary: "#60a5fa", textMuted: "#7db4f5",
    gradientOverlay: ["rgba(10,22,40,0)", "rgba(10,22,40,0.9)"],
  },
  {
    id: "split-emerald", name: "Bölünmüş Yeşil", layout: "split",
    bg: "#022c22", cardBg: "#064e3b", accent: "#10b981",
    textPrimary: "#ecfdf5", textSecondary: "#34d399", textMuted: "#6ee7b7",
    gradientOverlay: ["rgba(2,44,34,0)", "rgba(2,44,34,0.9)"],
  },
  // Showcase
  {
    id: "showcase-premium", name: "Vitrin Premium", layout: "showcase",
    bg: "#1a1207", cardBg: "#2a1f0e", accent: NEXOS_GOLD,
    textPrimary: "#fef9e7", textSecondary: NEXOS_GOLD, textMuted: "#c4a352",
    gradientOverlay: ["rgba(26,18,7,0)", "rgba(26,18,7,0.9)"],
  },
  {
    id: "showcase-dark", name: "Vitrin Koyu", layout: "showcase",
    bg: "#0f172a", cardBg: "#1e293b", accent: NEXOS_GOLD,
    textPrimary: "#f8fafc", textSecondary: NEXOS_GOLD, textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
];

const LAYOUT_LABELS: Record<LayoutType, string> = {
  classic: "Klasik",
  fullimage: "Tam Görsel",
  split: "Bölünmüş",
  showcase: "Vitrin",
};

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
      Promise.all(weights.map(async ({ weight, url }) => {
        const font = new FontFace("Montserrat", `url(${url})`, { weight });
        const loaded = await font.load();
        document.fonts.add(loaded);
      })),
      timeout(5000),
    ]);
    fontLoaded = true;
  } catch { fontLoaded = true; }
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
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => reject(new Error("timeout")), 8000);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error("fail")); };
    img.src = src;
  });
}

function drawIcon(ctx: CanvasRenderingContext2D, type: "pin" | "home" | "bed" | "ruler", x: number, y: number, size: number, color: string) {
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
  const s = size; const cx = x + s / 2; const cy = y + s / 2; const r2 = s * 0.35;
  switch (type) {
    case "pin":
      ctx.beginPath(); ctx.arc(cx, cy - s * 0.1, r2, Math.PI, 0);
      ctx.lineTo(cx, cy + s * 0.4); ctx.closePath(); ctx.fill(); break;
    case "home":
      ctx.beginPath(); ctx.moveTo(cx, y + 2); ctx.lineTo(x + s - 4, cy);
      ctx.lineTo(x + s - 8, cy); ctx.lineTo(x + s - 8, y + s - 4);
      ctx.lineTo(x + 8, y + s - 4); ctx.lineTo(x + 8, cy);
      ctx.lineTo(x + 4, cy); ctx.closePath(); ctx.fill(); break;
    case "bed":
      ctx.fillRect(x + 2, cy + 2, s - 4, 3); ctx.fillRect(x + 4, cy - 4, s * 0.35, 8);
      ctx.fillRect(x + 2, cy + 5, 3, 6); ctx.fillRect(x + s - 5, cy + 5, 3, 6); break;
    case "ruler":
      ctx.fillRect(x + 2, cy - 1, s - 4, 3); ctx.fillRect(x + 2, cy - 6, 3, 12);
      ctx.fillRect(x + s - 5, cy - 6, 3, 12);
      for (let i = 1; i < 4; i++) { ctx.fillRect(x + 2 + (s - 4) * (i / 4), cy - 4, 2, 6); } break;
  }
  ctx.restore();
}

// Word wrap helper
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW) { if (cur) lines.push(cur); cur = w; } else { cur = test; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].slice(0, -3) + "..."; }
  return lines;
}

// Draw image into rounded rect
async function drawCoverImg(ctx: CanvasRenderingContext2D, src: string, x: number, y: number, w: number, h: number, radius: number, fallbackBg: string) {
  try {
    const img = await loadImg(src);
    ctx.save(); rr(ctx, x, y, w, h, radius); ctx.clip();
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale; const dh = img.height * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
  } catch {
    ctx.fillStyle = fallbackBg; rr(ctx, x, y, w, h, radius); ctx.fill();
  }
}

// Draw logo
async function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, accent: string, align: "left" | "right" = "left") {
  try {
    const logoImg = await loadImg("/logo-trans.png");
    const logoW = h * (logoImg.width / logoImg.height);
    const lx = align === "right" ? x - logoW : x;
    ctx.drawImage(logoImg, lx, y, logoW, h);
  } catch {
    ctx.fillStyle = accent;
    ctx.font = `bold ${Math.round(h * 0.5)}px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = align === "right" ? "right" : "left";
    ctx.fillText("NEXOS", align === "right" ? x : x, y + h / 2);
    ctx.textAlign = "start";
  }
}

// Draw badge
function drawBadge(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, accent: string, bg: string) {
  ctx.font = `bold 24px ${FONT}`;
  const tw = ctx.measureText(label).width;
  const bw = tw + 36; const bh = 50;
  ctx.fillStyle = accent; rr(ctx, x, y, bw, bh, 10); ctx.fill();
  ctx.fillStyle = bg; ctx.textBaseline = "middle"; ctx.fillText(label, x + 18, y + bh / 2);
  return { w: bw, h: bh };
}

// Draw detail items
function drawDetails(ctx: CanvasRenderingContext2D, property: PropertyForImage, x: number, y: number, w: number, T: DesignTemplate) {
  const items: { icon: "pin" | "home" | "bed" | "ruler"; text: string }[] = [];
  if (property.city_name) {
    const loc = property.district_name ? `${property.district_name}, ${property.city_name}` : property.city_name;
    items.push({ icon: "pin", text: loc });
  }
  items.push({ icon: "home", text: TYPE_LABELS[property.type] ?? property.type });
  const roomStr = fmtRooms(property.rooms, property.living_rooms);
  if (roomStr) items.push({ icon: "bed", text: `${roomStr} Oda` });
  if (property.area_sqm) items.push({ icon: "ruler", text: `${property.area_sqm} m²` });

  const iconSize = 44; const circleR = 36; const rowH = 84;
  ctx.font = `600 32px ${FONT}`; ctx.textBaseline = "middle";
  const colW = w / 2;

  for (let i = 0; i < items.length; i++) {
    const col = i % 2; const row = Math.floor(i / 2);
    const ix = x + col * colW; const iy = y + row * rowH;
    ctx.fillStyle = T.accent + "30"; ctx.beginPath();
    ctx.arc(ix + circleR, iy + rowH / 2, circleR, 0, Math.PI * 2); ctx.fill();
    drawIcon(ctx, items[i].icon, ix + circleR - iconSize / 2, iy + (rowH - iconSize) / 2, iconSize, T.textPrimary);
    ctx.fillStyle = T.textPrimary; ctx.fillText(items[i].text, ix + circleR * 2 + 16, iy + rowH / 2);
  }
  return Math.ceil(items.length / 2) * rowH;
}

// Draw footer
function drawFooter(ctx: CanvasRenderingContext2D, T: DesignTemplate) {
  const brandY = H - 60;
  ctx.fillStyle = T.accent; ctx.fillRect(PAD, brandY - 40, 50, 4);
  ctx.fillStyle = T.textMuted; ctx.font = `600 24px ${FONT}`; ctx.textBaseline = "bottom";
  ctx.fillText("+90 542 880 64 56", PAD, brandY);
  ctx.textAlign = "right"; ctx.fillText("nexosinvestment.com", W - PAD, brandY);
  ctx.textAlign = "start";
}

// ---------------------------------------------------------------------------
// Layout renderers
// ---------------------------------------------------------------------------

async function renderClassic(ctx: CanvasRenderingContext2D, T: DesignTemplate, property: PropertyForImage, title: string, price: string, desc: string) {
  ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
  const startY = 135 + 36;

  // Badge
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  drawBadge(ctx, txLabel, PAD, startY, T.accent, T.bg);

  // Price
  const priceY = startY + 50 + 14;
  ctx.fillStyle = T.textSecondary; ctx.font = `bold 56px ${FONT}`; ctx.textBaseline = "top";
  ctx.fillText(price, PAD, priceY);

  // Title
  const titleY = priceY + 68;
  ctx.fillStyle = T.textPrimary; ctx.font = `bold 42px ${FONT}`; ctx.textBaseline = "top";
  const lines = wrapText(ctx, title, W - PAD * 2 - 200, 2);
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], PAD, titleY + i * 54);
  const titleEndY = titleY + lines.length * 54;

  // Logo (right aligned with header)
  await drawLogo(ctx, W - PAD, startY, 140, T.accent, "right");

  // Images
  const imgY = titleEndY + 20; const imgH = 530; const totalW = W - PAD * 2; const gap = 12;
  const hasExtras = property.extra_images?.length > 0;
  const mainW = hasExtras ? Math.round(totalW * 0.65) : totalW;

  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, PAD, imgY, mainW, imgH, R, T.cardBg);
    ctx.save(); rr(ctx, PAD, imgY, mainW, imgH, R); ctx.clip();
    const grad = ctx.createLinearGradient(PAD, imgY + imgH - 140, PAD, imgY + imgH);
    grad.addColorStop(0, T.gradientOverlay[0]); grad.addColorStop(1, T.gradientOverlay[1]);
    ctx.fillStyle = grad; ctx.fillRect(PAD, imgY + imgH - 140, mainW, 140); ctx.restore();
  }

  if (hasExtras) {
    const sideX = PAD + mainW + gap; const sideW = totalW - mainW - gap; const sideH = (imgH - gap) / 2;
    if (property.extra_images[0]) await drawCoverImg(ctx, property.extra_images[0], sideX, imgY, sideW, sideH, 16, T.cardBg);
    if (property.extra_images[1]) await drawCoverImg(ctx, property.extra_images[1], sideX, imgY + sideH + gap, sideW, sideH, 16, T.cardBg);
  }

  // Details
  const detailY = imgY + imgH + 24;
  const detailH = drawDetails(ctx, property, PAD, detailY, totalW, T);

  // Description
  if (desc) {
    const descY = detailY + detailH + 16;
    ctx.fillStyle = T.textMuted; ctx.font = `600 34px ${FONT}`; ctx.textBaseline = "top";
    const dl = wrapText(ctx, desc, totalW, 2);
    for (let i = 0; i < dl.length; i++) ctx.fillText(dl[i], PAD, descY + i * 44);
  }

  drawFooter(ctx, T);
}

async function renderFullImage(ctx: CanvasRenderingContext2D, T: DesignTemplate, property: PropertyForImage, title: string, price: string, desc: string) {
  // Full background image
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, 0, 0, W, H, 0, T.bg);
  } else {
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
  }

  // Dark overlay gradient from bottom
  const grad = ctx.createLinearGradient(0, H * 0.3, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.4, "rgba(0,0,0,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  // Top: logo + badge
  await drawLogo(ctx, PAD, PAD + 40, 100, T.accent, "left");
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  ctx.font = `bold 24px ${FONT}`;
  const tw = ctx.measureText(txLabel).width;
  ctx.fillStyle = T.accent; rr(ctx, W - PAD - tw - 36, PAD + 50, tw + 36, 50, 10); ctx.fill();
  ctx.fillStyle = "#000"; ctx.textBaseline = "middle"; ctx.fillText(txLabel, W - PAD - tw - 18, PAD + 75);

  // Bottom content
  const bottomY = H - 420;

  // Price
  ctx.fillStyle = T.textSecondary; ctx.font = `bold 64px ${FONT}`; ctx.textBaseline = "top";
  ctx.fillText(price, PAD, bottomY);

  // Title
  ctx.fillStyle = T.textPrimary; ctx.font = `bold 46px ${FONT}`;
  const lines = wrapText(ctx, title, W - PAD * 2, 2);
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], PAD, bottomY + 80 + i * 58);

  // Details in a row
  const items: string[] = [];
  if (property.city_name) items.push(`📍 ${property.district_name ? property.district_name + ", " : ""}${property.city_name}`);
  const roomStr = fmtRooms(property.rooms, property.living_rooms);
  if (roomStr) items.push(`🛏️ ${roomStr}`);
  if (property.area_sqm) items.push(`📐 ${property.area_sqm} m²`);

  ctx.fillStyle = T.textMuted; ctx.font = `500 30px ${FONT}`;
  const detailText = items.join("   •   ");
  ctx.fillText(detailText, PAD, bottomY + 80 + lines.length * 58 + 20);

  // Description
  if (desc) {
    ctx.fillStyle = T.textMuted; ctx.font = `600 32px ${FONT}`;
    ctx.fillText(desc, PAD, bottomY + 80 + lines.length * 58 + 70);
  }

  drawFooter(ctx, T);
}

async function renderSplit(ctx: CanvasRenderingContext2D, T: DesignTemplate, property: PropertyForImage, title: string, price: string, desc: string) {
  ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);

  // Left half: image
  const imgW = W * 0.5 - PAD / 2;
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, PAD, PAD + 135, imgW - PAD, H - PAD * 2 - 135 - 80, R, T.cardBg);
  }

  // Right half: content
  const rx = W * 0.5 + PAD / 2;
  const rw = W - rx - PAD;
  let cy = PAD + 160;

  // Logo
  await drawLogo(ctx, rx, cy, 80, T.accent, "left");
  cy += 100;

  // Badge
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  drawBadge(ctx, txLabel, rx, cy, T.accent, T.bg);
  cy += 70;

  // Price
  ctx.fillStyle = T.textSecondary; ctx.font = `bold 52px ${FONT}`; ctx.textBaseline = "top";
  ctx.fillText(price, rx, cy);
  cy += 70;

  // Title
  ctx.fillStyle = T.textPrimary; ctx.font = `bold 38px ${FONT}`; ctx.textBaseline = "top";
  const lines = wrapText(ctx, title, rw, 3);
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], rx, cy + i * 48);
  cy += lines.length * 48 + 30;

  // Accent line
  ctx.fillStyle = T.accent; ctx.fillRect(rx, cy, 60, 4); cy += 30;

  // Details vertical
  const items: { icon: "pin" | "home" | "bed" | "ruler"; text: string }[] = [];
  if (property.city_name) {
    const loc = property.district_name ? `${property.district_name}, ${property.city_name}` : property.city_name;
    items.push({ icon: "pin", text: loc });
  }
  items.push({ icon: "home", text: TYPE_LABELS[property.type] ?? property.type });
  const roomStr = fmtRooms(property.rooms, property.living_rooms);
  if (roomStr) items.push({ icon: "bed", text: `${roomStr} Oda` });
  if (property.area_sqm) items.push({ icon: "ruler", text: `${property.area_sqm} m²` });

  ctx.font = `600 28px ${FONT}`; ctx.textBaseline = "middle";
  for (const item of items) {
    ctx.fillStyle = T.accent + "30"; ctx.beginPath();
    ctx.arc(rx + 24, cy + 24, 24, 0, Math.PI * 2); ctx.fill();
    drawIcon(ctx, item.icon, rx + 8, cy + 8, 32, T.textPrimary);
    ctx.fillStyle = T.textPrimary; ctx.fillText(item.text, rx + 60, cy + 24);
    cy += 60;
  }

  // Description
  if (desc) {
    cy += 16;
    ctx.fillStyle = T.textMuted; ctx.font = `500 26px ${FONT}`; ctx.textBaseline = "top";
    const dl = wrapText(ctx, desc, rw, 2);
    for (let i = 0; i < dl.length; i++) ctx.fillText(dl[i], rx, cy + i * 34);
  }

  drawFooter(ctx, T);
}

async function renderShowcase(ctx: CanvasRenderingContext2D, T: DesignTemplate, property: PropertyForImage, title: string, price: string, desc: string) {
  ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);

  // Top: full width image
  const imgH = 700;
  if (property.cover_image) {
    await drawCoverImg(ctx, property.cover_image, 0, 0, W, imgH, 0, T.cardBg);
    // Bottom gradient
    const grad = ctx.createLinearGradient(0, imgH - 200, 0, imgH);
    grad.addColorStop(0, T.gradientOverlay[0]); grad.addColorStop(1, T.gradientOverlay[1]);
    ctx.fillStyle = grad; ctx.fillRect(0, imgH - 200, W, 200);
  }

  // Logo on image (top left)
  await drawLogo(ctx, PAD, PAD, 70, T.accent, "left");

  // Badge on image (top right)
  const txLabel = TX_LABELS[property.transaction_type] ?? "SATILIK";
  ctx.font = `bold 24px ${FONT}`;
  const tw = ctx.measureText(txLabel).width;
  ctx.fillStyle = T.accent; rr(ctx, W - PAD - tw - 36, PAD, tw + 36, 50, 10); ctx.fill();
  ctx.fillStyle = T.bg; ctx.textBaseline = "middle"; ctx.fillText(txLabel, W - PAD - tw - 18, PAD + 25);

  // Content card below image
  const cardY = imgH - 40;
  const cardH = H - cardY - 20;
  ctx.fillStyle = T.cardBg; rr(ctx, PAD - 20, cardY, W - PAD * 2 + 40, cardH, R); ctx.fill();

  // Accent top border
  ctx.fillStyle = T.accent; rr(ctx, PAD - 20, cardY, W - PAD * 2 + 40, 5, 2); ctx.fill();

  let cy = cardY + 40;

  // Price
  ctx.fillStyle = T.textSecondary; ctx.font = `bold 58px ${FONT}`; ctx.textBaseline = "top";
  ctx.fillText(price, PAD + 10, cy);
  cy += 76;

  // Title
  ctx.fillStyle = T.textPrimary; ctx.font = `bold 40px ${FONT}`;
  const lines = wrapText(ctx, title, W - PAD * 2 - 20, 2);
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], PAD + 10, cy + i * 52);
  cy += lines.length * 52 + 24;

  // Accent line
  ctx.fillStyle = T.accent; ctx.fillRect(PAD + 10, cy, 60, 4); cy += 28;

  // Details
  const detailH = drawDetails(ctx, property, PAD + 10, cy, W - PAD * 2 - 20, T);
  cy += detailH;

  // Description
  if (desc) {
    cy += 12;
    ctx.fillStyle = T.textMuted; ctx.font = `600 32px ${FONT}`; ctx.textBaseline = "top";
    const dl = wrapText(ctx, desc, W - PAD * 2 - 20, 2);
    for (let i = 0; i < dl.length; i++) ctx.fillText(dl[i], PAD + 10, cy + i * 42);
  }

  drawFooter(ctx, T);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialMediaImageGenerator({ property }: SocialMediaImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [templateId, setTemplateId] = useState("classic-gold");
  const [customTitle, setCustomTitle] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];

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
      canvas.width = W; canvas.height = H;

      const T = template;
      const title = customTitle || property.title;
      const price = customPrice || fmtPrice(property.price, property.currency);
      const desc = customDesc || "";

      switch (T.layout) {
        case "classic": await renderClassic(ctx, T, property, title, price, desc); break;
        case "fullimage": await renderFullImage(ctx, T, property, title, price, desc); break;
        case "split": await renderSplit(ctx, T, property, title, price, desc); break;
        case "showcase": await renderShowcase(ctx, T, property, title, price, desc); break;
      }

      setGenerated(true);
    } catch (err) {
      console.error("Image generation failed:", err);
      toast.error("Görsel oluşturulamadı. Tekrar deneyin.");
    } finally {
      setGenerating(false);
    }
  }, [property, template, customTitle, customPrice, customDesc]);

  useEffect(() => {
    if (property) { setGenerated(false); void generateImage(); }
  }, [property, template, generateImage]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `nexos-${property?.title?.replace(/\s+/g, "-").toLowerCase() ?? "post"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("Görsel indirildi.");
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <ImageIcon className="size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">Görsel oluşturmak için yukarıdan bir ilan seçin</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Sosyal Medya Görseli (1080×1350)</h3>
        {generated && (
          <Button size="sm" onClick={handleDownload}>
            <Download className="size-3.5" />
            İndir (PNG)
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Başlık</label>
          <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="İlan başlığı" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Fiyat</label>
          <Input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="£285,000" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Açıklama</label>
          <Input value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} placeholder="Detaylı bilgi için bize ulaşın." className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Tasarım</label>
          <Select value={templateId} onValueChange={(v) => v && setTemplateId(String(v))}>
            <SelectTrigger className="h-8 text-sm">
              <Palette className="size-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["classic", "fullimage", "split", "showcase"] as LayoutType[]).map((layout) => (
                <div key={layout}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{LAYOUT_LABELS[layout]}</div>
                  {TEMPLATES.filter((t) => t.layout === layout).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span className="inline-block size-3 rounded-full border" style={{ backgroundColor: t.accent }} />
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={() => void generateImage()} disabled={generating}>
        {generating ? "Oluşturuluyor..." : "Yeniden Oluştur"}
      </Button>

      <div className="overflow-hidden rounded-lg border bg-muted">
        <canvas ref={canvasRef} className="w-full" style={{ maxWidth: 480, aspectRatio: "1080/1350" }} />
      </div>

      <SocialMediaPreview canvasRef={canvasRef} generated={generated} />
    </div>
  );
}
