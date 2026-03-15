"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart3,
  Activity,
  PlusCircle,
  Search,
  UserCog,
} from "lucide-react";

interface CommandItem {
  label: string;
  href: string;
  icon: React.ElementType;
  keywords: string[];
}

const COMMANDS: CommandItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, keywords: ["ana sayfa", "panel", "dashboard"] },
  { label: "İlanlar", href: "/admin/ilanlar", icon: Building2, keywords: ["ilan", "emlak", "mülk"] },
  { label: "Yeni İlan", href: "/admin/ilanlar/yeni", icon: PlusCircle, keywords: ["yeni ilan", "ilan ekle"] },
  { label: "Danışmanlar", href: "/admin/danismanlar", icon: Users, keywords: ["danışman", "ekip", "agent"] },
  { label: "Blog", href: "/admin/blog", icon: BookOpen, keywords: ["blog", "yazı", "makale"] },
  { label: "Yeni Blog", href: "/admin/blog/yeni", icon: PlusCircle, keywords: ["yeni blog", "blog ekle"] },
  { label: "Talepler", href: "/admin/talepler", icon: MessageSquare, keywords: ["talep", "iletişim", "mesaj"] },
  { label: "Analiz", href: "/admin/analiz", icon: BarChart3, keywords: ["analiz", "istatistik", "rapor"] },
  { label: "Aktivite", href: "/admin/aktivite", icon: Activity, keywords: ["aktivite", "log", "günlük"] },
  { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: UserCog, keywords: ["kullanıcı", "admin"] },
  { label: "Ayarlar", href: "/admin/ayarlar", icon: Settings, keywords: ["ayar", "setting", "konfigürasyon"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? COMMANDS.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.keywords.some((k) => k.includes(q))
        );
      })
    : COMMANDS;

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) handleClose();
        else handleOpen();
      }

      // Escape
      if (e.key === "Escape" && open) {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleOpen, handleClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedIndex(0);
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex].href);
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-lg">
        <div className="overflow-hidden rounded-xl border bg-white shadow-2xl">
          {/* Search input */}
          <div className="flex items-center border-b px-4">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Sayfa veya işlem ara..."
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <ul className="max-h-72 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı.
              </li>
            ) : (
              filtered.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <li key={cmd.href}>
                    <button
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        index === selectedIndex
                          ? "bg-blue-50 text-blue-700"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelect(cmd.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <Icon className="size-4 shrink-0" />
                      {cmd.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <span>
              <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>{" "}
              Gezin
            </span>
            <span>
              <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[10px]">↵</kbd>{" "}
              Seç
            </span>
            <span>
              <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[10px]">ESC</kbd>{" "}
              Kapat
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
