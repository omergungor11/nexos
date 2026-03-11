import { AgentForm } from "@/components/admin/agent-form";

export const metadata = {
  title: "Yeni Danışman — Admin",
};

export default function YeniDanismanPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Yeni Danışman</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Yeni bir emlak danışmanı ekleyin.
        </p>
      </div>

      <AgentForm mode="create" />
    </div>
  );
}
