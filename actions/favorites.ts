"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFavorite(propertyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, property_id: propertyId });

  if (error) {
    if (error.code === "23505") {
      return { error: "Zaten favorilerde" };
    }
    console.error("addFavorite error:", error);
    return { error: "Favori eklenemedi" };
  }

  revalidatePath("/favoriler");
  return { success: true };
}

export async function removeFavorite(propertyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", propertyId);

  if (error) {
    console.error("removeFavorite error:", error);
    return { error: "Favori kaldırılamadı" };
  }

  revalidatePath("/favoriler");
  return { success: true };
}

export async function getFavorites() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      property_id,
      created_at,
      property:properties(
        id, slug, title, price, currency, type, transaction_type,
        area_sqm, rooms, living_rooms, is_featured,
        city:cities(id, name, slug),
        district:districts(id, name, slug),
        images:property_images(url, alt_text, sort_order, is_cover)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getFavorites error:", error);
    return [];
  }

  return data ?? [];
}

export async function isFavorite(propertyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("favorites")
    .select("property_id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .single();

  return !!data;
}
