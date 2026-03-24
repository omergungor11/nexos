import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/property/filter/filter-panel";
import { PropertyGrid } from "@/components/property/listing/property-grid";
import { SortBar } from "@/components/property/listing/sort-bar";
import { Pagination } from "@/components/property/listing/pagination";
import { SearchBar } from "@/components/property/listing/search-bar";
import { getProperties } from "@/lib/queries/properties";
import { getCities } from "@/lib/queries/locations";
import type { PropertyFilters, PropertyListItem } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listing" });
  return {
    title: t("allListings"),
    description: t("allListings"),
  };
}

const PAGE_SIZE = 20;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmlakPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [{ data, count }, cities] = await Promise.all([
    getProperties(filters),
    getCities(),
  ]);

  const properties = (data ?? []).map(mapListItem);
  const totalCount = count ?? 0;
  const currentPage = filters.sayfa ?? 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  let pageTitle: string;
  if (filters.islem === "satilik") {
    pageTitle = t("listing.saleListings");
  } else if (filters.islem === "kiralik") {
    pageTitle = t("listing.rentListings");
  } else if (filters.islem === "gunluk") {
    pageTitle = t("listing.dailyRentalListings");
  } else {
    pageTitle = t("listing.allListings");
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <div className="w-full sm:max-w-md">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("listing.filters")}
            </h2>
            <Suspense>
              <FilterPanel cities={cities} />
            </Suspense>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger>
                <Button variant="outline" size="sm" className="gap-2" render={<span />}>
                  <SlidersHorizontal className="h-4 w-4" />
                  {t("listing.filters")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <div className="mt-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("listing.filters")}
                  </h2>
                  <Suspense>
                    <FilterPanel cities={cities} />
                  </Suspense>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Suspense>
            <SortBar totalCount={totalCount} />
          </Suspense>

          <PropertyGrid properties={properties} />

          {totalPages > 1 && (
            <div className="pt-6">
              <Suspense>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function parseFilters(
  params: Record<string, string | string[] | undefined>
): PropertyFilters {
  const str = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };
  const num = (key: string) => {
    const v = str(key);
    return v ? Number(v) : undefined;
  };

  const bool = (key: string) => str(key) === "1" ? true : undefined;

  return {
    q: str("q"),
    islem: str("islem") as PropertyFilters["islem"],
    tip: str("tip")?.split(",") as PropertyFilters["tip"],
    sehir: str("sehir"),
    ilce: str("ilce"),
    mahalle: str("mahalle"),
    fiyat_min: num("fiyat_min"),
    fiyat_max: num("fiyat_max"),
    m2_min: num("m2_min"),
    m2_max: num("m2_max"),
    oda: str("oda")?.split(","),
    kat_min: num("kat_min"),
    kat_max: num("kat_max"),
    bina_yasi_max: num("bina_yasi"),
    isitma: str("isitma") as PropertyFilters["isitma"],
    otopark: bool("otopark"),
    esyali: bool("esyali"),
    asansor: bool("asansor"),
    havuz: bool("havuz"),
    bahce: bool("bahce"),
    guvenlik: bool("guvenlik"),
    balkon: bool("balkon"),
    siralama: str("siralama") as PropertyFilters["siralama"],
    sayfa: num("sayfa"),
  };
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
