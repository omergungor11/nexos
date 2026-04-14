// ---------------------------------------------------------------------------
// WhatsApp helper — phone normalisation + click-to-chat URL builder.
// ---------------------------------------------------------------------------

const COMPANY_DEFAULT_COUNTRY_CODE = "90"; // KKTC mobile uses TC's +90

/**
 * Normalises a free-form phone number into the digits-only E.164 form used
 * by wa.me links.
 *
 * Examples:
 *   "0533 123 45 67"   → "905331234567"
 *   "+90 533 123 4567" → "905331234567"
 *   "5331234567"       → "905331234567" (assumes default country code)
 *   "+44 7700 900123"  → "447700900123"
 *
 * Returns an empty string for input that contains no digits at all.
 */
export function normalizePhoneE164(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Strip everything but digits + leading "+"
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  // International form already (+ prefix or 00 prefix)
  if (hasPlus) return digits;
  if (digits.startsWith("00")) return digits.slice(2);

  // Local Turkish/KKTC form starting with 0 → drop the 0, prepend country
  if (digits.startsWith("0")) {
    return COMPANY_DEFAULT_COUNTRY_CODE + digits.slice(1);
  }

  // Numbers that already begin with the country code
  if (digits.startsWith(COMPANY_DEFAULT_COUNTRY_CODE)) return digits;

  // Bare 10-digit local mobile → assume default country
  return COMPANY_DEFAULT_COUNTRY_CODE + digits;
}

/**
 * Build a wa.me click-to-chat URL.
 *
 * Returns null when the phone doesn't normalise to anything sensible.
 */
export function buildWhatsAppUrl({
  phone,
  text,
}: {
  phone: string | null | undefined;
  text?: string;
}): string | null {
  const normalised = normalizePhoneE164(phone);
  if (!normalised) return null;
  const encoded = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${normalised}${encoded}`;
}

/**
 * Standard WhatsApp message used to deliver a showcase to a customer.
 * Kept short on purpose — the link is the payload.
 */
export function buildShowcaseMessage({
  customerName,
  title,
  url,
  agentName,
}: {
  customerName: string;
  title: string;
  url: string;
  agentName?: string | null;
}): string {
  const greeting = customerName.trim()
    ? `Merhaba ${customerName.trim()},`
    : "Merhaba,";
  const signature = agentName?.trim() ? `\n\n— ${agentName.trim()}` : "";
  return (
    `${greeting}\n\n` +
    `Sizin için "${title}" başlıklı ilan paketini hazırladım. ` +
    `Aşağıdaki linkten görüntüleyebilirsiniz:\n\n` +
    `${url}` +
    signature
  );
}

/**
 * Loosely validates an E.164-style phone number.
 * Accepts 8-15 digits — Wikipedia's E.164 max length is 15.
 */
export function isValidPhone(raw: string | null | undefined): boolean {
  const n = normalizePhoneE164(raw);
  return /^[1-9]\d{7,14}$/.test(n);
}
