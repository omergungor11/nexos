import { createClient } from "@/lib/supabase/server";
import type { PropertyFilters } from "@/types";

const PROPERTY_LIST_SELECT = `
  id, slug, title, price, currency, type, transaction_type,
  area_sqm, rooms, living_rooms, floor, is_featured, views_count, created_at, listing_number,
  city:cities(id, name, slug),
  district:districts(id, name, slug),
  images:property_images(url, alt_text, sort_order, is_cover)
`;

const PROPERTY_DETAIL_SELECT = `
  *,
  city:cities(id, name, slug, lat, lng),
  district:districts(id, name, slug, lat, lng),
  neighborhood:neighborhoods(id, name, slug, lat, lng),
  agent:agents(id, name, title, slug, phone, email, photo_url),
  images:property_images(id, url, alt_text, sort_order, is_cover),
  features:property_features(feature:features(id, name, slug, icon, category)),
  price_history:property_price_history(id, old_price, new_price, currency, changed_at)
`;

const PAGE_SIZE = 20;

export async function getProperties(filters: PropertyFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT, { count: "exact" })
    .eq("is_active", true);

  // Text search
  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,address.ilike.%${filters.q}%`);
  }

  // Transaction type
  if (filters.islem) {
    const txMap: Record<string, string> = {
      satilik: "sale",
      kiralik: "rent",
      gunluk: "daily_rental",
    };
    query = query.eq("transaction_type", txMap[filters.islem] ?? filters.islem);
  }

  // Property type
  if (filters.tip?.length) {
    query = query.in("type", filters.tip);
  }

  // Location cascade
  if (filters.mahalle) {
    // Need to get neighborhood_id by slug
    const { data: nh } = await supabase
      .from("neighborhoods")
      .select("id")
      .eq("slug", filters.mahalle)
      .single();
    if (nh) query = query.eq("neighborhood_id", nh.id);
  } else if (filters.ilce) {
    const { data: d } = await supabase
      .from("districts")
      .select("id")
      .eq("slug", filters.ilce)
      .single();
    if (d) query = query.eq("district_id", d.id);
  } else if (filters.sehir) {
    const { data: c } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", filters.sehir)
      .single();
    if (c) query = query.eq("city_id", c.id);
  }

  // Price range
  if (filters.fiyat_min) query = query.gte("price", filters.fiyat_min);
  if (filters.fiyat_max) query = query.lte("price", filters.fiyat_max);

  // Area range
  if (filters.m2_min) query = query.gte("area_sqm", filters.m2_min);
  if (filters.m2_max) query = query.lte("area_sqm", filters.m2_max);

  // Room count
  if (filters.oda?.length) {
    const conditions = filters.oda
      .map((r) => {
        if (r === "studio" || r === "1+0")
          return "and(rooms.eq.1,living_rooms.eq.0)";
        if (r.endsWith("+") && !r.includes("+", 0))
          return `rooms.gte.${r.replace("+", "")}`;
        if (r === "6+") return "rooms.gte.6";
        const parts = r.split("+");
        if (parts.length === 2 && parts[0] && parts[1])
          return `and(rooms.eq.${parts[0]},living_rooms.eq.${parts[1]})`;
        return null;
      })
      .filter(Boolean);
    if (conditions.length) query = query.or(conditions.join(","));
  }

  // Floor range (use != null to allow 0)
  if (filters.kat_min != null) query = query.gte("floor", filters.kat_min);
  if (filters.kat_max != null) query = query.lte("floor", filters.kat_max);

  // Building age
  if (filters.bina_yasi_max) {
    const minYear = new Date().getFullYear() - filters.bina_yasi_max;
    query = query.gte("year_built", minYear);
  }

  // Heating
  if (filters.isitma) query = query.eq("heating_type", filters.isitma);

  // Boolean amenities
  if (filters.otopark) query = query.eq("parking", true);
  if (filters.esyali) query = query.eq("furnished", true);
  if (filters.asansor) query = query.eq("elevator", true);
  if (filters.havuz) query = query.eq("pool", true);
  if (filters.bahce) query = query.eq("garden", true);
  if (filters.guvenlik) query = query.eq("security_24_7", true);
  if (filters.balkon) query = query.gte("balcony_count", 1);

  // Status filter (for admin views)
  if (filters.durum) {
    const statusMap: Record<string, string> = {
      musait: "available",
      satildi: "sold",
      kiralandi: "rented",
      rezerve: "reserved",
    };
    query = query.eq("status", statusMap[filters.durum] ?? filters.durum);
  }

  // Featured only
  if (filters.one_cikan) query = query.eq("is_featured", true);

  // Sorting
  switch (filters.siralama) {
    case "fiyat_artan":
      query = query.order("price", { ascending: true });
      break;
    case "fiyat_azalan":
      query = query.order("price", { ascending: false });
      break;
    case "m2_artan":
      query = query.order("area_sqm", { ascending: true });
      break;
    case "m2_azalan":
      query = query.order("area_sqm", { ascending: false });
      break;
    case "cok_izlenen":
      query = query.order("views_count", { ascending: false });
      break;
    case "eski":
      query = query.order("created_at", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const page = filters.sayfa ?? 1;
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  return query;
}

export async function getPropertyBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
}

export async function getFeaturedProperties(limit = 6) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getSliderProperties(limit = 8) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT)
    .eq("is_active", true)
    .eq("is_slider", true)
    .order("slider_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getShowcaseProperties(limit = 50) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT)
    .eq("is_active", true)
    .eq("is_showcase", true)
    .order("showcase_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getRecentProperties(limit = 8) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getRelatedProperties(
  propertyId: string,
  cityId: number,
  type: string,
  limit = 4
) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT)
    .eq("is_active", true)
    .eq("city_id", cityId)
    .eq("type", type)
    .neq("id", propertyId)
    .limit(limit);
}

export async function getPropertyCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  return count ?? 0;
}

export async function getPropertiesByAgent(agentId: string, limit = 20) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT)
    .eq("is_active", true)
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getDealProperties(limit = 4) {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select(PROPERTY_LIST_SELECT)
    .eq("is_active", true)
    .eq("is_deal", true)
    .order("deal_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getPropertyTypeCounts() {
  const supabase = await createClient();
  return supabase.from("properties").select("type").eq("is_active", true);
}

export async function getPropertyCityCounts() {
  const supabase = await createClient();
  return supabase
    .from("properties")
    .select("city_id, city:cities(name, slug)")
    .eq("is_active", true);
}
