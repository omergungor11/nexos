"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const t = useTranslations("footer");

  const emlakLinks = [
    { href: "/emlak?islem=satilik", tKey: "forSale" as const },
    { href: "/emlak?islem=kiralik", tKey: "forRent" as const },
    { href: "/emlak?tip=villa", tKey: "villa" as const },
    { href: "/emlak?tip=apartment", tKey: "apartment" as const },
    { href: "/emlak?tip=land", tKey: "land" as const },
  ];

  const kurumsalLinks = [
    { href: "/hakkimizda" as const, tKey: "aboutUs" as const },
    { href: "/hizmetlerimiz" as const, tKey: "services" as const },
    { href: "/ekibimiz" as const, tKey: "team" as const },
    { href: "/blog" as const, tKey: "guide" as const },
    { href: "/iletisim" as const, tKey: "contact" as const },
    { href: "/sss" as const, tKey: "faq" as const },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 space-y-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo-trans.png"
                alt="Nexos Investment"
                width={260}
                height={72}
                className="h-14 w-auto object-contain sm:h-22"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {/* Emlak links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">
              {t("realEstate")}
            </h3>
            <ul className="space-y-2">
              {emlakLinks.map((link) => (
                <li key={link.tKey}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.tKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kurumsal links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">
              {t("corporate")}
            </h3>
            <ul className="space-y-2">
              {kurumsalLinks.map((link) => (
                <li key={link.tKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.tKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">
              {t("contactTitle")}
            </h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-3">
              <li>
                <a
                  href="https://maps.app.goo.gl/jUajHgW2DWPzDKfJA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Yeniboğaziçi, Gazimağusa-Karpaz Anayolu,<br />
                    Piri Reis Sok. No. 1, Gazimağusa, KKTC
                    <span className="block text-xs text-muted-foreground/70 mt-0.5">Salamis Otel&apos;e 500m mesafede</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+905488604030"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  +90 548 860 40 30
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@nexosinvestment.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  info@nexosinvestment.com
                </a>
              </li>
            </ul>
            {/* Social icons */}
            <div className="mt-4 flex gap-3">
              <a href="https://www.facebook.com/nexosinvestment" target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Facebook">
                <Facebook className="size-4" />
              </a>
              <a href="https://www.instagram.com/nexosinvestment" target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Instagram">
                <Instagram className="size-4" />
              </a>
              <a href="https://www.youtube.com/@nexosinvestment" target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="YouTube">
                <Youtube className="size-4" />
              </a>
              <a href="https://www.tiktok.com/@nexosinvestment" target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="TikTok">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <p className="text-xs text-muted-foreground">
            Nexos Investment &copy; 2020–{new Date().getFullYear()}{" "}
            {t("rights")}
          </p>
          <div className="flex gap-4">
            <Link
              href={"/gizlilik-politikasi" as never}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("privacy")}
            </Link>
            <Link
              href={"/kullanim-sartlari" as never}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
