import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import { getLocale } from "next-intl/server";
import { localeDirection } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexos Investment | Güvenilir Gayrimenkul Danışmanlığı",
    template: "%s | Nexos Investment",
  },
  description:
    "Nexos Gayrimenkul - Satılık ve kiralık emlak ilanları, güvenilir danışmanlık hizmeti.",
  keywords: [
    "emlak",
    "gayrimenkul",
    "satılık daire",
    "kiralık daire",
    "villa",
    "arsa",
    "emlak ilanları",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexosinvestment.com"
  ),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Nexos Investment",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexosinvestment.com",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={localeDirection[locale as Locale] ?? "ltr"} suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
        <ServiceWorkerRegister />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
