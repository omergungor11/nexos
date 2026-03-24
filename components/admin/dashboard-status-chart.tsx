"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStatusChartProps {
  data: { status: string; count: number }[];
  totalActive: number;
  totalInactive: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bar: string; text: string; bg: string }
> = {
  available: {
    label: "Müsait",
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  sold: {
    label: "Satıldı",
    bar: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  rented: {
    label: "Kiralandı",
    bar: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  reserved: {
    label: "Rezerve",
    bar: "bg-violet-500",
    text: "text-violet-700",
    bg: "bg-violet-50",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardStatusChart({
  data,
  totalActive,
  totalInactive,
}: DashboardStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>İlan Durum Dağılımı</CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              {totalActive} Aktif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-muted-foreground/40" />
              {totalInactive} Pasif
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Henüz ilan bulunmuyor.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.map((item) => {
              const config = STATUS_CONFIG[item.status] ?? {
                label: item.status,
                bar: "bg-muted-foreground",
                text: "text-muted-foreground",
                bg: "bg-muted",
              };
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <li key={item.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {config.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.count}
                      <span className="ml-1 text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={item.count}
                      aria-valuemin={0}
                      aria-valuemax={total}
                      aria-label={`${config.label}: ${item.count} ilan`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
