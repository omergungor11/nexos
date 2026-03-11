import {
  GraduationCap,
  ShoppingCart,
  Stethoscope,
  Bus,
  TreePine,
  UtensilsCrossed,
  Waves,
  Building2,
} from "lucide-react";

interface NearbyPlace {
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  name: string;
  distance: string;
}

interface NearbyPlacesProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
}

// Static nearby places based on general location — these would ideally come
// from a Places API, but for now we show representative data.
function getEstimatedPlaces(): NearbyPlace[] {
  return [
    { icon: GraduationCap, category: "Eğitim", name: "Okul", distance: "~500m" },
    { icon: ShoppingCart, category: "Market", name: "Süpermarket", distance: "~300m" },
    { icon: Stethoscope, category: "Sağlık", name: "Hastane / Klinik", distance: "~1 km" },
    { icon: Bus, category: "Ulaşım", name: "Otobüs Durağı", distance: "~200m" },
    { icon: TreePine, category: "Park", name: "Park / Yeşil Alan", distance: "~400m" },
    { icon: UtensilsCrossed, category: "Restoran", name: "Kafe & Restoran", distance: "~250m" },
    { icon: Waves, category: "Deniz", name: "Sahil", distance: "~1.5 km" },
    { icon: Building2, category: "Banka", name: "Banka Şubesi", distance: "~600m" },
  ];
}

export function NearbyPlaces({ lat, lng }: NearbyPlacesProps) {
  if (lat == null || lng == null) return null;

  const places = getEstimatedPlaces();

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Çevredeki Mekanlar</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {places.map((place) => (
          <div
            key={place.category}
            className="flex items-center gap-2.5 rounded-lg border p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <place.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{place.category}</p>
              <p className="text-xs text-muted-foreground">{place.distance}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        * Mesafeler tahminidir, kesin bilgi için danışmanınıza sorunuz.
      </p>
    </div>
  );
}
