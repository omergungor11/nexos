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
}

export function PropertyMap({ lat, lng, title, address }: PropertyMapProps) {
  if (lat == null || lng == null) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        Harita bilgisi mevcut değil
      </div>
    );
  }

  return (
    <PropertyMapInner lat={lat} lng={lng} title={title} address={address} />
  );
}
