"use client";

import { MapPin, Maximize2, BedDouble, Building2, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatListingPrice, formatArea, formatRooms } from "@/lib/format";
import {
  PROPERTY_TYPE_TKEYS,
  TRANSACTION_TYPE_TKEYS,
} from "@/lib/constants";
import type { PropertyListItem } from "@/types";
import { CardImagePreview } from "./card-image-preview";

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
  const router = useRouter();

  // Build gallery list — prefer full `images` array, fall back to cover-only,
  // or a deterministic placeholder when the listing has no photos yet.
  const gallery: Array<{ url: string; alt_text?: string | null }> =
    property.images && property.images.length > 0
      ? property.images
      : property.cover_image
      ? [{ url: property.cover_image, alt_text: property.title }]
      : [{ url: getPlaceholderImage(property.id), alt_text: property.title }];

  const location = [property.district?.name, property.city?.name]
    .filter(Boolean)
    .join(", ");
  const listingNumber = String(property.listing_number ?? 0).padStart(4, "0");

  const transactionLabel =
    TRANSACTION_TYPE_TKEYS[property.transaction_type]
      ? t(TRANSACTION_TYPE_TKEYS[property.transaction_type])
      : property.transaction_type;

  const typeLabel =
    PROPERTY_TYPE_TKEYS[property.type]
      ? t(PROPERTY_TYPE_TKEYS[property.type])
      : property.type;

  const detailHref = {
    pathname: "/emlak/[slug]" as const,
    params: { slug: property.slug },
  };

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
      {/* Image section — NOT wrapped in Link so carousel controls work.
          We trigger navigation programmatically on non-control clicks. */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <CardImagePreview
          images={gallery}
          title={property.title}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onNavigate={() => router.push(detailHref)}
        />

        {/* Overlays — rendered above the preview, pointer-events-none so
            they don't steal pointer events from swipe / arrow buttons. */}
        <div className="pointer-events-none absolute top-2 left-2 z-20 flex gap-1.5">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            {transactionLabel}
          </Badge>
          <Badge variant="secondary">{typeLabel}</Badge>
        </div>

        {property.is_featured && (
          <Badge
            variant="secondary"
            className="pointer-events-none absolute top-2 right-2 z-20 bg-primary text-primary-foreground"
          >
            {t("property.featured")}
          </Badge>
        )}

        {/* Price badge */}
        <div className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          <p className="text-base font-bold text-white">
            {formatListingPrice(
              property.price,
              property.currency,
              (property as unknown as { pricing_type?: string }).pricing_type
            )}
          </p>
        </div>
      </div>

      {/* Text content — still a link for accessibility / right-click-new-tab */}
      <Link href={detailHref}>
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
              <MapPin className="h-3 w-3 text-primary" />
              {location}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            {property.rooms !== null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 text-primary" />
                {formatRooms(property.rooms, property.living_rooms)}
              </span>
            )}
            {property.area_sqm && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                {formatArea(property.area_sqm)}
              </span>
            )}
            {property.floor !== null && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                {t("property.floor", { floor: property.floor })}
              </span>
            )}
            {property.views_count > 0 && (
              <span className="ml-auto flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-primary" />
                {property.views_count}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

