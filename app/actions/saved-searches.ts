"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SavedSearch {
  id: string;
  name: string;
  params: string;
  created_at: string;
}

/**
 * Saves a named search query string for the authenticated user.
 * `params` is a serialised URL search parameter string, e.g. the output of
 * `new URLSearchParams(filters).toString()`.
 *
 * Returns `{ data: { id } }` on success or `{ error: string }` on failure.
 */
export async function saveSearch(
  name: string,
  params: string
): Promise<{ data: { id: string } } | { error: string }> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: "Arama adı boş olamaz" };
  }
  if (!params.trim()) {
    return { error: "Arama parametreleri boş olamaz" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({ user_id: user.id, name: trimmedName, params })
    .select("id")
    .single();

  if (error) {
    console.error("saveSearch error:", error);
    return { error: "Arama kaydedilemedi" };
  }

  revalidatePath("/profil/aramalar");
  return { data: { id: data.id } };
}

/**
 * Returns all saved searches belonging to the authenticated user,
 * ordered newest first. Returns an empty array if the user is not signed in.
 */
export async function getSavedSearches(): Promise<SavedSearch[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, name, params, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSavedSearches error:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Deletes a saved search by `id` for the authenticated user.
 * The row-level security policy prevents deletion of other users' records,
 * but the explicit `user_id` filter provides a defence-in-depth guarantee.
 *
 * Returns `{ success: true }` on success or `{ error: string }` on failure.
 */
export async function deleteSavedSearch(
  id: string
): Promise<{ success: true } | { error: string }> {
  if (!id) {
    return { error: "Geçersiz arama ID'si" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("deleteSavedSearch error:", error);
    return { error: "Arama silinemedi" };
  }

  revalidatePath("/profil/aramalar");
  return { success: true };
}
