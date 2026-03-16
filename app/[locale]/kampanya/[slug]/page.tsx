import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property/property-card";
import type { PropertyListItem } from "@/types";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("title, seo_title, seo_description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return {};
  return {
    title: data.seo_title || data.title,
    description: data.seo_description || undefined,
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!page) notFound();

  // Fetch related properties if filter_params is set
  let properties: PropertyListItem[] = [];
  if (page.filter_params) {
    const params = new URLSearchParams(page.filter_params);
    let query = supabase
      .from("properties")
      .select(`
        id, slug, title, price, currency, type, transaction_type,
        area_sqm, rooms, living_rooms, floor, is_featured, views_count,
        city:cities(id, name, slug),
        district:districts(id, name, slug),
        images:property_images(url, is_cover)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12);

    const islem = params.get("islem");
    if (islem === "satilik") query = query.eq("transaction_type", "sale");
    if (islem === "kiralik") query = query.eq("transaction_type", "rent");

    const tip = params.get("tip");
    if (tip) query = query.eq("type", tip);

    const { data: propData } = await query;

    properties = (propData ?? []).map((raw: Record<string, unknown>) => {
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
        status: "available" as const,
        is_featured: raw.is_featured as boolean,
        views_count: raw.views_count as number,
        city: raw.city as PropertyListItem["city"],
        district: raw.district as PropertyListItem["district"],
        cover_image: cover?.url ?? null,
      };
    });
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center justify-center px-4 py-20">
        {page.hero_image && (
          <>
            <Image src={page.hero_image} alt={page.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
          </>
        )}
        {!page.hero_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        )}
        <div className="relative z-10 text-center text-white">
          <h1 className="text-3xl font-bold sm:text-5xl">{page.title}</h1>
          {page.subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">{page.subtitle}</p>
          )}
          {page.cta_text && page.cta_url && (
            <Link
              href={page.cta_url as never}
              className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {page.cta_text}
            </Link>
          )}
        </div>
      </section>

      {/* Content */}
      {page.content && (
        <section className="container mx-auto px-4 py-12">
          <div
            className="prose prose-lg mx-auto dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </section>
      )}

      {/* Related Properties */}
      {properties.length > 0 && (
        <section className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-12">
            <h2 className="mb-8 text-center text-2xl font-bold">İlgili İlanlar</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            {page.filter_params && (
              <div className="mt-8 text-center">
                <Link
                  href={`/emlak?${page.filter_params}` as never}
                  className="inline-flex h-10 items-center rounded-lg border px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Tüm İlanları Gör
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
