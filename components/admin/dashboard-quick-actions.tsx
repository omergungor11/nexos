import Link from "next/link";
import { PlusCircle, FileText, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const QUICK_ACTIONS = [
  {
    label: "Yeni İlan",
    description: "Yeni bir emlak ilanı ekle",
    href: "/admin/ilanlar/yeni",
    icon: PlusCircle,
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    iconColor: "text-blue-600",
    external: false,
  },
  {
    label: "Yeni Blog",
    description: "Yeni bir blog yazısı oluştur",
    href: "/admin/blog/yeni",
    icon: FileText,
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    iconColor: "text-purple-600",
    external: false,
  },
  {
    label: "Siteyi Görüntüle",
    description: "Canlı siteyi yeni sekmede aç",
    href: "/",
    icon: ExternalLink,
    color: "bg-slate-50 text-foreground hover:bg-muted",
    iconColor: "text-muted-foreground",
    external: true,
  },
] as const;

export function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${action.color}`}
            >
              <action.icon className={`size-4 ${action.iconColor}`} />
              {action.label}
              {action.external && (
                <ExternalLink className="size-3 opacity-60" />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
