import { CURRENCY_SYMBOLS } from "./constants";

export function formatPrice(price: number, currency: string = "TRY"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || "₺";
  return `${new Intl.NumberFormat("tr-TR").format(price)} ${symbol}`;
}

export function formatListingPrice(
  price: number | null | undefined,
  currency: string = "TRY",
  pricingType: string | null | undefined = "fixed"
): string {
  if (pricingType === "exchange") return "TAKASA UYGUN";
  if (pricingType === "offer") return "TEKLİF";
  if (pricingType === "kat_karsiligi") return "KAT KARŞILIĞI";
  if (price == null || price <= 0) return "Fiyat Sorunuz";
  return formatPrice(price, currency);
}

export function formatArea(area: number | null): string {
  if (!area) return "—";
  return `${new Intl.NumberFormat("tr-TR").format(area)} m²`;
}

export function formatRooms(
  rooms: number | null,
  livingRooms: number | null
): string {
  if (rooms === null) return "—";
  return `${rooms}+${livingRooms ?? 1}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return formatDate(date);
}
