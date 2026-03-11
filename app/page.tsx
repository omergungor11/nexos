import Link from "next/link";
import { ArrowRight, Building2, Home, MapPin, TrendingUp } from "lucide-react";
// no import needed for inline Link styles
import { Card, CardContent } from "@/components/ui/card";
import { HeroSearch } from "@/components/shared/hero-search";
import { SectionHeader } from "@/components/shared/section-header";
import { PropertyCard } from "@/components/property/property-card";
import { JsonLd } from "@/components/shared/json-ld";
import { getFeaturedProperties, getRecentProperties } from "@/lib/queries/properties";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { PropertyListItem } from "@/types";

export const metadata = {
  title: "Nexos Emlak | Güvenilir Gayrimenkul Danışmanlığı",
  description:
    "Nexos Emlak ile hayalinizdeki evi bulun. Satılık ve kiralık daire, villa, arsa ve ticari gayrimenkul ilanları.",
  openGraph: {
    images: [
      {
        url: "/api/og?title=Nexos+Emlak&subtitle=G%C3%BCvenilir+Gayrimenkul+Dan%C4%B1%C5%9Fmanl%C4%B1%C4%9F%C4%B1",
        width: 1200,
        height: 630,
        alt: "Nexos Emlak",
      },
    ],
  },
};

const localBusinessJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Nexos Emlak",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/logo.jpeg`,
  description:
    "Nexos Emlak — Satılık ve kiralık gayrimenkul ilanları, güvenilir danışmanlık hizmeti.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Atatürk Cad. No:123",
    addressLocality: "Merkez",
    addressRegion: "İstanbul",
    addressCountry: "TR",
  },
  telephone: "+905551234567",
  email: "info@nexos.com.tr",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: [],
};

export default async function HomePage() {
  const [{ data: featured }, { data: recent }] = await Promise.all([
    getFeaturedProperties(6),
    getRecentProperties(8),
  ]);

  return (
    <>
      <JsonLd data={localBusinessJsonLd} />
      {/* Hero Section */}
      <section className="relative flex min-h-[520px] items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-slate-800/80" />
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hayalinizdeki Eve
              <br />
              <span className="text-primary">Bir Adım Uzaktasınız</span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-slate-300 sm:text-lg">
              Satılık ve kiralık gayrimenkul ilanlarını gelişmiş filtreleme ile
              kolayca keşfedin.
            </p>
          </div>
          <HeroSearch />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-8 px-4 py-6 sm:gap-16">
          {[
            { icon: Home, label: "Aktif İlan", value: "1.200+" },
            { icon: Building2, label: "Tamamlanan Satış", value: "850+" },
            { icon: MapPin, label: "Şehir", value: "15+" },
            { icon: TrendingUp, label: "Yıllık Deneyim", value: "10+" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      {featured && featured.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <SectionHeader
            title="Vitrin İlanlar"
            description="Öne çıkan gayrimenkul fırsatları"
            href="/emlak"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={mapListItem(property)} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Properties */}
      {recent && recent.length > 0 && (
        <section className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-16">
            <SectionHeader
              title="Son Eklenen İlanlar"
              description="En güncel gayrimenkul ilanları"
              href="/emlak?siralama=yeni"
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((property) => (
                <PropertyCard key={property.id} property={mapListItem(property)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Category Links */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeader
          title="Kategoriye Göre Ara"
          description="İstediğiniz emlak tipini hızla bulun"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(PROPERTY_TYPE_LABELS)
            .slice(0, 4)
            .map(([key, label]) => (
              <Link key={key} href={`/emlak?tip=${key}`}>
                <Card className="group transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        İlanları Görüntüle
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Mülkünüzü Değerlendirmek İster misiniz?
          </h2>
          <p className="max-w-lg text-primary-foreground/80">
            Uzman ekibimiz ile ücretsiz değerleme randevusu alın. Mülkünüzü en
            doğru fiyatla satmanıza veya kiralamanıza yardımcı olalım.
          </p>
          <Link
            href="/iletisim"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Ücretsiz Değerleme Alın
          </Link>
        </div>
      </section>
    </>
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
