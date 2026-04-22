"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";
import { Search, MapPin, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GoogleMapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  height?: string;
}

// North Cyprus center
const DEFAULT_CENTER = { lat: 35.24, lng: 33.66 };
const DEFAULT_ZOOM = 10;
const PIN_ZOOM = 15;

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries: ("places")[] = ["places"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function GoogleMapPickerInner({ lat, lng, onChange, height = "400px" }: GoogleMapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null
  );
  const [searchValue, setSearchValue] = useState("");

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Setup Places Autocomplete when map is loaded
  useEffect(() => {
    if (!isLoaded || !autocompleteInputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: ["cy", "tr"] },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarkerPos(newPos);
        onChange(newPos);
        setSearchValue(place.formatted_address ?? place.name ?? "");

        if (mapRef.current) {
          mapRef.current.panTo(newPos);
          mapRef.current.setZoom(PIN_ZOOM);
        }
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [isLoaded, onChange]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(newPos);
      onChange(newPos);
    },
    [onChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(newPos);
      onChange(newPos);
    },
    [onChange]
  );

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-muted"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-xs">Harita yukleniyor...</p>
        </div>
      </div>
    );
  }

  const center = markerPos ?? DEFAULT_CENTER;
  const zoom = markerPos ? PIN_ZOOM : DEFAULT_ZOOM;

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={autocompleteInputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Adres veya konum ara..."
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-lg border" style={{ height }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
          }}
        >
          {markerPos && (
            <Marker
              position={markerPos}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      {/* Coordinates display */}
      {markerPos && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span>
            {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
          </span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Haritaya tiklayarak veya arama yaparak konum secin. Pin&apos;i surukleyerek hassas ayar yapin.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dynamic export — SSR disabled
// ---------------------------------------------------------------------------

import dynamic from "next/dynamic";

const GoogleMapPickerDynamic = dynamic(
  () => Promise.resolve(GoogleMapPickerInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-lg border bg-muted">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs">Harita yukleniyor...</p>
        </div>
      </div>
    ),
  }
);

export function GoogleMapPicker(props: GoogleMapPickerProps) {
  return <GoogleMapPickerDynamic {...props} />;
}
