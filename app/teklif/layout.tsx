import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Teklif | Nexos Investment",
  robots: { index: false, follow: false },
};

const COMPANY_PHONE = "+90 548 860 40 30";
const COMPANY_PHONE_TEL = "+905488604030";

export default async function TeklifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Teklif routes live outside [locale], but inner components
  // (PropertyCard et al.) still call next-intl hooks. Seed the
  // provider with the default locale so client hydration doesn't crash.
  setRequestLocale(defaultLocale);
  const messages = await getMessages({ locale: defaultLocale });

  return (
    <NextIntlClientProvider locale={defaultLocale} messages={messages}>
      <div className="flex min-h-svh flex-col bg-background">
        {/* Lean header — logo + phone, nothing else */}
        <header className="border-b bg-background">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <Link href="https://www.nexosinvestment.com" className="flex items-center gap-2">
              <Image
                src="/logo-trans.png"
                alt="Nexos Investment"
                width={120}
                height={32}
                priority
              />
            </Link>
            <a
              href={`tel:${COMPANY_PHONE_TEL}`}
              className="text-xs font-medium text-muted-foreground hover:text-foreground sm:text-sm"
            >
              {COMPANY_PHONE}
            </a>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t bg-muted/30">
          <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Nexos Investment</p>
            <p>Bu sayfa size özel hazırlanmıştır.</p>
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
