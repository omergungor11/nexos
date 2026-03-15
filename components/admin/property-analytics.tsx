"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AreaChartCard } from "@/components/admin/charts";
import { getPropertyAnalytics } from "@/actions/analytics";
import { Eye, MessageSquare, BarChart3 } from "lucide-react";

interface PropertyAnalyticsProps {
  propertyId: string;
}

type AnalyticsData = {
  dailyViews: Array<{ date: string; views: number }>;
  totalViews: number;
  requestCount: number;
  avgViewsInCategory: number;
} | null;

export function PropertyAnalytics({ propertyId }: PropertyAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPropertyAnalytics(propertyId).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [propertyId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Analiz verileri yükleniyor...
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Analiz verisi bulunamadı.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">İlan Analizi</h3>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2">
                <Eye className="size-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Toplam Görüntülenme</p>
                <p className="text-xl font-bold tabular-nums">{data.totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-50 p-2">
                <MessageSquare className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gelen Talep</p>
                <p className="text-xl font-bold tabular-nums">{data.requestCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-50 p-2">
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kategori Ort.</p>
                <p className="text-xl font-bold tabular-nums">{data.avgViewsInCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily views chart */}
      <AreaChartCard
        title="Son 30 Gün Görüntülenme"
        data={data.dailyViews}
        dataKey="views"
        xAxisKey="date"
        color="#3b82f6"
        height={250}
      />
    </div>
  );
}
