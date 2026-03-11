import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages = [
    "",
    "emlak",
    "harita",
    "blog",
    "ekibimiz",
    "iletisim",
    "hakkimizda",
    "hizmetlerimiz",
    "karsilastir",
  ].map((route) => ({
    url: `${BASE_URL}/${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic property pages
  const { data: properties } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("is_active", true);

  const propertyPages = (properties ?? []).map((p) => ({
    url: `${BASE_URL}/emlak/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic blog pages
  const { data: blogs } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true);

  const blogPages = (blogs ?? []).map((b) => ({
    url: `${BASE_URL}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic agent pages
  const { data: agents } = await supabase
    .from("agents")
    .select("slug, updated_at")
    .eq("is_active", true);

  const agentPages = (agents ?? []).map((a) => ({
    url: `${BASE_URL}/ekibimiz/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // CMS pages
  const { data: cmsPages } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("is_published", true);

  const dynamicCmsPages = (cmsPages ?? []).map((p) => ({
    url: `${BASE_URL}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...propertyPages,
    ...blogPages,
    ...agentPages,
    ...dynamicCmsPages,
  ];
}
