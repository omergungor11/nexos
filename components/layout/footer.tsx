"use client";

import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
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
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{t("location")}</span>
              </li>
              <li>
                <a
                  href="tel:+905551234567"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  0555 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@nexos.com.tr"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  info@nexos.com.tr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <p className="text-xs text-muted-foreground">
            Nexos Investment &copy; {new Date().getFullYear()}{" "}
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
