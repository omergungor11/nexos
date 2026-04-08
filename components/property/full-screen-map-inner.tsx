"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronRight, List, Building2, MapPin } from "lucide-react";
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

function formatPrice(price: number, currency: string) {
  const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
  return `${sym}${price.toLocaleString("tr-TR")}`;
}

const TX_LABELS: Record<string, string> = {
  sale: "Satılık",
  rent: "Kiralık",
  daily_rental: "Günlük",
};

const TYPE_LABELS: Record<string, string> = {
  villa: "Villa", apartment: "Daire", twin_villa: "İkiz Villa",
  penthouse: "Penthouse", bungalow: "Bungalow", detached: "Müstakil Ev",
  residential_land: "Arsa", shop: "Dükkan", office: "Ofis",
};

export default function FullScreenMapInner({
  properties,
  projects = [],
}: FullScreenMapInnerProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden">
      {/* Count badge — clickable */}
      {(properties.length > 0 || projects.length > 0) && (
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute top-3 right-3 z-[400] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm transition-colors hover:bg-white"
        >
          <List className="h-3.5 w-3.5 text-gray-500" />
          {properties.length > 0 && <span>{properties.length} ilan</span>}
          {properties.length > 0 && projects.length > 0 && <span className="text-gray-400">·</span>}
          {projects.length > 0 && <span className="text-violet-600">{projects.length} proje</span>}
          <ChevronRight className={`h-3.5 w-3.5 text-gray-400 transition-transform ${panelOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Side panel — property list */}
      <div
        className={`absolute top-0 right-0 z-[400] h-full w-80 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-96 ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">
              Haritadaki İlanlar ({properties.length + projects.length})
            </h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="rounded-lg p-1 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto">
            {/* Properties */}
            {properties.map((p) => (
              <Link
                key={p.id}
                href={`/emlak/${p.slug}`}
                className="flex gap-3 border-b px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {p.cover_image ? (
                    <Image
                      src={p.cover_image}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Building2 className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {p.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{p.city}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(p.price, p.currency)}
                    </span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      {TX_LABELS[p.transaction_type] ?? p.transaction_type}
                    </span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      {TYPE_LABELS[p.type] ?? p.type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Projects */}
            {projects.length > 0 && (
              <>
                {properties.length > 0 && (
                  <div className="bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
                    Projeler ({projects.length})
                  </div>
                )}
                {projects.map((p) => (
                  <Link
                    key={`proj-${p.id}`}
                    href={`/projeler/${p.slug}`}
                    className="flex gap-3 border-b px-4 py-3 transition-colors hover:bg-violet-50/50"
                  >
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-violet-100">
                      {p.cover_image ? (
                        <Image
                          src={p.cover_image}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-5 w-5 text-violet-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {p.title}
                      </p>
                      {p.city && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{p.city}</span>
                        </div>
                      )}
                      <span className="mt-1 inline-block rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                        Proje
                      </span>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

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
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
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
