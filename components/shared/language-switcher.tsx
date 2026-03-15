"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales, localeNames } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchLocale(nextLocale: string | null) {
    if (!nextLocale) return;
    router.replace(
      // @ts-expect-error -- params type is dynamic
      { pathname, params },
      { locale: nextLocale }
    );
  }

  return (
    <Select value={locale} onValueChange={switchLocale}>
      <SelectTrigger className="h-8 w-auto gap-1.5 border-none bg-transparent px-2 text-sm font-medium text-muted-foreground shadow-none hover:text-foreground focus:ring-0">
        <Globe className="h-4 w-4 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc as Locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
