// ---------------------------------------------------------------------------
// Property Showcase domain types — separate from offers (custom_offers),
// which represent single-property price negotiations.
// ---------------------------------------------------------------------------

import type { PropertyListItem } from "./index";

export interface PropertyShowcase {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  customer_name: string;
  customer_phone: string;
  agent_id: string | null;
  created_by: string | null;
  view_count: number;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  expires_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseItem {
  showcase_id: string;
  property_id: string;
  sort_order: number;
}

/** Showcase enriched with the joined property list, sorted by sort_order. */
export interface ShowcaseWithProperties extends PropertyShowcase {
  properties: PropertyListItem[];
  agent: {
    id: string;
    name: string;
    phone: string | null;
    photo_url: string | null;
  } | null;
}

/** Slim row used in the admin list table. */
export interface ShowcaseListRow extends PropertyShowcase {
  property_count: number;
}

export interface ShowcaseCreateInput {
  title: string;
  description?: string | null;
  customer_name: string;
  customer_phone: string;
  agent_id?: string | null;
  expires_at?: string | null;
  property_ids: string[];
}

export type ShowcaseUpdateInput = Partial<
  Omit<ShowcaseCreateInput, "property_ids">
> & {
  property_ids?: string[];
  is_archived?: boolean;
};

export interface ShowcaseRecipient {
  customer_name: string;
  customer_phone: string;
}

// Bulk fan-out: same content, many recipients, one row + slug each.
export interface ShowcaseBulkCreateInput
  extends Omit<ShowcaseCreateInput, "customer_name" | "customer_phone"> {
  recipients: ShowcaseRecipient[];
}
