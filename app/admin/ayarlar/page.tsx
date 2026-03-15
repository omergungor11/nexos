import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Site Ayarları",
};

type SiteSettingRow = {
  key: string;
  value: string | null;
  label: string | null;
  category: string | null;
};

export default async function AdminAyarlarPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value, label, category")
    .order("category", { ascending: true })
    .order("key", { ascending: true });

  const rows = (settings ?? []) as SiteSettingRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Site Ayarları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Site genelinde geçerli olan ayarları düzenleyin.
        </p>
      </div>

      {/* Form */}
      <SettingsForm initialSettings={rows} />
    </div>
  );
}
