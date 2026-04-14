import { createClient } from "@/lib/supabase/server";
import type {
  PropertyShowcase,
  ShowcaseListRow,
  ShowcaseWithProperties,
} from "@/types/showcase";
import type { PropertyListItem } from "@/types";

// ---------------------------------------------------------------------------
// Select shapes
// ---------------------------------------------------------------------------

const SHOWCASE_BASE_FIELDS = `
  id, slug, title, description,
  customer_name, customer_phone,
  agent_id, created_by,
  view_count, first_viewed_at, last_viewed_at,
  expires_at, is_archived,
  created_at, updated_at
`;

// Same shape PROPERTY_LIST_SELECT exposes for cards. Kept inline so this
// file is self-contained (no cross-import from properties.ts).
const SHOWCASE_PROPERTY_FIELDS = `
  id, slug, title, price, currency, type, transaction_type,
  area_sqm, rooms, living_rooms, floor, is_featured, views_count,
  status, listing_number,
  city:cities(id, name, slug),
  district:districts(id, name, slug),
  images:property_images(url, alt_text, sort_order, is_cover)
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ShowcaseImageRow {
  url: string;
  alt_text: string | null;
  is_cover: boolean;
  sort_order?: number | null;
}

interface RawShowcaseProperty {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: PropertyListItem["currency"];
  type: PropertyListItem["type"];
  transaction_type: PropertyListItem["transaction_type"];
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  floor: number | null;
  is_featured: boolean;
  views_count: number;
  status: PropertyListItem["status"];
  listing_number: number | null;
  city: PropertyListItem["city"];
  district: PropertyListItem["district"];
  images: ShowcaseImageRow[] | null;
}

function mapPropertyRow(raw: RawShowcaseProperty): PropertyListItem {
  const sorted = [...(raw.images ?? [])].sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    price: raw.price as number,
    currency: raw.currency,
    type: raw.type,
    transaction_type: raw.transaction_type,
    area_sqm: raw.area_sqm,
    rooms: raw.rooms,
    living_rooms: raw.living_rooms,
    floor: raw.floor,
    is_featured: raw.is_featured,
    views_count: raw.views_count,
    status: raw.status,
    listing_number: raw.listing_number ?? 0,
    city: raw.city,
    district: raw.district,
    cover_image: sorted[0]?.url ?? null,
    images: sorted
      .slice(0, 8)
      .map((img) => ({ url: img.url, alt_text: img.alt_text })),
  };
}

// ---------------------------------------------------------------------------
// getShowcases — admin list
// ---------------------------------------------------------------------------

export async function getShowcases(): Promise<{
  data: ShowcaseListRow[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_showcases")
    .select(`${SHOWCASE_BASE_FIELDS}, items:property_showcase_items(showcase_id)`)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const rows = (data ?? []) as unknown as Array<
    PropertyShowcase & { items: { showcase_id: string }[] | null }
  >;

  return {
    data: rows.map((r) => ({
      ...r,
      property_count: r.items?.length ?? 0,
    })),
  };
}

// ---------------------------------------------------------------------------
// getShowcaseById — admin edit fetch
// ---------------------------------------------------------------------------

export async function getShowcaseById(id: string): Promise<{
  data: (PropertyShowcase & { property_ids: string[] }) | null;
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_showcases")
    .select(
      `${SHOWCASE_BASE_FIELDS}, items:property_showcase_items(property_id, sort_order)`
    )
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null };

  const row = data as unknown as PropertyShowcase & {
    items: { property_id: string; sort_order: number }[] | null;
  };

  const propertyIds = (row.items ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((it) => it.property_id);

  return {
    data: {
      ...row,
      property_ids: propertyIds,
    },
  };
}

// ---------------------------------------------------------------------------
// getShowcaseBySlug — public landing fetch (RLS handles expiry/archive)
// ---------------------------------------------------------------------------

export async function getShowcaseBySlug(slug: string): Promise<{
  data: ShowcaseWithProperties | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: showcaseRow, error: showcaseErr } = await supabase
    .from("property_showcases")
    .select(
      `${SHOWCASE_BASE_FIELDS},
       agent:agents(id, name, phone, photo_url),
       items:property_showcase_items(property_id, sort_order)`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (showcaseErr) return { data: null, error: showcaseErr.message };
  if (!showcaseRow) return { data: null };

  const row = showcaseRow as unknown as PropertyShowcase & {
    agent: ShowcaseWithProperties["agent"];
    items: { property_id: string; sort_order: number }[] | null;
  };

  const orderedIds = (row.items ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.property_id);

  if (orderedIds.length === 0) {
    return {
      data: {
        ...row,
        agent: row.agent,
        properties: [],
      },
    };
  }

  const { data: propRows, error: propErr } = await supabase
    .from("properties")
    .select(SHOWCASE_PROPERTY_FIELDS)
    .in("id", orderedIds)
    .eq("is_active", true);

  if (propErr) return { data: null, error: propErr.message };

  const byId = new Map<string, PropertyListItem>();
  for (const p of (propRows ?? []) as unknown as RawShowcaseProperty[]) {
    byId.set(p.id, mapPropertyRow(p));
  }

  const properties = orderedIds
    .map((id) => byId.get(id))
    .filter((p): p is PropertyListItem => p !== undefined);

  return {
    data: {
      ...row,
      agent: row.agent,
      properties,
    },
  };
}

// ---------------------------------------------------------------------------
// getPropertiesForPicker — slim list used by the admin multi-picker
// ---------------------------------------------------------------------------

export interface PickerProperty {
  id: string;
  listing_number: number;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  city_name: string;
  district_name: string | null;
  cover_image: string | null;
}

export async function getPropertiesForPicker(): Promise<PickerProperty[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      `id, listing_number, slug, title, price, currency, type, transaction_type,
       area_sqm, rooms,
       city:cities(name),
       district:districts(name),
       images:property_images(url, is_cover)`
    )
    .eq("is_active", true)
    .order("listing_number", { ascending: false })
    .limit(500);

  if (error || !data) return [];

  type Raw = {
    id: string;
    listing_number: number | null;
    slug: string;
    title: string;
    price: number | null;
    currency: string;
    type: string;
    transaction_type: string;
    area_sqm: number | null;
    rooms: number | null;
    city: { name: string } | null;
    district: { name: string } | null;
    images: { url: string; is_cover: boolean }[] | null;
  };

  return (data as unknown as Raw[]).map((r) => ({
    id: r.id,
    listing_number: r.listing_number ?? 0,
    slug: r.slug,
    title: r.title,
    price: r.price,
    currency: r.currency,
    type: r.type,
    transaction_type: r.transaction_type,
    area_sqm: r.area_sqm,
    rooms: r.rooms,
    city_name: r.city?.name ?? "",
    district_name: r.district?.name ?? null,
    cover_image:
      (r.images ?? []).find((i) => i.is_cover)?.url ??
      (r.images ?? [])[0]?.url ??
      null,
  }));
}
