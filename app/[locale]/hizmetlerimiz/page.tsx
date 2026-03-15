import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Home,
  Building2,
  TrendingUp,
  Key,
  FileSearch,
  PaintBucket,
  Scale,
  Handshake,
  MapPin,
  Calculator,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function HizmetlerimizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "servicesPage" });

  const SERVICES: Service[] = [
    {
      icon: Home,
      title: t("services.saleConsultancy.title"),
      description: t("services.saleConsultancy.description"),
      features: [
        t("services.saleConsultancy.features.f1"),
        t("services.saleConsultancy.features.f2"),
        t("services.saleConsultancy.features.f3"),
        t("services.saleConsultancy.features.f4"),
        t("services.saleConsultancy.features.f5"),
        t("services.saleConsultancy.features.f6"),
      ],
    },
    {
      icon: Key,
      title: t("services.rentalServices.title"),
      description: t("services.rentalServices.description"),
      features: [
        t("services.rentalServices.features.f1"),
        t("services.rentalServices.features.f2"),
        t("services.rentalServices.features.f3"),
        t("services.rentalServices.features.f4"),
        t("services.rentalServices.features.f5"),
        t("services.rentalServices.features.f6"),
      ],
    },
    {
      icon: TrendingUp,
      title: t("services.investmentConsultancy.title"),
      description: t("services.investmentConsultancy.description"),
      features: [
        t("services.investmentConsultancy.features.f1"),
        t("services.investmentConsultancy.features.f2"),
        t("services.investmentConsultancy.features.f3"),
        t("services.investmentConsultancy.features.f4"),
        t("services.investmentConsultancy.features.f5"),
        t("services.investmentConsultancy.features.f6"),
      ],
    },
    {
      icon: FileSearch,
      title: t("services.propertyValuation.title"),
      description: t("services.propertyValuation.description"),
      features: [
        t("services.propertyValuation.features.f1"),
        t("services.propertyValuation.features.f2"),
        t("services.propertyValuation.features.f3"),
        t("services.propertyValuation.features.f4"),
        t("services.propertyValuation.features.f5"),
        t("services.propertyValuation.features.f6"),
      ],
    },
    {
      icon: Building2,
      title: t("services.projectMarketing.title"),
      description: t("services.projectMarketing.description"),
      features: [
        t("services.projectMarketing.features.f1"),
        t("services.projectMarketing.features.f2"),
        t("services.projectMarketing.features.f3"),
        t("services.projectMarketing.features.f4"),
        t("services.projectMarketing.features.f5"),
        t("services.projectMarketing.features.f6"),
      ],
    },
    {
      icon: Scale,
      title: t("services.legalSupport.title"),
      description: t("services.legalSupport.description"),
      features: [
        t("services.legalSupport.features.f1"),
        t("services.legalSupport.features.f2"),
        t("services.legalSupport.features.f3"),
        t("services.legalSupport.features.f4"),
        t("services.legalSupport.features.f5"),
        t("services.legalSupport.features.f6"),
      ],
    },
    {
      icon: PaintBucket,
      title: t("services.renovationGuidance.title"),
      description: t("services.renovationGuidance.description"),
      features: [
        t("services.renovationGuidance.features.f1"),
        t("services.renovationGuidance.features.f2"),
        t("services.renovationGuidance.features.f3"),
        t("services.renovationGuidance.features.f4"),
        t("services.renovationGuidance.features.f5"),
        t("services.renovationGuidance.features.f6"),
      ],
    },
    {
      icon: MapPin,
      title: t("services.relocationGuidance.title"),
      description: t("services.relocationGuidance.description"),
      features: [
        t("services.relocationGuidance.features.f1"),
        t("services.relocationGuidance.features.f2"),
        t("services.relocationGuidance.features.f3"),
        t("services.relocationGuidance.features.f4"),
        t("services.relocationGuidance.features.f5"),
        t("services.relocationGuidance.features.f6"),
      ],
    },
  ];

  const PROCESS_STEPS = [
    {
      step: t("process.steps.step1.number"),
      title: t("process.steps.step1.title"),
      description: t("process.steps.step1.description"),
    },
    {
      step: t("process.steps.step2.number"),
      title: t("process.steps.step2.title"),
      description: t("process.steps.step2.description"),
    },
    {
      step: t("process.steps.step3.number"),
      title: t("process.steps.step3.title"),
      description: t("process.steps.step3.description"),
    },
    {
      step: t("process.steps.step4.number"),
      title: t("process.steps.step4.title"),
      description: t("process.steps.step4.description"),
    },
  ];

  const STATS = [
    { value: t("stats.happyClients.value"), label: t("stats.happyClients.label") },
    { value: t("stats.satisfactionRate.value"), label: t("stats.satisfactionRate.label") },
    { value: t("stats.yearsExperience.value"), label: t("stats.yearsExperience.label") },
    { value: t("stats.completedTransactions.value"), label: t("stats.completedTransactions.label") },
  ];

  const WHY_US_FEATURES = [
    {
      icon: ShieldCheck,
      title: t("whyUs.features.reliable.title"),
      desc: t("whyUs.features.reliable.description"),
    },
    {
      icon: Handshake,
      title: t("whyUs.features.personalized.title"),
      desc: t("whyUs.features.personalized.description"),
    },
    {
      icon: Calculator,
      title: t("whyUs.features.valuation.title"),
      desc: t("whyUs.features.valuation.description"),
    },
    {
      icon: MapPin,
      title: t("whyUs.features.localExpertise.title"),
      desc: t("whyUs.features.localExpertise.description"),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              {t("hero.title")}{" "}
              <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("hero.description")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/iletisim"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Phone className="h-4 w-4" />
                {t("hero.ctaConsultation")}
              </Link>
              <Link
                href="/emlak"
                className="inline-flex h-11 items-center gap-2 rounded-lg border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t("hero.ctaListings")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t("servicesSection.title")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("servicesSection.description")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <Card key={service.title} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold">{service.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <ul className="grid gap-2 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("process.title")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("process.subtitle")}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+2.5rem)] hidden h-0.5 w-[calc(100%-5rem)] bg-primary/20 lg:block" />
                )}
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t("whyUs.title")} <span className="text-primary">{t("whyUs.titleHighlight")}</span>
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("whyUs.description")}
            </p>
            <div className="mt-8 space-y-4">
              {WHY_US_FEATURES.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/why-us.jpg"
              alt={t("whyUs.imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("cta.description")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/iletisim"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Phone className="h-4 w-4" />
              {t("cta.ctaContact")}
            </Link>
            <Link
              href="/sss"
              className="inline-flex h-11 items-center rounded-lg border px-8 text-sm font-medium transition-colors hover:bg-muted"
            >
              {t("cta.ctaFaq")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
