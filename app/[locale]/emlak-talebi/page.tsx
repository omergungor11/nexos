import { setRequestLocale, getTranslations } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "propertyRequest" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function EmlakTalebiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "propertyRequest" });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <ClipboardList className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">{t("heading")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("description")}
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
                <p className="font-medium">{t("howItWorks")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("howItWorksDesc")}
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
                <p className="font-medium">{t("phone")}</p>
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
                <p className="font-medium">{t("email")}</p>
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
                <p className="font-medium">{t("address")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("addressValue")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("formTitle")}</CardTitle>
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
