"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { parseSearchQuery, TX_TO_ISLEM } from "@/lib/search-parser";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(currentQuery);

  const applySearch = useCallback(
    (raw: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("sayfa");

      if (!raw.trim()) {
        params.delete("q");
        params.delete("oda");
        router.push(`?${params.toString()}`);
        return;
      }

      const parsed = parseSearchQuery(raw);

      // Set structured filters parsed from the text
      if (parsed.transactionType) {
        params.set("islem", TX_TO_ISLEM[parsed.transactionType] ?? "");
      }
      if (parsed.propertyType) {
        params.set("tip", parsed.propertyType);
      }
      if (parsed.roomStr) {
        params.set("oda", parsed.roomStr);
      } else {
        params.delete("oda");
      }

      // Remaining free text
      if (parsed.remainingText.length >= 2) {
        params.set("q", parsed.remainingText);
      } else {
        params.delete("q");
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applySearch(value);
  }

  function handleClear() {
    setValue("");
    applySearch("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="3+1 satılık villa, daire, arsa..."
        className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
