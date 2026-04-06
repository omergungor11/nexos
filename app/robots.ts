import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexosinvestment.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/giris",
          "/kayit",
          "/favoriler",
          "/karsilastir",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
