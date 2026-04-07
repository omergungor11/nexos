"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Fix Leaflet default marker icon (same pattern as full-screen-map-inner)
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

// North Cyprus center
const DEFAULT_CENTER: [number, number] = [35.24, 33.66];
const DEFAULT_ZOOM = 13;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// ---------------------------------------------------------------------------
// Inner map component — handles click + drag events
// ---------------------------------------------------------------------------

function MapClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const prevCenter = useRef<string | null>(null);

  useEffect(() => {
    if (!center) return;
    const key = `${center[0].toFixed(6)},${center[1].toFixed(6)}`;
    if (key === prevCenter.current) return;
    prevCenter.current = key;
    map.setView(center, Math.max(map.getZoom(), 15), { animate: true });
  }, [center, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Main LocationPicker (inner, requires window)
// ---------------------------------------------------------------------------

function LocationPickerInner({ lat, lng, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    lat != null && lng != null ? [lat, lng] : null
  );
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync external lat/lng changes
  useEffect(() => {
    if (lat != null && lng != null) {
      setMarkerPos([lat, lng]);
    }
  }, [lat, lng]);

  const handleMapClick = useCallback(
    (newLat: number, newLng: number) => {
      setMarkerPos([newLat, newLng]);
      onChange({ lat: newLat, lng: newLng });
      setShowResults(false);
    },
    [onChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: L.DragEndEvent) => {
      const pos = (e.target as L.Marker).getLatLng();
      setMarkerPos([pos.lat, pos.lng]);
      onChange({ lat: pos.lat, lng: pos.lng });
    },
    [onChange]
  );

  function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;

    setSearching(true);
    setShowResults(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&accept-language=tr`,
      { headers: { "User-Agent": "NexosInvestment/1.0" } }
    )
      .then((res) => res.json())
      .then((data: NominatimResult[]) => {
        setResults(data);
        setSearching(false);
      })
      .catch(() => {
        setResults([]);
        setSearching(false);
      });
  }

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length >= 3) {
      searchTimeout.current = setTimeout(handleSearch, 400);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }

  function selectResult(result: NominatimResult) {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    setMarkerPos([newLat, newLng]);
    setFlyTo([newLat, newLng]);
    onChange({ lat: newLat, lng: newLng });
    setShowResults(false);
    setSearchQuery(result.display_name.split(",").slice(0, 2).join(","));
  }

  // Close results on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const center: [number, number] =
    markerPos ?? DEFAULT_CENTER;

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative" ref={resultsRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Konum ara... (ör: Girne, Alsancak)"
              className="pl-9 h-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="gap-1.5 shrink-0"
          >
            {searching ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <MapPin className="size-3.5" />
            )}
            Ara
          </Button>
        </div>

        {/* Search results dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-[1100] mt-1 w-full rounded-lg border bg-background shadow-lg">
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <MapPin className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {showResults && !searching && results.length === 0 && searchQuery.trim().length >= 3 && (
          <div className="absolute z-[1100] mt-1 w-full rounded-lg border bg-background px-3 py-3 text-center text-sm text-muted-foreground shadow-lg">
            Sonuç bulunamadı
          </div>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-lg border">
        <MapContainer
          center={center}
          zoom={markerPos ? 15 : DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ height: "300px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapClickHandler onChange={handleMapClick} />
          <MapCenterUpdater center={flyTo} />

          {markerPos && (
            <Marker
              position={markerPos}
              draggable
              eventHandlers={{ dragend: handleMarkerDragEnd }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        Haritaya tıklayarak veya arama yaparak konum seçin. Pin&apos;i sürükleyerek hassas ayar yapın.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dynamic wrapper — SSR disabled
// ---------------------------------------------------------------------------

import dynamic from "next/dynamic";

const LocationPickerDynamic = dynamic(
  () => Promise.resolve(LocationPickerInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-lg border bg-muted">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs">Harita yükleniyor…</p>
        </div>
      </div>
    ),
  }
);

export function LocationPicker(props: LocationPickerProps) {
  return <LocationPickerDynamic {...props} />;
}
