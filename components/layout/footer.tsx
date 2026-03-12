import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  emlak: [
    { href: "/emlak?islem=satilik", label: "Satılık" },
    { href: "/emlak?islem=kiralik", label: "Kiralık" },
    { href: "/emlak?tip=villa", label: "Villa" },
    { href: "/emlak?tip=apartment", label: "Daire" },
    { href: "/emlak?tip=land", label: "Arsa" },
  ],
  kurumsal: [
    { href: "/hakkimizda", label: "Hakkımızda" },
    { href: "/hizmetlerimiz", label: "Hizmetlerimiz" },
    { href: "/ekibimiz", label: "Ekibimiz" },
    { href: "/blog", label: "Rehber" },
    { href: "/iletisim", label: "İletişim" },
    { href: "/sss", label: "SSS" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Mobile: compact 2-row layout */}
        {/* Desktop: 4-col grid */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {/* Brand — full width on mobile */}
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
              Profesyonel emlak danışmanlığı ile hayalinizdeki mülke ulaşmanızı
              sağlıyoruz.
            </p>
          </div>

          {/* Emlak links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">Emlak</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.emlak.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kurumsal links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">Kurumsal</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.kurumsal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">İletişim</h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>İskele, Kuzey Kıbrıs</span>
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
            &copy; {new Date().getFullYear()} NexOS Emlak. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <Link
              href="/gizlilik-politikasi"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="/kullanim-sartlari"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
