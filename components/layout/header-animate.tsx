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
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { motion, AnimatePresence } from "motion/react";

// ---------------------------------------------------------------------------
// Stagger animation variants
// ---------------------------------------------------------------------------

// Stagger delay per nav index
function navDelay(i: number) {
  return { delay: 0.05 * i, duration: 0.4, ease: "easeOut" as const };
}

// ---------------------------------------------------------------------------
// Main Header
// ---------------------------------------------------------------------------

export function HeaderAnimate() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Scroll detection for header glass effect
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-sm border-border/50"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link, i) =>
            link.children ? (
              <motion.div
                key={link.tKey}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={navDelay(i)}
              >
                <DesktopDropdown item={link} t={t} />
              </motion.div>
            ) : (
              <motion.div
                key={link.tKey}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={navDelay(i)}
              >
                <Link
                  href={link.href as never}
                  className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
                >
                  {t(link.tKey)}
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-hover:w-3/4" />
                </Link>
              </motion.div>
            )
          )}
        </nav>

        {/* Desktop CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden items-center gap-3 md:flex"
        >
          <ThemeSwitcher />
          <LanguageSwitcher />
          <a
            href="tel:+905488604030"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-[1300px]:flex"
          >
            <Phone className="h-4 w-4" />
            +90 548 860 40 30
          </a>
        </motion.div>

        {/* Mobile Menu */}
        <div ref={menuRef} className="relative md:hidden">
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">{t("nav.menu")}</span>
            </Button>
          </div>

          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur"
                >
                  <nav className="flex flex-col gap-0.5">
                    {NAV_LINKS.map((link, i) =>
                      link.children ? (
                        <motion.div
                          key={link.tKey}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                        >
                          <MobileDropdown item={link} t={t} onClose={() => setOpen(false)} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={link.tKey}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                        >
                          <Link
                            href={link.href as never}
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            {t(link.tKey)}
                          </Link>
                        </motion.div>
                      )
                    )}
                    <div className="my-2 h-px bg-border" />
                    <a href="tel:+905488604030" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent">
                      <Phone className="h-4 w-4" />
                      +90 548 860 40 30
                    </a>
                    <Link href="/iletisim" onClick={() => setOpen(false)} className="mt-1 flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      {t("nav.contactUs")}
                    </Link>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

/* ─── Desktop Dropdown ─────────────────────────────────────────��────────── */

function DesktopDropdown({ item, t }: { item: NavItem; t: ReturnType<typeof useTranslations> }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleEnter() { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsOpen(true); }
  function handleLeave() { timeoutRef.current = setTimeout(() => setIsOpen(false), 150); }

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        aria-expanded={isOpen}
        className="relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {t(item.tKey)}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
        <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-hover:w-3/4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="menu"
            className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border bg-background/95 p-1.5 shadow-lg backdrop-blur"
          >
            {item.children!.map((child, ci) =>
              isNavChildGroup(child) ? (
                <div key={child.groupTKey}>
                  <div className="mt-1.5 mb-1 border-t pt-1.5 px-3">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {t(child.groupTKey)}
                    </span>
                  </div>
                  {child.items.map((sub, si) => (
                    <motion.div
                      key={sub.tKey}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * (ci + si) }}
                    >
                      <Link
                        href={sub.href as never}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {t(sub.tKey)}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  key={child.tKey}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * ci }}
                >
                  <Link
                    href={child.href as never}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {t(child.tKey)}
                  </Link>
                </motion.div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile Dropdown ─────────────────────────────────────────────────── */

function MobileDropdown({ item, t, onClose }: { item: NavItem; t: ReturnType<typeof useTranslations>; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        {t(item.tKey)}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden ml-3 border-l pl-2"
          >
            <div className="flex flex-col gap-0.5 py-0.5">
              {item.children!.map((child) =>
                isNavChildGroup(child) ? (
                  <div key={child.groupTKey} className="mt-1">
                    <span className="px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {t(child.groupTKey)}
                    </span>
                    {child.items.map((sub) => (
                      <Link key={sub.tKey} href={sub.href as never} onClick={onClose} className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                        {t(sub.tKey)}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link key={child.tKey} href={child.href as never} onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                    {t(child.tKey)}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
