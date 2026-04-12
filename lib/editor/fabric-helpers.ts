// ---------------------------------------------------------------------------
// Fabric Editor — Helper Utilities
// ---------------------------------------------------------------------------

import { Canvas, FabricImage, Textbox, Rect, FabricObject } from "fabric";

// ---------------------------------------------------------------------------
// Font Loading
// ---------------------------------------------------------------------------

let fontLoaded = false;

export async function ensureFonts(): Promise<void> {
  if (fontLoaded) return;
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
    await Promise.all(
      weights.map(async (w) => {
        const face = new FontFace("Montserrat", `url(${w.url})`, {
          weight: w.weight,
          style: "normal",
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
      })
    );
    fontLoaded = true;
  } catch {
    // Fallback to system fonts
  }
}

// ---------------------------------------------------------------------------
// Image Loading
// ---------------------------------------------------------------------------

export async function loadImageAsync(
  url: string
): Promise<FabricImage | null> {
  try {
    const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
    return img;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Object Factory Helpers
// ---------------------------------------------------------------------------

export function createRoundedRect(options: {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  rx?: number;
  ry?: number;
  opacity?: number;
  selectable?: boolean;
  evented?: boolean;
}): Rect {
  return new Rect({
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    fill: options.fill,
    rx: options.rx ?? 0,
    ry: options.ry ?? 0,
    opacity: options.opacity ?? 1,
    selectable: options.selectable ?? false,
    evented: options.evented ?? false,
  });
}

export function createTextBlock(options: {
  text: string;
  left: number;
  top: number;
  width: number;
  fontSize: number;
  fill: string;
  fontWeight?: string | number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  selectable?: boolean;
  editable?: boolean;
}): Textbox {
  return new Textbox(options.text, {
    left: options.left,
    top: options.top,
    width: options.width,
    fontSize: options.fontSize,
    fill: options.fill,
    fontWeight: options.fontWeight ?? "normal",
    fontFamily: options.fontFamily ?? "Montserrat, system-ui, sans-serif",
    textAlign: options.textAlign ?? "left",
    lineHeight: options.lineHeight ?? 1.2,
    selectable: options.selectable ?? true,
    editable: options.editable ?? true,
    splitByGrapheme: false,
  });
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function exportCanvasAsPNG(canvas: Canvas): string {
  return canvas.toDataURL({ format: "png", multiplier: 1, quality: 1 });
}

export function exportCanvasAsJPEG(
  canvas: Canvas,
  quality = 0.9
): string {
  return canvas.toDataURL({ format: "jpeg", multiplier: 1, quality });
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

export function serializeCanvas(canvas: Canvas): string {
  return JSON.stringify(canvas.toJSON());
}

export async function deserializeCanvas(
  canvas: Canvas,
  json: string
): Promise<void> {
  const parsed = JSON.parse(json);
  await canvas.loadFromJSON(parsed);
  canvas.renderAll();
}

// ---------------------------------------------------------------------------
// Object Metadata
// ---------------------------------------------------------------------------

export function getObjectRole(obj: FabricObject): string | undefined {
  return (obj as FabricObject & { data?: { role?: string } }).data?.role;
}

export function setObjectRole(
  obj: FabricObject,
  role: string
): void {
  (obj as FabricObject & { data?: Record<string, unknown> }).data = {
    ...((obj as FabricObject & { data?: Record<string, unknown> }).data ?? {}),
    role,
  };
}

// ---------------------------------------------------------------------------
// Editability Rules
// ---------------------------------------------------------------------------

export function applyEditabilityRules(obj: FabricObject): void {
  const role = getObjectRole(obj);
  switch (role) {
    case "background":
      obj.set({ selectable: false, evented: false });
      break;
    case "logo":
      obj.set({ selectable: false, evented: false });
      break;
    case "footer":
      obj.set({ lockMovementX: true, lockMovementY: true, hasControls: false });
      break;
    case "decorative":
      obj.set({ hasControls: false });
      break;
    // title, price, description, badge, cover, extra-image, custom — fully editable (defaults)
  }
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

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

export function formatPrice(price: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${sym}${price.toLocaleString("tr-TR")}`;
}

export function getTransactionLabel(tx: string): string {
  return TX_LABELS[tx] ?? tx.toUpperCase();
}

export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}
