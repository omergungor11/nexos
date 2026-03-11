const EXCHANGE_RATES: Record<string, number> = {
  TRY: 1,
  USD: parseFloat(process.env.EXCHANGE_RATE_USD ?? "0.028"),
  EUR: parseFloat(process.env.EXCHANGE_RATE_EUR ?? "0.026"),
};

/**
 * Converts a price amount from one currency to another.
 * Conversion goes through TRY as the base currency.
 */
export function convertPrice(amount: number, from: string, to: string): number {
  const fromRate = EXCHANGE_RATES[from] ?? 1;
  const toRate = EXCHANGE_RATES[to] ?? 1;
  const inTRY = amount / fromRate;
  return inTRY * toRate;
}

const CURRENCY_CODE_MAP: Record<string, string> = {
  TRY: "TRY",
  USD: "USD",
  EUR: "EUR",
};

/**
 * Formats a price with its currency symbol using Turkish locale conventions.
 * Falls back to TRY if the currency code is not recognised.
 */
export function formatPriceWithCurrency(
  amount: number,
  currency: string
): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: CURRENCY_CODE_MAP[currency] ?? "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns the list of supported currency codes.
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES);
}
