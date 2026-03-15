// Structural data — labels come from translations via t()

// Property type categories
export type PropertyCategory = "residential" | "land" | "commercial";

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  "residential",
  "land",
  "commercial",
];

export const RESIDENTIAL_TYPES = [
  "villa",
  "apartment",
  "twin_villa",
  "penthouse",
  "residence",
  "bungalow",
  "detached",
  "building",
  "timeshare",
  "derelict",
  "unfinished",
] as const;

export const LAND_TYPES = [
  "residential_land",
  "mixed_land",
  "commercial_land",
  "industrial_land",
  "tourism_land",
  "field",
  "olive_grove",
] as const;

export const COMMERCIAL_TYPES = [
  "shop",
  "hotel",
  "workplace",
  "warehouse",
  "business_transfer",
  "office",
] as const;

export const CATEGORY_SUBTYPES: Record<PropertyCategory, readonly string[]> = {
  residential: RESIDENTIAL_TYPES,
  land: LAND_TYPES,
  commercial: COMMERCIAL_TYPES,
};

// Flat list for backward compat
export const PROPERTY_TYPES = [
  ...RESIDENTIAL_TYPES,
  ...LAND_TYPES,
  ...COMMERCIAL_TYPES,
] as const;

export const TRANSACTION_TYPES = ["sale", "rent"] as const;

export const PROPERTY_STATUSES = [
  "available",
  "sold",
  "rented",
  "reserved",
] as const;

export const HEATING_TYPES = [
  "none",
  "central",
  "natural_gas",
  "floor_heating",
  "electric",
  "solar",
  "coal",
  "air_condition",
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export const ROOM_OPTIONS = [
  "1+0",
  "1+1",
  "2+1",
  "3+1",
  "4+1",
  "4+2",
  "5+1",
  "5+2",
  "6+",
];

export const SORT_KEYS = [
  "yeni",
  "eski",
  "fiyat_artan",
  "fiyat_azalan",
  "m2_artan",
  "m2_azalan",
  "cok_izlenen",
] as const;

// Translation key mappings
export const PROPERTY_TYPE_TKEYS: Record<string, string> = {
  // Residential
  villa: "propertyTypes.villa",
  apartment: "propertyTypes.apartment",
  twin_villa: "propertyTypes.twin_villa",
  penthouse: "propertyTypes.penthouse",
  residence: "propertyTypes.residence",
  bungalow: "propertyTypes.bungalow",
  detached: "propertyTypes.detached",
  building: "propertyTypes.building",
  timeshare: "propertyTypes.timeshare",
  derelict: "propertyTypes.derelict",
  unfinished: "propertyTypes.unfinished",
  // Land
  residential_land: "propertyTypes.residential_land",
  mixed_land: "propertyTypes.mixed_land",
  commercial_land: "propertyTypes.commercial_land",
  industrial_land: "propertyTypes.industrial_land",
  tourism_land: "propertyTypes.tourism_land",
  field: "propertyTypes.field",
  olive_grove: "propertyTypes.olive_grove",
  // Commercial
  shop: "propertyTypes.shop",
  hotel: "propertyTypes.hotel",
  workplace: "propertyTypes.workplace",
  warehouse: "propertyTypes.warehouse",
  business_transfer: "propertyTypes.business_transfer",
  office: "propertyTypes.office",
  // Legacy (DB enum still uses "land" for generic land type)
  land: "propertyTypes.land",
};

export const CATEGORY_TKEYS: Record<PropertyCategory, string> = {
  residential: "propertyCategories.residential",
  land: "propertyCategories.land",
  commercial: "propertyCategories.commercial",
};

export const TRANSACTION_TYPE_TKEYS: Record<string, string> = {
  sale: "property.sale",
  rent: "property.rent",
};

export const SORT_TKEYS: Record<string, string> = {
  yeni: "sort.newest",
  eski: "sort.oldest",
  fiyat_artan: "sort.priceAsc",
  fiyat_azalan: "sort.priceDesc",
  m2_artan: "sort.areaAsc",
  m2_azalan: "sort.areaDesc",
  cok_izlenen: "sort.mostViewed",
};

// Nav links with translation keys
export const NAV_LINKS = [
  { href: "/emlak?islem=satilik" as const, tKey: "nav.forSale" },
  { href: "/emlak?islem=kiralik" as const, tKey: "nav.forRent" },
  { href: "/harita" as const, tKey: "nav.map" },
  { href: "/hizmetlerimiz" as const, tKey: "nav.services" },
  { href: "/blog" as const, tKey: "nav.guide" },
  { href: "/ekibimiz" as const, tKey: "nav.team" },
  { href: "/hakkimizda" as const, tKey: "nav.about" },
  { href: "/sss" as const, tKey: "nav.faq" },
  { href: "/iletisim" as const, tKey: "nav.contact" },
];

// Legacy label accessors for components that don't have translation context (e.g. admin)
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  apartment: "Daire",
  twin_villa: "İkiz Villa",
  penthouse: "Penthouse",
  residence: "Residence",
  bungalow: "Bungalow",
  detached: "Müstakil Ev",
  building: "Komple Bina",
  timeshare: "Devremülk",
  derelict: "Metruk Bina",
  unfinished: "Yarım İnşaat",
  residential_land: "Konut İmarlı Arsa",
  mixed_land: "Konut ve Ticari İmarlı Arsa",
  commercial_land: "Ticari İmarlı Arsa",
  industrial_land: "Sanayi İmarlı Arsa",
  tourism_land: "Turizm İmarlı Arsa",
  field: "Tarla",
  olive_grove: "Zeytinlik",
  shop: "Dükkan",
  hotel: "Hotel",
  workplace: "İş Yeri",
  warehouse: "Depo",
  business_transfer: "Devren Satılık İşyeri",
  office: "Ofis",
  land: "Arsa",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  sale: "Satılık",
  rent: "Kiralık",
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  available: "Müsait",
  sold: "Satıldı",
  rented: "Kiralandı",
  reserved: "Rezerve",
};

export const HEATING_TYPE_LABELS: Record<string, string> = {
  none: "Yok",
  central: "Merkezi",
  natural_gas: "Doğalgaz (Kombi)",
  floor_heating: "Yerden Isıtma",
  electric: "Elektrikli",
  solar: "Güneş Enerjisi",
  coal: "Kömür/Soba",
  air_condition: "Klima",
};

export const SORT_OPTIONS = [
  { value: "yeni", label: "En Yeni" },
  { value: "eski", label: "En Eski" },
  { value: "fiyat_artan", label: "Fiyat (Artan)" },
  { value: "fiyat_azalan", label: "Fiyat (Azalan)" },
  { value: "m2_artan", label: "m² (Artan)" },
  { value: "m2_azalan", label: "m² (Azalan)" },
  { value: "cok_izlenen", label: "En Çok İzlenen" },
];

// Price/Area range presets for sliders
export const PRICE_RANGE = { min: 0, max: 5_000_000, step: 10_000 };
export const AREA_RANGE = { min: 0, max: 1000, step: 10 };
export const FLOOR_RANGE = { min: -1, max: 30, step: 1 };
export const BUILDING_AGE_OPTIONS = [1, 3, 5, 10, 15, 20, 30] as const;
