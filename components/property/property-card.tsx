import Image from "next/image";
import { MapPin, Maximize2, BedDouble, Building2, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, formatArea, formatRooms } from "@/lib/format";
import {
  PROPERTY_TYPE_TKEYS,
  TRANSACTION_TYPE_TKEYS,
} from "@/lib/constants";
import type { PropertyListItem } from "@/types";

interface PropertyCardProps {
  property: PropertyListItem;
  priority?: boolean;
}

const PLACEHOLDER_IMAGES = [
  "/images/property-1.jpg",
  "/images/property-2.jpg",
  "/images/property-3.jpg",
  "/images/property-4.jpg",
  "/images/property-5.jpg",
  "/images/property-6.jpg",
];

function getPlaceholderImage(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return PLACEHOLDER_IMAGES[Math.abs(hash) % PLACEHOLDER_IMAGES.length];
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const t = useTranslations();
  const coverImage =
    property.cover_image || getPlaceholderImage(property.id);
  const location = [property.district?.name, property.city?.name]
    .filter(Boolean)
    .join(", ");
  const listingNumber = Math.abs(
    property.id.split("").reduce((acc: number, ch: string) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0)
  ) % 900000 + 100000;

  const transactionLabel =
    TRANSACTION_TYPE_TKEYS[property.transaction_type]
      ? t(TRANSACTION_TYPE_TKEYS[property.transaction_type])
      : property.transaction_type;

  const typeLabel =
    PROPERTY_TYPE_TKEYS[property.type]
      ? t(PROPERTY_TYPE_TKEYS[property.type])
      : property.type;

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
      <Link href={{ pathname: "/emlak/[slug]", params: { slug: property.slug } }}>
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
              {transactionLabel}
            </Badge>
            <Badge variant="secondary">
              {typeLabel}
            </Badge>
          </div>
          {property.is_featured && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-primary text-primary-foreground"
            >
              {t("property.featured")}
            </Badge>
          )}
          {/* Price badge on image */}
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-base font-bold text-white">
              {formatPrice(property.price, property.currency)}
            </p>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">
              #{listingNumber}
            </span>
          </div>

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
                {t("property.floor", { floor: property.floor })}
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
