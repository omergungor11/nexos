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
  name: "Nexos Emlak",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
        <div className="lg:col-span-2">
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
