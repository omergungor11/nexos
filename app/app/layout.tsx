import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexos Emlak — Güvenilir Gayrimenkul Danışmanlığı",
    template: "%s | Nexos Emlak",
  },
  description:
    "Nexos Emlak ile hayalinizdeki evi bulun. Satılık ve kiralık daire, villa, arsa ve ticari gayrimenkul ilanları. Gelişmiş arama ve filtreleme ile kolay ilan bulma.",
  keywords: [
    "emlak",
    "gayrimenkul",
    "satılık daire",
    "kiralık daire",
    "villa",
    "arsa",
    "emlak ilanları",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Nexos Emlak",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
