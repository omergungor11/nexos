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
  /** Optional node rendered between the count and the sort dropdown. */
  middleSlot?: React.ReactNode;
}

export function SortBar({ totalCount, middleSlot }: SortBarProps) {
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground shrink-0">
        {t("listing.found", { count: totalCount })}
      </p>
      {middleSlot && <div className="w-full sm:max-w-sm sm:flex-1">{middleSlot}</div>}
      <Select
        value={searchParams.get("siralama") ?? "yeni"}
        onValueChange={handleSort}
      >
        <SelectTrigger className="w-full sm:w-44">
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
