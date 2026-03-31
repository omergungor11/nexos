import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsPage } from "@/components/admin/settings/settings-page";

export const metadata: Metadata = {
  title: "Ayarlar",
};

export default async function AdminAyarlarPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .order("category");

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value ?? "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Site ayarlarını ve tercihlerinizi yönetin.
        </p>
      </div>

      <SettingsPage settings={settings} />
    </div>
  );
}
