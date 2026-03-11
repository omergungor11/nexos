// ---------------------------------------------------------------------------
// Central type barrel — import from here throughout the app.
// ---------------------------------------------------------------------------

export * from "./property";
export * from "./filters";

// Re-export Database-level helpers so callers can use them without importing
// from types/supabase directly.
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  // Raw enum types (DB spelling)
  PropertyTypeEnum,
  TransactionTypeEnum,
  PropertyStatusEnum,
  HeatingTypeEnum,
  CurrencyEnum,
  FeatureCategoryEnum,
  ContactStatusEnum,
} from "./supabase";

// ---------------------------------------------------------------------------
// Domain types with relations
// ---------------------------------------------------------------------------

import type { Tables } from "./supabase";

// Shorthand aliases for raw DB rows — used when relation data is not needed.
export type CityRow = Tables<"cities">;
export type DistrictRow = Tables<"districts">;
export type NeighborhoodRow = Tables<"neighborhoods">;
export type AgentRow = Tables<"agents">;
export type FeatureRow = Tables<"features">;
export type PropertyRow = Tables<"properties">;
export type PropertyImageRow = Tables<"property_images">;
export type PropertyFeatureRow = Tables<"property_features">;
export type ContactRequestRow = Tables<"contact_requests">;
export type BlogPostRow = Tables<"blog_posts">;
export type PageRow = Tables<"pages">;
export type SiteSettingRow = Tables<"site_settings">;
export type FavoriteRow = Tables<"favorites">;
export type ComparisonRow = Tables<"comparisons">;

// ---------------------------------------------------------------------------
// Nested / joined domain types
// ---------------------------------------------------------------------------

/** A property record with all its relational data pre-joined. */
export type PropertyWithRelations = PropertyRow & {
  city: CityRow;
  district: DistrictRow | null;
  neighborhood: NeighborhoodRow | null;
  agent: AgentRow | null;
  images: PropertyImageRow[];
  features: FeatureRow[];
};

/** A slim property object used in list views — only the columns needed to
 *  render a card, plus a pre-resolved cover image URL. */
export type PropertyListItem = Pick<
  PropertyRow,
  | "id"
  | "slug"
  | "title"
  | "price"
  | "currency"
  | "type"
  | "transaction_type"
  | "area_sqm"
  | "rooms"
  | "living_rooms"
  | "floor"
  | "is_featured"
  | "views_count"
  | "status"
> & {
  city: Pick<CityRow, "id" | "name" | "slug">;
  district: Pick<DistrictRow, "id" | "name" | "slug"> | null;
  cover_image: string | null;
};

/** An agent record together with a summary list of their active properties. */
export type AgentWithProperties = AgentRow & {
  properties: PropertyListItem[];
};

/** A blog post that has been published — `published_at` is guaranteed
 *  non-null and `is_published` is always true. */
export type BlogPostPublished = Omit<BlogPostRow, "published_at"> & {
  published_at: string;
  is_published: true;
};

/** A contact request enriched with the related property summary and agent. */
export type ContactRequestWithProperty = ContactRequestRow & {
  property: PropertyListItem | null;
  agent: Pick<AgentRow, "id" | "name" | "email" | "phone"> | null;
};

/** A user's favorites list resolved to full property list items. */
export type FavoriteWithProperty = FavoriteRow & {
  property: PropertyListItem;
};

/** A comparison session resolved to full property list items. */
export type ComparisonWithProperties = ComparisonRow & {
  properties: PropertyWithRelations[];
};
