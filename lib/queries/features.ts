import { createClient } from "@/lib/supabase/server";
import type { Feature, FeatureCategory } from "@/types";

// ---------------------------------------------------------------------------
// Read queries
// ---------------------------------------------------------------------------

/**
 * Returns every feature row ordered by sort_order ascending, then by name.
 * Returns an empty array when no rows exist or on error.
 */
export async function getAllFeatures(): Promise<Feature[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("features")
    .select("id, name, slug, icon, category, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getAllFeatures]", error.message);
    return [];
  }

  return (data ?? []) as Feature[];
}

/**
 * Returns features grouped by their category.
 * Categories with no features are omitted from the result.
 */
export async function getFeaturesByCategory(): Promise<
  Partial<Record<FeatureCategory, Feature[]>>
> {
  const features = await getAllFeatures();

  const grouped: Partial<Record<FeatureCategory, Feature[]>> = {};

  for (const feature of features) {
    const cat = feature.category;
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    // Non-null assertion is safe: we just initialised the array above.
    grouped[cat]!.push(feature);
  }

  return grouped;
}

/**
 * Returns the features assigned to a specific property via the
 * property_features join table.
 *
 * Supabase PostgREST resolves the nested select the same way
 * PROPERTY_DETAIL_SELECT does in properties.ts.
 */
export async function getPropertyFeatures(
  propertyId: string
): Promise<Feature[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_features")
    .select("feature:features(id, name, slug, icon, category, sort_order)")
    .eq("property_id", propertyId);

  if (error) {
    console.error("[getPropertyFeatures]", error.message);
    return [];
  }

  // data is { feature: Feature | null }[]
  const features: Feature[] = [];
  for (const row of data ?? []) {
    // The PostgREST response type for a single-object foreign key embed is
    // the object directly (not an array). Cast through unknown to satisfy TS
    // without using `any`.
    const feature = (row as unknown as { feature: Feature | null }).feature;
    if (feature !== null && feature !== undefined) {
      features.push(feature);
    }
  }

  return features.sort((a, b) => a.sort_order - b.sort_order);
}

// ---------------------------------------------------------------------------
// Write queries (admin only)
// ---------------------------------------------------------------------------

/**
 * Replaces the full set of features for a property in a two-step operation:
 *   1. Delete all existing property_features rows for the property.
 *   2. Insert the new set (skipped when featureIds is empty).
 *
 * Both operations use the same Supabase client created for the current
 * request, so they share the same auth context and RLS policies.
 *
 * @returns true on success, false when either step fails.
 */
export async function setPropertyFeatures(
  propertyId: string,
  featureIds: number[]
): Promise<boolean> {
  const supabase = await createClient();

  // Step 1 — remove all existing associations
  const { error: deleteError } = await supabase
    .from("property_features")
    .delete()
    .eq("property_id", propertyId);

  if (deleteError) {
    console.error("[setPropertyFeatures] delete failed:", deleteError.message);
    return false;
  }

  // Step 2 — insert the new set (no-op for empty arrays)
  if (featureIds.length === 0) {
    return true;
  }

  const rows = featureIds.map((featureId) => ({
    property_id: propertyId,
    feature_id: featureId,
  }));

  const { error: insertError } = await supabase
    .from("property_features")
    .insert(rows);

  if (insertError) {
    console.error("[setPropertyFeatures] insert failed:", insertError.message);
    return false;
  }

  return true;
}
