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
    { href: "/ekibimiz", label: "Ekibimiz" },
    { href: "/blog", label: "Blog" },
    { href: "/iletisim", label: "İletişim" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                N
              </div>
              <span className="text-xl font-bold tracking-tight">NexOS</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Profesyonel emlak danışmanlığı ile hayalinizdeki mülke ulaşmanızı
              sağlıyoruz.
            </p>
          </div>

          {/* Property Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Emlak</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.emlak.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Corporate Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Kurumsal</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.kurumsal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Atatürk Cad. No:123, Merkez, İstanbul</span>
              </li>
              <li>
                <a
                  href="tel:+905551234567"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  0555 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@nexos.com.tr"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  info@nexos.com.tr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NexOS Emlak. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <Link
              href="/gizlilik-politikasi"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="/kullanim-sartlari"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
