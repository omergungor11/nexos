"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Type,
  FileText,
  ArrowRightLeft,
  LayoutGrid,
  Home,
  CircleDot,
  UserCircle,
  Banknote,
  Coins,
  Ruler,
  BedDouble,
  Sofa,
  Bath,
  CalendarDays,
  Layers,
  Building,
  Flame,
  MapPin,
  Map,
  Navigation,
  Globe,
  Star,
  Search,
  Video,
  Eye,
  Clock,
  CreditCard,
  Waves,
  Car,
  DoorOpen,
  LandPlot,
  ScrollText,
  Zap,
  Droplets,
  Route,
  FileCheck,
  Info,
  Image,
  Tag,
  Sparkles,
  List,
  BarChart3,
  Armchair,
  ShieldCheck,
  TreePine,
  Share2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createProperty,
  updateProperty,
  syncPropertyFeatures,
  type PropertyCreateInput,
} from "@/actions/properties";

import {
  LAND_TYPES,
  RESIDENTIAL_TYPES,
  COMMERCIAL_TYPES,
  type PropertyCategory,
} from "@/lib/constants";

import { LocationPicker } from "@/components/admin/location-picker";

import type {
  TransactionType,
  PropertyType,
  PropertyStatus,
  HeatingType,
  Currency,
  FeatureCategory,
  PoolType,
  ParkingType,
  TitleDeedType,
  ZoningStatus,
  RentalPaymentInterval,
} from "@/types/property";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CityOption = { id: number; name: string; slug: string };
type DistrictOption = { id: number; name: string; slug: string; city_id: number };
type NeighborhoodOption = {
  id: number;
  name: string;
  slug: string;
  district_id: number;
};
type FeatureOption = { id: number; name: string; icon: string | null };

type AgentOption = { id: string; name: string; title: string | null };

export interface PropertyFormProps {
  cities: CityOption[];
  featuresByCategory: Record<string, FeatureOption[]>;
  agents?: AgentOption[];
  initialData?: Partial<InitialPropertyData>;
  propertyId?: string;
  mediaSlot?: React.ReactNode;
  analyticsSlot?: React.ReactNode;
  socialMediaSlot?: React.ReactNode;
}

interface InitialPropertyData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  type: string;
  status: string;
  transaction_type: string;
  area_sqm: number | null;
  gross_area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  year_built: number | null;
  heating_type: string | null;
  parking: boolean | null;
  furnished: boolean | null;
  balcony_count: number | null;
  elevator: boolean | null;
  pool: boolean | null;
  garden: boolean | null;
  security_24_7: boolean | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  city_id: number;
  district_id: number | null;
  neighborhood_id: number | null;
  is_featured: boolean;
  workflow_status?: string | null;
  seo_title: string | null;
  seo_description: string | null;
  agent_id: string | null;
  video_url?: string | null;
  virtual_tour_url?: string | null;
  feature_ids?: number[];
}

interface FormState {
  title: string;
  description: string;
  transaction_type: TransactionType;
  category: PropertyCategory;
  property_type: PropertyType;
  status: PropertyStatus;
  price: string;
  pricing_type: "fixed" | "exchange" | "offer";
  price_per_donum: string;
  currency: Currency;
  area_sqm: string;
  gross_area_sqm: string;
  rooms: string;
  living_rooms: string;
  bathrooms: string;
  floor: string;
  total_floors: string;
  year_built: string;
  heating_type: HeatingType | "";
  city_id: string;
  district_id: string;
  neighborhood_id: string;
  address: string;
  lat: string;
  lng: string;
  parking: boolean;
  parking_type: ParkingType;
  furnished: boolean;
  elevator: boolean;
  pool: boolean;
  pool_type: PoolType;
  garden: boolean;
  security_24_7: boolean;
  balcony_count: string;
  land_area_sqm: string;
  title_deed_type: TitleDeedType | "";
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  agent_id: string;
  video_url: string;
  virtual_tour_url: string;
  // Land-specific
  has_road_access: boolean;
  has_electricity: boolean;
  has_water: boolean;
  zoning_status: ZoningStatus | "";
  // Rental-specific
  min_rental_period: string;
  rental_payment_interval: RentalPaymentInterval | "";
  // Internal
  internal_notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  sale: "Satılık",
  rent: "Kiralık",
  daily_rental: "Günlük Kiralık",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  // Konut
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
  // Arsa
  residential_land: "Konut İmarlı Arsa",
  mixed_land: "Konut ve Ticari İmarlı Arsa",
  commercial_land: "Ticari İmarlı Arsa",
  industrial_land: "Sanayi İmarlı Arsa",
  tourism_land: "Turizm İmarlı Arsa",
  field: "Tarla",
  olive_grove: "Zeytinlik",
  // Ticari
  shop: "Dükkan",
  hotel: "Hotel",
  workplace: "İş Yeri",
  warehouse: "Depo",
  business_transfer: "Devren Satılık İşyeri",
  office: "Ofis",
  // Legacy
  land: "Arsa",
};

const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Müsait",
  sold: "Satıldı",
  rented: "Kiralandı",
  reserved: "Rezerve",
};

const HEATING_TYPE_LABELS: Record<HeatingType, string> = {
  none: "Yok",
  central: "Merkezi Sistem",
  natural_gas: "Doğalgaz",
  floor_heating: "Yerden Isıtma",
  electric: "Elektrikli",
  solar: "Güneş Enerjisi",
  coal: "Kömür",
  air_condition: "Klima",
};

const CURRENCY_LABELS: Record<Currency, string> = {
  TRY: "TL (₺)",
  USD: "Dolar ($)",
  EUR: "Euro (€)",
  GBP: "Sterlin (£)",
};

const POOL_TYPE_OPTIONS: Record<PoolType, string> = {
  none: "Havuz Yok",
  private: "Özel Havuz",
  shared: "Ortak Havuz",
};

const PARKING_TYPE_OPTIONS: Record<ParkingType, string> = {
  none: "Otopark Yok",
  open: "Açık Otopark",
  closed: "Kapalı Otopark",
  both: "Açık + Kapalı",
};

const TITLE_DEED_OPTIONS: Record<TitleDeedType, string> = {
  esdeger: "Eşdeğer Koçan",
  tahsis: "Tahsis Koçan",
  turk: "Türk Koçanı",
  gazi: "Gazi Koçanı",
  yabanci: "Yabancı Koçanı",
  other: "Diğer",
};

const ZONING_STATUS_OPTIONS: Record<ZoningStatus, string> = {
  none: "İmar Yok",
  residential: "Konut",
  commercial: "Ticari",
  mixed: "Karma",
  industrial: "Sanayi",
  tourism: "Turizm",
  agricultural: "Tarım",
};

const MIN_RENTAL_PERIOD_OPTIONS: Record<string, string> = {
  "1_day": "1 Gün",
  "2_days": "2 Gün",
  "3_days": "3 Gün",
  "1_week": "1 Hafta",
  "2_weeks": "2 Hafta",
  "1_month": "1 Ay",
  "3_months": "3 Ay",
  "6_months": "6 Ay",
  "1_year": "1 Yıl",
};

const RENTAL_PAYMENT_INTERVAL_OPTIONS: Record<RentalPaymentInterval, string> = {
  daily: "Günlük",
  monthly: "Aylık",
  "3months": "3 Aylık",
  "6months": "6 Aylık",
  yearly: "Yıllık",
};

const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  residential: "Konut",
  land: "Arsa",
  commercial: "Ticari",
};

const CATEGORY_SUBTYPES: Record<PropertyCategory, { types: readonly string[]; labels: Record<string, string> }> = {
  residential: {
    types: RESIDENTIAL_TYPES,
    labels: Object.fromEntries(
      RESIDENTIAL_TYPES.map((t) => [t, PROPERTY_TYPE_LABELS[t] ?? t])
    ),
  },
  land: {
    types: LAND_TYPES,
    labels: Object.fromEntries(
      LAND_TYPES.map((t) => [t, PROPERTY_TYPE_LABELS[t] ?? t])
    ),
  },
  commercial: {
    types: COMMERCIAL_TYPES,
    labels: Object.fromEntries(
      COMMERCIAL_TYPES.map((t) => [t, PROPERTY_TYPE_LABELS[t] ?? t])
    ),
  },
};

function detectCategory(type: string): PropertyCategory {
  if ((LAND_TYPES as readonly string[]).includes(type)) return "land";
  if ((COMMERCIAL_TYPES as readonly string[]).includes(type)) return "commercial";
  return "residential";
}

function isLandType(type: string): boolean {
  return (LAND_TYPES as readonly string[]).includes(type);
}

function formatPriceDisplay(val: string): string {
  const num = val.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("tr-TR");
}

const FEATURE_CATEGORY_LABELS: Record<FeatureCategory, string> = {
  interior: "İç Mekan",
  exterior: "Dış Mekan",
  building: "Bina",
  neighborhood: "Çevre",
};

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  icon: Icon,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-medium leading-none">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkbox field
// ---------------------------------------------------------------------------

function CheckboxField({
  id,
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: LucideIcon;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded accent-primary"
      />
      {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      {label}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Build initial state
// ---------------------------------------------------------------------------

function buildInitialState(
  initialData: Partial<InitialPropertyData> | undefined
): FormState {
  return {
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    transaction_type:
      (initialData?.transaction_type as TransactionType) ?? "sale",
    category: initialData?.type ? detectCategory(initialData.type) : "residential",
    property_type: (initialData?.type as PropertyType) ?? "apartment",
    status: (initialData?.status as PropertyStatus) ?? "available",
    price: initialData?.price != null ? String(initialData.price) : "",
    pricing_type:
      ((initialData as Record<string, unknown>)?.pricing_type as
        | "fixed"
        | "exchange"
        | "offer") ?? "fixed",
    price_per_donum:
      (initialData as Record<string, unknown>)?.price_per_donum != null
        ? String((initialData as Record<string, unknown>).price_per_donum)
        : "",
    currency: (initialData?.currency as Currency) ?? "GBP",
    area_sqm:
      initialData?.area_sqm != null ? String(initialData.area_sqm) : "",
    gross_area_sqm:
      initialData?.gross_area_sqm != null
        ? String(initialData.gross_area_sqm)
        : "",
    rooms: initialData?.rooms != null ? String(initialData.rooms) : "",
    living_rooms:
      initialData?.living_rooms != null
        ? String(initialData.living_rooms)
        : "",
    bathrooms:
      initialData?.bathrooms != null ? String(initialData.bathrooms) : "",
    floor: initialData?.floor != null ? String(initialData.floor) : "",
    total_floors:
      initialData?.total_floors != null
        ? String(initialData.total_floors)
        : "",
    year_built:
      initialData?.year_built != null ? String(initialData.year_built) : "",
    heating_type: (initialData?.heating_type as HeatingType) ?? "",
    city_id:
      initialData?.city_id != null ? String(initialData.city_id) : "",
    district_id:
      initialData?.district_id != null
        ? String(initialData.district_id)
        : "",
    neighborhood_id:
      initialData?.neighborhood_id != null
        ? String(initialData.neighborhood_id)
        : "",
    address: initialData?.address ?? "",
    lat: initialData?.lat != null ? String(initialData.lat) : "",
    lng: initialData?.lng != null ? String(initialData.lng) : "",
    parking: initialData?.parking ?? false,
    parking_type: (initialData as Record<string, unknown>)?.parking_type as ParkingType ?? "none",
    furnished: initialData?.furnished ?? false,
    elevator: initialData?.elevator ?? false,
    pool: initialData?.pool ?? false,
    pool_type: (initialData as Record<string, unknown>)?.pool_type as PoolType ?? "none",
    garden: initialData?.garden ?? false,
    security_24_7: initialData?.security_24_7 ?? false,
    balcony_count:
      initialData?.balcony_count != null
        ? String(initialData.balcony_count)
        : "0",
    land_area_sqm:
      (initialData as Record<string, unknown>)?.land_area_sqm != null
        ? String((initialData as Record<string, unknown>).land_area_sqm)
        : "",
    title_deed_type: ((initialData as Record<string, unknown>)?.title_deed_type as TitleDeedType) ?? "",
    is_featured: initialData?.is_featured ?? false,
    seo_title: initialData?.seo_title ?? "",
    seo_description: initialData?.seo_description ?? "",
    agent_id: initialData?.agent_id ?? "__none__",
    video_url: initialData?.video_url ?? "",
    virtual_tour_url: initialData?.virtual_tour_url ?? "",
    // Land-specific
    has_road_access: (initialData as Record<string, unknown>)?.has_road_access as boolean ?? false,
    has_electricity: (initialData as Record<string, unknown>)?.has_electricity as boolean ?? false,
    has_water: (initialData as Record<string, unknown>)?.has_water as boolean ?? false,
    zoning_status: ((initialData as Record<string, unknown>)?.zoning_status as ZoningStatus) ?? "",
    // Rental-specific
    min_rental_period: ((initialData as Record<string, unknown>)?.min_rental_period as string) ?? "",
    rental_payment_interval: ((initialData as Record<string, unknown>)?.rental_payment_interval as RentalPaymentInterval) ?? "",
    internal_notes: ((initialData as Record<string, unknown>)?.internal_notes as string) ?? "",
  };
}

// ---------------------------------------------------------------------------
// Location response types
// ---------------------------------------------------------------------------

interface DistrictResponse {
  data: DistrictOption[];
}

interface NeighborhoodResponse {
  data: NeighborhoodOption[];
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PropertyForm({
  cities,
  featuresByCategory,
  agents = [],
  initialData,
  propertyId,
  mediaSlot,
  analyticsSlot,
  socialMediaSlot,
}: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("temel");
  const isEditMode = !!propertyId;

  // Current workflow state drives the primary "save" button so that hitting
  // Enter on an edit form doesn't silently flip a draft to published. Users
  // still pick the explicit intent via the button row below.
  const currentWorkflow = (initialData?.workflow_status ?? "draft") as
    | "draft"
    | "published"
    | "passive"
    | "archived";
  const defaultSaveIntent: "draft" | "published" | "passive" =
    currentWorkflow === "draft"
      ? "draft"
      : currentWorkflow === "passive"
        ? "passive"
        : "published";

  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(initialData)
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Location cascading state
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Feature selection state
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<number>>(
    () => new Set(initialData?.feature_ids ?? [])
  );

  // ---------------------------------------------------------------------------
  // Load initial districts when editing
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (initialData?.city_id) {
      void fetchDistricts(initialData.city_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally run on mount only — initialData is stable

  useEffect(() => {
    if (initialData?.district_id && districts.length > 0) {
      void fetchNeighborhoods(initialData.district_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts]); // Intentionally depends only on districts loading

  // ---------------------------------------------------------------------------
  // Cascading fetch helpers
  // ---------------------------------------------------------------------------

  const fetchDistricts = useCallback(async (cityId: number) => {
    setLoadingDistricts(true);
    try {
      const res = await fetch(
        `/api/locations/districts?cityId=${cityId}`
      );
      if (!res.ok) {
        toast.error("İlçeler yüklenemedi");
        return;
      }
      const json = (await res.json()) as DistrictResponse;
      setDistricts(json.data ?? []);
    } catch {
      toast.error("İlçeler yüklenirken bir hata oluştu");
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const fetchNeighborhoods = useCallback(async (districtId: number) => {
    setLoadingNeighborhoods(true);
    try {
      const res = await fetch(
        `/api/locations/neighborhoods?districtId=${districtId}`
      );
      if (!res.ok) {
        toast.error("Mahalleler yüklenemedi");
        return;
      }
      const json = (await res.json()) as NeighborhoodResponse;
      setNeighborhoods(json.data ?? []);
    } catch {
      toast.error("Mahalleler yüklenirken bir hata oluştu");
    } finally {
      setLoadingNeighborhoods(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Change handlers
  // ---------------------------------------------------------------------------

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSelectChange(name: keyof FormState, value: string | null) {
    if (value === null) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBooleanChange(name: keyof FormState, checked: boolean) {
    setForm((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleCityChange(value: string | null) {
    if (value === null) return;
    setForm((prev) => ({
      ...prev,
      city_id: value,
      district_id: "",
      neighborhood_id: "",
    }));
    setDistricts([]);
    setNeighborhoods([]);

    if (errors.city_id) {
      setErrors((prev) => ({ ...prev, city_id: undefined }));
    }

    const cityId = Number(value);
    if (cityId > 0) {
      await fetchDistricts(cityId);
    }
  }

  async function handleDistrictChange(value: string | null) {
    if (value === null) return;
    setForm((prev) => ({
      ...prev,
      district_id: value,
      neighborhood_id: "",
    }));
    setNeighborhoods([]);

    const districtId = Number(value);
    if (districtId > 0) {
      await fetchNeighborhoods(districtId);
    }
  }

  function handleFeatureToggle(featureId: number, checked: boolean) {
    setSelectedFeatureIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(featureId);
      } else {
        next.delete(featureId);
      }
      return next;
    });
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validate(): boolean {
    const next: FormErrors = {};

    if (!form.title.trim()) {
      next.title = "Başlık zorunludur.";
    }

    if (form.pricing_type === "fixed") {
      if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0) {
        next.price = "Geçerli bir fiyat giriniz.";
      }
    }

    if (!form.city_id) {
      next.city_id = "Şehir seçimi zorunludur.";
    }

    setErrors(next);

    // Auto-switch to the first tab with errors
    if (Object.keys(next).length > 0) {
      const firstErrorField = Object.keys(next)[0] as keyof FormState;
      const tab = FIELD_TAB_MAP[firstErrorField];
      if (tab) {
        setActiveTab(tab);
      }
    }

    return Object.keys(next).length === 0;
  }

  // Map form fields to their tab for error highlighting
  const FIELD_TAB_MAP: Partial<Record<keyof FormState, string>> = {
    title: "temel",
    description: "temel",
    transaction_type: "temel",
    category: "temel",
    property_type: "temel",
    status: "temel",
    agent_id: "temel",
    price: "fiyat",
    currency: "fiyat",
    area_sqm: "fiyat",
    gross_area_sqm: "fiyat",
    rooms: "fiyat",
    city_id: "konum",
    district_id: "konum",
    neighborhood_id: "konum",
    address: "konum",
    lat: "konum",
    lng: "konum",
    seo_title: "seo",
    seo_description: "seo",
  };

  // Compute which tabs have errors
  const tabsWithErrors = new Set<string>();
  for (const field of Object.keys(errors) as (keyof FormState)[]) {
    const tab = FIELD_TAB_MAP[field];
    if (tab) tabsWithErrors.add(tab);
  }

  // ---------------------------------------------------------------------------
  // Build payload
  // ---------------------------------------------------------------------------

  function buildPayload(): PropertyCreateInput {
    const parseOptionalInt = (val: string): number | undefined => {
      const n = parseInt(val, 10);
      return isNaN(n) ? undefined : n;
    };

    const parseOptionalFloat = (val: string): number | undefined => {
      const n = parseFloat(val);
      return isNaN(n) ? undefined : n;
    };

    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      price: form.pricing_type === "fixed" && form.price ? Number(form.price) : 0,
      pricing_type: form.pricing_type,
      price_per_donum: parseOptionalFloat(form.price_per_donum) ?? null,
      currency: form.currency,
      type: form.property_type,
      transaction_type: form.transaction_type,
      area_sqm: parseOptionalFloat(form.area_sqm),
      gross_area_sqm: parseOptionalFloat(form.gross_area_sqm),
      rooms: parseOptionalInt(form.rooms),
      living_rooms: parseOptionalInt(form.living_rooms),
      bathrooms: parseOptionalInt(form.bathrooms),
      floor: parseOptionalInt(form.floor),
      total_floors: parseOptionalInt(form.total_floors),
      year_built: parseOptionalInt(form.year_built),
      heating_type: form.heating_type || undefined,
      parking: form.parking,
      parking_type: form.parking_type,
      furnished: form.furnished,
      elevator: form.elevator,
      pool: form.pool,
      pool_type: form.pool_type,
      garden: form.garden,
      security_24_7: form.security_24_7,
      balcony_count: parseOptionalInt(form.balcony_count),
      land_area_sqm: parseOptionalFloat(form.land_area_sqm),
      title_deed_type: form.title_deed_type || null,
      lat: parseOptionalFloat(form.lat),
      lng: parseOptionalFloat(form.lng),
      address: form.address.trim() || undefined,
      city_id: Number(form.city_id),
      district_id: form.district_id ? Number(form.district_id) : undefined,
      neighborhood_id: form.neighborhood_id
        ? Number(form.neighborhood_id)
        : undefined,
      is_featured: form.is_featured,
      seo_title: form.seo_title.trim() || undefined,
      seo_description: form.seo_description.trim() || undefined,
      agent_id: form.agent_id !== "__none__" ? form.agent_id : null,
      video_url: form.video_url.trim() || undefined,
      virtual_tour_url: form.virtual_tour_url.trim() || undefined,
      // Land-specific
      has_road_access: form.has_road_access || undefined,
      has_electricity: form.has_electricity || undefined,
      has_water: form.has_water || undefined,
      zoning_status: form.zoning_status || null,
      // Rental-specific
      min_rental_period: form.min_rental_period.trim() || null,
      rental_payment_interval: form.rental_payment_interval || null,
      internal_notes: form.internal_notes.trim() || null,
    };
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  function performSave(
    workflowIntent: "draft" | "published" | "passive"
  ) {
    // Drafts skip the full field validation — only title is required.
    if (workflowIntent !== "draft" && !validate()) return;
    if (workflowIntent === "draft" && !form.title.trim()) {
      toast.error("Taslak için en azından bir başlık girin.");
      return;
    }

    const payload = buildPayload();

    startTransition(async () => {
      try {
        if (isEditMode && propertyId) {
          const result = await updateProperty(propertyId, { ...payload, workflow_status: workflowIntent });
          if (result.error) {
            toast.error(`Kayıt hatası: ${result.error}`);
            return;
          }
          // Sync features
          const featureResult = await syncPropertyFeatures(propertyId, Array.from(selectedFeatureIds));
          if (featureResult.error) {
            toast.error(`Özellikler kaydedilemedi: ${featureResult.error}`);
          }
          toast.success(
            workflowIntent === "draft"
              ? "Taslak kaydedildi."
              : workflowIntent === "passive"
                ? "İlan pasife alındı."
                : "İlan yayınlandı."
          );
          router.push("/admin/ilanlar");
        } else {
          const result = await createProperty({ ...payload, workflow_status: workflowIntent });
          if (result.error) {
            toast.error(`İlan oluşturulamadı: ${result.error}`);
            return;
          }
          // Sync features for new property
          if (result.data && selectedFeatureIds.size > 0) {
            await syncPropertyFeatures(result.data.id, Array.from(selectedFeatureIds));
          }
          toast.success(
            workflowIntent === "draft"
              ? "Taslak oluşturuldu."
              : "İlan yayınlandı."
          );
          router.push("/admin/ilanlar");
        }
      } catch (err) {
        console.error("Property save error:", err);
        toast.error("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        performSave(defaultSaveIntent);
      }}
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
        <TabsList className="h-auto flex-wrap gap-1">
          {([
            { value: "temel", label: "Temel Bilgiler", icon: Info },
            { value: "medya", label: "Medya", icon: Image },
            { value: "fiyat", label: "Fiyat & Özellikler", icon: Banknote },
            { value: "konum", label: "Konum", icon: MapPin },
            { value: "one-cikan", label: "Öne Çıkan", icon: Sparkles },
            { value: "detay", label: "Detay Özellikleri", icon: List },
            { value: "seo", label: "SEO", icon: Search },
          ] as const).map((tab) => {
            const TabIcon = tab.icon;
            return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`gap-1.5 ${tabsWithErrors.has(tab.value) ? "text-destructive data-[state=active]:text-destructive" : ""}`}
            >
              <TabIcon className="size-3.5" />
              {tab.label}
              {tabsWithErrors.has(tab.value) && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </TabsTrigger>
            );
          })}
          {socialMediaSlot && <TabsTrigger value="sosyal" className="gap-1.5"><Share2 className="size-3.5" />Sosyal Medya</TabsTrigger>}
          {analyticsSlot && <TabsTrigger value="analiz" className="gap-1.5"><BarChart3 className="size-3.5" />Analiz</TabsTrigger>}
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* Tab 1: Temel Bilgiler                                              */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="temel" className="mt-6 space-y-5">
          <Field label="Başlık" htmlFor="title" required error={errors.title} icon={Type}>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="İlan başlığı"
              aria-invalid={!!errors.title}
            />
          </Field>

          <Field label="Açıklama" htmlFor="description" icon={FileText}>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="İlan açıklaması..."
              rows={6}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="İşlem Türü" htmlFor="transaction_type" required icon={ArrowRightLeft}>
              <Select
                value={form.transaction_type}
                onValueChange={(v) =>
                  handleSelectChange("transaction_type", v)
                }
              >
                <SelectTrigger id="transaction_type" className="w-full">
                  <SelectValue placeholder="Seçiniz">
                    {TRANSACTION_TYPE_LABELS[form.transaction_type] ?? form.transaction_type}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(TRANSACTION_TYPE_LABELS) as [
                      TransactionType,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Kategori" htmlFor="category" required icon={LayoutGrid}>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  const cat = v as PropertyCategory;
                  const firstType = CATEGORY_SUBTYPES[cat].types[0] as PropertyType;
                  setForm((prev) => ({ ...prev, category: cat, property_type: firstType }));
                }}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Seçiniz">
                    {CATEGORY_LABELS[form.category] ?? form.category}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_LABELS) as [PropertyCategory, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Emlak Türü" htmlFor="property_type" required icon={Home}>
              <Select
                value={form.property_type}
                onValueChange={(v) =>
                  handleSelectChange("property_type", v)
                }
              >
                <SelectTrigger id="property_type" className="w-full">
                  <SelectValue placeholder="Seçiniz">
                    {CATEGORY_SUBTYPES[form.category].labels[form.property_type] ?? form.property_type}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_SUBTYPES[form.category].types.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CATEGORY_SUBTYPES[form.category].labels[value] ?? value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Durum" htmlFor="status" required icon={CircleDot}>
              <Select
                value={form.status}
                onValueChange={(v) => handleSelectChange("status", v)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Seçiniz">
                    {PROPERTY_STATUS_LABELS[form.status] ?? form.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(PROPERTY_STATUS_LABELS) as [
                      PropertyStatus,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {agents.length > 0 && (
            <Field
              label="Sorumlu Danışman"
              htmlFor="agent_id"
              hint="Bu ilanla ilgilenecek ekip üyesini seçin"
              icon={UserCircle}
            >
              <Select
                value={form.agent_id}
                onValueChange={(v) =>
                  handleSelectChange("agent_id", v)
                }
              >
                <SelectTrigger id="agent_id" className="w-full sm:w-80">
                  <SelectValue placeholder="Danışman seçiniz (opsiyonel)">
                    {form.agent_id && form.agent_id !== "__none__"
                      ? (agents.find((a) => a.id === form.agent_id)?.name ?? form.agent_id)
                      : form.agent_id === "__none__" ? "Danışman yok" : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Danışman yok</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                      {agent.title ? ` — ${agent.title}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {/* Internal notes */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <Field
              label="Özel Notlar"
              htmlFor="internal_notes"
              icon={FileText}
              hint="Bu notlar sadece admin panelinde görünür, müşteriler göremez."
            >
              <Textarea
                id="internal_notes"
                name="internal_notes"
                value={form.internal_notes}
                onChange={handleChange}
                placeholder="Mülk sahibi ile görüşme notları, özel durumlar, fiyat pazarlık marjı vb."
                rows={4}
                className="bg-white dark:bg-background"
              />
            </Field>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Tab: Medya (Görseller, Video, 360°)                               */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="medya" className="mt-6 space-y-6">
          {/* Image Manager — only available when editing (needs propertyId) */}
          {mediaSlot && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Görseller</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                JPEG, PNG veya WebP formatında, maksimum 5 MB.
              </p>
              {mediaSlot}
            </div>
          )}

          {/* Video URL */}
          <Field
            label="Video URL"
            htmlFor="video_url"
            hint="YouTube veya Vimeo video linki"
            icon={Video}
          >
            <Input
              id="video_url"
              name="video_url"
              type="url"
              value={form.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>

          {/* 360° Virtual Tour URL */}
          <Field
            label="360° Sanal Tur URL"
            htmlFor="virtual_tour_url"
            hint="Matterport, Kuula veya benzeri sanal tur linki"
            icon={Eye}
          >
            <Input
              id="virtual_tour_url"
              name="virtual_tour_url"
              type="url"
              value={form.virtual_tour_url}
              onChange={handleChange}
              placeholder="https://my.matterport.com/show/?m=..."
            />
          </Field>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Tab 2: Fiyat & Özellikler                                         */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="fiyat" className="mt-6 space-y-5">
          {/* Pricing type toggle */}
          <Field label="Fiyat Tipi" htmlFor="pricing_type" icon={Banknote}>
            <div className="flex gap-2" role="radiogroup" id="pricing_type">
              {([
                { v: "fixed", label: "Sabit Fiyat" },
                { v: "exchange", label: "Takas" },
                { v: "offer", label: "Teklif" },
              ] as const).map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={form.pricing_type === v}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, pricing_type: v }))
                  }
                  className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                    form.pricing_type === v
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {form.pricing_type === "fixed" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Fiyat"
                htmlFor="price"
                required
                error={errors.price}
                icon={Banknote}
                hint={form.price ? formatPriceDisplay(form.price) : undefined}
              >
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  aria-invalid={!!errors.price}
                />
              </Field>

              <Field label="Para Birimi" htmlFor="currency" icon={Coins}>
                <Select
                  value={form.currency}
                  onValueChange={(v) => handleSelectChange("currency", v)}
                >
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue>
                      {CURRENCY_LABELS[form.currency as Currency] ?? form.currency}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(CURRENCY_LABELS) as [Currency, string][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {form.pricing_type !== "fixed" && (
            <div className="rounded-md border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
              {form.pricing_type === "exchange"
                ? "Bu ilan takasa açık olarak yayınlanacak — fiyat yerine 'TAKAS' etiketi gösterilecek."
                : "Bu ilan teklife açık olarak yayınlanacak — fiyat yerine 'TEKLİF' etiketi gösterilecek."}
            </div>
          )}

          {/* Per-dönüm price — only for land types */}
          {isLandType(form.property_type) && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Dönüm Başına Fiyat"
                htmlFor="price_per_donum"
                icon={Banknote}
                hint={
                  form.price_per_donum
                    ? `${formatPriceDisplay(form.price_per_donum)} / dönüm`
                    : "İsteğe bağlı — dönüm başına birim fiyat"
                }
              >
                <Input
                  id="price_per_donum"
                  name="price_per_donum"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price_per_donum}
                  onChange={handleChange}
                  placeholder="0"
                />
              </Field>
            </div>
          )}

          {/* Rental-specific fields */}
          {(form.transaction_type === "rent" || form.transaction_type === "daily_rental") && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Minimum Kiralama Süresi" htmlFor="min_rental_period" icon={Clock}>
                <Select
                  value={form.min_rental_period || "__none__"}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, min_rental_period: v === "__none__" ? "" : String(v) }))
                  }
                >
                  <SelectTrigger id="min_rental_period" className="w-full">
                    <SelectValue placeholder="Seçiniz">
                      {form.min_rental_period
                        ? MIN_RENTAL_PERIOD_OPTIONS[form.min_rental_period] ?? form.min_rental_period
                        : "Belirtilmemiş"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Belirtilmemiş</SelectItem>
                    {Object.entries(MIN_RENTAL_PERIOD_OPTIONS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Kira Ödeme Aralığı" htmlFor="rental_payment_interval" icon={CreditCard}>
                <Select
                  value={form.rental_payment_interval || "__none__"}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, rental_payment_interval: v === "__none__" ? "" : v as RentalPaymentInterval }))
                  }
                >
                  <SelectTrigger id="rental_payment_interval" className="w-full">
                    <SelectValue placeholder="Seçiniz">
                      {form.rental_payment_interval
                        ? RENTAL_PAYMENT_INTERVAL_OPTIONS[form.rental_payment_interval as RentalPaymentInterval]
                        : "Belirtilmemiş"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Belirtilmemiş</SelectItem>
                    {(Object.entries(RENTAL_PAYMENT_INTERVAL_OPTIONS) as [RentalPaymentInterval, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2">
            <Field label="Net Alan (m²)" htmlFor="area_sqm" icon={Ruler}>
              <Input
                id="area_sqm"
                name="area_sqm"
                type="number"
                min="0"
                step="0.01"
                value={form.area_sqm}
                onChange={handleChange}
                placeholder="0"
              />
            </Field>

            <Field label="Brüt Alan (m²)" htmlFor="gross_area_sqm" icon={Ruler}>
              <Input
                id="gross_area_sqm"
                name="gross_area_sqm"
                type="number"
                min="0"
                step="0.01"
                value={form.gross_area_sqm}
                onChange={handleChange}
                placeholder="0"
              />
            </Field>
          </div>

          {/* Villa/Residential — Arazi Alanı */}
          {(form.property_type === "villa" || form.property_type === "twin_villa" || form.property_type === "detached" || form.property_type === "bungalow" || isLandType(form.property_type)) && (
            <Field label="Arazi Alanı (m²)" htmlFor="land_area_sqm" hint="Villanın veya arsanın toplam arazi büyüklüğü" icon={LandPlot}>
              <Input
                id="land_area_sqm"
                name="land_area_sqm"
                type="number"
                min="0"
                step="0.01"
                value={form.land_area_sqm}
                onChange={handleChange}
                placeholder="0"
                className="w-48"
              />
            </Field>
          )}

          {/* Room/floor/heating fields — hidden for land types */}
          {!isLandType(form.property_type) && (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Field label="Oda Sayısı" htmlFor="rooms" icon={BedDouble}>
                  <Input
                    id="rooms"
                    name="rooms"
                    type="number"
                    min="0"
                    step="1"
                    value={form.rooms}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </Field>

                <Field label="Salon Sayısı" htmlFor="living_rooms" icon={Sofa}>
                  <Input
                    id="living_rooms"
                    name="living_rooms"
                    type="number"
                    min="0"
                    step="1"
                    value={form.living_rooms}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </Field>

                <Field label="Banyo Sayısı" htmlFor="bathrooms" icon={Bath}>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="1"
                    value={form.bathrooms}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </Field>

                <Field label="Yapım Yılı" htmlFor="year_built" icon={CalendarDays}>
                  <Input
                    id="year_built"
                    name="year_built"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    step="1"
                    value={form.year_built}
                    onChange={handleChange}
                    placeholder="2024"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Field label="Bulunduğu Kat" htmlFor="floor" icon={Layers}>
                  <Input
                    id="floor"
                    name="floor"
                    type="number"
                    step="1"
                    value={form.floor}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </Field>

                <Field label="Toplam Kat" htmlFor="total_floors" icon={Building}>
                  <Input
                    id="total_floors"
                    name="total_floors"
                    type="number"
                    min="0"
                    step="1"
                    value={form.total_floors}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </Field>

                <Field label="Isıtma Türü" htmlFor="heating_type" icon={Flame}>
                  <Select
                    value={form.heating_type}
                    onValueChange={(v) => handleSelectChange("heating_type", v)}
                  >
                    <SelectTrigger id="heating_type" className="w-full">
                      <SelectValue placeholder="Seçiniz">
                        {form.heating_type ? (HEATING_TYPE_LABELS[form.heating_type as HeatingType] ?? form.heating_type) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(HEATING_TYPE_LABELS) as [
                          HeatingType,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </>
          )}

        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Tab 3: Konum                                                       */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="konum" className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field
              label="Şehir"
              htmlFor="city_id"
              required
              error={errors.city_id}
              icon={MapPin}
            >
              <Select
                value={form.city_id}
                onValueChange={(v) => void handleCityChange(v)}
              >
                <SelectTrigger
                  id="city_id"
                  className="w-full"
                  aria-invalid={!!errors.city_id}
                >
                  <SelectValue placeholder="Şehir seçiniz">
                    {form.city_id ? (cities.find((c) => String(c.id) === form.city_id)?.name ?? form.city_id) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="İlçe" htmlFor="district_id" icon={Map}>
              <Select
                value={form.district_id}
                onValueChange={(v) => void handleDistrictChange(v)}
                disabled={districts.length === 0 && !loadingDistricts}
              >
                <SelectTrigger id="district_id" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingDistricts
                        ? "Yükleniyor..."
                        : districts.length === 0
                          ? "Önce şehir seçin"
                          : "İlçe seçiniz"
                    }
                  >
                    {form.district_id ? (districts.find((d) => String(d.id) === form.district_id)?.name ?? form.district_id) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Mahalle" htmlFor="neighborhood_id" icon={Navigation}>
              <Select
                value={form.neighborhood_id}
                onValueChange={(v) =>
                  handleSelectChange("neighborhood_id", v)
                }
                disabled={
                  neighborhoods.length === 0 && !loadingNeighborhoods
                }
              >
                <SelectTrigger id="neighborhood_id" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingNeighborhoods
                        ? "Yükleniyor..."
                        : neighborhoods.length === 0
                          ? "Önce ilçe seçin"
                          : "Mahalle seçiniz"
                    }
                  >
                    {form.neighborhood_id ? (neighborhoods.find((n) => String(n.id) === form.neighborhood_id)?.name ?? form.neighborhood_id) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Açık Adres" htmlFor="address" icon={MapPin}>
            <Textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Sokak, mahalle, cadde gibi detaylı adres bilgisi"
              rows={2}
            />
          </Field>

          {/* Interactive map picker */}
          <LocationPicker
            lat={form.lat ? Number(form.lat) : null}
            lng={form.lng ? Number(form.lng) : null}
            onChange={({ lat: newLat, lng: newLng }) => {
              setForm((prev) => ({
                ...prev,
                lat: newLat.toFixed(6),
                lng: newLng.toFixed(6),
              }));
            }}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Enlem (Lat)"
              htmlFor="lat"
              hint="Haritadan seçebilir veya manuel girebilirsiniz."
              icon={Globe}
            >
              <Input
                id="lat"
                name="lat"
                type="number"
                step="any"
                value={form.lat}
                onChange={handleChange}
                placeholder="35.2345"
              />
            </Field>

            <Field
              label="Boylam (Lng)"
              htmlFor="lng"
              hint="Haritadan seçebilir veya manuel girebilirsiniz."
              icon={Globe}
            >
              <Input
                id="lng"
                name="lng"
                type="number"
                step="any"
                value={form.lng}
                onChange={handleChange}
                placeholder="33.6789"
              />
            </Field>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Tab 4: Öne Çıkan Özellikler                                       */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="one-cikan" className="mt-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Aşağıdaki özellikler ilan kartında ve detay sayfasında öne çıkacak
            şekilde gösterilir.
          </p>

          {/* Bina özellikleri — arsalar için gizle */}
          {!isLandType(form.property_type) && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                <CheckboxField
                  id="furnished"
                  label="Eşyalı"
                  checked={form.furnished}
                  onChange={(c) => handleBooleanChange("furnished", c)}
                  icon={Armchair}
                />
                <CheckboxField
                  id="elevator"
                  label="Asansör"
                  checked={form.elevator}
                  onChange={(c) => handleBooleanChange("elevator", c)}
                  icon={Layers}
                />
                <CheckboxField
                  id="garden"
                  label="Bahçe"
                  checked={form.garden}
                  onChange={(c) => handleBooleanChange("garden", c)}
                  icon={TreePine}
                />
                <CheckboxField
                  id="security_24_7"
                  label="7/24 Güvenlik"
                  checked={form.security_24_7}
                  onChange={(c) => handleBooleanChange("security_24_7", c)}
                  icon={ShieldCheck}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Havuz" htmlFor="pool_type" icon={Waves}>
                  <Select
                    value={form.pool_type}
                    onValueChange={(v) => {
                      const pt = v as PoolType;
                      setForm((prev) => ({ ...prev, pool_type: pt, pool: pt !== "none" }));
                    }}
                  >
                    <SelectTrigger id="pool_type" className="w-full">
                      <SelectValue>{POOL_TYPE_OPTIONS[form.pool_type]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(POOL_TYPE_OPTIONS) as [PoolType, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Otopark" htmlFor="parking_type" icon={Car}>
                  <Select
                    value={form.parking_type}
                    onValueChange={(v) => {
                      const pt = v as ParkingType;
                      setForm((prev) => ({ ...prev, parking_type: pt, parking: pt !== "none" }));
                    }}
                  >
                    <SelectTrigger id="parking_type" className="w-full">
                      <SelectValue>{PARKING_TYPE_OPTIONS[form.parking_type]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(PARKING_TYPE_OPTIONS) as [ParkingType, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label="Balkon Sayısı"
                  htmlFor="balcony_count"
                  hint="0 girin balkon yoksa"
                  icon={DoorOpen}
                >
                  <Input
                    id="balcony_count"
                    name="balcony_count"
                    type="number"
                    min="0"
                    step="1"
                    value={form.balcony_count}
                    onChange={handleChange}
              />
            </Field>
          </div>
            </>
          )}

          {/* Arsa — Koçan Durumu + Altyapı */}
          {isLandType(form.property_type) && (
            <>
              <Field label="Koçan Durumu" htmlFor="title_deed_type" hint="Kıbrıs'a özel tapu/koçan türü" icon={ScrollText}>
                <Select
                  value={form.title_deed_type || "__none__"}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, title_deed_type: v === "__none__" ? "" : v as TitleDeedType }))
                  }
                >
                  <SelectTrigger id="title_deed_type" className="w-full sm:w-64">
                    <SelectValue placeholder="Seçiniz (opsiyonel)">
                      {form.title_deed_type ? TITLE_DEED_OPTIONS[form.title_deed_type as TitleDeedType] : "Belirtilmemiş"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Belirtilmemiş</SelectItem>
                    {(Object.entries(TITLE_DEED_OPTIONS) as [TitleDeedType, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <h4 className="text-sm font-semibold pt-2">Arsa Altyapı Özellikleri</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <CheckboxField
                  id="has_road_access"
                  label="Yol"
                  checked={form.has_road_access}
                  onChange={(c) => handleBooleanChange("has_road_access", c)}
                  icon={Route}
                />
                <CheckboxField
                  id="has_electricity"
                  label="Elektrik"
                  checked={form.has_electricity}
                  onChange={(c) => handleBooleanChange("has_electricity", c)}
                  icon={Zap}
                />
                <CheckboxField
                  id="has_water"
                  label="Su"
                  checked={form.has_water}
                  onChange={(c) => handleBooleanChange("has_water", c)}
                  icon={Droplets}
                />
              </div>

              <Field label="İmar Durumu" htmlFor="zoning_status" icon={FileCheck}>
                <Select
                  value={form.zoning_status || "__none__"}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, zoning_status: v === "__none__" ? "" : v as ZoningStatus }))
                  }
                >
                  <SelectTrigger id="zoning_status" className="w-full sm:w-64">
                    <SelectValue placeholder="Seçiniz (opsiyonel)">
                      {form.zoning_status ? ZONING_STATUS_OPTIONS[form.zoning_status as ZoningStatus] : "Belirtilmemiş"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Belirtilmemiş</SelectItem>
                    {(Object.entries(ZONING_STATUS_OPTIONS) as [ZoningStatus, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Tab 5: Detay Özellikleri                                          */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="detay" className="mt-6 space-y-6">
          {isLandType(form.property_type) ? (
            <p className="text-sm text-muted-foreground">
              Arsa türü ilanlar için detay özellikleri &quot;Öne Çıkan&quot; sekmesindeki altyapı bölümünden yönetilir.
            </p>
          ) : Object.entries(featuresByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz özellik tanımlanmamış.
            </p>
          ) : (
            Object.entries(featuresByCategory)
              .filter(([category]) => category !== "accessibility")
              .map(([category, features]) => {
                // Filter out features already in "Öne Çıkan" tab
                const EXCLUDED_NAMES = ["Eşyalı", "Asansör", "Bahçe", "24 Saat Güvenlik", "Yüzme Havuzu", "Otopark", "Balkon"];
                const filtered = features.filter((f) => !EXCLUDED_NAMES.includes(f.name));
                if (filtered.length === 0) return null;
                return (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {FEATURE_CATEGORY_LABELS[
                      category as FeatureCategory
                    ] ?? category}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {filtered.map((feature) => (
                      <CheckboxField
                        key={feature.id}
                        id={`feature-${feature.id}`}
                        label={feature.name}
                        checked={selectedFeatureIds.has(feature.id)}
                        onChange={(c) =>
                          handleFeatureToggle(feature.id, c)
                        }
                      />
                    ))}
                  </div>
                </div>
                );
              }).filter(Boolean)
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Tab 6: SEO                                                         */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="seo" className="mt-6 space-y-5">
          <Field
            label="SEO Başlık"
            htmlFor="seo_title"
            hint="Boş bırakılırsa ilan başlığı kullanılır."
            icon={Search}
          >
            <Input
              id="seo_title"
              name="seo_title"
              value={form.seo_title}
              onChange={handleChange}
              placeholder="Arama motorlarında görünecek başlık"
              maxLength={160}
            />
          </Field>

          <Field
            label="SEO Açıklama"
            htmlFor="seo_description"
            hint="Maksimum 160 karakter önerilir."
            icon={FileText}
          >
            <Textarea
              id="seo_description"
              name="seo_description"
              value={form.seo_description}
              onChange={handleChange}
              placeholder="Arama motorlarında görünecek açıklama"
              rows={3}
              maxLength={300}
            />
          </Field>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Switch
              id="is_featured"
              checked={form.is_featured}
              onCheckedChange={(checked) =>
                handleBooleanChange("is_featured", checked)
              }
            />
            <label htmlFor="is_featured" className="cursor-pointer text-sm">
              <span className="font-medium">
                {form.is_featured ? "Öne Çıkarılıyor" : "Normal İlan"}
              </span>
              <span className="ml-1 text-muted-foreground">
                {form.is_featured
                  ? "— ilan ana sayfada öne çıkar"
                  : "— standart listeleme sırası"}
              </span>
            </label>
          </div>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Tab 7: Sosyal Medya (only in edit mode)                            */}
        {/* ----------------------------------------------------------------- */}
        {socialMediaSlot && (
          <TabsContent value="sosyal" className="mt-6">
            {socialMediaSlot}
          </TabsContent>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Tab 8: Analiz (only in edit mode)                                  */}
        {/* ----------------------------------------------------------------- */}
        {analyticsSlot && (
          <TabsContent value="analiz" className="mt-6">
            {analyticsSlot}
          </TabsContent>
        )}
      </Tabs>

      {/* ------------------------------------------------------------------- */}
      {/* Form actions — workflow-aware save buttons                            */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => performSave("draft")}
        >
          {isPending && defaultSaveIntent === "draft" ? "Kaydediliyor..." : "Taslak Kaydet"}
        </Button>

        <Button
          type="button"
          disabled={isPending}
          onClick={() => performSave("published")}
        >
          {isPending && defaultSaveIntent === "published"
            ? "Yayınlanıyor..."
            : currentWorkflow === "published"
              ? "Değişiklikleri Kaydet"
              : "Yayınla"}
        </Button>

        {isEditMode && currentWorkflow === "published" && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => performSave("passive")}
          >
            Pasife Al
          </Button>
        )}

        {isEditMode && currentWorkflow === "passive" && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Şu an pasif
          </span>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/ilanlar")}
          disabled={isPending}
          className="ml-auto"
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
