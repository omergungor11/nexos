"use client";

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---------------------------------------------------------------------------
// Leaflet default icon fix
// ---------------------------------------------------------------------------
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ---------------------------------------------------------------------------
// Cluster icon
// ---------------------------------------------------------------------------
interface MarkerClusterLike {
  getChildCount(): number;
}

function createClusterIcon(cluster: MarkerClusterLike): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? "small" : count < 50 ? "medium" : "large";
  const sizeMap: Record<string, number> = { small: 36, medium: 44, large: 52 };
  const px = sizeMap[size];
  const colorMap: Record<string, string> = {
    small: "#2563eb",
    medium: "#d97706",
    large: "#dc2626",
  };
  const bg = colorMap[size];

  return L.divIcon({
    html: `<div style="width:${px}px;height:${px}px;border-radius:50%;background:${bg};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:${count < 100 ? 13 : 11}px;font-family:inherit;">${count}</div>`,
    className: "",
    iconSize: [px, px],
    iconAnchor: [px / 2, px / 2],
  });
}

// ---------------------------------------------------------------------------
// Types & defaults
// ---------------------------------------------------------------------------
interface AdminMapPreviewProps {
  properties: Array<{ id: string; lat: number; lng: number; title: string }>;
}

const DEFAULT_CENTER: [number, number] = [35.24, 33.66];
const DEFAULT_ZOOM = 10;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminMapPreview({ properties }: AdminMapPreviewProps) {
  return (
    <div className="h-[350px] w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon}>
          {properties.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Tooltip>{p.title}</Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
