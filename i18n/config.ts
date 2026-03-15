export const locales = ["tr", "en", "ru", "fa", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ru: "Русский",
  fa: "فارسی",
  de: "Deutsch",
};

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  tr: "ltr",
  en: "ltr",
  ru: "ltr",
  fa: "rtl",
  de: "ltr",
};
