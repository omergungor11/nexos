/**
 * Shared Turkish property search query parser.
 * Extracts transaction type, property type, room count, and remaining free text
 * from natural-language queries like "3+1 satılık villa".
 *
 * No server imports — safe for both client and server contexts.
 */

export const TX_KEYWORDS: Record<string, string> = {
  satılık: "sale",
  satilik: "sale",
  satılik: "sale",
  kiralık: "rent",
  kiralik: "rent",
  günlük: "daily_rental",
  gunluk: "daily_rental",
  "günlük kiralık": "daily_rental",
  "gunluk kiralik": "daily_rental",
};

export const TYPE_KEYWORDS: Record<string, string> = {
  daire: "apartment",
  villa: "villa",
  "ikiz villa": "twin_villa",
  penthouse: "penthouse",
  bungalow: "bungalow",
  müstakil: "detached",
  mustakil: "detached",
  "müstakil ev": "detached",
  arsa: "residential_land",
  dükkan: "shop",
  dukkan: "shop",
  ofis: "office",
  tarla: "field",
  otel: "hotel",
  stüdyo: "studio",
  studyo: "studio",
};

// Turkish → English property type URL values (for tip= param)
export const TX_TO_ISLEM: Record<string, string> = {
  sale: "satilik",
  rent: "kiralik",
  daily_rental: "gunluk",
};

export interface ParsedSearchQuery {
  /** DB value: "sale" | "rent" | "daily_rental" | null */
  transactionType: string | null;
  /** DB value: "apartment" | "villa" | etc. | null */
  propertyType: string | null;
  /** URL-safe room string for ?oda= param, e.g. "3+1" */
  roomStr: string | null;
  /** Parsed bedroom count, null if not detected */
  rooms: number | null;
  /** Parsed living room count, null if not detected */
  livingRooms: number | null;
  /** Remaining words not matched by any keyword (for title/address search) */
  remainingText: string;
}

export function normalizetr(s: string): string {
  return s
    .toLowerCase()
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c");
}

export function parseSearchQuery(raw: string): ParsedSearchQuery {
  const lower = raw.toLowerCase().trim();
  let words = lower.split(/\s+/);
  let transactionType: string | null = null;
  let propertyType: string | null = null;
  let roomStr: string | null = null;
  let rooms: number | null = null;
  let livingRooms: number | null = null;

  // ── Room pattern: "3+1", "2+0", "1+0" ──────────────────────────────────
  const roomMatch = lower.match(/\b(\d+)\+(\d+)\b/);
  if (roomMatch) {
    rooms = parseInt(roomMatch[1], 10);
    livingRooms = parseInt(roomMatch[2], 10);
    roomStr = `${rooms}+${livingRooms}`;
    words = words.filter((w) => !/^\d+\+\d+$/.test(w));
  }

  // ── Transaction type (multi-word first) ─────────────────────────────────
  const fullPhrase = words.join(" ");
  const fullNorm = normalizetr(fullPhrase);

  for (const [kw, val] of Object.entries(TX_KEYWORDS)) {
    if (fullPhrase.includes(kw) || fullNorm.includes(normalizetr(kw))) {
      transactionType = val;
      const kwWords = kw.split(" ");
      words = words.filter(
        (w) => !kwWords.some((kww) => w === kww || normalizetr(w) === normalizetr(kww))
      );
      break;
    }
  }

  // ── Property type (multi-word first, on remaining words) ─────────────────
  const remaining = words.join(" ");
  const remainNorm = normalizetr(remaining);

  for (const [kw, val] of Object.entries(TYPE_KEYWORDS)) {
    if (remaining.includes(kw) || remainNorm.includes(normalizetr(kw))) {
      propertyType = val;
      const kwWords = kw.split(" ");
      words = words.filter(
        (w) => !kwWords.some((kww) => w === kww || normalizetr(w) === normalizetr(kww))
      );
      break;
    }
  }

  // ── Single-word fallbacks ────────────────────────────────────────────────
  if (!transactionType) {
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const n = normalizetr(w);
      for (const [kw, val] of Object.entries(TX_KEYWORDS)) {
        if (w === kw || n === normalizetr(kw)) {
          transactionType = val;
          words.splice(i, 1);
          break;
        }
      }
      if (transactionType) break;
    }
  }

  if (!propertyType) {
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const n = normalizetr(w);
      for (const [kw, val] of Object.entries(TYPE_KEYWORDS)) {
        if (w === kw || n === normalizetr(kw)) {
          propertyType = val;
          words.splice(i, 1);
          break;
        }
      }
      if (propertyType) break;
    }
  }

  const remainingText = words.filter((w) => w.length >= 2).join(" ");

  return { transactionType, propertyType, roomStr, rooms, livingRooms, remainingText };
}
