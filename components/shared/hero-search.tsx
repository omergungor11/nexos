"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Home, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPE_TKEYS } from "@/lib/constants";

interface CityOption {
  id: number;
  name: string;
  slug: string;
}

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  city: { name: string } | null;
  district: { name: string } | null;
  images: { url: string; is_cover: boolean }[];
}

interface HeroSearchProps {
  cities?: CityOption[];
}

export function HeroSearch({ cities = [] }: HeroSearchProps) {
  const router = useRouter();
  const t = useTranslations();

  const TABS = [
    { value: "", label: t("search.all") },
    { value: "satilik", label: t("search.forSale") },
    { value: "kiralik", label: t("search.forRent") },
    { value: "gunluk", label: t("search.dailyRental") },
  ];

  const [activeTab, setActiveTab] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [tip, setTip] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.data ?? []);
      setShowResults(true);
    } catch {
      setResults([]);
      setShowResults(true);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (activeTab) params.set("islem", activeTab);
    if (tip) params.set("tip", tip);
    if (city) params.set("sehir", city);
    if (query.length >= 2) params.set("q", query);
    router.push(`/emlak?${params.toString()}`);
  }

  function handleResultClick(slug: string) {
    setShowResults(false);
    router.push(`/emlak/${slug}`);
  }

  function formatPrice(price: number, currency: string) {
    const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
    return `${sym}${price.toLocaleString("tr-TR")}`;
  }

  const chevronSvg = (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  const propertyTypeEntries = Object.entries(PROPERTY_TYPE_TKEYS).filter(
    ([key]) => key !== "land" // exclude legacy "land" — use specific land subtypes instead
  );

  return (
    <div className="w-full max-w-4xl px-2 sm:px-0">
      {/* Tabs */}
      <div className="mb-3 flex justify-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "relative px-5 py-2 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "text-white"
                : "text-white/70 hover:text-white"
            )}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div ref={searchRef} className="relative">
        {/* Desktop layout */}
        <div className="hidden rounded-2xl bg-white/95 p-2.5 shadow-xl backdrop-blur sm:block">
          <div className="flex items-center">
            <div className="relative flex-1 border-r border-gray-200">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("search.quickSearch")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-11 w-full bg-transparent pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="relative border-r border-gray-200">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-11 w-44 appearance-none rounded-lg bg-transparent pl-10 pr-8 text-sm text-gray-900 focus:outline-none"
              >
                <option value="">{t("search.location")}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {chevronSvg}
            </div>
            <div className="relative border-r border-gray-200">
              <Home className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="h-11 w-36 appearance-none rounded-lg bg-transparent pl-10 pr-8 text-sm text-gray-900 focus:outline-none"
              >
                <option value="">{t("search.propertyType")}</option>
                {propertyTypeEntries.map(([value, tKey]) => (
                  <option key={value} value={value}>{t(tKey)}</option>
                ))}
              </select>
              {chevronSvg}
            </div>
            <div className="flex items-center gap-2 pl-3 pr-1">
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (activeTab) params.set("islem", activeTab);
                  router.push(`/emlak?${params.toString()}`);
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap hover:text-gray-900"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("search.detailed")}
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                aria-label={t("search.search")}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search.searchListings")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm text-gray-900 focus:border-primary focus:outline-none"
              >
                <option value="">{t("search.location")}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {chevronSvg}
            </div>
            <div className="relative">
              <Home className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm text-gray-900 focus:border-primary focus:outline-none"
              >
                <option value="">{t("search.propertyType")}</option>
                {propertyTypeEntries.map(([value, tKey]) => (
                  <option key={value} value={value}>{t(tKey)}</option>
                ))}
              </select>
              {chevronSvg}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            {t("search.search")}
          </button>
        </div>

        {/* Results dropdown */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border bg-white shadow-2xl sm:max-h-96">
            {results.length > 0 ? (
              <>
                <div className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                  {t("search.resultsFound", { count: results.length })}
                </div>
                {results.map((r) => {
                  const cover = r.images?.find((i) => i.is_cover)?.url || r.images?.[0]?.url;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleResultClick(r.slug)}
                      className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      {cover && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={cover}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-lg object-cover sm:h-12 sm:w-16"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {[r.district?.name, r.city?.name].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-lg bg-primary/5 px-2.5 py-1 text-sm font-extrabold tracking-tight text-primary shadow-sm ring-1 ring-primary/10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)] transition-all duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:ring-primary sm:text-base"
                      >
                        {formatPrice(r.price, r.currency)}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex w-full items-center justify-center gap-1 border-t px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50"
                >
                  {t("search.viewAll")}
                </button>
              </>
            ) : (
              !searching && (
                <div className="px-4 py-6 text-center">
                  <Search className="mx-auto h-6 w-6 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    {t("search.noResults", { query })}
                  </p>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    {t("search.searchAll")}
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {searching && query.length >= 2 && !showResults && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-white p-4 text-center text-sm text-gray-500 shadow-xl">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2">{t("search.searching")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
