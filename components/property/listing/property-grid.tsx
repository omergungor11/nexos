import { PropertyCard } from "@/components/property/property-card";
import type { PropertyListItem } from "@/types";

interface PropertyGridProps {
  properties: PropertyListItem[];
  emptyMessage?: string;
}

export function PropertyGrid({
  properties,
  emptyMessage = "İlan bulunamadı.",
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {emptyMessage}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtrelerinizi değiştirmeyi deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
