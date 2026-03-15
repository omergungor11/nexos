"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_KEYS, SORT_TKEYS } from "@/lib/constants";

interface SortBarProps {
  totalCount: number;
}

export function SortBar({ totalCount }: SortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  function handleSort(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "yeni") {
      params.set("siralama", value);
    } else {
      params.delete("siralama");
    }
    params.delete("sayfa");
    router.push(`/emlak?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {t("listing.found", { count: totalCount })}
      </p>
      <Select
        value={searchParams.get("siralama") ?? "yeni"}
        onValueChange={handleSort}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_KEYS.map((key) => (
            <SelectItem key={key} value={key}>
              {t(SORT_TKEYS[key])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
