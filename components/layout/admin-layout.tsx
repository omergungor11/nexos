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
  Settings,
  MapPin,
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Activity,
  ImageIcon,
  Tag,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/admin/notification-bell";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { CommandPalette } from "@/components/admin/command-palette";
import { useAdminShortcuts } from "@/hooks/use-admin-shortcuts";

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
    href: "/admin/galeri",
    label: "Galeri",
    icon: ImageIcon,
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
    href: "/admin/teklifler",
    label: "Teklifler",
    icon: Tag,
    exact: false,
  },
  {
    href: "/admin/sosyal-medya",
    label: "Sosyal Medya",
    icon: Share2,
    exact: false,
  },
  {
    href: "/admin/konumlar",
    label: "Konumlar",
    icon: MapPin,
    exact: false,
  },
  {
    href: "/admin/analiz",
    label: "Analiz",
    icon: BarChart3,
    exact: false,
  },
  {
    href: "/admin/aktivite",
    label: "Aktivite",
    icon: Activity,
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
  const [collapsed, setCollapsed] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  useAdminShortcuts();

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

  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo + collapse toggle */}
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
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
          {!isCollapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">
              Nexos{" "}
              <span className="text-sm font-normal text-sidebar-foreground/50">Admin</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex rounded-md p-1.5 text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          title={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-4", isCollapsed ? "px-2" : "px-3")}>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center rounded-lg text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0",
                      isCollapsed ? "size-5" : "size-4",
                      active
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                    )}
                  />
                  {!isCollapsed && item.label}
                  {!isCollapsed && active && (
                    <ChevronRight className="ml-auto size-3.5 text-sidebar-accent-foreground/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className={cn("border-t border-sidebar-border", isCollapsed ? "p-2" : "p-4")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {getInitials(adminName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {adminName}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/50">{adminEmail}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={isCollapsed ? "Çıkış Yap" : undefined}
          className={cn(
            "flex w-full items-center rounded-lg text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground disabled:pointer-events-none disabled:opacity-50",
            isCollapsed ? "justify-center p-2.5 mt-0" : "gap-2 px-3 py-2 mt-3"
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!isCollapsed && (loggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Command Palette */}
      <CommandPalette />

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
          "fixed inset-y-0 left-0 z-30 bg-sidebar transition-all duration-200 ease-in-out lg:relative lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        )}
        aria-label="Yönetim paneli gezinme"
      >
        <SidebarContent isCollapsed={collapsed && !sidebarOpen} />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 lg:px-6">
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
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Yönetim</span>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-foreground">
                {getCurrentPageLabel()}
              </span>
            </div>
          </div>

          {/* Right side: notifications + avatar + logout shortcut on desktop */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <NotificationBell />
            <div className="hidden items-center gap-2 lg:flex">
              <Avatar size="sm">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                  {getInitials(adminName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
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
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
