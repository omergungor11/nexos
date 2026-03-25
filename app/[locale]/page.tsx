import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Building2,
  Flame,
  Home,
  MapPin,
  TrendingUp,
  CheckCircle2,
  KeyRound,
  HandCoins,
  LineChart,
  Scale,
  Handshake,
  PaintBucket,
  ShieldCheck,
  Clock,
  Users,
  HeartHandshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSearch } from "@/components/shared/hero-search";
import { SectionHeader } from "@/components/shared/section-header";
import { PropertyCard } from "@/components/property/property-card";
import { JsonLd } from "@/components/shared/json-ld";
import { Link } from "@/i18n/navigation";
import { getFeaturedProperties, getRecentProperties, getDealProperties } from "@/lib/queries/properties";
import { getCities } from "@/lib/queries/locations";
import { PROPERTY_TYPE_TKEYS } from "@/lib/constants";
import type { PropertyListItem } from "@/types";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
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
}

const localBusinessJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Nexos Emlak",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/logo-trans.png`,
  description:
    "Nexos Emlak — Satılık ve kiralık gayrimenkul ilanları, güvenilir danışmanlık hizmeti.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Yeniboğaziçi Gazimagusa-Karpaz Anayolu, Piri Reis. Sok. No. 1",
    addressLocality: "Yeniboğaziçi, Gazimagusa",
    addressRegion: "Kuzey Kıbrıs",
    postalCode: "5876",
    addressCountry: "CY",
  },
  telephone: "+905428806456",
  email: "nexosinvestmentcy@gmail.com",
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  const [{ data: featured }, { data: recent }, { data: deals }, cities] =
    await Promise.all([
      getFeaturedProperties(6),
      getRecentProperties(8),
      getDealProperties(4),
      getCities(),
    ]);

  const serviceItems = [
    { icon: HandCoins, tTitle: "services.forSale", tDesc: "services.forSaleDesc" },
    { icon: KeyRound, tTitle: "services.forRent", tDesc: "services.forRentDesc" },
    { icon: LineChart, tTitle: "services.investment", tDesc: "services.investmentDesc" },
    { icon: Scale, tTitle: "services.legal", tDesc: "services.legalDesc" },
    { icon: Handshake, tTitle: "services.corporate", tDesc: "services.corporateDesc" },
    { icon: PaintBucket, tTitle: "services.renovation", tDesc: "services.renovationDesc" },
  ];

  const whyUsItems = [
    { icon: ShieldCheck, tTitle: "whyUs.reliable", tDesc: "whyUs.reliableDesc" },
    { icon: Clock, tTitle: "whyUs.fast", tDesc: "whyUs.fastDesc" },
    { icon: Users, tTitle: "whyUs.expert", tDesc: "whyUs.expertDesc" },
    { icon: HeartHandshake, tTitle: "whyUs.satisfaction", tDesc: "whyUs.satisfactionDesc" },
  ];

  const aboutFeatures = [
    t("about.features.team"),
    t("about.features.transparency"),
    t("about.features.portfolio"),
    t("about.features.consultancy"),
  ];

  return (
    <>
      <JsonLd data={localBusinessJsonLd} />
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-slate-800/80" />
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("hero.title1")}
              <br />
              <span className="text-primary">{t("hero.title2")}</span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-slate-300 sm:text-lg">
              {t("hero.description")}
            </p>
          </div>
          <HeroSearch cities={cities} />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-8 px-4 py-6 sm:gap-16">
          {[
            { icon: Home, tLabel: "stats.activeListings", value: "1.200+" },
            { icon: Building2, tLabel: "stats.completedSales", value: "850+" },
            { icon: MapPin, tLabel: "stats.cities", value: "15+" },
            { icon: TrendingUp, tLabel: "stats.yearsExperience", value: "6+" },
          ].map((stat) => (
            <div key={stat.tLabel} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{t(stat.tLabel)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      {featured && featured.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <SectionHeader
            title={t("featured.title")}
            description={t("featured.description")}
            href="/emlak"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={mapListItem(property)} />
            ))}
          </div>
        </section>
      )}

      {/* Deal Properties */}
      {deals && deals.length > 0 && (
        <section className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {t("deals.title")}
                  </h2>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {t("deals.description")}
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {deals.map((property) => (
                <PropertyCard key={property.id} property={mapListItem(property)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-16">
          <SectionHeader
            title={t("services.title")}
            description={t("services.description")}
            href="/hizmetlerimiz"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceItems.map((service) => (
              <Card key={service.tTitle} className="group transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{t(service.tTitle)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(service.tDesc)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Category Links */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeader
          title={t("categories.title")}
          description={t("categories.description")}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["apartment", "villa", "detached", "land"].map((key) => (
            <Link key={key} href={`/emlak?tip=${key}` as never}>
              <Card className="group transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {t(PROPERTY_TYPE_TKEYS[key])}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("categories.viewListings")}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {t("about.label")}
                </p>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {t("about.title")}
                  <br />
                  <span className="text-primary">{t("about.titleHighlight")}</span>
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.description")}
              </p>
              <ul className="space-y-3">
                {aboutFeatures.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/hakkimizda"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {t("about.moreInfo")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/about-team.jpg"
                alt="Nexos Investment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl bg-primary/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Properties */}
      {recent && recent.length > 0 && (
        <section className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-16">
            <SectionHeader
              title={t("recent.title")}
              description={t("recent.description")}
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

      {/* Video Section */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeader
          title={t("video.title")}
          description={t("video.description")}
        />
        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl shadow-lg">
          <div className="relative aspect-video">
            <iframe
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              title="Nexos Investment — Kuzey Kıbrıs Gayrimenkul"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/why-us.jpg"
                alt="Nexos"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-xl bg-primary px-5 py-4 text-primary-foreground shadow-xl sm:bottom-6 sm:right-6">
              <p className="text-3xl font-bold">850+</p>
              <p className="text-sm text-primary-foreground/80">{t("whyUs.happyCustomers")}</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {t("whyUs.label")}
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("whyUs.title")}
                <br />
                <span className="text-primary">{t("whyUs.titleHighlight")}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("whyUs.description")}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {whyUsItems.map((item) => (
                <div key={item.tTitle} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{t(item.tTitle)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t(item.tDesc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t("cta.title")}
          </h2>
          <p className="max-w-lg text-primary-foreground/80">
            {t("cta.description")}
          </p>
          <Link
            href="/iletisim"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            {t("cta.button")}
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
