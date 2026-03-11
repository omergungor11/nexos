"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  MessageSquare,
  FileText,
  Settings,
  MapPin,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/ilanlar",
    label: "İlanlar",
    icon: Building2,
    exact: false,
  },
  {
    href: "/admin/danismanlar",
    label: "Danışmanlar",
    icon: Users,
    exact: false,
  },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: BookOpen,
    exact: false,
  },
  {
    href: "/admin/talepler",
    label: "Talepler",
    icon: MessageSquare,
    exact: false,
  },
  {
    href: "/admin/sayfalar",
    label: "Sayfalar",
    icon: FileText,
    exact: false,
  },
  {
    href: "/admin/konumlar",
    label: "Konumlar",
    icon: MapPin,
    exact: false,
  },
  {
    href: "/admin/ayarlar",
    label: "Ayarlar",
    icon: Settings,
    exact: false,
  },
] as const;

interface AdminLayoutProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}

export function AdminLayout({
  children,
  adminName,
  adminEmail,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentPageLabel = () => {
    const match = [...NAV_ITEMS]
      .reverse()
      .find((item) => isActive(item.href, item.exact));
    return match?.label ?? "Admin";
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/giris");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2"
          onClick={() => setSidebarOpen(false)}
        >
          <Image
            src="/logo-square.jpeg"
            alt="Nexos"
            width={32}
            height={32}
            className="size-8 rounded"
          />
          <span className="text-lg font-semibold text-white">
            Nexos{" "}
            <span className="text-sm font-normal text-slate-400">Admin</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  {item.label}
                  {active && (
                    <ChevronRight className="ml-auto size-3.5 text-blue-300" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getInitials(adminName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {adminName}
            </p>
            <p className="truncate text-xs text-slate-400">{adminEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-50"
        >
          <LogOut className="size-4 shrink-0" />
          {loggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop always visible, mobile slides in */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Yönetim paneli gezinme"
      >
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu className="size-5" />
            </Button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <span>Yönetim</span>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-slate-900">
                {getCurrentPageLabel()}
              </span>
            </div>
          </div>

          {/* Right side: avatar + logout shortcut on desktop */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 lg:flex">
              <Avatar size="sm">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {getInitials(adminName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">
                {adminName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Çıkış Yap"
              aria-label="Çıkış Yap"
              className="text-slate-500 hover:text-slate-900"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
