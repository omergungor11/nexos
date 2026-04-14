import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/shared/json-ld";
import { ContactForm } from "./contact-form";
import { ContactMapWrapper } from "@/components/shared/contact-map-wrapper";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("pageTitle"),
    description: t("pageSubtitle"),
  };
}

const contactJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Nexos Investment",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexosinvestment.com",
  description:
    "Nexos Investment — Satılık ve kiralık gayrimenkul ilanları, güvenilir danışmanlık hizmeti.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Yeniboğaziçi Gazimagusa-Karpaz Anayolu, Piri Reis. Sok. No. 1",
    addressLocality: "Yeniboğaziçi, Gazimagusa",
    addressRegion: "Kuzey Kıbrıs",
    postalCode: "5876",
    addressCountry: "CY",
  },
  telephone: "+905488604030",
  email: "info@nexosinvestment.com",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  ],
};

export default async function IletisimPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  return (
    <>
      <JsonLd data={contactJsonLd} />
      <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold">{t("pageTitle")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("pageSubtitle")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("phone")}</p>
                <a
                  href="tel:+905488604030"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  +90 548 860 40 30
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("email")}</p>
                <a
                  href="mailto:info@nexosinvestment.com"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  info@nexosinvestment.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("address")}</p>
                <a
                  href="https://maps.app.goo.gl/jUajHgW2DWPzDKfJA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Yeniboğaziçi, Gazimağusa-Karpaz Anayolu,
                  Piri Reis Sok. No. 1, Gazimağusa, KKTC
                </a>
                <p className="mt-0.5 text-xs text-muted-foreground/70">Salamis Otel&apos;e 500m mesafede</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("workingHours")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("workingHoursValue")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick contact actions */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
            <a
              href="tel:+905488604030"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow"
            >
              <Phone className="size-3.5" />
              Hemen Ara
            </a>
            <a
              href="https://wa.me/905488604030"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1ebe57] hover:shadow"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.142 1.595 5.946L0 24l6.335-1.652a11.882 11.882 0 0 0 5.723 1.459h.005c9.884 0 16.094-10.773 10.457-19.358zM12.06 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.003-8.718 10.62-13.083 16.79-6.915a9.812 9.812 0 0 1 2.89 6.994c-.003 5.457-4.437 9.814-9.796 9.814z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="mailto:info@nexosinvestment.com"
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted/70"
            >
              <Mail className="size-3.5" />
              E-posta
            </a>
            <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
              En hızlı yanıt için bize telefondan veya WhatsApp'tan ulaşabilirsiniz.
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("sendMessage")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-bold">{t("ourLocation")}</h2>
        <div className="h-[350px] overflow-hidden rounded-lg border">
          <ContactMapWrapper />
        </div>
      </div>
    </div>
    </>
  );
}
