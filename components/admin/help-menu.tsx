"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  PlayCircle,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HelpMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleStartTour() {
    setOpen(false);
    const start = (window as unknown as Record<string, unknown>).__startOnboardingTour;
    if (typeof start === "function") {
      (start as () => void)();
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(!open)}
        title="Yardım"
        aria-label="Yardım menüsü"
        className="text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="size-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 animate-in fade-in slide-in-from-top-1 rounded-xl border bg-background/95 p-1.5 shadow-lg backdrop-blur">
          <Link
            href="/admin/yardim"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <BookOpen className="size-4" />
            Yardım Merkezi
          </Link>
          <button
            onClick={handleStartTour}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PlayCircle className="size-4" />
            Turu Başlat
          </button>
          <div className="my-1 h-px bg-border" />
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
            <Keyboard className="size-4" />
            <span>Hızlı arama: <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd></span>
          </div>
        </div>
      )}
    </div>
  );
}
