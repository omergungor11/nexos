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
    },
    "/emlak/[slug]": {
      tr: "/emlak/[slug]",
      en: "/properties/[slug]",
    },
    "/harita": {
      tr: "/harita",
      en: "/map",
    },
    "/hizmetlerimiz": {
      tr: "/hizmetlerimiz",
      en: "/services",
    },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/ekibimiz": {
      tr: "/ekibimiz",
      en: "/team",
    },
    "/ekibimiz/[slug]": {
      tr: "/ekibimiz/[slug]",
      en: "/team/[slug]",
    },
    "/hakkimizda": {
      tr: "/hakkimizda",
      en: "/about",
    },
    "/sss": {
      tr: "/sss",
      en: "/faq",
    },
    "/iletisim": {
      tr: "/iletisim",
      en: "/contact",
    },
    "/favoriler": {
      tr: "/favoriler",
      en: "/favorites",
    },
    "/karsilastir": {
      tr: "/karsilastir",
      en: "/compare",
    },
    "/giris": {
      tr: "/giris",
      en: "/login",
    },
    "/kayit": {
      tr: "/kayit",
      en: "/register",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
