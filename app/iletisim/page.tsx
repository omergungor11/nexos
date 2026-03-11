import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/shared/json-ld";
import { ContactForm } from "./contact-form";
import { ContactMapWrapper } from "@/components/shared/contact-map-wrapper";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Nexos Emlak ile iletişime geçin. Gayrimenkul danışmanlığı, mülk değerleme ve sorularınız için bize ulaşın.",
};

const contactJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Nexos Emlak",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "Nexos Emlak — Satılık ve kiralık gayrimenkul ilanları, güvenilir danışmanlık hizmeti.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "İskele Merkez",
    addressLocality: "İskele",
    addressRegion: "Kuzey Kıbrıs",
    addressCountry: "CY",
  },
  telephone: "+905551234567",
  email: "info@nexos.com.tr",
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

export default function IletisimPage() {
  return (
    <>
      <JsonLd data={contactJsonLd} />
      <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold">Bize Ulaşın</h1>
        <p className="mt-2 text-muted-foreground">
          Sorularınız ve talepleriniz için bizimle iletişime geçmekten çekinmeyin.
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
                <p className="text-sm font-medium">Telefon</p>
                <a
                  href="tel:+905551234567"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  0555 123 45 67
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
                <p className="text-sm font-medium">E-posta</p>
                <a
                  href="mailto:info@nexos.com.tr"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  info@nexos.com.tr
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
                <p className="text-sm font-medium">Adres</p>
                <p className="text-sm text-muted-foreground">
                  İskele, Kuzey Kıbrıs
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Çalışma Saatleri</p>
                <p className="text-sm text-muted-foreground">
                  Pzt–Cmt: 09:00–18:00
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mesaj Gönderin</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-bold">Konumumuz</h2>
        <div className="h-[350px] overflow-hidden rounded-lg border">
          <ContactMapWrapper />
        </div>
      </div>
    </div>
    </>
  );
}
