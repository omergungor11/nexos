import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ClipboardList, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyRequestForm } from "./property-request-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  void locale;
  return {
    title: "Emlak Talebi | Nexos Emlak",
    description:
      "Aradığınız gayrimenkulü bize bildirin. Uzman danışmanlarımız sizin için en uygun seçenekleri belirlesin.",
  };
}

export default async function EmlakTalebiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <ClipboardList className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Emlak Talebi Oluşturun</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Aradığınız gayrimenkulün özelliklerini bize bildirin. Uzman
          danışmanlarımız portföyümüzden size en uygun seçenekleri sunacak.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Info Cards */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Nasıl Çalışır?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Formu doldurun, danışmanlarımız uygun ilanları belirleyerek
                  sizinle iletişime geçsin.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Telefon</p>
                <a
                  href="tel:+905488604030"
                  className="mt-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  +90 548 860 40 30
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">E-posta</p>
                <a
                  href="mailto:info@nexosinvestment.com"
                  className="mt-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  info@nexosinvestment.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Adres</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yeniboğaziçi, Gazimağusa, Kuzey Kıbrıs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Aradığınız Gayrimenkulü Tanımlayın</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyRequestForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
