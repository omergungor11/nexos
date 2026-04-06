"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPropertyPopup } from "./map-property-popup";
import type { MapProperty } from "./map-property-popup";
import { MapProjectPopup } from "./map-project-popup";
import type { MapProject } from "./map-project-popup";

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

// ---------------------------------------------------------------------------
// Custom project pin — purple labeled marker with building icon.
// Displayed outside cluster groups so they're always visible.
// ---------------------------------------------------------------------------
function createProjectIcon(title: string): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        background: #7c3aed;
        color: white;
        padding: 5px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: inline-flex;
        align-items: center;
        gap: 5px;
        line-height: 1;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
          <path d="M9 22V12h6v10"/>
          <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01"/>
        </svg>
        ${title}
      </div>
    `,
    className: "",
    iconSize: undefined as unknown as L.PointExpression,
    iconAnchor: [0, 16],
  });
}

interface FullScreenMapInnerProps {
  properties: MapProperty[];
  projects?: MapProject[];
}

export default function FullScreenMapInner({
  properties,
  projects = [],
}: FullScreenMapInnerProps) {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Count badge */}
      {(properties.length > 0 || projects.length > 0) && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm">
          {properties.length > 0 && <span>{properties.length} ilan</span>}
          {properties.length > 0 && projects.length > 0 && <span className="text-gray-400">·</span>}
          {projects.length > 0 && <span className="text-violet-600">{projects.length} proje</span>}
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

        {/* Project markers — outside cluster group, always visible */}
        {projects.map((project) => (
          <Marker
            key={`project-${project.id}`}
            position={[project.lat, project.lng]}
            icon={createProjectIcon(project.title)}
            zIndexOffset={1000}
          >
            <Popup minWidth={224} maxWidth={224} className="project-popup">
              <MapProjectPopup project={project} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Empty state overlay */}
      {properties.length === 0 && projects.length === 0 && (
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
