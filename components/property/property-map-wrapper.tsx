"use client";

import dynamic from "next/dynamic";

const PropertyMapInner = dynamic(() => import("./property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted" />
  ),
});

interface PropertyMapProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
  title: string;
  address?: string;
  cityLat?: number | null;
  cityLng?: number | null;
  districtLat?: number | null;
  districtLng?: number | null;
}

export function PropertyMap({ lat, lng, title, address, cityLat, cityLng, districtLat, districtLng }: PropertyMapProps) {
  // Use property coords, fallback to district, then city
  const finalLat = lat ?? districtLat ?? cityLat;
  const finalLng = lng ?? districtLng ?? cityLng;
  const isApproximate = lat == null || lng == null;

  if (finalLat == null || finalLng == null) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        Harita bilgisi mevcut değil
      </div>
    );
  }

  return (
    <div className="relative">
      {isApproximate && (
        <div className="absolute left-3 top-3 z-[1000] rounded-md bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 shadow">
          Yaklaşık konum (il/ilçe merkezi)
        </div>
      )}
      <PropertyMapInner lat={finalLat} lng={finalLng} title={title} address={address} />
    </div>
  );
}
