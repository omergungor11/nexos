import { createClient } from "@/lib/supabase/server";
import {
  MapManagementTable,
  type MapManagementRow,
} from "@/components/admin/map-management-table";

export const metadata = {
  title: "Harita Yönetimi — Admin",
};

export default async function AdminHaritaPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id, title, slug, price, currency, type, transaction_type,
      is_active, show_on_map, lat, lng,
      city:cities(name, lat, lng),
      district:districts(name, lat, lng),
      images:property_images(url, is_cover)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Veriler yüklenemedi: {error.message}</p>
      </div>
    );
  }

  const properties = (data ?? []) as unknown as MapManagementRow[];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Harita Yönetimi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Haritada gösterilecek ilanları yönetin.
        </p>
      </div>

      <MapManagementTable initialData={properties} />
    </div>
  );
}
