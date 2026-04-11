import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginTitle"), description: t("loginDescription") };
}

export default async function GirisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginForm />;
}
