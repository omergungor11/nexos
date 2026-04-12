import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import {
  getAnalyticsOverview,
  getAnalyticsSummary,
} from "@/actions/analytics";
import { AnalyticsOverviewComponent } from "@/components/admin/analytics-overview";

export const metadata: Metadata = {
  title: "Analiz — Admin",
};

export default async function AdminAnalizPage() {
  const [overview, summary] = await Promise.all([
    getAnalyticsOverview(30),
    getAnalyticsSummary(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
          <BarChart3 className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analiz</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Site trafiği, ilan performansı ve talep istatistikleri
          </p>
        </div>
      </div>

      <AnalyticsOverviewComponent
        initialData={overview}
        summaryData={summary}
        initialDays={30}
      />
    </div>
  );
}
