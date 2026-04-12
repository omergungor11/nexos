import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/queries/content";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { PhoneButton } from "@/components/shared/phone-button";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { ScrollToTop } from "@/components/shared/scroll-to-top";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, settings] = await Promise.all([
    getMessages(),
    getSiteSettings(),
  ]);

  const animateUI = settings.animate_ui_enabled === "true";

  // Dynamic imports for animate variants (only loaded when enabled)
  const HeaderComponent = animateUI
    ? (await import("@/components/layout/header-animate")).HeaderAnimate
    : Header;
  const FooterComponent = animateUI
    ? (await import("@/components/layout/footer-animate")).FooterAnimate
    : Footer;

  return (
    <NextIntlClientProvider messages={messages}>
      <HeaderComponent />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <FooterComponent />
      <PhoneButton />
      <WhatsAppButton />
      <ScrollToTop />
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
