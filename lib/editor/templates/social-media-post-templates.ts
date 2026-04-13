// ---------------------------------------------------------------------------
// Social Media Post Templates — Fabric.js Object Specs
// ---------------------------------------------------------------------------
// Converts the 8 layout types from Canvas 2D rendering to EditorObjectSpec arrays.
// Each builder function returns an EditorTemplate ready for FabricEditor.

import type {
  EditorObjectSpec,
  EditorTemplate,
  PropertyForEditor,
} from "@/lib/editor/fabric-editor-types";
import { formatPrice, getTransactionLabel, getTypeLabel } from "@/lib/editor/fabric-helpers";

// ---------------------------------------------------------------------------
// Constants (matching original social-media-image-generator.tsx)
// ---------------------------------------------------------------------------

const W = 1080;
const H = 1350;
const PAD = 80;
const R = 24;

// ---------------------------------------------------------------------------
// Design Template (color scheme) — imported from original
// ---------------------------------------------------------------------------

type LayoutType =
  | "classic"
  | "fullimage"
  | "showcase"
  | "magazine"
  | "gallery"
  | "herooverlay"
  | "poster"
  | "catalog";

export interface DesignTemplate {
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

export const TEMPLATES: DesignTemplate[] = [
  {
    id: "classic-gold", name: "Klasik Altın", layout: "classic",
    bg: "#171717", cardBg: "#1e293b", accent: "#ffca3e",
    textPrimary: "#f8fafc", textSecondary: "#ffca3e", textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
  {
    id: "classic-white", name: "Klasik Beyaz", layout: "classic",
    bg: "#ffffff", cardBg: "#f1f5f9", accent: "#ffca3e",
    textPrimary: "#171717", textSecondary: "#ffca3e", textMuted: "#64748b",
    gradientOverlay: ["rgba(255,255,255,0)", "rgba(255,255,255,0.85)"],
  },
  {
    id: "fullimage-dark", name: "Tam Görsel Koyu", layout: "fullimage",
    bg: "#000000", cardBg: "rgba(0,0,0,0.6)", accent: "#ffca3e",
    textPrimary: "#ffffff", textSecondary: "#ffca3e", textMuted: "#d1d5db",
    gradientOverlay: ["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"],
  },
  {
    id: "fullimage-gold", name: "Tam Görsel Altın", layout: "fullimage",
    bg: "#000000", cardBg: "rgba(26,18,7,0.7)", accent: "#ffca3e",
    textPrimary: "#fef9e7", textSecondary: "#ffca3e", textMuted: "#c4a352",
    gradientOverlay: ["rgba(0,0,0,0)", "rgba(26,18,7,0.9)"],
  },
  {
    id: "showcase-premium", name: "Vitrin Premium", layout: "showcase",
    bg: "#1a1207", cardBg: "#2a1f0e", accent: "#ffca3e",
    textPrimary: "#fef9e7", textSecondary: "#ffca3e", textMuted: "#c4a352",
    gradientOverlay: ["rgba(26,18,7,0)", "rgba(26,18,7,0.9)"],
  },
  {
    id: "showcase-dark", name: "Vitrin Koyu", layout: "showcase",
    bg: "#171717", cardBg: "#1e293b", accent: "#ffca3e",
    textPrimary: "#f8fafc", textSecondary: "#ffca3e", textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
  {
    id: "magazine-dark", name: "Dergi Koyu", layout: "magazine",
    bg: "#171717", cardBg: "#1e293b", accent: "#ffca3e",
    textPrimary: "#f8fafc", textSecondary: "#ffca3e", textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
  {
    id: "magazine-white", name: "Dergi Beyaz", layout: "magazine",
    bg: "#fafaf9", cardBg: "#e7e5e4", accent: "#ffca3e",
    textPrimary: "#1c1917", textSecondary: "#ffca3e", textMuted: "#78716c",
    gradientOverlay: ["rgba(250,250,249,0)", "rgba(250,250,249,0.85)"],
  },
  {
    id: "gallery-gold", name: "Galeri Altın", layout: "gallery",
    bg: "#171717", cardBg: "#1e293b", accent: "#ffca3e",
    textPrimary: "#f8fafc", textSecondary: "#ffca3e", textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
  {
    id: "herooverlay-gold", name: "Hero Overlay Altın", layout: "herooverlay",
    bg: "#171717", cardBg: "rgba(255,255,255,0.95)", accent: "#ffca3e",
    textPrimary: "#171717", textSecondary: "#ffca3e", textMuted: "#475569",
    gradientOverlay: ["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"],
  },
  {
    id: "herooverlay-dark", name: "Hero Overlay Koyu", layout: "herooverlay",
    bg: "#171717", cardBg: "rgba(15,23,42,0.9)", accent: "#ffca3e",
    textPrimary: "#f8fafc", textSecondary: "#ffca3e", textMuted: "#94a3b8",
    gradientOverlay: ["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"],
  },
  {
    id: "poster-gold", name: "Poster Altın", layout: "poster",
    bg: "#171717", cardBg: "#1e293b", accent: "#ffca3e",
    textPrimary: "#f8fafc", textSecondary: "#ffca3e", textMuted: "#94a3b8",
    gradientOverlay: ["rgba(0,0,0,0)", "rgba(15,23,42,0.85)"],
  },
  {
    id: "poster-white", name: "Poster Beyaz", layout: "poster",
    bg: "#ffffff", cardBg: "#f1f5f9", accent: "#ffca3e",
    textPrimary: "#171717", textSecondary: "#ffca3e", textMuted: "#64748b",
    gradientOverlay: ["rgba(255,255,255,0)", "rgba(255,255,255,0.85)"],
  },
  {
    id: "catalog-gold", name: "Katalog Altın", layout: "catalog",
    bg: "#ffffff", cardBg: "#f8fafc", accent: "#ffca3e",
    textPrimary: "#171717", textSecondary: "#ffca3e", textMuted: "#64748b",
    gradientOverlay: ["rgba(255,255,255,0)", "rgba(255,255,255,0.85)"],
  },
  {
    id: "catalog-dark", name: "Katalog Koyu", layout: "catalog",
    bg: "#171717", cardBg: "#1e293b", accent: "#ffca3e",
    textPrimary: "#f8fafc", textSecondary: "#ffca3e", textMuted: "#94a3b8",
    gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
  },
];

export const LAYOUT_LABELS: Record<LayoutType, string> = {
  classic: "Klasik",
  fullimage: "Tam Görsel",
  showcase: "Vitrin",
  magazine: "Dergi",
  gallery: "Galeri",
  herooverlay: "Hero Overlay",
  poster: "Poster",
  catalog: "Katalog",
};

// ---------------------------------------------------------------------------
// Helper: build property detail text
// ---------------------------------------------------------------------------

function buildDetailText(p: PropertyForEditor): string {
  const parts: string[] = [];
  if (p.city_name) {
    parts.push(p.district_name ? `${p.district_name}, ${p.city_name}` : p.city_name);
  }
  parts.push(getTypeLabel(p.type));
  if (p.rooms != null) {
    parts.push(`${p.rooms}+${p.living_rooms ?? 1} Oda`);
  }
  if (p.area_sqm) parts.push(`${p.area_sqm} m²`);
  return parts.join("  •  ");
}

function fmtRooms(rooms: number | null, lr: number | null): string | null {
  if (rooms == null) return null;
  return `${rooms}+${lr ?? 1}`;
}

// ---------------------------------------------------------------------------
// Template Builders
// ---------------------------------------------------------------------------

function buildClassic(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];
  const startY = 171;
  const txLabel = getTransactionLabel(p.transaction_type);

  // Background
  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Badge
  objects.push({
    id: "badge", role: "badge", type: "rect", left: PAD, top: startY,
    width: 180, height: 50, fill: T.accent, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox", left: PAD + 18, top: startY + 8,
    width: 150, text: txLabel, fontSize: 24, fontWeight: "bold", fill: T.bg,
  });

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox", left: PAD, top: startY + 64,
    width: W - PAD * 2, text: price, fontSize: 56, fontWeight: "bold", fill: T.textSecondary,
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox", left: PAD, top: startY + 132,
    width: W - PAD * 2 - 200, text: title, fontSize: 42, fontWeight: "bold", fill: T.textPrimary,
  });

  // Logo placeholder (text fallback)
  objects.push({
    id: "logo", role: "logo", type: "image", left: W - PAD - 120, top: startY,
    width: 120, height: 120, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Cover image
  if (p.cover_image) {
    const hasExtras = p.extra_images?.length > 0;
    const totalW = W - PAD * 2;
    const mainW = hasExtras ? Math.round(totalW * 0.65) : totalW;
    const imgY = startY + 230;

    objects.push({
      id: "cover", role: "cover", type: "image", left: PAD, top: imgY,
      width: mainW, height: 530, src: p.cover_image,
      clipPath: { type: "rect", rx: R, ry: R },
    });

    // Gradient overlay on cover
    objects.push({
      id: "cover-gradient", role: "decorative", type: "gradient-rect",
      left: PAD, top: imgY + 390, width: mainW, height: 140,
      colorStops: [
        { offset: 0, color: T.gradientOverlay[0] },
        { offset: 1, color: T.gradientOverlay[1] },
      ],
      selectable: false, evented: false,
    });

    // Extra images
    if (hasExtras) {
      const gap = 12;
      const sideX = PAD + mainW + gap;
      const sideW = totalW - mainW - gap;
      const count = Math.min(p.extra_images.length, 3);
      const sideH = (530 - gap * (count - 1)) / count;

      for (let i = 0; i < count; i++) {
        objects.push({
          id: `extra-${i}`, role: "extra-image", type: "image",
          left: sideX, top: imgY + i * (sideH + gap),
          width: sideW, height: sideH, src: p.extra_images[i],
          clipPath: { type: "rect", rx: 14, ry: 14 },
        });
      }
    }
  }

  // Details text
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: PAD, top: startY + 780, width: W - PAD * 2,
    text: buildDetailText(p), fontSize: 32, fontWeight: "600",
    fill: T.textPrimary,
  });

  // Description
  if (desc) {
    objects.push({
      id: "desc", role: "description", type: "textbox",
      left: PAD, top: startY + 860, width: W - PAD * 2,
      text: desc, fontSize: 34, fontWeight: "600", fill: T.textMuted,
    });
  }

  // Footer
  objects.push({
    id: "footer-line", role: "footer", type: "rect",
    left: PAD, top: H - 100, width: 50, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });
  objects.push({
    id: "footer-phone", role: "footer", type: "textbox",
    left: PAD, top: H - 90, width: 300,
    text: "+90 548 860 40 30", fontSize: 24, fontWeight: "600", fill: T.textMuted,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "footer-web", role: "footer", type: "textbox",
    left: W - PAD - 300, top: H - 90, width: 300,
    text: "nexosinvestment.com", fontSize: 24, fontWeight: "600",
    fill: T.textMuted, textAlign: "right",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildFullImage(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  // Background (dark fallback)
  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Full cover image
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image", left: 0, top: 0,
      width: W, height: H, src: p.cover_image,
    });
  }

  // Dark overlay
  objects.push({
    id: "overlay", role: "decorative", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: "rgba(0,0,0,0.3)",
    selectable: false, evented: false,
  });

  // Gradient overlay
  objects.push({
    id: "gradient", role: "decorative", type: "gradient-rect",
    left: 0, top: H * 0.3, width: W, height: H * 0.7,
    colorStops: [
      { offset: 0, color: "rgba(0,0,0,0)" },
      { offset: 0.4, color: "rgba(0,0,0,0.3)" },
      { offset: 1, color: "rgba(0,0,0,0.85)" },
    ],
    selectable: false, evented: false,
  });

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image", left: PAD, top: PAD + 40,
    width: 140, height: 140, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge", role: "badge", type: "rect",
    left: W - PAD - 180, top: PAD + 85, width: 180, height: 50,
    fill: T.accent, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: W - PAD - 162, top: PAD + 93, width: 150,
    text: txLabel, fontSize: 24, fontWeight: "bold", fill: "#000",
  });

  // Price
  const bottomY = H - 420;
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: PAD, top: bottomY, width: W - PAD * 2,
    text: price, fontSize: 64, fontWeight: "bold", fill: T.textSecondary,
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: PAD, top: bottomY + 80, width: W - PAD * 2,
    text: title, fontSize: 46, fontWeight: "bold", fill: T.textPrimary,
  });

  // Details row
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: PAD, top: bottomY + 210, width: W - PAD * 2,
    text: buildDetailText(p), fontSize: 30, fontWeight: "500", fill: T.textMuted,
  });

  // Description
  if (desc) {
    objects.push({
      id: "desc", role: "description", type: "textbox",
      left: PAD, top: bottomY + 260, width: W - PAD * 2,
      text: desc, fontSize: 32, fontWeight: "600", fill: T.textMuted,
    });
  }

  // Footer
  objects.push({
    id: "footer-phone", role: "footer", type: "textbox",
    left: PAD, top: H - 60, width: 300,
    text: "+90 548 860 40 30", fontSize: 24, fontWeight: "600", fill: T.textMuted,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "footer-web", role: "footer", type: "textbox",
    left: W - PAD - 300, top: H - 60, width: 300,
    text: "nexosinvestment.com", fontSize: 24, fontWeight: "600",
    fill: T.textMuted, textAlign: "right",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildShowcase(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  // Background
  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Main cover image
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image", left: 0, top: 0,
      width: W, height: 500, src: p.cover_image,
    });
    objects.push({
      id: "cover-overlay", role: "decorative", type: "gradient-rect",
      left: 0, top: 300, width: W, height: 200,
      colorStops: [
        { offset: 0, color: T.gradientOverlay[0] },
        { offset: 1, color: T.gradientOverlay[1] },
      ],
      selectable: false, evented: false,
    });
  }

  // 3 thumbnails
  const thumbGap = 10;
  const thumbW = (W - PAD * 2 - thumbGap * 2) / 3;
  const thumbY = 500 - 110;
  const extras = p.extra_images ?? [];
  for (let i = 0; i < 3; i++) {
    if (extras[i]) {
      objects.push({
        id: `thumb-${i}`, role: "extra-image", type: "image",
        left: PAD + i * (thumbW + thumbGap), top: thumbY,
        width: thumbW, height: 220, src: extras[i],
        clipPath: { type: "rect", rx: 14, ry: 14 },
      });
    } else {
      objects.push({
        id: `thumb-${i}-bg`, role: "decorative", type: "rect",
        left: PAD + i * (thumbW + thumbGap), top: thumbY,
        width: thumbW, height: 220, fill: T.cardBg, rx: 14, ry: 14,
        selectable: false, evented: false,
      });
    }
  }

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge", role: "badge", type: "rect",
    left: W - PAD - 180, top: PAD, width: 180, height: 50,
    fill: T.accent, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: W - PAD - 162, top: PAD + 8, width: 150,
    text: txLabel, fontSize: 24, fontWeight: "bold", fill: T.bg,
  });

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image", left: PAD, top: PAD - 30,
    width: 110, height: 110, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Content card
  const cardY = 630;
  objects.push({
    id: "card", role: "decorative", type: "rect",
    left: PAD - 20, top: cardY, width: W - PAD * 2 + 40, height: H - cardY - 20,
    fill: T.cardBg, rx: R, ry: R, selectable: false, evented: false,
  });
  objects.push({
    id: "card-accent", role: "decorative", type: "rect",
    left: PAD - 20, top: cardY, width: W - PAD * 2 + 40, height: 5,
    fill: T.accent, selectable: false, evented: false,
  });

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: PAD + 10, top: cardY + 40, width: W - PAD * 2 - 20,
    text: price, fontSize: 58, fontWeight: "bold", fill: T.textSecondary,
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: PAD + 10, top: cardY + 116, width: W - PAD * 2 - 20,
    text: title, fontSize: 40, fontWeight: "bold", fill: T.textPrimary,
  });

  // Accent line
  objects.push({
    id: "accent-line", role: "decorative", type: "rect",
    left: PAD + 10, top: cardY + 210, width: 60, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: PAD + 10, top: cardY + 240, width: W - PAD * 2 - 20,
    text: buildDetailText(p), fontSize: 30, fontWeight: "600", fill: T.textPrimary,
  });

  // Description
  if (desc) {
    objects.push({
      id: "desc", role: "description", type: "textbox",
      left: PAD + 10, top: cardY + 310, width: W - PAD * 2 - 20,
      text: desc, fontSize: 32, fontWeight: "600", fill: T.textMuted,
    });
  }

  // Footer
  objects.push({
    id: "footer-phone", role: "footer", type: "textbox",
    left: PAD, top: H - 60, width: 300,
    text: "+90 548 860 40 30", fontSize: 24, fontWeight: "600", fill: T.textMuted,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "footer-web", role: "footer", type: "textbox",
    left: W - PAD - 300, top: H - 60, width: 300,
    text: "nexosinvestment.com", fontSize: 24, fontWeight: "600",
    fill: T.textMuted, textAlign: "right",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildMagazine(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];
  const sY = 155;

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Accent line top-right
  objects.push({
    id: "accent-top", role: "decorative", type: "rect",
    left: W - PAD - 80, top: sY, width: 80, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image", left: PAD, top: sY + 20,
    width: 100, height: 100, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge", role: "badge", type: "rect",
    left: W - PAD - 160, top: sY + 20, width: 160, height: 50,
    fill: T.accent, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: W - PAD - 142, top: sY + 28, width: 130,
    text: txLabel, fontSize: 24, fontWeight: "bold", fill: T.bg,
  });

  // Big price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: PAD, top: sY + 100, width: W - PAD * 2,
    text: price, fontSize: 72, fontWeight: "bold", fill: T.textSecondary,
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: PAD, top: sY + 190, width: W - PAD * 2,
    text: title, fontSize: 40, fontWeight: "bold", fill: T.textPrimary,
  });

  // Accent line
  objects.push({
    id: "accent-line", role: "decorative", type: "rect",
    left: PAD, top: sY + 290, width: 80, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });

  // Asymmetric image grid
  const imgY = sY + 310;
  const imgH = 520;
  const gap = 10;
  const leftW = Math.round((W - PAD * 2 - gap) * 0.64);
  const rightW = W - PAD * 2 - gap - leftW;
  const rightH = (imgH - gap * 2) / 3;

  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image",
      left: PAD, top: imgY, width: leftW, height: imgH, src: p.cover_image,
      clipPath: { type: "rect", rx: R, ry: R },
    });
  }

  for (let i = 0; i < 3; i++) {
    const src = p.extra_images?.[i];
    if (src) {
      objects.push({
        id: `extra-${i}`, role: "extra-image", type: "image",
        left: PAD + leftW + gap, top: imgY + i * (rightH + gap),
        width: rightW, height: rightH, src,
        clipPath: { type: "rect", rx: 14, ry: 14 },
      });
    } else {
      objects.push({
        id: `extra-${i}-bg`, role: "decorative", type: "rect",
        left: PAD + leftW + gap, top: imgY + i * (rightH + gap),
        width: rightW, height: rightH, fill: T.cardBg, rx: 14, ry: 14,
        selectable: false, evented: false,
      });
    }
  }

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: PAD, top: imgY + imgH + 24, width: W - PAD * 2,
    text: buildDetailText(p), fontSize: 32, fontWeight: "600", fill: T.textPrimary,
  });

  if (desc) {
    objects.push({
      id: "desc", role: "description", type: "textbox",
      left: PAD, top: imgY + imgH + 80, width: W - PAD * 2,
      text: desc, fontSize: 32, fontWeight: "600", fill: T.textMuted,
    });
  }

  // Footer
  objects.push({
    id: "footer-line", role: "footer", type: "rect",
    left: PAD, top: H - 100, width: 50, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });
  objects.push({
    id: "footer-phone", role: "footer", type: "textbox",
    left: PAD, top: H - 90, width: 300,
    text: "+90 548 860 40 30", fontSize: 24, fontWeight: "600", fill: T.textMuted,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "footer-web", role: "footer", type: "textbox",
    left: W - PAD - 300, top: H - 90, width: 300,
    text: "nexosinvestment.com", fontSize: 24, fontWeight: "600",
    fill: T.textMuted, textAlign: "right",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildGallery(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];
  const sY = 165;

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Logo centered
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: W / 2 - 60, top: sY, width: 120, height: 120, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Price centered
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: PAD, top: sY + 170, width: W - PAD * 2,
    text: price, fontSize: 60, fontWeight: "bold", fill: T.textSecondary,
    textAlign: "center",
  });

  // Title centered
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: PAD, top: sY + 250, width: W - PAD * 2,
    text: title, fontSize: 38, fontWeight: "bold", fill: T.textPrimary,
    textAlign: "center",
  });

  // 2x2 image grid
  const imgY = sY + 350;
  const gap = 10;
  const cellW = (W - PAD * 2 - gap) / 2;
  const cellH = 240;
  const allImgs = [p.cover_image, ...(p.extra_images ?? [])].filter(Boolean) as string[];

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    if (allImgs[i]) {
      objects.push({
        id: `img-${i}`, role: i === 0 ? "cover" : "extra-image", type: "image",
        left: PAD + col * (cellW + gap), top: imgY + row * (cellH + gap),
        width: cellW, height: cellH, src: allImgs[i],
        clipPath: { type: "rect", rx: 16, ry: 16 },
      });
    } else {
      objects.push({
        id: `img-${i}-bg`, role: "decorative", type: "rect",
        left: PAD + col * (cellW + gap), top: imgY + row * (cellH + gap),
        width: cellW, height: cellH, fill: T.cardBg, rx: 16, ry: 16,
        selectable: false, evented: false,
      });
    }
  }

  // Details centered
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: PAD, top: imgY + 2 * (cellH + gap) + 20, width: W - PAD * 2,
    text: buildDetailText(p), fontSize: 30, fontWeight: "600",
    fill: T.textMuted, textAlign: "center",
  });

  if (desc) {
    objects.push({
      id: "desc", role: "description", type: "textbox",
      left: PAD, top: imgY + 2 * (cellH + gap) + 70, width: W - PAD * 2,
      text: desc, fontSize: 28, fontWeight: "500", fill: T.textMuted, textAlign: "center",
    });
  }

  // Footer
  objects.push({
    id: "footer-line", role: "footer", type: "rect",
    left: PAD, top: H - 100, width: 50, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });
  objects.push({
    id: "footer-phone", role: "footer", type: "textbox",
    left: PAD, top: H - 90, width: 300,
    text: "+90 548 860 40 30", fontSize: 24, fontWeight: "600", fill: T.textMuted,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "footer-web", role: "footer", type: "textbox",
    left: W - PAD - 300, top: H - 90, width: 300,
    text: "nexosinvestment.com", fontSize: 24, fontWeight: "600",
    fill: T.textMuted, textAlign: "right",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildHeroOverlay(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  // Background
  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Cover image
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image", left: 0, top: 0,
      width: W, height: H, src: p.cover_image,
    });
  }

  // Multi-stop gradient
  objects.push({
    id: "gradient", role: "decorative", type: "gradient-rect",
    left: 0, top: 0, width: W, height: H,
    colorStops: [
      { offset: 0, color: "rgba(0,0,0,0.25)" },
      { offset: 0.35, color: "rgba(0,0,0,0.15)" },
      { offset: 0.55, color: "rgba(0,0,0,0.4)" },
      { offset: 1, color: "rgba(0,0,0,0.88)" },
    ],
    selectable: false, evented: false,
  });

  // Logo centered
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: W / 2 - 60, top: 160, width: 120, height: 120, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Title centered
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: PAD, top: 300, width: W - PAD * 2,
    text: title, fontSize: 54, fontWeight: "bold", fill: "#ffffff",
    textAlign: "center",
  });

  // Accent line
  objects.push({
    id: "accent-line", role: "decorative", type: "rect",
    left: (W - 80) / 2, top: 420, width: 80, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });

  // 3 thumbnails
  const thumbGap = 16;
  const thumbW = (W - PAD * 2 - thumbGap * 2) / 3;
  const baseThumbY = 444;
  const allImgs = [p.cover_image, ...(p.extra_images ?? [])].filter(Boolean) as string[];

  for (let i = 0; i < 3; i++) {
    const h = i === 1 ? 460 : 420;
    const ty = i === 1 ? baseThumbY - 20 : baseThumbY + 20;
    const src = allImgs[i + 1] ?? allImgs[0] ?? "";
    if (src) {
      objects.push({
        id: `thumb-${i}`, role: "extra-image", type: "image",
        left: PAD + i * (thumbW + thumbGap), top: ty,
        width: thumbW, height: h, src,
        clipPath: { type: "rect", rx: i === 1 ? 28 : 22, ry: i === 1 ? 28 : 22 },
      });
    }
  }

  // Price card
  const cardY = baseThumbY + 460 + 30;
  objects.push({
    id: "price-card", role: "decorative", type: "rect",
    left: (W - 400) / 2, top: cardY, width: 400, height: 120,
    fill: T.cardBg, rx: 18, ry: 18, selectable: false, evented: false,
  });
  objects.push({
    id: "price-label", role: "detail", type: "textbox",
    left: (W - 400) / 2, top: cardY + 18, width: 400,
    text: "BAŞLAYAN FİYATLAR", fontSize: 20, fontWeight: "700",
    fill: T.textSecondary, textAlign: "center",
  });
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: (W - 400) / 2, top: cardY + 48, width: 400,
    text: price, fontSize: 56, fontWeight: "bold", fill: T.textSecondary,
    textAlign: "center",
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: PAD, top: cardY + 150, width: W - PAD * 2,
    text: buildDetailText(p), fontSize: 30, fontWeight: "600",
    fill: "#ffffff", textAlign: "center",
  });

  // Footer bar
  objects.push({
    id: "footer-accent", role: "footer", type: "rect",
    left: 0, top: H - 86, width: W, height: 3, fill: T.accent,
    selectable: false, evented: false,
  });
  objects.push({
    id: "footer-bg", role: "footer", type: "rect",
    left: 0, top: H - 83, width: W, height: 83, fill: T.cardBg,
    selectable: false, evented: false,
  });
  objects.push({
    id: "footer-phone", role: "footer", type: "textbox",
    left: PAD + 10, top: H - 52, width: 300,
    text: "+90 548 860 40 30", fontSize: 22, fontWeight: "600", fill: T.textPrimary,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "footer-web", role: "footer", type: "textbox",
    left: W - PAD - 310, top: H - 52, width: 300,
    text: "nexosinvestment.com", fontSize: 22, fontWeight: "600",
    fill: T.textPrimary, textAlign: "right",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildPoster(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Top cover image
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image", left: 0, top: 0,
      width: W, height: 620, src: p.cover_image,
    });
    objects.push({
      id: "cover-overlay", role: "decorative", type: "rect",
      left: 0, top: 0, width: W, height: 620, fill: "rgba(0,0,0,0.3)",
      selectable: false, evented: false,
    });
    objects.push({
      id: "cover-gradient", role: "decorative", type: "gradient-rect",
      left: 0, top: 370, width: W, height: 250,
      colorStops: [
        { offset: 0, color: "rgba(0,0,0,0)" },
        { offset: 1, color: T.gradientOverlay[1] },
      ],
      selectable: false, evented: false,
    });
  }

  // 2 extra images overlapping
  const imgY = 560;
  const gap = 20;
  const imgW = (W - PAD * 2 - gap) / 2;
  const extras = p.extra_images ?? [];
  for (let i = 0; i < 2; i++) {
    if (extras[i]) {
      objects.push({
        id: `extra-${i}`, role: "extra-image", type: "image",
        left: PAD + i * (imgW + gap), top: imgY,
        width: imgW, height: 300, src: extras[i],
        clipPath: { type: "rect", rx: 22, ry: 22 },
      });
    } else {
      objects.push({
        id: `extra-${i}-bg`, role: "decorative", type: "rect",
        left: PAD + i * (imgW + gap), top: imgY,
        width: imgW, height: 300, fill: T.cardBg, rx: 22, ry: 22,
        selectable: false, evented: false,
      });
    }
  }

  // Title centered
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: PAD, top: imgY + 324, width: W - PAD * 2,
    text: title, fontSize: 44, fontWeight: "bold", fill: T.textPrimary,
    textAlign: "center",
  });

  // Price badge
  objects.push({
    id: "price-badge", role: "decorative", type: "rect",
    left: (W - 400) / 2, top: imgY + 430, width: 400, height: 80,
    fill: T.accent, rx: 16, ry: 16,
  });
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: (W - 400) / 2, top: imgY + 442, width: 400,
    text: price, fontSize: 54, fontWeight: "bold", fill: T.bg,
    textAlign: "center",
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: PAD, top: imgY + 530, width: W - PAD * 2,
    text: buildDetailText(p), fontSize: 26, fontWeight: "500",
    fill: T.textMuted, textAlign: "center",
  });

  // Logo centered
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: W / 2 - 55, top: imgY + 576, width: 110, height: 110, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Footer bar
  objects.push({
    id: "footer-accent", role: "footer", type: "rect",
    left: 0, top: H - 90, width: W, height: 3, fill: T.accent,
    selectable: false, evented: false,
  });
  objects.push({
    id: "footer-bg", role: "footer", type: "rect",
    left: 0, top: H - 87, width: W, height: 87, fill: T.cardBg,
    selectable: false, evented: false,
  });
  objects.push({
    id: "footer-phone", role: "footer", type: "textbox",
    left: PAD + 10, top: H - 52, width: 300,
    text: "+90 548 860 40 30", fontSize: 22, fontWeight: "600", fill: T.textPrimary,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "footer-web", role: "footer", type: "textbox",
    left: W - PAD - 310, top: H - 52, width: 300,
    text: "nexosinvestment.com", fontSize: 22, fontWeight: "600",
    fill: T.textPrimary, textAlign: "right",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildCatalog(T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];
  const leftW = W * 0.46;
  const rightX = W * 0.50;
  const rightW = W - rightX - 40;
  const startY = 80;

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: W, height: H, fill: T.bg, selectable: false, evented: false,
  });

  // Decorative triangle (top-right)
  objects.push({
    id: "deco-accent", role: "decorative", type: "rect",
    left: W - 6, top: 250, width: 6, height: 300, fill: T.accent,
    selectable: false, evented: false,
  });

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image", left: PAD, top: startY,
    width: 90, height: 90, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: PAD, top: startY + 110, width: leftW - PAD,
    text: title, fontSize: 48, fontWeight: "bold", fill: T.textPrimary,
  });

  // Price badge label
  objects.push({
    id: "price-label-bg", role: "decorative", type: "rect",
    left: PAD, top: startY + 330, width: 280, height: 42,
    fill: T.accent, rx: 8, ry: 8,
  });
  objects.push({
    id: "price-label", role: "detail", type: "textbox",
    left: PAD + 18, top: startY + 336, width: 250,
    text: "Başlayan Fiyatlarla", fontSize: 22, fontWeight: "700", fill: T.bg,
  });

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: PAD, top: startY + 386, width: leftW - PAD,
    text: price, fontSize: 58, fontWeight: "bold", fill: T.textSecondary,
  });

  // Accent divider
  objects.push({
    id: "divider", role: "decorative", type: "rect",
    left: PAD, top: startY + 466, width: 60, height: 4, fill: T.accent,
    selectable: false, evented: false,
  });

  // Features header
  objects.push({
    id: "features-header", role: "detail", type: "textbox",
    left: PAD, top: startY + 490, width: leftW - PAD,
    text: "Özellikler:", fontSize: 32, fontWeight: "bold", fill: T.textPrimary,
  });

  // Location
  objects.push({
    id: "location", role: "detail", type: "textbox",
    left: PAD, top: startY + 538, width: leftW - PAD,
    text: p.district_name
      ? `${p.district_name} Bölgesinde`
      : `${p.city_name} Bölgesinde`,
    fontSize: 26, fontWeight: "500", fill: T.textMuted,
  });

  // Detail items
  const detailParts: string[] = [];
  if (p.area_sqm) detailParts.push(`${p.area_sqm} m²`);
  const rs = fmtRooms(p.rooms, p.living_rooms);
  if (rs) detailParts.push(`${rs} Oda`);
  detailParts.push(getTypeLabel(p.type));

  objects.push({
    id: "detail-items", role: "detail", type: "textbox",
    left: PAD, top: startY + 578, width: leftW - PAD,
    text: detailParts.join("  •  "), fontSize: 28, fontWeight: "600", fill: T.textPrimary,
  });

  // CTA button
  objects.push({
    id: "cta-bg", role: "decorative", type: "rect",
    left: PAD, top: startY + 660, width: 360, height: 54,
    fill: T.accent, rx: 12, ry: 12,
  });
  objects.push({
    id: "cta-text", role: "detail", type: "textbox",
    left: PAD + 28, top: startY + 670, width: 310,
    text: "Bir Görüşme Planlayın", fontSize: 24, fontWeight: "bold", fill: T.bg,
  });

  // Contact info
  objects.push({
    id: "contact-phone", role: "footer", type: "textbox",
    left: PAD, top: startY + 740, width: leftW - PAD,
    text: "+90 548 860 40 30", fontSize: 22, fontWeight: "500", fill: T.textMuted,
    lockMovementX: true, lockMovementY: true,
  });
  objects.push({
    id: "contact-web", role: "footer", type: "textbox",
    left: PAD, top: startY + 772, width: leftW - PAD,
    text: "nexosinvestment.com", fontSize: 22, fontWeight: "500", fill: T.textMuted,
    lockMovementX: true, lockMovementY: true,
  });

  // Right column: images
  const allImgs = [p.cover_image, ...(p.extra_images ?? [])].filter(Boolean) as string[];
  const mainImgH = 500;
  const smallImgH = 340;

  if (allImgs[0]) {
    objects.push({
      id: "right-main", role: "cover", type: "image",
      left: rightX, top: 80, width: rightW, height: mainImgH, src: allImgs[0],
      clipPath: { type: "rect", rx: 24, ry: 24 },
    });
  }

  for (let i = 0; i < 2; i++) {
    const iy = 80 + mainImgH + 16 + i * (smallImgH + 16);
    if (allImgs[i + 1]) {
      objects.push({
        id: `right-small-${i}`, role: "extra-image", type: "image",
        left: rightX, top: iy, width: rightW, height: smallImgH,
        src: allImgs[i + 1],
        clipPath: { type: "rect", rx: 18, ry: 18 },
      });
    } else {
      objects.push({
        id: `right-small-${i}-bg`, role: "decorative", type: "rect",
        left: rightX, top: iy, width: rightW, height: smallImgH,
        fill: T.cardBg, rx: 18, ry: 18,
        selectable: false, evented: false,
      });
    }
  }

  return objects;
}

// ---------------------------------------------------------------------------
// Main builder — dispatches to layout-specific builder
// ---------------------------------------------------------------------------

const LAYOUT_BUILDERS: Record<
  LayoutType,
  (T: DesignTemplate, p: PropertyForEditor, title: string, price: string, desc: string) => EditorObjectSpec[]
> = {
  classic: buildClassic,
  fullimage: buildFullImage,
  showcase: buildShowcase,
  magazine: buildMagazine,
  gallery: buildGallery,
  herooverlay: buildHeroOverlay,
  poster: buildPoster,
  catalog: buildCatalog,
};

export function buildPostTemplate(
  designTemplate: DesignTemplate,
  property: PropertyForEditor,
  customTitle?: string,
  customPrice?: string,
  customDesc?: string
): EditorTemplate {
  const title = customTitle || property.title;
  const price = customPrice || formatPrice(property.price, property.currency);
  const desc = customDesc || "Detaylı bilgi için bize ulaşın.";

  const builder = LAYOUT_BUILDERS[designTemplate.layout];
  const objects = builder(designTemplate, property, title, price, desc);

  return {
    id: designTemplate.id,
    name: designTemplate.name,
    layout: designTemplate.layout,
    config: {
      width: W,
      height: H,
      backgroundColor: designTemplate.bg,
    },
    objects,
    colors: {
      bg: designTemplate.bg,
      cardBg: designTemplate.cardBg,
      accent: designTemplate.accent,
      textPrimary: designTemplate.textPrimary,
      textSecondary: designTemplate.textSecondary,
      textMuted: designTemplate.textMuted,
      gradientOverlay: designTemplate.gradientOverlay,
    },
  };
}
