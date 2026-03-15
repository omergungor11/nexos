import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getFeaturedProperties } from "@/lib/queries/properties";
import { PropertyCard } from "@/components/property/property-card";
import type { PropertyListItem } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "featured" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function VitrinPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const { data } = await getFeaturedProperties(50);
  const properties = (data ?? []).map(mapListItem);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{t("featured.pageTitle")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("featured.pageDescription")}
        </p>
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-muted-foreground">{t("featured.noResults")}</p>
        </div>
      )}
    </div>
  );
}

function mapListItem(raw: Record<string, unknown>): PropertyListItem {
  const images = raw.images as Array<{ url: string; is_cover: boolean }> | null;
  const cover = images?.find((i) => i.is_cover) ?? images?.[0];
  return {
    id: raw.id as string,
    slug: raw.slug as string,
    title: raw.title as string,
    price: raw.price as number,
    currency: raw.currency as PropertyListItem["currency"],
    type: raw.type as PropertyListItem["type"],
    transaction_type: raw.transaction_type as PropertyListItem["transaction_type"],
    area_sqm: raw.area_sqm as number | null,
    rooms: raw.rooms as number | null,
    living_rooms: raw.living_rooms as number | null,
    floor: raw.floor as number | null,
    status: raw.status as PropertyListItem["status"],
    is_featured: raw.is_featured as boolean,
    views_count: raw.views_count as number,
    city: raw.city as PropertyListItem["city"],
    district: raw.district as PropertyListItem["district"],
    cover_image: cover?.url ?? null,
  };
}
