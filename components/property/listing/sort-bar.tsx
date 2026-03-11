"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";

interface SortBarProps {
  totalCount: number;
}

export function SortBar({ totalCount }: SortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        <span className="font-semibold text-foreground">{totalCount}</span> ilan
        bulundu
      </p>
      <Select
        value={searchParams.get("siralama") ?? "yeni"}
        onValueChange={handleSort}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
