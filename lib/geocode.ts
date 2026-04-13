// Northern Cyprus geocoding via OpenStreetMap Nominatim.
// We constrain results to a KKTC-focused bounding box so matches like
// "Alsancak" in other countries don't win over the local one.

// viewbox: lon_min, lat_max, lon_max, lat_min (OSM order is x1,y1,x2,y2)
// North Cyprus: roughly lon 32.27 → 34.60, lat 34.55 → 35.73
const KKTC_VIEWBOX = "32.27,35.73,34.60,34.55";

// Broader Cyprus bbox used to sanity-check the response — reject anything
// that lands outside the island no matter how confident Nominatim is.
const CYPRUS_BOUNDS = {
  latMin: 34.5,
  latMax: 35.8,
  lngMin: 32.2,
  lngMax: 34.7,
};

export interface GeocodeResult {
  lat: number;
  lng: number;
}

// Try a sequence of progressively looser queries. More specific first so we
// don't accidentally match a shop named "Alsancak" before the place itself.
async function tryNominatim(queries: string[]): Promise<GeocodeResult | null> {
  for (const q of queries) {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("viewbox", KKTC_VIEWBOX);
      url.searchParams.set("bounded", "1");
      url.searchParams.set("accept-language", "tr,en");

      const res = await fetch(url.toString(), {
        headers: {
          // Nominatim requires a descriptive UA + contact
          "User-Agent": "NexosInvestment/1.0 (contact@nexosinvestment.com)",
        },
        // Don't cache server-side — the DB is the cache
        cache: "no-store",
      });

      if (!res.ok) continue;

      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!data.length) continue;

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= CYPRUS_BOUNDS.latMin &&
        lat <= CYPRUS_BOUNDS.latMax &&
        lng >= CYPRUS_BOUNDS.lngMin &&
        lng <= CYPRUS_BOUNDS.lngMax
      ) {
        return { lat, lng };
      }
    } catch {
      // Network errors or malformed responses — just try the next query
    }
  }
  return null;
}

export async function geocodeCity(cityName: string): Promise<GeocodeResult | null> {
  return tryNominatim([
    `${cityName}, Kuzey Kıbrıs`,
    `${cityName}, KKTC`,
    `${cityName}, Cyprus`,
  ]);
}

export async function geocodeDistrict(
  districtName: string,
  cityName: string
): Promise<GeocodeResult | null> {
  return tryNominatim([
    `${districtName}, ${cityName}, Kuzey Kıbrıs`,
    `${districtName}, ${cityName}, Cyprus`,
    `${districtName}, Kuzey Kıbrıs`,
    `${districtName}, Cyprus`,
  ]);
}

export async function geocodeNeighborhood(
  neighborhoodName: string,
  districtName: string,
  cityName: string
): Promise<GeocodeResult | null> {
  return tryNominatim([
    `${neighborhoodName}, ${districtName}, ${cityName}, Kuzey Kıbrıs`,
    `${neighborhoodName}, ${districtName}, Cyprus`,
    `${neighborhoodName}, ${cityName}, Cyprus`,
    `${neighborhoodName}, Kuzey Kıbrıs`,
  ]);
}
