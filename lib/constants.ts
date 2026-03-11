// Turkish translations for property types
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

export const SORT_OPTIONS = [
  { value: "yeni", label: "En Yeni" },
  { value: "eski", label: "En Eski" },
  { value: "fiyat_artan", label: "Fiyat (Artan)" },
  { value: "fiyat_azalan", label: "Fiyat (Azalan)" },
  { value: "m2_artan", label: "m² (Artan)" },
  { value: "m2_azalan", label: "m² (Azalan)" },
  { value: "cok_izlenen", label: "En Çok İzlenen" },
];

export const NAV_LINKS = [
  { href: "/emlak?islem=satilik", label: "Satılık" },
  { href: "/emlak?islem=kiralik", label: "Kiralık" },
  { href: "/harita", label: "Harita" },
  { href: "/hizmetlerimiz", label: "Hizmetlerimiz" },
  { href: "/ekibimiz", label: "Ekibimiz" },
  { href: "/blog", label: "Rehber" },
  { href: "/iletisim", label: "İletişim" },
];
