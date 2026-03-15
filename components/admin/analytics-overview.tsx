"use client";

import { useState, useTransition } from "react";
import { Eye, Users, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChartCard } from "@/components/admin/charts/area-chart-card";
import { BarChartCard } from "@/components/admin/charts/bar-chart-card";
import { PieChartCard } from "@/components/admin/charts/pie-chart-card";
import { formatPrice } from "@/lib/format";
import { getAnalyticsOverview, type AnalyticsOverview } from "@/actions/analytics";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DateRange = 7 | 30 | 90;

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  description,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AnalyticsOverview({
  initialData,
  initialDays,
}: {
  initialData: AnalyticsOverview;
  initialDays?: DateRange;
}) {
  const [days, setDays] = useState<DateRange>(initialDays ?? 30);
  const [data, setData] = useState<AnalyticsOverview>(initialData);
  const [isPending, startTransition] = useTransition();

  function handleRangeChange(newDays: DateRange) {
    if (newDays === days) return;
    setDays(newDays);
    startTransition(async () => {
      const fresh = await getAnalyticsOverview(newDays);
      setData(fresh);
    });
  }

  const rangeButtons: { label: string; value: DateRange }[] = [
    { label: "7 Gün", value: 7 },
    { label: "30 Gün", value: 30 },
    { label: "90 Gün", value: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex items-center gap-2">
        {rangeButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={days === btn.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleRangeChange(btn.value)}
            disabled={isPending}
          >
            {btn.label}
          </Button>
        ))}
        {isPending && (
          <span className="ml-2 text-xs text-muted-foreground">Yükleniyor...</span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Toplam Görüntülenme"
          value={new Intl.NumberFormat("tr-TR").format(data.totalViews)}
          icon={Eye}
          color="bg-blue-600"
          description={`Son ${days} gün`}
        />
        <KpiCard
          label="Benzersiz Ziyaretçi"
          value={new Intl.NumberFormat("tr-TR").format(data.uniqueViewers)}
          icon={Users}
          color="bg-violet-600"
          description="Tekil oturum sayısı"
        />
        <KpiCard
          label="Talep Dönüşüm Oranı"
          value={`%${data.conversionRate}`}
          icon={TrendingUp}
          color="bg-emerald-600"
          description="Görüntülenme / Talep"
        />
        <KpiCard
          label="Ortalama İlan Fiyatı"
          value={formatPrice(data.avgPrice, "TRY")}
          icon={Building2}
          color="bg-amber-500"
          description="Aktif ilanlar"
        />
      </div>

      {/* Charts — row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AreaChartCard
          title="Günlük Görüntülenme"
          description={`Son ${days} günün günlük görüntülenme trendi`}
          data={data.dailyViews as unknown as Array<Record<string, unknown>>}
          dataKey="views"
          xAxisKey="date"
          color="#3b82f6"
        />
        <BarChartCard
          title="En Çok Görüntülenen 10 İlan"
          description="Toplam görüntülenme sayısına göre"
          data={data.topProperties as unknown as Array<Record<string, unknown>>}
          dataKey="views"
          xAxisKey="name"
          color="#8b5cf6"
          layout="vertical"
          height={350}
        />
      </div>

      {/* Charts — row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PieChartCard
          title="Talep Durum Dağılımı"
          description="Dönem içindeki talep durumları"
          data={data.requestStatusCounts}
        />
        <BarChartCard
          title="Aylık İlan Ekleme Trendi"
          description="Son 12 ayda eklenen ilan sayısı"
          data={data.monthlyListings as unknown as Array<Record<string, unknown>>}
          dataKey="count"
          xAxisKey="month"
          color="#10b981"
        />
      </div>
    </div>
  );
}
