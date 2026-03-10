import { createClient } from "@/lib/supabase/server";

export async function getCities() {
  const supabase = await createClient();
  return supabase
    .from("cities")
    .select("id, name, slug, plate_code")
    .eq("is_active", true)
    .order("name");
}

export async function getDistrictsByCity(citySlug: string) {
  const supabase = await createClient();

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", citySlug)
    .single();

  if (!city) return { data: [], error: null };

  return supabase
    .from("districts")
    .select("id, name, slug")
    .eq("city_id", city.id)
    .eq("is_active", true)
    .order("name");
}

export async function getNeighborhoodsByDistrict(districtSlug: string) {
  const supabase = await createClient();

  const { data: district } = await supabase
    .from("districts")
    .select("id")
    .eq("slug", districtSlug)
    .single();

  if (!district) return { data: [], error: null };

  return supabase
    .from("neighborhoods")
    .select("id, name, slug")
    .eq("district_id", district.id)
    .eq("is_active", true)
    .order("name");
}
