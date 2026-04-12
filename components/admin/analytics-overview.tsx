"use client";

import { useState, useTransition } from "react";
import {
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Building2,
  MessageSquare,
  Home,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCurveChart } from "@/components/admin/charts/animated-curve-chart";
import { BarChartCard } from "@/components/admin/charts/bar-chart-card";
import { PieChartCard } from "@/components/admin/charts/pie-chart-card";
import { formatPrice } from "@/lib/format";
import {
  getAnalyticsOverview,
  type AnalyticsOverview,
  type AnalyticsSummary,
} from "@/actions/analytics";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DateRange = 7 | 30 | 90;

// ---------------------------------------------------------------------------
// KPI Card — enhanced with trend
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  description,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground";

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
              {trend && (
                <TrendIcon className={`size-4 ${trendColor}`} />
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
            <Icon className="size-5 text-white" />
          </div>
        </div>
        {/* Decorative gradient */}
        <div className={`absolute bottom-0 left-0 h-1 w-full ${color} opacity-20`} />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Top Properties Table
// ---------------------------------------------------------------------------

function TopPropertiesTable({
  data,
}: {
  data: Array<{ name: string; views: number }>;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Veri bulunamadı
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views));

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(item.views / maxViews) * 100}%` }}
              />
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {item.views.toLocaleString("tr-TR")}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Distribution mini cards
// ---------------------------------------------------------------------------

function DistributionSection({
  title,
  data,
  colorClasses,
}: {
  title: string;
  data: Array<{ name: string; count: number }>;
  colorClasses: string[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Veri yok</p>
        ) : (
          <div className="space-y-3">
            {data.map((item, i) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={`size-2.5 shrink-0 rounded-full ${colorClasses[i % colorClasses.length]}`} />
                  <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {item.count}
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AnalyticsOverviewProps {
  initialData: AnalyticsOverview;
  summaryData: AnalyticsSummary;
  initialDays?: DateRange;
}

export function AnalyticsOverviewComponent({
  initialData,
  summaryData,
  initialDays,
}: AnalyticsOverviewProps) {
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

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

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
          <span className="ml-2 text-xs text-muted-foreground animate-pulse">Yükleniyor...</span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Toplam Görüntülenme"
          value={fmt(data.totalViews)}
          icon={Eye}
          color="bg-blue-600"
          description={`Son ${days} gün`}
          trend={data.totalViews > 0 ? "up" : "neutral"}
        />
        <KpiCard
          label="Benzersiz Ziyaretçi"
          value={fmt(data.uniqueViewers)}
          icon={Users}
          color="bg-violet-600"
          description="Tekil oturum sayısı"
          trend={data.uniqueViewers > 0 ? "up" : "neutral"}
        />
        <KpiCard
          label="Dönüşüm Oranı"
          value={`%${data.conversionRate}`}
          icon={data.conversionRate > 1 ? TrendingUp : TrendingDown}
          color="bg-emerald-600"
          description="Görüntülenme → Talep"
          trend={data.conversionRate > 1 ? "up" : data.conversionRate > 0 ? "neutral" : "down"}
        />
        <KpiCard
          label="Ort. İlan Fiyatı"
          value={formatPrice(data.avgPrice, "TRY")}
          icon={Building2}
          color="bg-amber-500"
          description="Aktif ilanlar"
          trend="neutral"
        />
      </div>

      {/* Animated curve chart — full width */}
      <AnimatedCurveChart
        title="Günlük Görüntülenme Trendi"
        description={`Son ${days} günün polinom eğrili görüntülenme grafiği`}
        data={data.dailyViews as unknown as Array<Record<string, unknown>>}
        dataKey="views"
        xAxisKey="date"
        color="#3b82f6"
        gradientFrom="#3b82f6"
        height={360}
        unit="görüntülenme"
        averageLabel="Günlük Ort"
      />

      {/* Top properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">En Çok Görüntülenen İlanlar</CardTitle>
          <CardDescription>Toplam görüntülenme sayısına göre ilk 10</CardDescription>
        </CardHeader>
        <CardContent>
          <TopPropertiesTable data={data.topProperties} />
        </CardContent>
      </Card>

      {/* Charts — row 2: Request status + Monthly listings */}
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

      {/* Distribution section — from summary data */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DistributionSection
          title="Emlak Tipi Dağılımı"
          data={summaryData.propertyTypeCounts}
          colorClasses={["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500"]}
        />
        <DistributionSection
          title="İşlem Tipi Dağılımı"
          data={summaryData.transactionTypeCounts.map((d) => ({ name: d.name, count: d.value }))}
          colorClasses={["bg-emerald-500", "bg-blue-500", "bg-amber-500"]}
        />
        <DistributionSection
          title="Şehre Göre Dağılım"
          data={summaryData.cityCounts}
          colorClasses={["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"]}
        />
      </div>
    </div>
  );
}
