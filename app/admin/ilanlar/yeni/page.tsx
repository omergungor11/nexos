import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { createDraftProperty } from "@/actions/properties";
import { getCities } from "@/lib/queries/locations";

export const metadata: Metadata = {
  title: "Yeni İlan Oluştur — Admin",
};

export default async function AdminPropertyNewPage() {
  // Get the first active city as a default
  const cities = await getCities();
  const defaultCityId = cities[0]?.id ?? 1;

  // Create a draft property and redirect to its edit page
  const result = await createDraftProperty(defaultCityId);

  if (result.error || !result.data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-destructive">
          Taslak ilan oluşturulamadı: {result.error ?? "Bilinmeyen hata"}
        </p>
      </div>
    );
  }

  redirect(`/admin/ilanlar/${result.data.id}/duzenle`);
}
