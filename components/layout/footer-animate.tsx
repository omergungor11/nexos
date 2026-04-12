"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";
import { useRef } from "react";
import { useInView } from "motion/react";

// ---------------------------------------------------------------------------
// Animated link component
// ---------------------------------------------------------------------------

function AnimatedLink({
  href,
  children,
  delay = 0,
}: {
  href: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link
        href={href as never}
        className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="relative">
          {children}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
        </span>
      </Link>
    </motion.li>
  );
}

// ---------------------------------------------------------------------------
// Social icon with hover scale
// ---------------------------------------------------------------------------

function SocialIcon({
  href,
  label,
  children,
  delay = 0,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3, type: "spring" }}
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.9 }}
      className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export function FooterAnimate() {
  const t = useTranslations("footer");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const emlakLinks = [
    { href: "/emlak?islem=satilik", tKey: "forSale" as const },
    { href: "/emlak?islem=kiralik", tKey: "forRent" as const },
    { href: "/emlak?islem=gunluk", tKey: "dailyRental" as const },
    { href: "/emlak?tip=villa", tKey: "villa" as const },
    { href: "/emlak?tip=apartment", tKey: "apartment" as const },
    { href: "/emlak?tip=penthouse", tKey: "penthouse" as const },
    { href: "/emlak?tip=residential_land", tKey: "land" as const },
  ];

  const kurumsalLinks = [
    { href: "/hakkimizda" as const, tKey: "aboutUs" as const },
    { href: "/hizmetlerimiz" as const, tKey: "services" as const },
    { href: "/ekibimiz" as const, tKey: "team" as const },
    { href: "/blog" as const, tKey: "guide" as const },
    { href: "/projeler" as const, tKey: "projects" as const },
    { href: "/emlak-talebi" as const, tKey: "propertyRequest" as const },
    { href: "/iletisim" as const, tKey: "contact" as const },
    { href: "/sss" as const, tKey: "faq" as const },
  ];

  return (
    <footer ref={ref} className="border-t bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="col-span-2 space-y-3 lg:col-span-1"
          >
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo-trans.png"
                alt="Nexos Investment"
                width={260}
                height={72}
                className="h-20 w-auto object-contain sm:h-22"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </motion.div>

          {/* Emlak links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">{t("realEstate")}</h3>
            <ul className="space-y-2">
              {emlakLinks.map((link, i) => (
                <AnimatedLink key={link.tKey} href={link.href} delay={0.15 + i * 0.04}>
                  {t(link.tKey)}
                </AnimatedLink>
              ))}
            </ul>
          </motion.div>

          {/* Kurumsal links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">{t("corporate")}</h3>
            <ul className="space-y-2">
              {kurumsalLinks.map((link, i) => (
                <AnimatedLink key={link.tKey} href={link.href} delay={0.2 + i * 0.04}>
                  {t(link.tKey)}
                </AnimatedLink>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-2 lg:col-span-1"
          >
            <h3 className="mb-3 text-sm font-semibold sm:mb-4">{t("contactTitle")}</h3>
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
                  </span>
                </a>
              </li>
              <li>
                <a href="tel:+905488604030" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  +90 548 860 40 30
                </a>
              </li>
              <li>
                <a href="mailto:info@nexosinvestment.com" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  info@nexosinvestment.com
                </a>
              </li>
            </ul>

            {/* Social icons */}
            <div className="mt-4 flex justify-center gap-3">
              <SocialIcon href="https://www.facebook.com/nexosinvestment" label="Facebook" delay={0.35}>
                <Facebook className="size-4" />
              </SocialIcon>
              <SocialIcon href="https://www.instagram.com/nexosinvestment" label="Instagram" delay={0.4}>
                <Instagram className="size-4" />
              </SocialIcon>
              <SocialIcon href="https://www.youtube.com/@nexosinvestment" label="YouTube" delay={0.45}>
                <Youtube className="size-4" />
              </SocialIcon>
              <SocialIcon href="https://www.tiktok.com/@nexosinvestment" label="TikTok" delay={0.5}>
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z" /></svg>
              </SocialIcon>
            </div>
          </motion.div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4"
        >
          <p className="text-xs text-muted-foreground">
            Nexos Investment &copy; 2020–{new Date().getFullYear()}{" "}
            {t("rights")}
          </p>
          <div className="flex gap-4">
            <Link href={"/gizlilik-politikasi" as never} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {t("privacy")}
            </Link>
            <Link href={"/kullanim-sartlari" as never} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {t("terms")}
            </Link>
            <Link href={"/kvkk" as never} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              KVKK
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
