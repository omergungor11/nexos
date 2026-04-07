"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, isNavChildGroup } from "@/lib/constants";
import type { NavItem } from "@/lib/constants";
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
          {NAV_LINKS.map((link) =>
            link.children ? (
              <DesktopDropdown key={link.tKey} item={link} t={t} />
            ) : (
              <Link
                key={link.tKey}
                href={link.href as never}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.tKey)}
              </Link>
            )
          )}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <a
            href="tel:+905488604030"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground min-[1300px]:flex"
          >
            <Phone className="h-4 w-4" />
            +90 548 860 40 30
          </a>
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
                  {NAV_LINKS.map((link) =>
                    link.children ? (
                      <MobileDropdown
                        key={link.tKey}
                        item={link}
                        t={t}
                        onClose={() => setOpen(false)}
                      />
                    ) : (
                      <Link
                        key={link.tKey}
                        href={link.href as never}
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {t(link.tKey)}
                      </Link>
                    )
                  )}
                  <HrSeparator className="my-2" />
                  <a
                    href="tel:+905488604030"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                  >
                    <Phone className="h-4 w-4" />
                    +90 548 860 40 30
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

/* ─── Desktop Dropdown ──────────────────────────────────────────────────── */

function DesktopDropdown({
  item,
  t,
}: {
  item: NavItem;
  t: ReturnType<typeof useTranslations>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        {t(item.tKey)}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div role="menu" className="absolute left-0 top-full z-50 mt-1 min-w-[180px] animate-in fade-in slide-in-from-top-1 rounded-xl border bg-background/95 p-1.5 shadow-lg backdrop-blur">
          {item.children!.map((child) =>
            isNavChildGroup(child) ? (
              <div key={child.groupTKey}>
                <div className="mt-1.5 mb-1 border-t pt-1.5 px-3">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {t(child.groupTKey)}
                  </span>
                </div>
                {child.items.map((sub) => (
                  <Link
                    key={sub.tKey}
                    href={sub.href as never}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {t(sub.tKey)}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={child.tKey}
                href={child.href as never}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {t(child.tKey)}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile Dropdown (accordion style) ─────────────────────────────────── */

function MobileDropdown({
  item,
  t,
  onClose,
}: {
  item: NavItem;
  t: ReturnType<typeof useTranslations>;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        aria-expanded={expanded}
        aria-haspopup="true"
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        {t(item.tKey)}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="ml-3 flex flex-col gap-0.5 border-l pl-2">
          {item.children!.map((child) =>
            isNavChildGroup(child) ? (
              <div key={child.groupTKey} className="mt-1">
                <span className="px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {t(child.groupTKey)}
                </span>
                {child.items.map((sub) => (
                  <Link
                    key={sub.tKey}
                    href={sub.href as never}
                    onClick={onClose}
                    className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {t(sub.tKey)}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={child.tKey}
                href={child.href as never}
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {t(child.tKey)}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

function HrSeparator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}
