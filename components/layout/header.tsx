"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-trans.png"
            alt="Nexos Investment"
            width={300}
            height={80}
            className="h-28 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.tKey}
              href={link.href as never}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.tKey)}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <a
            href="tel:+905551234567"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Phone className="h-4 w-4" />
            0555 123 45 67
          </a>
          <Link href="/iletisim" className={buttonVariants({ size: "sm" })}>
            {t("nav.contactUs")}
          </Link>
        </div>

        {/* Mobile Menu */}
        <div ref={menuRef} className="relative md:hidden">
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">{t("nav.menu")}</span>
            </Button>
          </div>

          {open && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              {/* Floating card */}
              <div className="absolute right-0 top-full z-50 mt-2 w-64 animate-in fade-in slide-in-from-top-2 rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur">
                <nav className="flex flex-col gap-0.5">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.tKey}
                      href={link.href as never}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {t(link.tKey)}
                    </Link>
                  ))}
                  <HrSeparator className="my-2" />
                  <a
                    href="tel:+905551234567"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                  >
                    <Phone className="h-4 w-4" />
                    0555 123 45 67
                  </a>
                  <Link
                    href="/iletisim"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants(), "mt-1 rounded-xl")}
                  >
                    {t("nav.contactUs")}
                  </Link>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HrSeparator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}
