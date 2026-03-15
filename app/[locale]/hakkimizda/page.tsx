import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  Target,
  Eye,
  Heart,
  Shield,
  Users,
  Award,
  TrendingUp,
  Home,
  Handshake,
  MapPin,
  CheckCircle2,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function HakkimizdaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "aboutPage" });

  const STATS = [
    { value: "500+", label: t("stats.happyClients") },
    { value: "1.200+", label: t("stats.portfolio") },
    { value: "8+", label: t("stats.experience") },
    { value: "15+", label: t("stats.consultants") },
  ];

  const VALUES = [
    {
      icon: Shield,
      title: t("values.trustTransparency.title"),
      description: t("values.trustTransparency.description"),
    },
    {
      icon: Heart,
      title: t("values.customerFocus.title"),
      description: t("values.customerFocus.description"),
    },
    {
      icon: Award,
      title: t("values.professionalism.title"),
      description: t("values.professionalism.description"),
    },
    {
      icon: Handshake,
      title: t("values.longTermRelationship.title"),
      description: t("values.longTermRelationship.description"),
    },
    {
      icon: TrendingUp,
      title: t("values.innovation.title"),
      description: t("values.innovation.description"),
    },
    {
      icon: Users,
      title: t("values.teamSpirit.title"),
      description: t("values.teamSpirit.description"),
    },
  ];

  const SERVICES_SUMMARY = [
    t("services.items.salesRental"),
    t("services.items.valuation"),
    t("services.items.investment"),
    t("services.items.titleDeed"),
    t("services.items.rentalManagement"),
    t("services.items.furnishing"),
    t("services.items.residencePermit"),
    t("services.items.transfer"),
    t("services.items.airbnb"),
    t("services.items.afterSales"),
  ];

  const TIMELINE = [
    {
      year: "2016",
      title: t("timeline.2016.title"),
      description: t("timeline.2016.description"),
    },
    {
      year: "2018",
      title: t("timeline.2018.title"),
      description: t("timeline.2018.description"),
    },
    {
      year: "2020",
      title: t("timeline.2020.title"),
      description: t("timeline.2020.description"),
    },
    {
      year: "2022",
      title: t("timeline.2022.title"),
      description: t("timeline.2022.description"),
    },
    {
      year: "2024",
      title: t("timeline.2024.title"),
      description: t("timeline.2024.description"),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 text-white sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,203,45,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,203,45,0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            {t("hero.subtitle")}
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {t("hero.titleLine1")}
            <br />
            <span className="text-primary">{t("hero.titleLine2")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
            {t("hero.description")}
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto grid grid-cols-2 divide-x sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center sm:py-8">
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Biz Kimiz */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">{t("whoWeAre.title")}</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>{t("whoWeAre.paragraph1")}</p>
              <p>{t("whoWeAre.paragraph2")}</p>
              <p>{t("whoWeAre.paragraph3")}</p>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-6">
                  <div className="text-center">
                    <Users className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{t("infoCards.consultants.value")}</p>
                    <p className="text-xs text-muted-foreground">{t("infoCards.consultants.label")}</p>
                  </div>
                </div>
                <div className="flex aspect-[3/2] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                  <div className="text-center">
                    <Award className="mx-auto h-8 w-8 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{t("infoCards.referralRate.value")}</p>
                    <p className="text-xs text-gray-400">{t("infoCards.referralRate.label")}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <div className="flex aspect-[3/2] items-center justify-center rounded-2xl bg-primary p-6 text-white">
                  <div className="text-center">
                    <Home className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-semibold">{t("infoCards.portfolio.value")}</p>
                    <p className="text-xs text-white/80">{t("infoCards.portfolio.label")}</p>
                  </div>
                </div>
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                  <div className="text-center">
                    <MapPin className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{t("infoCards.regions.value")}</p>
                    <p className="text-xs text-muted-foreground">{t("infoCards.regions.label")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misyon & Vizyon */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8 sm:p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{t("mission.title")}</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("mission.description")}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 sm:p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{t("vision.title")}</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("vision.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Degerlerimiz */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("values.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("values.description")}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <value.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Hikayemiz - Timeline */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t("timeline.title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              {t("timeline.description")}
            </p>
          </div>
          <div className="relative mx-auto max-w-3xl">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 hidden h-full w-0.5 bg-border sm:left-1/2 sm:block sm:-translate-x-0.5" />

            <div className="space-y-8 sm:space-y-12">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex flex-col sm:flex-row ${
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 top-6 hidden h-3 w-3 rounded-full border-2 border-primary bg-background sm:left-1/2 sm:block sm:-translate-x-1.5" />

                  {/* Content */}
                  <div
                    className={`w-full pl-0 sm:w-1/2 ${
                      i % 2 === 0
                        ? "sm:pr-12 sm:text-right"
                        : "sm:pl-12 sm:text-left"
                    }`}
                  >
                    <div className="rounded-xl border bg-card p-5">
                      <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                        {item.year}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hizmetlerimiz Ozet */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              {t("services.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t("services.description")}
            </p>
            <ul className="mt-6 space-y-3">
              {SERVICES_SUMMARY.map((service) => (
                <li key={service} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{service}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/hizmetlerimiz"
              className="mt-8 inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {t("services.viewAllButton")}
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { icon: Home, title: t("services.cards.salesRental.title"), desc: t("services.cards.salesRental.description") },
              { icon: Shield, title: t("services.cards.legalProcess.title"), desc: t("services.cards.legalProcess.description") },
              { icon: TrendingUp, title: t("services.cards.investmentAdvisory.title"), desc: t("services.cards.investmentAdvisory.description") },
              { icon: Handshake, title: t("services.cards.rentalManagement.title"), desc: t("services.cards.rentalManagement.description") },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neden Bizi Secmelisiniz */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                {t("whyNexos.title")}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {t("whyNexos.description")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-primary p-4 text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-xs text-white/80">{t("whyNexos.statsLabels.happyClients")}</p>
                </div>
              </div>
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-900 p-4 text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold">8+</p>
                  <p className="text-xs text-gray-400">{t("whyNexos.statsLabels.yearsExperience")}</p>
                </div>
              </div>
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">7/24</p>
                  <p className="text-xs text-muted-foreground">{t("whyNexos.statsLabels.support")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {[
              {
                title: t("whyNexos.features.regionalExpertise.title"),
                desc: t("whyNexos.features.regionalExpertise.description"),
              },
              {
                title: t("whyNexos.features.transparentPricing.title"),
                desc: t("whyNexos.features.transparentPricing.description"),
              },
              {
                title: t("whyNexos.features.legalAssurance.title"),
                desc: t("whyNexos.features.legalAssurance.description"),
              },
              {
                title: t("whyNexos.features.afterSalesSupport.title"),
                desc: t("whyNexos.features.afterSalesSupport.description"),
              },
              {
                title: t("whyNexos.features.widePortfolio.title"),
                desc: t("whyNexos.features.widePortfolio.description"),
              },
              {
                title: t("whyNexos.features.digitalExperience.title"),
                desc: t("whyNexos.features.digitalExperience.description"),
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl border bg-card p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center text-white sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,203,45,0.12),transparent_70%)]" />
          <h2 className="relative text-2xl font-bold sm:text-3xl">
            {t("cta.title")}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-gray-300">
            {t("cta.description")}
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/iletisim"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {t("cta.consultButton")}
            </Link>
            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-lg border border-white/20 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {t("cta.whatsappButton")}
            </a>
            <Link
              href="/ekibimiz"
              className="inline-flex h-11 items-center rounded-lg border border-white/20 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {t("cta.teamButton")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
