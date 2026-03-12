// Structural data — labels come from translations via t()
export const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "detached",
  "land",
  "office",
  "shop",
  "warehouse",
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
  apartment: "property.apartment",
  villa: "property.villa",
  detached: "property.detached",
  land: "property.land",
  office: "property.office",
  shop: "property.shop",
  warehouse: "property.warehouse",
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
  apartment: "Daire",
  villa: "Villa",
  detached: "Müstakil Ev",
  land: "Arsa",
  office: "Ofis",
  shop: "Dükkan",
  warehouse: "Depo",
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
