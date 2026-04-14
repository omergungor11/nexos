import Link from "next/link";
import {
  PlusCircle,
  FileText,
  ExternalLink,
  Star,
  Sparkles,
  Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const QUICK_ACTIONS = [
  {
    label: "Yeni İlan",
    description: "Yeni bir emlak ilanı ekle",
    href: "/admin/ilanlar/yeni",
    icon: PlusCircle,
    color:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    iconColor: "text-primary-foreground",
    external: false,
  },
  {
    label: "Yeni Blog",
    description: "Yeni bir blog yazısı oluştur",
    href: "/admin/blog/yeni",
    icon: FileText,
    color:
      "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
    iconColor: "text-primary",
    external: false,
  },
  {
    label: "Öne Çıkar",
    description: "Öne Çıkan ilan listesini düzenle",
    href: "/admin/vitrin-yonetimi?tab=featured",
    icon: Star,
    color:
      "border border-amber-400/50 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    external: false,
  },
  {
    label: "Vitrin",
    description: "Vitrin sayfası ilan listesini düzenle",
    href: "/admin/vitrin-yonetimi?tab=showcase",
    icon: Sparkles,
    color:
      "border border-violet-400/50 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-500/30 dark:hover:bg-violet-950/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    external: false,
  },
  {
    label: "Fırsat",
    description: "Fırsat ilanları listesini düzenle",
    href: "/admin/vitrin-yonetimi?tab=deal",
    icon: Flame,
    color:
      "border border-rose-400/50 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-950/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    external: false,
  },
  {
    label: "Siteyi Görüntüle",
    description: "Canlı siteyi yeni sekmede aç",
    href: "/",
    icon: ExternalLink,
    color: "border bg-background text-foreground hover:bg-muted",
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
