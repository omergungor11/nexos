import Image from "next/image";
import Link from "next/link";
import { BedDouble, Maximize2 } from "lucide-react";
import { formatListingPrice, formatArea, formatRooms } from "@/lib/format";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants";

export interface MapProperty {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  rooms: number | null;
  living_rooms: number | null;
  area_sqm: number | null;
  lat: number;
  lng: number;
  cover_image: string | null;
  city?: string | null;
}

interface MapPropertyPopupProps {
  property: MapProperty;
}

export function MapPropertyPopup({ property }: MapPropertyPopupProps) {
  const coverImage = property.cover_image ?? "/placeholder-property.svg";

  return (
    <div className="w-56">
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden rounded-t-md">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          className="object-cover"
          sizes="224px"
          unoptimized
        />
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
            {TRANSACTION_TYPE_LABELS[property.transaction_type] ??
              property.transaction_type}
          </span>
          <span className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
            {PROPERTY_TYPE_LABELS[property.type] ?? property.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5">
        <p className="text-sm font-bold text-primary">
          {formatListingPrice(
            property.price,
            property.currency,
            (property as unknown as { pricing_type?: string }).pricing_type
          )}
        </p>

        <h3 className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-gray-900">
          {property.title}
        </h3>

        {/* Stats */}
        {(property.rooms !== null || property.area_sqm !== null) && (
          <div className="mt-2 flex items-center gap-2.5 text-[11px] text-gray-500">
            {property.rooms !== null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3 w-3" />
                {formatRooms(property.rooms, property.living_rooms)}
              </span>
            )}
            {property.area_sqm !== null && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                {formatArea(property.area_sqm)}
              </span>
            )}
          </div>
        )}

        <Link
          href={`/emlak/${property.slug}`}
          className="mt-2.5 block w-full rounded-md bg-primary px-3 py-1.5 text-center text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          target="_blank"
          rel="noopener noreferrer"
        >
          Detayları Gör
        </Link>
      </div>
    </div>
  );
}
