import { createClient } from "@/lib/supabase/server";

export async function getProjects() {
  const supabase = await createClient();
  return supabase
    .from("projects")
    .select("*, city:cities(name, slug), district:districts(name, slug)")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
}

export async function getFeaturedProjects(limit = 3) {
  const supabase = await createClient();
  return supabase
    .from("projects")
    .select("*, city:cities(name, slug), district:districts(name, slug)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("projects")
    .select("*, city:cities(name, slug), district:districts(name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
}
