import { MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardCityDistributionProps {
  data: { city_name: string; count: number }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardCityDistribution({
  data,
}: DashboardCityDistributionProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const max = sorted[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <CardTitle>Bölge Dağılımı</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Henüz bölge verisi bulunmuyor.
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((item) => {
              const pct = Math.round((item.count / max) * 100);

              return (
                <li key={item.city_name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {item.city_name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={item.count}
                      aria-valuemin={0}
                      aria-valuemax={max}
                      aria-label={`${item.city_name}: ${item.count} ilan`}
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
