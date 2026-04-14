"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Users,
  BookOpen,
  MessageSquare,
  Settings,
  MapPin,
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BarChart3,
  Activity,
  ImageIcon,
  Tag,
  Share2,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Map,
  FolderKanban,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/admin/notification-bell";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { CommandPalette } from "@/components/admin/command-palette";
import { HelpMenu } from "@/components/admin/help-menu";
import { OnboardingTour } from "@/components/admin/onboarding-tour";
import { useAdminShortcuts } from "@/hooks/use-admin-shortcuts";

type NavChild = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact: boolean;
  children?: NavChild[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Gayrimenkul",
    items: [
      { href: "/admin/ilanlar", label: "İlanlar", icon: Building2, exact: false },
      { href: "/admin/projeler", label: "Projeler", icon: FolderKanban, exact: false },
      { href: "/admin/vitrin-yonetimi", label: "Vitrin Yönetimi", icon: Sparkles, exact: false },
      { href: "/admin/harita", label: "Harita", icon: Map, exact: false },
    ],
  },
  {
    label: "İçerik",
    items: [
      { href: "/admin/blog", label: "Blog", icon: BookOpen, exact: false },
      { href: "/admin/galeri", label: "Galeri", icon: ImageIcon, exact: false },
      { href: "/admin/sosyal-medya", label: "Sosyal Medya", icon: Share2, exact: false },
      { href: "/admin/sunumlar", label: "Sunumlar", icon: Monitor, exact: false },
    ],
  },
  {
    label: "Müşteri",
    items: [
      { href: "/admin/talepler", label: "Talepler", icon: MessageSquare, exact: false },
      { href: "/admin/emlak-talepleri", label: "Emlak Talepleri", icon: ClipboardList, exact: false },
      { href: "/admin/teklifler", label: "Teklifler", icon: Tag, exact: false },
    ],
  },
  {
    label: "Yönetim",
    items: [
      { href: "/admin/danismanlar", label: "Danışmanlar", icon: Users, exact: false },
      { href: "/admin/konumlar", label: "Konumlar", icon: MapPin, exact: false },
      { href: "/admin/analiz", label: "Analiz", icon: BarChart3, exact: false },
      { href: "/admin/aktivite", label: "Aktivite", icon: Activity, exact: false },
      { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings, exact: false },
    ],
  },
  {
    label: "",
    items: [
      { href: "/admin/yardim", label: "Yardım", icon: HelpCircle, exact: false },
    ],
  },
];

// Flat list for getCurrentPageLabel and other lookups
const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

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
      <nav className={cn("admin-scroll flex-1 overflow-y-auto py-4", isCollapsed ? "px-2" : "px-3")}>
        <div className="space-y-4">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {/* Group label */}
              {group.label && !isCollapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
              )}
              {group.label && isCollapsed && (
                <div className="mx-auto mb-1.5 h-px w-6 bg-sidebar-border" />
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  const hasChildren = item.children && item.children.length > 0;
                  const childOpen = hasChildren && active && !isCollapsed;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "group flex items-center rounded-lg text-sm font-medium transition-colors",
                          isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
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
                        {!isCollapsed && active && !hasChildren && (
                          <ChevronRight className="ml-auto size-3.5 text-sidebar-accent-foreground/60" />
                        )}
                        {!isCollapsed && hasChildren && (
                          <ChevronDown className={cn(
                            "ml-auto size-3.5 transition-transform",
                            active ? "text-sidebar-accent-foreground/60" : "text-sidebar-foreground/30"
                          )} />
                        )}
                      </Link>

                      {/* Sub-menu children */}
                      {childOpen && item.children && (
                        <ul className="mt-1 ml-4 space-y-0.5 border-l border-sidebar-border pl-3">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href || pathname.startsWith(child.href.split("?")[0]) && new URLSearchParams(child.href.split("?")[1]).get("type") === new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("type");
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={cn(
                                    "block rounded-md px-2.5 py-1.5 text-xs transition-colors",
                                    childActive
                                      ? "bg-sidebar-accent/60 font-medium text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
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
      <OnboardingTour autoStart />

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
            <HelpMenu />
            <NotificationBell />
            <Link
              href="/admin/ayarlar"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname.startsWith("/admin/ayarlar") && "bg-muted text-foreground",
              )}
              title="Ayarlar"
              aria-label="Ayarlar"
            >
              <Settings className="size-4" />
            </Link>
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
