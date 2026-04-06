import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexosinvestment.com";

// Pathname mapping for English URLs
const EN_PATHNAMES: Record<string, string> = {
  "": "",
  emlak: "en/properties",
  harita: "en/map",
  blog: "en/blog",
  ekibimiz: "en/team",
  iletisim: "en/contact",
  hakkimizda: "en/about",
  hizmetlerimiz: "en/services",
  sss: "en/faq",
  karsilastir: "en/compare",
};

function getAlternates(trPath: string) {
  const enPath = EN_PATHNAMES[trPath];
  if (enPath === undefined) return {};

  return {
    languages: {
      tr: `${BASE_URL}/${trPath}`,
      en: `${BASE_URL}/${enPath}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages — one entry per TR path, with alternates for EN
  const staticRoutes = [
    "",
    "emlak",
    "harita",
    "blog",
    "ekibimiz",
    "iletisim",
    "hakkimizda",
    "hizmetlerimiz",
    "sss",
    "karsilastir",
  ];

  const staticPages = staticRoutes.flatMap((route) => {
    const entries: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}/${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
        alternates: getAlternates(route),
      },
    ];

    // Add EN version
    const enPath = EN_PATHNAMES[route];
    if (enPath !== undefined && enPath !== "") {
      entries.push({
        url: `${BASE_URL}/${enPath}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.7,
      });
    }

    return entries;
  });

  // Dynamic property pages
  const { data: properties } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("is_active", true);

  const propertyPages = (properties ?? []).flatMap((p) => [
    {
      url: `${BASE_URL}/emlak/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/properties/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  // Dynamic blog pages
  const { data: blogs } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true);

  const blogPages = (blogs ?? []).flatMap((b) => [
    {
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: new Date(b.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/blog/${b.slug}`,
      lastModified: new Date(b.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);

  // Dynamic agent pages
  const { data: agents } = await supabase
    .from("agents")
    .select("slug, updated_at")
    .eq("is_active", true);

  const agentPages = (agents ?? []).flatMap((a) => [
    {
      url: `${BASE_URL}/ekibimiz/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/team/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]);

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
