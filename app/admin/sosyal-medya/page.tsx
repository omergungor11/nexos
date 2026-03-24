import { createClient } from "@/lib/supabase/server";
import { SocialMediaGenerator } from "@/components/admin/social-media-generator";

export const metadata = {
  title: "Sosyal Medya — Admin",
};

export default async function SosyalMedyaPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, title, price, currency, type, transaction_type, area_sqm, rooms, living_rooms, city:cities(name), district:districts(name)"
    )
    .eq("is_active", true)
    .order("title");

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Veriler yüklenemedi: {error.message}</p>
      </div>
    );
  }

  type RawRow = {
    id: string;
    title: string;
    price: number;
    currency: string;
    type: string;
    transaction_type: string;
    area_sqm: number | null;
    rooms: number | null;
    living_rooms: number | null;
    city: { name: string } | null;
    district: { name: string } | null;
  };

  const rows = (data ?? []) as unknown as RawRow[];

  const properties = rows.map((row) => ({
    id: row.id,
    title: row.title,
    price: row.price,
    currency: row.currency,
    type: row.type,
    transaction_type: row.transaction_type,
    area_sqm: row.area_sqm,
    rooms: row.rooms,
    living_rooms: row.living_rooms,
    city_name: row.city?.name ?? "",
    district_name: row.district?.name ?? null,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sosyal Medya Gönderi Oluşturucu</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          İlanlarınız için Instagram ve Facebook gönderileri oluşturun.
        </p>
      </div>

      <div className="max-w-2xl">
        <SocialMediaGenerator properties={properties} />
      </div>
    </div>
  );
}
