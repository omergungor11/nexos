import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("registerTitle"), description: t("registerDescription") };
}

export default async function KayitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RegisterForm />;
}
