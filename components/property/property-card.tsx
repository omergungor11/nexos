import Image from "next/image";
import Link from "next/link";
import { MapPin, Maximize2, BedDouble, Building2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, formatArea, formatRooms } from "@/lib/format";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants";
import type { PropertyListItem } from "@/types";

interface PropertyCardProps {
  property: PropertyListItem;
  priority?: boolean;
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const coverImage =
    property.cover_image || "/placeholder-property.jpg";
  const location = [property.district?.name, property.city.name]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/emlak/${property.slug}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {TRANSACTION_TYPE_LABELS[property.transaction_type] ?? property.transaction_type}
            </Badge>
            <Badge variant="secondary">
              {PROPERTY_TYPE_LABELS[property.type] ?? property.type}
            </Badge>
          </div>
          {property.is_featured && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-amber-500 text-white"
            >
              Vitrin
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <p className="text-lg font-bold text-primary">
            {formatPrice(property.price, property.currency)}
          </p>

          <h3 className="mt-1 line-clamp-1 text-sm font-semibold">
            {property.title}
          </h3>

          {location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            {property.rooms !== null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {formatRooms(property.rooms, property.living_rooms)}
              </span>
            )}
            {property.area_sqm && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5" />
                {formatArea(property.area_sqm)}
              </span>
            )}
            {property.floor !== null && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {property.floor}. kat
              </span>
            )}
            {property.views_count > 0 && (
              <span className="ml-auto flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {property.views_count}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
