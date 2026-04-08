"use client";

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---------------------------------------------------------------------------
// Leaflet default icon fix — same as full-screen-map-inner.tsx
// ---------------------------------------------------------------------------
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ---------------------------------------------------------------------------
// Types & defaults
// ---------------------------------------------------------------------------
interface AdminMapPreviewProps {
  properties: Array<{ id: string; lat: number; lng: number; title: string }>;
}

const DEFAULT_CENTER: [number, number] = [35.24, 33.66];
const DEFAULT_ZOOM = 10;

// ---------------------------------------------------------------------------
// Component — simple markers without clustering for admin preview
// ---------------------------------------------------------------------------
export default function AdminMapPreview({ properties }: AdminMapPreviewProps) {
  return (
    <div className="relative h-[350px] w-full overflow-hidden rounded-lg border">
      {properties.length === 0 && (
        <div className="absolute top-2 left-2 z-[500] rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
          Haritada gösterilecek ilan yok
        </div>
      )}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {properties.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}>
            <Tooltip>{p.title}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
