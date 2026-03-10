import { createClient } from "@/lib/supabase/server";

export async function getPageBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
}

export async function getBlogPosts(page = 1, pageSize = 12) {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
}

export async function getAgents() {
  const supabase = await createClient();
  return supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("name");
}

export async function getAgentBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("agents")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
}

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");

  if (!data) return {};

  return Object.fromEntries(data.map((s) => [s.key, s.value]));
}

export async function getFeatures() {
  const supabase = await createClient();
  return supabase
    .from("features")
    .select("*")
    .order("sort_order");
}
