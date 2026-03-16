"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPropertyPopup } from "./map-property-popup";
import type { MapProperty } from "./map-property-popup";

// ---------------------------------------------------------------------------
// Fix default marker icon resolution with webpack / Next.js bundler.
// Leaflet bundles icons via CSS url() which breaks when Webpack re-hashes
// the asset filenames. Pointing to unpkg is the most reliable cross-env fix.
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
// Custom cluster icon — renders the count inside a circle that scales with
// cluster size: small (< 10), medium (< 50), large (50+).
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
    small: "#2563eb",   // blue-600
    medium: "#d97706",  // amber-600
    large: "#dc2626",   // red-600
  };
  const bg = colorMap[size];

  return L.divIcon({
    html: `
      <div style="
        width:${px}px;height:${px}px;
        border-radius:50%;
        background:${bg};
        border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:700;font-size:${count < 100 ? 13 : 11}px;
        font-family:inherit;
      ">${count}</div>
    `,
    className: "",
    iconSize: [px, px],
    iconAnchor: [px / 2, px / 2],
  });
}

// ---------------------------------------------------------------------------
// Turkey bounding box — used to fit-bounds when there are no properties.
// ---------------------------------------------------------------------------
// North Cyprus center — the primary operating region
const DEFAULT_CENTER: [number, number] = [35.24, 33.66];
const DEFAULT_ZOOM = 10;

interface FullScreenMapInnerProps {
  properties: MapProperty[];
}

export default function FullScreenMapInner({
  properties,
}: FullScreenMapInnerProps) {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Property count badge */}
      {properties.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm">
          {properties.length} ilan haritada
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          showCoverageOnHover={false}
          maxClusterRadius={60}
          spiderfyOnMaxZoom
        >
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.lat, property.lng]}
            >
              <Popup
                minWidth={224}
                maxWidth={224}
                className="property-popup"
              >
                <MapPropertyPopup property={property} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Empty state overlay */}
      {properties.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
          <div className="rounded-xl bg-white/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
            <p className="font-semibold text-gray-900">
              Haritada gösterilecek ilan bulunamadı
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Koordinat bilgisi olan ilanlar haritada görünür.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
