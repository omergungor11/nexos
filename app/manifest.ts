import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexos Investment — Gayrimenkul",
    short_name: "Nexos",
    description: "Kuzey Kıbrıs'ta satılık ve kiralık emlak ilanları, güvenilir gayrimenkul danışmanlığı.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e293b",
    orientation: "portrait-primary",
    categories: ["business", "lifestyle"],
    icons: [
      {
        src: "/logo-square.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logo-square.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
