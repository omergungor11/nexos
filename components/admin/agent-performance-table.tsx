"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpDown, UserIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BarChartCard } from "@/components/admin/charts/bar-chart-card";
import { type AgentPerformance } from "@/actions/analytics";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = keyof Pick<
  AgentPerformance,
  "propertyCount" | "totalViews" | "requestCount" | "conversionRate"
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRate(rate: number): string {
  return `%${rate.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgentPerformanceTable({
  data,
}: {
  data: AgentPerformance[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("totalViews");
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  const sortableTh = (label: string, key: SortKey) => (
    <th
      className={`${thClass} cursor-pointer select-none hover:text-foreground`}
      onClick={() => handleSort(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="size-3 opacity-60" />
      </span>
    </th>
  );

  // Chart data — top 8 by views for readability
  const chartData = [...data]
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 8)
    .map((a) => ({
      name: a.name.split(" ")[0], // first name only for chart labels
      views: a.totalViews,
    }));

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <BarChartCard
        title="Danışman Görüntülenme Karşılaştırması"
        description="Danışman bazında toplam ilan görüntülenme sayısı"
        data={chartData as unknown as Array<Record<string, unknown>>}
        dataKey="views"
        xAxisKey="name"
        color="#3b82f6"
        height={280}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danışman Performans Tablosu</CardTitle>
          <CardDescription>
            Başlıklara tıklayarak sıralama yapabilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className={thClass}>Danışman</th>
                  {sortableTh("İlan Sayısı", "propertyCount")}
                  {sortableTh("Toplam Görüntülenme", "totalViews")}
                  {sortableTh("Gelen Talep", "requestCount")}
                  {sortableTh("Dönüşüm Oranı", "conversionRate")}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {sorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      Henüz danışman verisi bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  sorted.map((agent, idx) => (
                    <tr
                      key={agent.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Agent */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-xs text-muted-foreground tabular-nums">
                            {idx + 1}
                          </span>
                          <div className="size-9 overflow-hidden rounded-full bg-muted flex shrink-0 items-center justify-center">
                            {agent.photo_url ? (
                              <Image
                                src={agent.photo_url}
                                alt={agent.name}
                                width={36}
                                height={36}
                                className="size-9 object-cover"
                              />
                            ) : (
                              <UserIcon className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium text-foreground">
                            {agent.name}
                          </span>
                        </div>
                      </td>

                      {/* Property count */}
                      <td className="px-3 py-3 tabular-nums">
                        {new Intl.NumberFormat("tr-TR").format(agent.propertyCount)}
                      </td>

                      {/* Total views */}
                      <td className="px-3 py-3 tabular-nums font-medium">
                        {new Intl.NumberFormat("tr-TR").format(agent.totalViews)}
                      </td>

                      {/* Request count */}
                      <td className="px-3 py-3 tabular-nums">
                        {new Intl.NumberFormat("tr-TR").format(agent.requestCount)}
                      </td>

                      {/* Conversion rate */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            agent.conversionRate >= 5
                              ? "bg-emerald-100 text-emerald-700"
                              : agent.conversionRate >= 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {formatRate(agent.conversionRate)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
