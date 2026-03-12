"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useParams } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchLocale() {
    const nextLocale = locale === "tr" ? "en" : "tr";
    router.replace(
      // @ts-expect-error -- params type is dynamic
      { pathname, params },
      { locale: nextLocale }
    );
  }

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      aria-label={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {locale === "tr" ? "EN" : "TR"}
      </span>
    </button>
  );
}
