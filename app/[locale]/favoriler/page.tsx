import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { getFavorites } from "@/actions/favorites";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property/property-card";
import type { PropertyListItem } from "@/types";

export const metadata: Metadata = {
  title: "Favorilerim",
  description: "Favori emlak ilanlarınız.",
};

// ---------------------------------------------------------------------------
// Helper: shape the raw favorites query result into PropertyListItem objects.
// The getFavorites() query returns nested property data; we map it here so
// PropertyCard receives the exact shape it expects.
// ---------------------------------------------------------------------------

type RawFavoriteProperty = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  is_featured: boolean;
  city: { id: number; name: string; slug: string } | null;
  district: { id: number; name: string; slug: string } | null;
  images: { url: string; alt_text: string | null; is_cover: boolean }[];
};

function toPropertyListItem(raw: RawFavoriteProperty): PropertyListItem | null {
  if (!raw.city) return null;

  const coverImage =
    raw.images.find((img) => img.is_cover)?.url ??
    raw.images[0]?.url ??
    null;

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    price: raw.price,
    currency: raw.currency as PropertyListItem["currency"],
    type: raw.type as PropertyListItem["type"],
    transaction_type: raw.transaction_type as PropertyListItem["transaction_type"],
    area_sqm: raw.area_sqm,
    rooms: raw.rooms,
    living_rooms: raw.living_rooms,
    floor: null,
    is_featured: raw.is_featured,
    views_count: 0,
    status: "available",
    city: raw.city,
    district: raw.district,
    cover_image: coverImage,
  };
}

// ---------------------------------------------------------------------------
// Page component — Server Component, auth-gated
// ---------------------------------------------------------------------------

export default async function FavorilerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Check authentication first
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-24">
        <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Heart className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Favorilerim</h1>
          <p className="text-muted-foreground">
            Favori ilanlarınızı görmek için giriş yapmanız gerekiyor.
          </p>
          <Link
            href="/giris"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Giriş Yap
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    );
  }

  const rawFavorites = await getFavorites();

  // Map raw favorites into PropertyListItem shape
  const properties: PropertyListItem[] = rawFavorites
    .map((fav) => {
      const raw = fav.property as unknown as RawFavoriteProperty | null;
      if (!raw) return null;
      return toPropertyListItem(raw);
    })
    .filter((p): p is PropertyListItem => p !== null);

  return (
    <main className="container mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-3">
        <Heart className="size-6 fill-red-500 text-red-500" aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight">Favorilerim</h1>
        {properties.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {properties.length} ilan
          </span>
        )}
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Heart className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">Henüz favori ilanınız yok.</p>
          <p className="text-sm text-muted-foreground">
            Beğendiğiniz ilanlardaki kalp ikonuna tıklayarak buraya
            ekleyebilirsiniz.
          </p>
          <Link
            href="/emlak"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            İlanlara Göz At
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {/* Property grid */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </main>
  );
}
