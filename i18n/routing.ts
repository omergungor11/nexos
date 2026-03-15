import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/emlak": {
      tr: "/emlak",
      en: "/properties",
      ru: "/nedvizhimost",
      fa: "/emlak",
      de: "/immobilien",
    },
    "/emlak/[slug]": {
      tr: "/emlak/[slug]",
      en: "/properties/[slug]",
      ru: "/nedvizhimost/[slug]",
      fa: "/emlak/[slug]",
      de: "/immobilien/[slug]",
    },
    "/harita": {
      tr: "/harita",
      en: "/map",
      ru: "/karta",
      fa: "/harita",
      de: "/karte",
    },
    "/hizmetlerimiz": {
      tr: "/hizmetlerimiz",
      en: "/services",
      ru: "/uslugi",
      fa: "/khadamat",
      de: "/dienstleistungen",
    },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/ekibimiz": {
      tr: "/ekibimiz",
      en: "/team",
      ru: "/komanda",
      fa: "/tim",
      de: "/team",
    },
    "/ekibimiz/[slug]": {
      tr: "/ekibimiz/[slug]",
      en: "/team/[slug]",
      ru: "/komanda/[slug]",
      fa: "/tim/[slug]",
      de: "/team/[slug]",
    },
    "/hakkimizda": {
      tr: "/hakkimizda",
      en: "/about",
      ru: "/o-nas",
      fa: "/darbare-ma",
      de: "/ueber-uns",
    },
    "/sss": {
      tr: "/sss",
      en: "/faq",
      ru: "/voprosy",
      fa: "/soalat",
      de: "/faq",
    },
    "/iletisim": {
      tr: "/iletisim",
      en: "/contact",
      ru: "/kontakty",
      fa: "/tamas",
      de: "/kontakt",
    },
    "/favoriler": {
      tr: "/favoriler",
      en: "/favorites",
      ru: "/izbrannoe",
      fa: "/morede-alaqe",
      de: "/favoriten",
    },
    "/karsilastir": {
      tr: "/karsilastir",
      en: "/compare",
      ru: "/sravnenie",
      fa: "/moqayese",
      de: "/vergleichen",
    },
    "/giris": {
      tr: "/giris",
      en: "/login",
      ru: "/vhod",
      fa: "/vorud",
      de: "/anmelden",
    },
    "/kayit": {
      tr: "/kayit",
      en: "/register",
      ru: "/registratsiya",
      fa: "/sabt-nam",
      de: "/registrieren",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
