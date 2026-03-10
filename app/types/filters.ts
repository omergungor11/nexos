import type { PropertyType, HeatingType } from "./property";

export interface PropertyFilters {
  islem?: "satilik" | "kiralik";
  tip?: PropertyType[];
  sehir?: string;
  ilce?: string;
  mahalle?: string;
  fiyat_min?: number;
  fiyat_max?: number;
  para_birimi?: "TRY" | "USD" | "EUR";
  m2_min?: number;
  m2_max?: number;
  oda?: string[];
  kat_min?: number;
  kat_max?: number;
  bina_yasi_max?: number;
  ozellikler?: string[];
  isitma?: HeatingType;
  siralama?: SortOption;
  sayfa?: number;
  gorunum?: "liste" | "kart" | "harita";
}

export type SortOption =
  | "yeni"
  | "eski"
  | "fiyat_artan"
  | "fiyat_azalan"
  | "m2_artan"
  | "m2_azalan"
  | "cok_izlenen";
