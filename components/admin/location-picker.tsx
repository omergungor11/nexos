"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Fix Leaflet default marker icon
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

interface LocationResult {
  id: number;
  name: string;
  type: "city" | "district";
  cityName?: string;
  lat: number | null;
  lng: number | null;
}

// ---------------------------------------------------------------------------
// Map sub-components
// ---------------------------------------------------------------------------

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
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
// Location search hook — searches cities & districts from DB
// ---------------------------------------------------------------------------

function useLocationSearch() {
  const [allLocations, setAllLocations] = useState<LocationResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load all cities + districts once
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();

      const [citiesRes, districtsRes] = await Promise.all([
        supabase
          .from("cities")
          .select("id, name, lat, lng")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("districts")
          .select("id, name, lat, lng, city:cities(name)")
          .eq("is_active", true)
          .order("name"),
      ]);

      if (cancelled) return;

      const cities: LocationResult[] = (citiesRes.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        type: "city" as const,
        lat: c.lat,
        lng: c.lng,
      }));

      const districts: LocationResult[] = (districtsRes.data ?? []).map((d) => {
        const city = d.city as unknown as { name: string } | null;
        return {
          id: d.id,
          name: d.name,
          type: "district" as const,
          cityName: city?.name ?? undefined,
          lat: d.lat,
          lng: d.lng,
        };
      });

      setAllLocations([...cities, ...districts]);
      setLoaded(true);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  function search(query: string): LocationResult[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allLocations
      .filter((loc) => {
        const nameMatch = loc.name.toLowerCase().includes(q);
        const cityMatch = loc.cityName?.toLowerCase().includes(q);
        return nameMatch || cityMatch;
      })
      .slice(0, 8);
  }

  return { search, loaded };
}

// ---------------------------------------------------------------------------
// Main LocationPicker (inner, requires window)
// ---------------------------------------------------------------------------

function LocationPickerInner({ lat, lng, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    lat != null && lng != null ? [lat, lng] : null
  );
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { search, loaded } = useLocationSearch();

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

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      const found = search(value);
      setResults(found);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }

  function selectResult(result: LocationResult) {
    if (result.lat != null && result.lng != null) {
      setMarkerPos([result.lat, result.lng]);
      setFlyTo([result.lat, result.lng]);
      onChange({ lat: result.lat, lng: result.lng });
    }
    setShowResults(false);
    setSearchQuery(
      result.type === "district" && result.cityName
        ? `${result.name}, ${result.cityName}`
        : result.name
    );
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

  const center: [number, number] = markerPos ?? DEFAULT_CENTER;

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative" ref={resultsRef}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={loaded ? "Şehir veya ilçe ara... (ör: Girne, Long Beach)" : "Konumlar yükleniyor..."}
            className="pl-9 h-9"
            disabled={!loaded}
          />
          {!loaded && (
            <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search results dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-[1100] mt-1 w-full rounded-lg border bg-background shadow-lg">
            {results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                type="button"
                onClick={() => selectResult(r)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{r.name}</span>
                  {r.type === "district" && r.cityName && (
                    <span className="ml-1.5 text-muted-foreground">— {r.cityName}</span>
                  )}
                </div>
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {r.type === "city" ? "Şehir" : "İlçe"}
                </span>
                {r.lat == null && (
                  <span className="shrink-0 text-[10px] text-amber-500">Koordinat yok</span>
                )}
              </button>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && searchQuery.trim().length >= 2 && (
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
        Şehir/ilçe arayarak veya haritaya tıklayarak konum seçin. Pin&apos;i sürükleyerek hassas ayar yapın.
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
