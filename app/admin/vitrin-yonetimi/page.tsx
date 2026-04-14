import { Sparkles } from "lucide-react";
import { getHighlightedProperties } from "@/actions/property-highlights";
import { HighlightManager } from "@/components/admin/highlight-manager";

export const metadata = {
  title: "Vitrin Yönetimi — Admin",
};

// Force fresh data on every request (admin lists shouldn't cache).
export const dynamic = "force-dynamic";

export default async function VitrinYonetimiPage() {
  const result = await getHighlightedProperties();

  if (result.error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Veriler yüklenemedi: {result.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="size-5 text-primary" />
          Vitrin Yönetimi
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Anasayfa slider'ı, öne çıkan ilanlar, vitrin sayfası ve fırsat
          ilanları için ilan seçimi ve sıralaması.
        </p>
      </div>

      <HighlightManager initialProperties={result.data ?? []} />
    </div>
  );
}
