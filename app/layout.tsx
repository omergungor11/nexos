import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { PhoneButton } from "@/components/shared/phone-button";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { ScrollToTop } from "@/components/shared/scroll-to-top";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexos Emlak | Güvenilir Gayrimenkul Danışmanlığı",
    template: "%s | Nexos Emlak",
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
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Nexos Emlak",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <PhoneButton />
          <WhatsAppButton />
          <ScrollToTop />
          <CookieBanner />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
