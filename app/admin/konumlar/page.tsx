import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LocationManager } from "@/components/admin/location-manager";

export const metadata: Metadata = {
  title: "Konum Yönetimi",
};

type CityRow = {
  id: number;
  name: string;
  slug: string;
  plate_code: number | null;
};

type DistrictRow = {
  id: number;
  name: string;
  slug: string;
  city_id: number;
};

type NeighborhoodRow = {
  id: number;
  name: string;
  slug: string;
  district_id: number;
};

export default async function AdminKonumlarPage() {
  const supabase = await createClient();

  const [citiesResult, districtsResult, neighborhoodsResult] =
    await Promise.all([
      supabase
        .from("cities")
        .select("id, name, slug, plate_code")
        .order("name", { ascending: true }),
      supabase
        .from("districts")
        .select("id, name, slug, city_id")
        .order("name", { ascending: true }),
      supabase
        .from("neighborhoods")
        .select("id, name, slug, district_id")
        .order("name", { ascending: true }),
    ]);

  const cities = (citiesResult.data ?? []) as CityRow[];
  const districts = (districtsResult.data ?? []) as DistrictRow[];
  const neighborhoods = (neighborhoodsResult.data ?? []) as NeighborhoodRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Konum Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-500">
          {cities.length} il, {districts.length} ilçe, {neighborhoods.length}{" "}
          mahalle
        </p>
      </div>

      {/* Manager component */}
      <LocationManager
        initialCities={cities}
        initialDistricts={districts}
        initialNeighborhoods={neighborhoods}
      />
    </div>
  );
}
