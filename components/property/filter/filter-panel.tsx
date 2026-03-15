"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  PROPERTY_TYPES,
  HEATING_TYPES,
  ROOM_OPTIONS,
  PROPERTY_TYPE_TKEYS,
} from "@/lib/constants";
import { X } from "lucide-react";

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

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

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

  const clearAll = useCallback(() => {
    router.push("/emlak");
  }, [router]);

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-5">
      {/* Transaction Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("filter.transactionType")}</label>
        <div className="flex gap-2">
          {[
            { value: "satilik", tKey: "property.sale" },
            { value: "kiralik", tKey: "property.rent" },
          ].map((opt) => (
            <Button
              key={opt.value}
              variant={
                searchParams.get("islem") === opt.value ? "default" : "outline"
              }
              size="sm"
              className="flex-1"
              onClick={() =>
                updateParam(
                  "islem",
                  searchParams.get("islem") === opt.value ? "" : opt.value
                )
              }
            >
              {t(opt.tKey)}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Property Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("filter.propertyType")}</label>
        <Select
          value={searchParams.get("tip") ?? ""}
          onValueChange={(v) => updateParam("tip", v ?? "")}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("filter.all")} />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(PROPERTY_TYPE_TKEYS[type])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("filter.priceRange")}
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t("filter.min")}
            value={searchParams.get("fiyat_min") ?? ""}
            onChange={(e) => updateParam("fiyat_min", e.target.value)}
          />
          <Input
            type="number"
            placeholder={t("filter.max")}
            value={searchParams.get("fiyat_max") ?? ""}
            onChange={(e) => updateParam("fiyat_max", e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Area Range */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("filter.areaRange")}
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t("filter.min")}
            value={searchParams.get("m2_min") ?? ""}
            onChange={(e) => updateParam("m2_min", e.target.value)}
          />
          <Input
            type="number"
            placeholder={t("filter.max")}
            value={searchParams.get("m2_max") ?? ""}
            onChange={(e) => updateParam("m2_max", e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Room Count */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("filter.roomCount")}</label>
        <div className="flex flex-wrap gap-1.5">
          {ROOM_OPTIONS.map((room) => {
            const currentOda = searchParams.get("oda")?.split(",") ?? [];
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
        <label className="mb-1.5 block text-sm font-medium">{t("filter.heating")}</label>
        <Select
          value={searchParams.get("isitma") ?? ""}
          onValueChange={(v) => updateParam("isitma", v ?? "")}
        >
          <SelectTrigger>
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
