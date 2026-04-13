// ---------------------------------------------------------------------------
// Story Templates — Fabric.js Object Specs (1080×1920)
// ---------------------------------------------------------------------------

import type {
  EditorObjectSpec,
  EditorTemplate,
  PropertyForEditor,
} from "@/lib/editor/fabric-editor-types";
import { formatPrice, getTransactionLabel, getTypeLabel } from "@/lib/editor/fabric-helpers";

const SW = 1080;
const SH = 1920;
const SPAD = 60;
const ACCENT = "#ffca3e";

export type StoryTemplateId =
  | "klasik"
  | "vitrin"
  | "galeri"
  | "kesit"
  | "panorama"
  | "cerceve"
  | "sahne";

export interface StoryTemplateDef {
  id: StoryTemplateId;
  name: string;
}

export const STORY_TEMPLATES: StoryTemplateDef[] = [
  { id: "klasik", name: "Klasik" },
  { id: "vitrin", name: "Vitrin" },
  { id: "galeri", name: "Galeri" },
  { id: "kesit", name: "Kesit" },
  { id: "panorama", name: "Panorama" },
  { id: "cerceve", name: "Çerçeve" },
  { id: "sahne", name: "Sahne" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDetailText(p: PropertyForEditor): string {
  const parts: string[] = [];
  if (p.city_name) {
    parts.push(p.district_name ? `${p.district_name}, ${p.city_name}` : p.city_name);
  }
  parts.push(getTypeLabel(p.type));
  if (p.rooms != null) parts.push(`${p.rooms}+${p.living_rooms ?? 1} Oda`);
  if (p.area_sqm) parts.push(`${p.area_sqm} m²`);
  return parts.join("  •  ");
}

// ---------------------------------------------------------------------------
// Template Builders
// ---------------------------------------------------------------------------

function buildKlasik(p: PropertyForEditor, title: string, price: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  // Background
  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "#171717", selectable: false, evented: false,
  });

  // Cover image (full bleed)
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image", left: 0, top: 0,
      width: SW, height: SH, src: p.cover_image,
    });
  }

  // Top gradient
  objects.push({
    id: "top-gradient", role: "decorative", type: "gradient-rect",
    left: 0, top: 0, width: SW, height: SH * 0.45,
    colorStops: [
      { offset: 0, color: "rgba(0,0,0,0.85)" },
      { offset: 1, color: "rgba(0,0,0,0)" },
    ],
    selectable: false, evented: false,
  });

  // Bottom gradient
  objects.push({
    id: "bottom-gradient", role: "decorative", type: "gradient-rect",
    left: 0, top: SH * 0.45, width: SW, height: SH * 0.55,
    colorStops: [
      { offset: 0, color: "rgba(0,0,0,0)" },
      { offset: 0.4, color: "rgba(0,0,0,0.7)" },
      { offset: 1, color: "rgba(0,0,0,0.95)" },
    ],
    selectable: false, evented: false,
  });

  // Logo centered top
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: SW / 2 - 90, top: 90, width: 180, height: 180, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge-bg", role: "badge", type: "rect",
    left: (SW - 220) / 2, top: 280, width: 220, height: 64,
    fill: ACCENT, rx: 16, ry: 16,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: (SW - 220) / 2, top: 296, width: 220,
    text: txLabel, fontSize: 34, fontWeight: "bold", fill: "#000",
    textAlign: "center",
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: SPAD, top: SH * 0.58, width: SW - SPAD * 2,
    text: title, fontSize: 72, fontWeight: "bold", fill: "#ffffff",
    textAlign: "center",
  });

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: SPAD, top: SH * 0.58 + 200, width: SW - SPAD * 2,
    text: price, fontSize: 88, fontWeight: "bold", fill: ACCENT,
    textAlign: "center",
  });

  // Accent line
  objects.push({
    id: "accent-line", role: "decorative", type: "rect",
    left: (SW - 200) / 2, top: SH * 0.58 + 320, width: 200, height: 4,
    fill: ACCENT, selectable: false, evented: false,
  });

  // Location + details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: SPAD, top: SH * 0.58 + 360, width: SW - SPAD * 2,
    text: buildDetailText(p), fontSize: 44, fontWeight: "600", fill: "#e2e8f0",
    textAlign: "center",
  });

  // Swipe up indicator
  objects.push({
    id: "swipe-text", role: "footer", type: "textbox",
    left: SPAD, top: SH - 160, width: SW - SPAD * 2,
    text: "Detaylar için yukarı kaydırın ↑", fontSize: 28, fontWeight: "500",
    fill: "#94a3b8", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  // Footer
  objects.push({
    id: "footer", role: "footer", type: "textbox",
    left: SPAD, top: SH - 110, width: SW - SPAD * 2,
    text: "nexosinvestment.com  •  +90 548 860 40 30", fontSize: 26,
    fontWeight: "500", fill: "#64748b", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildVitrin(p: PropertyForEditor, title: string, price: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "#171717", selectable: false, evented: false,
  });

  // Logo top center
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: SW / 2 - 70, top: 80, width: 140, height: 140, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge-bg", role: "badge", type: "rect",
    left: (SW - 200) / 2, top: 240, width: 200, height: 54,
    fill: ACCENT, rx: 12, ry: 12,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: (SW - 200) / 2, top: 252, width: 200,
    text: txLabel, fontSize: 28, fontWeight: "bold", fill: "#000",
    textAlign: "center",
  });

  // Main cover image
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image",
      left: SPAD, top: 330, width: SW - SPAD * 2, height: 700, src: p.cover_image,
      clipPath: { type: "rect", rx: 24, ry: 24 },
    });
  }

  // 3 small thumbnails
  const thumbW = (SW - SPAD * 2 - 20) / 3;
  const extras = p.extra_images ?? [];
  for (let i = 0; i < 3; i++) {
    if (extras[i]) {
      objects.push({
        id: `thumb-${i}`, role: "extra-image", type: "image",
        left: SPAD + i * (thumbW + 10), top: 1060,
        width: thumbW, height: 200, src: extras[i],
        clipPath: { type: "rect", rx: 14, ry: 14 },
      });
    } else {
      objects.push({
        id: `thumb-${i}-bg`, role: "decorative", type: "rect",
        left: SPAD + i * (thumbW + 10), top: 1060,
        width: thumbW, height: 200, fill: "#1e293b", rx: 14, ry: 14,
        selectable: false, evented: false,
      });
    }
  }

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: SPAD, top: 1310, width: SW - SPAD * 2,
    text: price, fontSize: 80, fontWeight: "bold", fill: ACCENT,
    textAlign: "center",
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: SPAD, top: 1420, width: SW - SPAD * 2,
    text: title, fontSize: 54, fontWeight: "bold", fill: "#f8fafc",
    textAlign: "center",
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: SPAD, top: 1560, width: SW - SPAD * 2,
    text: buildDetailText(p), fontSize: 36, fontWeight: "600", fill: "#94a3b8",
    textAlign: "center",
  });

  // Footer
  objects.push({
    id: "footer", role: "footer", type: "textbox",
    left: SPAD, top: SH - 110, width: SW - SPAD * 2,
    text: "nexosinvestment.com  •  +90 548 860 40 30", fontSize: 26,
    fontWeight: "500", fill: "#64748b", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildGaleri(p: PropertyForEditor, title: string, price: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "#171717", selectable: false, evented: false,
  });

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: SPAD, top: 80, width: 120, height: 120, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge-bg", role: "badge", type: "rect",
    left: SW - SPAD - 180, top: 110, width: 180, height: 50,
    fill: ACCENT, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: SW - SPAD - 162, top: 118, width: 150,
    text: txLabel, fontSize: 24, fontWeight: "bold", fill: "#000",
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: SPAD, top: 230, width: SW - SPAD * 2,
    text: title, fontSize: 54, fontWeight: "bold", fill: "#f8fafc",
  });

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: SPAD, top: 350, width: SW - SPAD * 2,
    text: price, fontSize: 64, fontWeight: "bold", fill: ACCENT,
  });

  // 2x2 image grid
  const allImgs = [p.cover_image, ...(p.extra_images ?? [])].filter(Boolean) as string[];
  const gap = 12;
  const cellW = (SW - SPAD * 2 - gap) / 2;
  const cellH = 420;
  const gridY = 460;

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    if (allImgs[i]) {
      objects.push({
        id: `img-${i}`, role: i === 0 ? "cover" : "extra-image", type: "image",
        left: SPAD + col * (cellW + gap), top: gridY + row * (cellH + gap),
        width: cellW, height: cellH, src: allImgs[i],
        clipPath: { type: "rect", rx: 18, ry: 18 },
      });
    } else {
      objects.push({
        id: `img-${i}-bg`, role: "decorative", type: "rect",
        left: SPAD + col * (cellW + gap), top: gridY + row * (cellH + gap),
        width: cellW, height: cellH, fill: "#1e293b", rx: 18, ry: 18,
        selectable: false, evented: false,
      });
    }
  }

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: SPAD, top: gridY + 2 * (cellH + gap) + 30, width: SW - SPAD * 2,
    text: buildDetailText(p), fontSize: 36, fontWeight: "600", fill: "#94a3b8",
    textAlign: "center",
  });

  // Footer
  objects.push({
    id: "footer", role: "footer", type: "textbox",
    left: SPAD, top: SH - 110, width: SW - SPAD * 2,
    text: "nexosinvestment.com  •  +90 548 860 40 30", fontSize: 26,
    fontWeight: "500", fill: "#64748b", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildKesit(p: PropertyForEditor, title: string, price: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "#171717", selectable: false, evented: false,
  });

  // Top half: cover image
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image",
      left: 0, top: 0, width: SW, height: SH * 0.5, src: p.cover_image,
    });
    objects.push({
      id: "cover-gradient", role: "decorative", type: "gradient-rect",
      left: 0, top: SH * 0.3, width: SW, height: SH * 0.2,
      colorStops: [
        { offset: 0, color: "rgba(15,23,42,0)" },
        { offset: 1, color: "#171717" },
      ],
      selectable: false, evented: false,
    });
  }

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: SPAD, top: 60, width: 120, height: 120, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge-bg", role: "badge", type: "rect",
    left: SW - SPAD - 180, top: 90, width: 180, height: 50,
    fill: ACCENT, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: SW - SPAD - 162, top: 98, width: 150,
    text: txLabel, fontSize: 24, fontWeight: "bold", fill: "#000",
  });

  // Price (centered in bottom half)
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: SPAD, top: SH * 0.52, width: SW - SPAD * 2,
    text: price, fontSize: 80, fontWeight: "bold", fill: ACCENT,
    textAlign: "center",
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: SPAD, top: SH * 0.52 + 110, width: SW - SPAD * 2,
    text: title, fontSize: 56, fontWeight: "bold", fill: "#f8fafc",
    textAlign: "center",
  });

  // Accent line
  objects.push({
    id: "accent-line", role: "decorative", type: "rect",
    left: (SW - 120) / 2, top: SH * 0.52 + 260, width: 120, height: 4,
    fill: ACCENT, selectable: false, evented: false,
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: SPAD, top: SH * 0.52 + 290, width: SW - SPAD * 2,
    text: buildDetailText(p), fontSize: 38, fontWeight: "600", fill: "#94a3b8",
    textAlign: "center",
  });

  // 2 extra images at bottom
  const extras = p.extra_images ?? [];
  const imgW = (SW - SPAD * 2 - 16) / 2;
  for (let i = 0; i < 2; i++) {
    if (extras[i]) {
      objects.push({
        id: `extra-${i}`, role: "extra-image", type: "image",
        left: SPAD + i * (imgW + 16), top: SH * 0.52 + 380,
        width: imgW, height: 300, src: extras[i],
        clipPath: { type: "rect", rx: 18, ry: 18 },
      });
    }
  }

  // Footer
  objects.push({
    id: "footer", role: "footer", type: "textbox",
    left: SPAD, top: SH - 110, width: SW - SPAD * 2,
    text: "nexosinvestment.com  •  +90 548 860 40 30", fontSize: 26,
    fontWeight: "500", fill: "#64748b", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildPanorama(p: PropertyForEditor, title: string, price: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "#171717", selectable: false, evented: false,
  });

  // Cover image full bleed
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image", left: 0, top: 0,
      width: SW, height: SH, src: p.cover_image,
    });
  }

  // Overall dark overlay
  objects.push({
    id: "overlay", role: "decorative", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "rgba(0,0,0,0.4)",
    selectable: false, evented: false,
  });

  // Bottom gradient
  objects.push({
    id: "bottom-gradient", role: "decorative", type: "gradient-rect",
    left: 0, top: SH * 0.5, width: SW, height: SH * 0.5,
    colorStops: [
      { offset: 0, color: "rgba(0,0,0,0)" },
      { offset: 1, color: "rgba(0,0,0,0.9)" },
    ],
    selectable: false, evented: false,
  });

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: SW / 2 - 80, top: 100, width: 160, height: 160, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Price centered
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: SPAD, top: SH - 550, width: SW - SPAD * 2,
    text: price, fontSize: 90, fontWeight: "bold", fill: ACCENT,
    textAlign: "center",
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: SPAD, top: SH - 430, width: SW - SPAD * 2,
    text: title, fontSize: 60, fontWeight: "bold", fill: "#ffffff",
    textAlign: "center",
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: SPAD, top: SH - 300, width: SW - SPAD * 2,
    text: buildDetailText(p), fontSize: 38, fontWeight: "600", fill: "#d1d5db",
    textAlign: "center",
  });

  // Footer
  objects.push({
    id: "footer", role: "footer", type: "textbox",
    left: SPAD, top: SH - 110, width: SW - SPAD * 2,
    text: "nexosinvestment.com  •  +90 548 860 40 30", fontSize: 26,
    fontWeight: "500", fill: "#64748b", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildCerceve(p: PropertyForEditor, title: string, price: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];
  const frame = 40;

  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "#171717", selectable: false, evented: false,
  });

  // Frame accent border
  objects.push({
    id: "frame", role: "decorative", type: "rect",
    left: frame, top: frame, width: SW - frame * 2, height: SH - frame * 2,
    fill: "transparent", rx: 24, ry: 24,
    stroke: ACCENT, strokeWidth: 3,
    selectable: false, evented: false,
  });

  // Cover image inside frame
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image",
      left: frame + 20, top: frame + 20,
      width: SW - frame * 2 - 40, height: SH * 0.5 - frame,
      src: p.cover_image,
      clipPath: { type: "rect", rx: 18, ry: 18 },
    });
  }

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: SW / 2 - 60, top: SH * 0.5 + 30, width: 120, height: 120, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge-bg", role: "badge", type: "rect",
    left: (SW - 200) / 2, top: SH * 0.5 + 170, width: 200, height: 50,
    fill: ACCENT, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: (SW - 200) / 2, top: SH * 0.5 + 178, width: 200,
    text: txLabel, fontSize: 26, fontWeight: "bold", fill: "#000", textAlign: "center",
  });

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: SPAD + 20, top: SH * 0.5 + 260, width: SW - SPAD * 2 - 40,
    text: price, fontSize: 76, fontWeight: "bold", fill: ACCENT, textAlign: "center",
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: SPAD + 20, top: SH * 0.5 + 370, width: SW - SPAD * 2 - 40,
    text: title, fontSize: 50, fontWeight: "bold", fill: "#f8fafc", textAlign: "center",
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: SPAD + 20, top: SH * 0.5 + 500, width: SW - SPAD * 2 - 40,
    text: buildDetailText(p), fontSize: 34, fontWeight: "600", fill: "#94a3b8",
    textAlign: "center",
  });

  // Footer
  objects.push({
    id: "footer", role: "footer", type: "textbox",
    left: SPAD, top: SH - 110, width: SW - SPAD * 2,
    text: "nexosinvestment.com  •  +90 548 860 40 30", fontSize: 26,
    fontWeight: "500", fill: "#64748b", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

function buildSahne(p: PropertyForEditor, title: string, price: string): EditorObjectSpec[] {
  const objects: EditorObjectSpec[] = [];

  // Dark background
  objects.push({
    id: "bg", role: "background", type: "rect", left: 0, top: 0,
    width: SW, height: SH, fill: "#1a1207", selectable: false, evented: false,
  });

  // Cover image top 60%
  if (p.cover_image) {
    objects.push({
      id: "cover", role: "cover", type: "image", left: 0, top: 0,
      width: SW, height: SH * 0.6, src: p.cover_image,
    });
    objects.push({
      id: "cover-gradient", role: "decorative", type: "gradient-rect",
      left: 0, top: SH * 0.4, width: SW, height: SH * 0.2,
      colorStops: [
        { offset: 0, color: "rgba(26,18,7,0)" },
        { offset: 1, color: "#1a1207" },
      ],
      selectable: false, evented: false,
    });
  }

  // Logo
  objects.push({
    id: "logo", role: "logo", type: "image",
    left: SPAD, top: 80, width: 120, height: 120, src: "/logo-trans.png",
    selectable: false, evented: false,
  });

  // Badge
  const txLabel = getTransactionLabel(p.transaction_type);
  objects.push({
    id: "badge-bg", role: "badge", type: "rect",
    left: SW - SPAD - 180, top: 110, width: 180, height: 50,
    fill: ACCENT, rx: 10, ry: 10,
  });
  objects.push({
    id: "badge-text", role: "badge", type: "textbox",
    left: SW - SPAD - 162, top: 118, width: 150,
    text: txLabel, fontSize: 24, fontWeight: "bold", fill: "#000",
  });

  // Content area (bottom 40%)
  const contentY = SH * 0.62;

  // Accent line
  objects.push({
    id: "accent-line", role: "decorative", type: "rect",
    left: SPAD, top: contentY, width: 80, height: 4, fill: ACCENT,
    selectable: false, evented: false,
  });

  // Price
  objects.push({
    id: "price", role: "price", type: "textbox",
    left: SPAD, top: contentY + 30, width: SW - SPAD * 2,
    text: price, fontSize: 80, fontWeight: "bold", fill: ACCENT,
  });

  // Title
  objects.push({
    id: "title", role: "title", type: "textbox",
    left: SPAD, top: contentY + 140, width: SW - SPAD * 2,
    text: title, fontSize: 56, fontWeight: "bold", fill: "#fef9e7",
  });

  // Details
  objects.push({
    id: "details", role: "detail", type: "textbox",
    left: SPAD, top: contentY + 300, width: SW - SPAD * 2,
    text: buildDetailText(p), fontSize: 36, fontWeight: "600", fill: "#c4a352",
  });

  // 2 extra images at bottom
  const extras = p.extra_images ?? [];
  const imgW = (SW - SPAD * 2 - 16) / 2;
  for (let i = 0; i < 2; i++) {
    if (extras[i]) {
      objects.push({
        id: `extra-${i}`, role: "extra-image", type: "image",
        left: SPAD + i * (imgW + 16), top: contentY + 380,
        width: imgW, height: 240, src: extras[i],
        clipPath: { type: "rect", rx: 16, ry: 16 },
      });
    }
  }

  // Footer
  objects.push({
    id: "footer", role: "footer", type: "textbox",
    left: SPAD, top: SH - 110, width: SW - SPAD * 2,
    text: "nexosinvestment.com  •  +90 548 860 40 30", fontSize: 26,
    fontWeight: "500", fill: "#64748b", textAlign: "center",
    lockMovementX: true, lockMovementY: true,
  });

  return objects;
}

// ---------------------------------------------------------------------------
// Dispatch map
// ---------------------------------------------------------------------------

const STORY_BUILDERS: Record<
  StoryTemplateId,
  (p: PropertyForEditor, title: string, price: string) => EditorObjectSpec[]
> = {
  klasik: buildKlasik,
  vitrin: buildVitrin,
  galeri: buildGaleri,
  kesit: buildKesit,
  panorama: buildPanorama,
  cerceve: buildCerceve,
  sahne: buildSahne,
};

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export function buildStoryTemplate(
  templateId: StoryTemplateId,
  property: PropertyForEditor,
  customTitle?: string,
  customPrice?: string
): EditorTemplate {
  const title = customTitle || property.title;
  const price = customPrice || formatPrice(property.price, property.currency);

  const builder = STORY_BUILDERS[templateId];
  const objects = builder(property, title, price);

  return {
    id: templateId,
    name: STORY_TEMPLATES.find((t) => t.id === templateId)?.name ?? templateId,
    layout: templateId,
    config: {
      width: SW,
      height: SH,
      backgroundColor: "#171717",
    },
    objects,
    colors: {
      bg: "#171717",
      cardBg: "#1e293b",
      accent: ACCENT,
      textPrimary: "#f8fafc",
      textSecondary: ACCENT,
      textMuted: "#94a3b8",
      gradientOverlay: ["rgba(15,23,42,0)", "rgba(15,23,42,0.9)"],
    },
  };
}
