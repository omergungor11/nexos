import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface KpiTrend {
  value: number; // percentage change, positive = up, negative = down
  direction: "up" | "down" | "neutral";
}

export interface DashboardKpiCardProps {
  label: string;
  count: number | string;
  icon: React.ElementType;
  color: string;
  href: string;
  trend?: KpiTrend;
  suffix?: string; // e.g. "%" for conversion rate
}

export function DashboardKpiCard({
  label,
  count,
  icon: Icon,
  color,
  href,
  trend,
  suffix,
}: DashboardKpiCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold tabular-nums">
                {count}
                {suffix && (
                  <span className="ml-0.5 text-xl font-semibold text-muted-foreground">
                    {suffix}
                  </span>
                )}
              </p>
            </div>
            <div className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="size-5 text-white" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {trend ? (
              <TrendBadge trend={trend} />
            ) : (
              <span className="text-xs text-muted-foreground">Bu hafta</span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
              Tümü <ArrowRight className="size-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TrendBadge({ trend }: { trend: KpiTrend }) {
  if (trend.direction === "up") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <TrendingUp className="size-3" />
        {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`} geçen haftaya göre
      </span>
    );
  }

  if (trend.direction === "down") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-500">
        <TrendingDown className="size-3" />
        {trend.value}% geçen haftaya göre
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="size-3" />
      Değişim yok
    </span>
  );
}
