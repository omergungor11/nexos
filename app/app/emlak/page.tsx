import type { Metadata } from "next";
import { Suspense } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/property/filter/filter-panel";
import { PropertyGrid } from "@/components/property/listing/property-grid";
import { SortBar } from "@/components/property/listing/sort-bar";
import { Pagination } from "@/components/property/listing/pagination";
import { getProperties } from "@/lib/queries/properties";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import type { PropertyFilters, PropertyListItem } from "@/types";

export const metadata: Metadata = {
  title: "Emlak İlanları",
  description:
    "Satılık ve kiralık daire, villa, arsa ve ticari gayrimenkul ilanları. Gelişmiş filtreleme ile aradığınızı kolayca bulun.",
};

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmlakPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const { data, count } = await getProperties(filters);

  const properties = (data ?? []).map(mapListItem);
  const totalCount = count ?? 0;
  const currentPage = filters.sayfa ?? 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const pageTitle = filters.islem
    ? TRANSACTION_TYPE_LABELS[filters.islem === "satilik" ? "sale" : "rent"] +
      " Emlak İlanları"
    : "Tüm Emlak İlanları";

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">{pageTitle}</h1>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-lg border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Filtreler
            </h2>
            <Suspense>
              <FilterPanel />
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
                  Filtreler
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <div className="mt-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Filtreler
                  </h2>
                  <Suspense>
                    <FilterPanel />
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

  return {
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
    bina_yasi_max: num("bina_yasi_max"),
    isitma: str("isitma") as PropertyFilters["isitma"],
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
    is_featured: raw.is_featured as boolean,
    views_count: raw.views_count as number,
    city: raw.city as PropertyListItem["city"],
    district: raw.district as PropertyListItem["district"],
    cover_image: cover?.url ?? null,
  };
}
