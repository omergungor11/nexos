import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Nexos Investment hesabınıza giriş yapın.",
};

export default async function GirisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginForm />;
}
