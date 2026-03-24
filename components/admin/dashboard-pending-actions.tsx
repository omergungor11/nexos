import Link from "next/link";
import { MessageSquare, Clock, EyeOff, FileEdit, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardPendingActionsProps {
  newContacts: number;
  inProgressContacts: number;
  inactiveProperties: number;
  draftBlogPosts: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

interface ActionConfig {
  label: string;
  icon: React.ElementType;
  href: string;
  activeBg: string;
  activeIcon: string;
  activeText: string;
}

const ACTIONS: ActionConfig[] = [
  {
    label: "Yeni Talepler",
    icon: MessageSquare,
    href: "/admin/talepler",
    activeBg: "bg-amber-50",
    activeIcon: "text-amber-600",
    activeText: "text-amber-700",
  },
  {
    label: "İşlemdeki Talepler",
    icon: Clock,
    href: "/admin/talepler",
    activeBg: "bg-blue-50",
    activeIcon: "text-blue-600",
    activeText: "text-blue-700",
  },
  {
    label: "Pasif İlanlar",
    icon: EyeOff,
    href: "/admin/ilanlar",
    activeBg: "bg-rose-50",
    activeIcon: "text-rose-600",
    activeText: "text-rose-700",
  },
  {
    label: "Taslak Blog Yazıları",
    icon: FileEdit,
    href: "/admin/blog",
    activeBg: "bg-violet-50",
    activeIcon: "text-violet-600",
    activeText: "text-violet-700",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardPendingActions({
  newContacts,
  inProgressContacts,
  inactiveProperties,
  draftBlogPosts,
}: DashboardPendingActionsProps) {
  const counts = [newContacts, inProgressContacts, inactiveProperties, draftBlogPosts];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Bekleyen İşlemler</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ul className="divide-y">
          {ACTIONS.map((action, index) => {
            const count = counts[index] ?? 0;
            const isActive = count > 0;
            const Icon = action.icon;

            return (
              <li key={action.label}>
                <Link
                  href={action.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    isActive ? action.activeBg : ""
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? `${action.activeBg} ring-1 ring-inset ring-foreground/5`
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`size-4 ${
                        isActive ? action.activeIcon : "text-muted-foreground/50"
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`flex-1 text-sm font-medium ${
                      isActive ? action.activeText : "text-muted-foreground"
                    }`}
                  >
                    {action.label}
                  </span>

                  {/* Count + arrow */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`tabular-nums text-sm font-semibold ${
                        isActive ? action.activeText : "text-muted-foreground/50"
                      }`}
                    >
                      {count}
                    </span>
                    <ArrowRight
                      className={`size-3.5 ${
                        isActive
                          ? `${action.activeIcon} opacity-60`
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
