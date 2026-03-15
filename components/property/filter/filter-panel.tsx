"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROPERTY_CATEGORIES,
  CATEGORY_SUBTYPES,
  CATEGORY_TKEYS,
  PROPERTY_TYPE_TKEYS,
  HEATING_TYPES,
  ROOM_OPTIONS,
  PRICE_RANGE,
  AREA_RANGE,
  FLOOR_RANGE,
  BUILDING_AGE_OPTIONS,
} from "@/lib/constants";
import type { PropertyCategory } from "@/lib/constants";
import { X, ChevronDown, ChevronUp } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CityOption {
  id: number;
  name: string;
  slug: string;
}

interface DistrictOption {
  id: number;
  name: string;
  slug: string;
}

interface FilterPanelProps {
  cities?: CityOption[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HEATING_TYPE_TKEYS: Record<string, string> = {
  none: "heatingType.none",
  central: "heatingType.central",
  natural_gas: "heatingType.natural_gas",
  floor_heating: "heatingType.floor_heating",
  electric: "heatingType.electric",
  solar: "heatingType.solar",
  coal: "heatingType.coal",
  air_condition: "heatingType.air_condition",
};

function formatPrice(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

// ---------------------------------------------------------------------------
// Amenity toggle button
// ---------------------------------------------------------------------------

function AmenityToggle({
  label,
  paramKey,
  isActive,
  onClick,
}: {
  label: string;
  paramKey: string;
  isActive: boolean;
  onClick: (key: string) => void;
}) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className="h-8 px-2.5 text-xs"
      onClick={() => onClick(paramKey)}
    >
      {label}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FilterPanel({ cities = [] }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Determine selected category from current subtype param
  const currentTip = searchParams.get("tip") ?? "";
  const selectedCategory = useMemo((): PropertyCategory | "" => {
    if (!currentTip) return "";
    for (const cat of PROPERTY_CATEGORIES) {
      if ((CATEGORY_SUBTYPES[cat] as readonly string[]).includes(currentTip)) {
        return cat;
      }
    }
    return "";
  }, [currentTip]);

  // Location state
  const currentCity = searchParams.get("sehir") ?? "";
  const currentDistrict = searchParams.get("ilce") ?? "";

  // Load districts when city changes
  useEffect(() => {
    let cancelled = false;

    if (!currentCity) {
      queueMicrotask(() => { if (!cancelled) setDistricts([]); });
      return () => { cancelled = true; };
    }

    const city = cities.find((c) => c.slug === currentCity);
    if (!city) return () => { cancelled = true; };

    queueMicrotask(() => { if (!cancelled) setLoadingDistricts(true); });
    fetch(`/api/locations/districts?cityId=${city.id}`)
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setDistricts(json.data ?? []); })
      .catch(() => { if (!cancelled) setDistricts([]); })
      .finally(() => { if (!cancelled) setLoadingDistricts(false); });
    return () => { cancelled = true; };
  }, [currentCity, cities]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("sayfa");
      router.push(`/emlak?${params.toString()}`);
    },
    [router, searchParams]
  );

  const updateMultipleParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("sayfa");
      router.push(`/emlak?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/emlak");
  }, [router]);

  const toggleBoolParam = useCallback(
    (key: string) => {
      const current = searchParams.get(key);
      updateParam(key, current ? "" : "1");
    },
    [searchParams, updateParam]
  );

  const hasFilters = searchParams.toString().length > 0;

  // Slider values
  const priceMin = Number(searchParams.get("fiyat_min") || PRICE_RANGE.min);
  const priceMax = Number(searchParams.get("fiyat_max") || PRICE_RANGE.max);
  const areaMin = Number(searchParams.get("m2_min") || AREA_RANGE.min);
  const areaMax = Number(searchParams.get("m2_max") || AREA_RANGE.max);

  // Amenity definitions
  const amenities = [
    { key: "otopark", label: t("filter.parking") },
    { key: "esyali", label: t("filter.furnished") },
    { key: "asansor", label: t("filter.elevator") },
    { key: "havuz", label: t("filter.pool") },
    { key: "bahce", label: t("filter.garden") },
    { key: "guvenlik", label: t("filter.security") },
    { key: "balkon", label: t("filter.balcony") },
  ];

  return (
    <div className="space-y-5">
      {/* Transaction Type Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { value: "", tKey: "filter.all" },
          { value: "satilik", tKey: "property.sale" },
          { value: "kiralik", tKey: "property.rent" },
          { value: "gunluk", tKey: "property.dailyRental" },
        ].map((opt) => {
          const isActive =
            opt.value === ""
              ? !searchParams.get("islem")
              : searchParams.get("islem") === opt.value;
          return (
            <Button
              key={opt.value || "all"}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => updateParam("islem", opt.value)}
            >
              {t(opt.tKey)}
            </Button>
          );
        })}
      </div>

      <Separator />

      {/* Property Category - 3 Buttons (Konut, Arsa, Ticari) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("filter.propertyType")}
        </label>
        <div className="flex gap-1.5">
          {PROPERTY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <Button
                key={cat}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (isActive) {
                    updateParam("tip", "");
                  } else {
                    updateParam("tip", CATEGORY_SUBTYPES[cat][0]);
                  }
                }}
              >
                {t(CATEGORY_TKEYS[cat])}
              </Button>
            );
          })}
        </div>

        {/* Subtypes dropdown - shows when a category is selected */}
        {selectedCategory && (
          <div className="mt-2">
            <Select
              value={currentTip}
              onValueChange={(v) => updateParam("tip", v ?? "")}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("filter.all")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_SUBTYPES[selectedCategory].map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(PROPERTY_TYPE_TKEYS[type])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      {/* City / District */}
      {cities.length > 0 && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t("filter.city")}
            </label>
            <Select
              value={currentCity}
              onValueChange={(v) => {
                updateMultipleParams({
                  sehir: v ?? "",
                  ilce: "",
                });
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("filter.selectCity")}>
                  {currentCity
                    ? (cities.find((c) => c.slug === currentCity)?.name ?? currentCity)
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentCity && (
              <Select
                value={currentDistrict}
                onValueChange={(v) => updateParam("ilce", v ?? "")}
                disabled={loadingDistricts || districts.length === 0}
              >
                <SelectTrigger className="h-9">
                  <SelectValue
                    placeholder={
                      loadingDistricts
                        ? "Yükleniyor..."
                        : t("filter.selectDistrict")
                    }
                  >
                    {currentDistrict
                      ? (districts.find((d) => d.slug === currentDistrict)?.name ?? currentDistrict)
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.slug}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Separator />
        </>
      )}

      {/* Price Range Slider */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium">
            {t("filter.priceRange")}
          </label>
          <span className="text-xs text-muted-foreground">
            {formatPrice(priceMin)} – {formatPrice(priceMax)} £
          </span>
        </div>
        <Slider
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={PRICE_RANGE.step}
          value={[priceMin, priceMax]}
          onValueCommitted={(value) => {
            const values = Array.isArray(value) ? value : [value];
            updateMultipleParams({
              fiyat_min:
                values[0] > PRICE_RANGE.min ? values[0].toString() : "",
              fiyat_max:
                (values[1] ?? PRICE_RANGE.max) < PRICE_RANGE.max ? (values[1] ?? PRICE_RANGE.max).toString() : "",
            });
          }}
        />
      </div>

      <Separator />

      {/* Area Range Slider */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium">{t("filter.areaRange")}</label>
          <span className="text-xs text-muted-foreground">
            {areaMin} – {areaMax} m²
          </span>
        </div>
        <Slider
          min={AREA_RANGE.min}
          max={AREA_RANGE.max}
          step={AREA_RANGE.step}
          value={[areaMin, areaMax]}
          onValueCommitted={(value) => {
            const values = Array.isArray(value) ? value : [value];
            updateMultipleParams({
              m2_min: values[0] > AREA_RANGE.min ? values[0].toString() : "",
              m2_max: (values[1] ?? AREA_RANGE.max) < AREA_RANGE.max ? (values[1] ?? AREA_RANGE.max).toString() : "",
            });
          }}
        />
      </div>

      <Separator />

      {/* Advanced Filters Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {t("filter.detailed")}
        {showAdvanced ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Advanced Filters Section */}
      {showAdvanced && (
        <div className="space-y-5 pt-1">
          {/* Room Count */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("filter.roomCount")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_OPTIONS.map((room) => {
                const currentOda =
                  searchParams.get("oda")?.split(",") ?? [];
                const isActive = currentOda.includes(room);
                return (
                  <Button
                    key={room}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => {
                      const next = isActive
                        ? currentOda.filter((r) => r !== room)
                        : [...currentOda, room];
                      updateParam("oda", next.filter(Boolean).join(","));
                    }}
                  >
                    {room}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Heating */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("filter.heating")}
            </label>
            <Select
              value={searchParams.get("isitma") ?? ""}
              onValueChange={(v) => updateParam("isitma", v ?? "")}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("filter.all")} />
              </SelectTrigger>
              <SelectContent>
                {HEATING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(HEATING_TYPE_TKEYS[type])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Floor Range */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium">
                {t("filter.floorRange")}
              </label>
              <span className="text-xs text-muted-foreground">
                {searchParams.get("kat_min") ?? FLOOR_RANGE.min} – {searchParams.get("kat_max") ?? FLOOR_RANGE.max}
              </span>
            </div>
            <Slider
              min={FLOOR_RANGE.min}
              max={FLOOR_RANGE.max}
              step={FLOOR_RANGE.step}
              value={[
                Number(searchParams.get("kat_min") || FLOOR_RANGE.min),
                Number(searchParams.get("kat_max") || FLOOR_RANGE.max),
              ]}
              onValueCommitted={(value) => {
                const values = Array.isArray(value) ? value : [value];
                updateMultipleParams({
                  kat_min:
                    values[0] > FLOOR_RANGE.min ? values[0].toString() : "",
                  kat_max:
                    (values[1] ?? FLOOR_RANGE.max) < FLOOR_RANGE.max
                      ? (values[1] ?? FLOOR_RANGE.max).toString()
                      : "",
                });
              }}
            />
          </div>

          <Separator />

          {/* Building Age */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("filter.buildingAge")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={!searchParams.get("bina_yasi") ? "default" : "outline"}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => updateParam("bina_yasi", "")}
              >
                {t("filter.anyAge")}
              </Button>
              {BUILDING_AGE_OPTIONS.map((age) => {
                const isActive = searchParams.get("bina_yasi") === String(age);
                return (
                  <Button
                    key={age}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => updateParam("bina_yasi", String(age))}
                  >
                    {age}+
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("filter.amenities")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((a) => (
                <AmenityToggle
                  key={a.key}
                  label={a.label}
                  paramKey={a.key}
                  isActive={!!searchParams.get(a.key)}
                  onClick={toggleBoolParam}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasFilters && (
        <>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground"
            onClick={clearAll}
          >
            <X className="h-4 w-4" />
            {t("filter.clearFilters")}
          </Button>
        </>
      )}
    </div>
  );
}
