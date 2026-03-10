"use client";

import dynamic from "next/dynamic";
import type { MapProperty } from "./map-property-popup";

// ---------------------------------------------------------------------------
// The actual map implementation — loaded only on the client to avoid SSR
// issues with Leaflet's dependency on `window`.
// ---------------------------------------------------------------------------

const FullScreenMapInner = dynamic(() => import("./full-screen-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm">Harita yükleniyor…</p>
      </div>
    </div>
  ),
});

interface FullScreenMapProps {
  properties: MapProperty[];
}

export function FullScreenMap({ properties }: FullScreenMapProps) {
  return <FullScreenMapInner properties={properties} />;
}
