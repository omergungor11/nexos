// Property-related TypeScript types

export type TransactionType = "sale" | "rent";
export type PropertyType =
  | "apartment"
  | "villa"
  | "detached"
  | "land"
  | "office"
  | "shop"
  | "warehouse";
export type PropertyStatus = "available" | "sold" | "rented" | "reserved";
export type HeatingType =
  | "none"
  | "central"
  | "natural_gas"
  | "floor_heating"
  | "electric"
  | "solar"
  | "coal"
  | "air_condition";
export type Currency = "TRY" | "USD" | "EUR";
export type FeatureCategory =
  | "interior"
  | "exterior"
  | "building"
  | "neighborhood"
  | "accessibility";
export type ContactStatus = "new" | "in_progress" | "resolved" | "spam";

export interface City {
  id: number;
  name: string;
  slug: string;
  plate_code: number | null;
  is_active: boolean;
}

export interface District {
  id: number;
  city_id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Neighborhood {
  id: number;
  district_id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Agent {
  id: string;
  name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Feature {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  category: FeatureCategory;
  sort_order: number;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  currency: Currency;
  type: PropertyType;
  status: PropertyStatus;
  transaction_type: TransactionType;
  area_sqm: number | null;
  gross_area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  year_built: number | null;
  heating_type: HeatingType;
  parking: boolean;
  furnished: boolean;
  balcony_count: number;
  elevator: boolean;
  pool: boolean;
  garden: boolean;
  security_24_7: boolean;
  lat: number | null;
  lng: number | null;
  address: string | null;
  city_id: number;
  district_id: number | null;
  neighborhood_id: number | null;
  agent_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithRelations extends Property {
  city: City;
  district: District | null;
  neighborhood: Neighborhood | null;
  agent: Agent | null;
  images: PropertyImage[];
  features: Feature[];
}

export interface PropertyListItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: Currency;
  type: PropertyType;
  transaction_type: TransactionType;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  floor: number | null;
  is_featured: boolean;
  views_count: number;
  city: Pick<City, "id" | "name" | "slug">;
  district: Pick<District, "id" | "name" | "slug"> | null;
  cover_image: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author: string;
  published_at: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  views_count: number;
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
}

export interface ContactRequest {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  property_id: string | null;
  agent_id: string | null;
  status: ContactStatus;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string | null;
  value_type: string;
  label: string | null;
}
