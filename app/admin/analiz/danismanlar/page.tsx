import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getAgentPerformance } from "@/actions/analytics";
import { AgentPerformanceTable } from "@/components/admin/agent-performance-table";

export const metadata: Metadata = {
  title: "Danışman Performansı",
};

export default async function AdminAnalizDanismanlarPage() {
  const data = await getAgentPerformance();

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-600">
          <Users className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Danışman Performansı
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Danışman bazında ilan, görüntülenme ve talep istatistikleri
          </p>
        </div>
      </div>

      <AgentPerformanceTable data={data} />
    </div>
  );
}
