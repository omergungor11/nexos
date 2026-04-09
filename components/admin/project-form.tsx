"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  ImageIcon,
  Info,
  MapPin,
  Banknote,
  Film,
  ListChecks,
  Settings2,
  X,
  GripVertical,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MediaPicker } from "@/components/admin/media-picker";
import { LocationPicker } from "@/components/admin/location-picker";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  createProject,
  updateProject,
  type ProjectInput,
} from "@/actions/projects";
import type { CityRow } from "@/lib/queries/locations";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProjectRecord = Record<string, any>;

type ProjectFormProps =
  | { mode: "create"; project?: never; cities: CityRow[] }
  | { mode: "edit"; project: ProjectRecord; cities: CityRow[] };

type FormState = {
  title: string;
  short_description: string;
  description: string;
  completion_date: string;
  location: string;
  city_id: string;
  district_id: string;
  lat: string;
  lng: string;
  starting_price: string;
  currency: string;
  total_units: string;
  cover_image: string;
  video_url: string;
  status: string;
  is_featured: boolean;
  is_active: boolean;
};

type DistrictOption = { id: number; name: string };

// ---------------------------------------------------------------------------
// Predefined project features
// ---------------------------------------------------------------------------

const PREDEFINED_FEATURES = [
  "Yüzme Havuzu",
  "Çocuk Havuzu",
  "Fitness Salonu",
  "SPA & Wellness",
  "Sauna",
  "Türk Hamamı",
  "24 Saat Güvenlik",
  "Kapalı Otopark",
  "Açık Otopark",
  "Çocuk Oyun Alanı",
  "Basketbol Sahası",
  "Tenis Kortu",
  "Yürüyüş Parkuru",
  "Bisiklet Yolu",
  "BBQ Alanı",
  "Peyzaj & Bahçe",
  "Jeneratör",
  "Su Deposu",
  "Asansör",
  "Engelli Erişimi",
  "Kapıcı / Resepsiyon",
  "Toplantı Salonu",
  "Kafeterya",
  "Market / Mağaza",
  "Denize Sıfır",
  "Deniz Manzarası",
  "Dağ Manzarası",
  "Klima (Merkezi)",
  "Yerden Isıtma",
  "Akıllı Ev Sistemi",
  "Güneş Enerjisi",
  "EV Şarj İstasyonu",
];

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const TABS = [
  { value: "temel", label: "Temel Bilgiler", icon: Info },
  { value: "konum", label: "Konum", icon: MapPin },
  { value: "fiyat", label: "Fiyat & Birimler", icon: Banknote },
  { value: "medya", label: "Medya", icon: Film },
  { value: "ozellikler", label: "Özellikler", icon: ListChecks },
  { value: "durum", label: "Durum", icon: Settings2 },
] as const;

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
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
// Sortable gallery thumbnail
// ---------------------------------------------------------------------------

function SortableGalleryItem({
  url,
  onRemove,
}: {
  url: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square w-28 shrink-0 overflow-hidden rounded-lg border bg-muted"
    >
      <Image
        src={url}
        alt=""
        fill
        className="object-cover"
        sizes="112px"
        unoptimized
      />
      {/* Drag handle */}
      <button
        type="button"
        className="absolute top-1 left-1 rounded bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
      >
        <X className="size-3.5" />
      </button>
      {/* Order badge */}
      <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {/* index rendered by parent */}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

export function ProjectForm({ mode, project, cities }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("temel");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "gallery">("cover");
  const [districts, setDistricts] = useState<DistrictOption[]>([]);

  // Gallery images as array
  const [galleryImages, setGalleryImages] = useState<string[]>(
    () => (project?.gallery_images ?? []) as string[]
  );

  // Features as Set
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => {
    const initial = (project?.features ?? []) as string[];
    return new Set(initial);
  });
  const [customFeature, setCustomFeature] = useState("");

  const [form, setForm] = useState<FormState>({
    title: project?.title ?? "",
    short_description: project?.short_description ?? "",
    description: project?.description ?? "",
    completion_date: project?.completion_date ?? "",
    location: project?.location ?? "",
    city_id: project?.city_id?.toString() ?? "",
    district_id: project?.district_id?.toString() ?? "",
    lat: project?.lat?.toString() ?? "",
    lng: project?.lng?.toString() ?? "",
    starting_price: project?.starting_price?.toString() ?? "",
    currency: project?.currency ?? "GBP",
    total_units: project?.total_units?.toString() ?? "",
    cover_image: project?.cover_image ?? "",
    video_url: project?.video_url ?? "",
    status: project?.status ?? "selling",
    is_featured: project?.is_featured ?? false,
    is_active: project?.is_active ?? true,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Tabs with errors
  const tabFieldMap: Record<string, (keyof FormState)[]> = {
    temel: ["title"],
  };

  const tabsWithErrors = new Set<string>();
  for (const [tab, fields] of Object.entries(tabFieldMap)) {
    if (fields.some((f) => errors[f])) tabsWithErrors.add(tab);
  }

  // Load districts when city changes
  const cityId = form.city_id;
  useEffect(() => {
    if (!cityId) {
      const t = setTimeout(() => setDistricts([]), 0);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("districts")
        .select("id, name")
        .eq("city_id", Number(cityId))
        .eq("is_active", true)
        .order("name");
      if (!cancelled) setDistricts((data ?? []) as DistrictOption[]);
    }
    void load();
    return () => { cancelled = true; };
  }, [cityId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) next.title = "Proje adı zorunludur.";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      for (const [tab, fields] of Object.entries(tabFieldMap)) {
        if (fields.some((f) => next[f])) {
          setActiveTab(tab);
          break;
        }
      }
    }

    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const payload: ProjectInput = {
      title: form.title.trim(),
      short_description: form.short_description.trim() || undefined,
      description: form.description.trim() || undefined,
      completion_date: form.completion_date.trim() || undefined,
      location: form.location.trim() || undefined,
      city_id: form.city_id ? Number(form.city_id) : undefined,
      district_id: form.district_id ? Number(form.district_id) : undefined,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      starting_price: form.starting_price ? Number(form.starting_price) : undefined,
      currency: form.currency || "GBP",
      total_units: form.total_units ? Number(form.total_units) : undefined,
      cover_image: form.cover_image.trim() || undefined,
      video_url: form.video_url.trim() || undefined,
      gallery_images: galleryImages.length > 0 ? galleryImages : undefined,
      features: selectedFeatures.size > 0 ? Array.from(selectedFeatures) : undefined,
      status: form.status,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createProject(payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Proje oluşturuldu.");
          router.push("/admin/projeler");
        }
      } else {
        const result = await updateProject(project.id, payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Proje güncellendi.");
          router.push("/admin/projeler");
        }
      }
    });
  }

  // Media picker
  function openMediaPicker(target: "cover" | "gallery") {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
  }

  const handleMediaSelect = useCallback((url: string) => {
    if (mediaPickerTarget === "cover") {
      setForm((prev) => ({ ...prev, cover_image: url }));
    } else {
      setGalleryImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    }
  }, [mediaPickerTarget]);

  // Gallery DnD
  function handleGalleryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGalleryImages((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function removeGalleryImage(url: string) {
    setGalleryImages((prev) => prev.filter((u) => u !== url));
  }

  // Features toggle
  function toggleFeature(feature: string) {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(feature)) next.delete(feature);
      else next.add(feature);
      return next;
    });
  }

  function addCustomFeature() {
    const val = customFeature.trim();
    if (!val) return;
    setSelectedFeatures((prev) => new Set(prev).add(val));
    setCustomFeature("");
  }

  const textareaClass =
    "h-auto w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 resize-y";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
        <TabsList className="h-auto flex-wrap gap-1">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`gap-1.5 ${tabsWithErrors.has(tab.value) ? "text-destructive data-[state=active]:text-destructive" : ""}`}
              >
                <TabIcon className="size-3.5" />
                {tab.label}
                {tabsWithErrors.has(tab.value) && <span className="ml-1 text-destructive">*</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ================================================================ */}
        {/* TAB: Temel Bilgiler                                              */}
        {/* ================================================================ */}
        <TabsContent value="temel" className="mt-6 space-y-5">
          <Field label="Proje Adı" htmlFor="title" required error={errors.title}>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Sunset Bay Residence"
              aria-invalid={!!errors.title}
            />
          </Field>

          <Field label="Kısa Açıklama" htmlFor="short_description" hint="Liste kartlarında gösterilir.">
            <Input
              id="short_description"
              name="short_description"
              value={form.short_description}
              onChange={handleChange}
              placeholder="Deniz manzaralı lüks konut projesi"
            />
          </Field>

          <Field label="Detaylı Açıklama" htmlFor="description">
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Proje hakkında detaylı bilgi..."
              className={textareaClass}
            />
          </Field>

          <Field label="Teslim Tarihi" htmlFor="completion_date" hint="Örn. 2026 Q3">
            <Input
              id="completion_date"
              name="completion_date"
              value={form.completion_date}
              onChange={handleChange}
              placeholder="2026 Q3"
            />
          </Field>
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB: Konum                                                       */}
        {/* ================================================================ */}
        <TabsContent value="konum" className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Şehir" htmlFor="city_id">
              <Select
                value={form.city_id || undefined}
                onValueChange={(v) => {
                  setForm((prev) => ({ ...prev, city_id: v ?? "", district_id: "" }));
                }}
              >
                <SelectTrigger id="city_id" className="h-9">
                  <SelectValue placeholder="Seçiniz">
                    {form.city_id
                      ? cities.find((c) => c.id.toString() === form.city_id)?.name ?? "Seçiniz"
                      : "Seçiniz"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="İlçe" htmlFor="district_id">
              <Select
                value={form.district_id || undefined}
                onValueChange={(v) => setForm((prev) => ({ ...prev, district_id: v ?? "" }))}
              >
                <SelectTrigger id="district_id" className="h-9">
                  <SelectValue placeholder="Seçiniz">
                    {form.district_id
                      ? districts.find((d) => d.id.toString() === form.district_id)?.name ?? "Seçiniz"
                      : "Seçiniz"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Adres / Konum" htmlFor="location" hint="Proje detay sayfasında gösterilir.">
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Girne, Alsancak"
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
            <Field label="Enlem (Lat)" htmlFor="lat" hint="Haritadan seçebilir veya manuel girebilirsiniz.">
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
            <Field label="Boylam (Lng)" htmlFor="lng">
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

        {/* ================================================================ */}
        {/* TAB: Fiyat & Birimler                                            */}
        {/* ================================================================ */}
        <TabsContent value="fiyat" className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Başlangıç Fiyatı" htmlFor="starting_price">
              <Input
                id="starting_price"
                name="starting_price"
                type="number"
                step="0.01"
                value={form.starting_price}
                onChange={handleChange}
                placeholder="150000"
              />
            </Field>

            <Field label="Para Birimi" htmlFor="currency">
              <Select
                value={form.currency}
                onValueChange={(v) => setForm((prev) => ({ ...prev, currency: v ?? "GBP" }))}
              >
                <SelectTrigger id="currency" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Toplam Birim" htmlFor="total_units">
              <Input
                id="total_units"
                name="total_units"
                type="number"
                value={form.total_units}
                onChange={handleChange}
                placeholder="120"
              />
            </Field>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB: Medya                                                       */}
        {/* ================================================================ */}
        <TabsContent value="medya" className="mt-6 space-y-6">
          {/* Cover image */}
          <div className="space-y-1.5">
            <label htmlFor="cover_image" className="text-sm font-medium leading-none">
              Kapak Görseli
            </label>
            <div className="flex gap-2">
              <Input
                id="cover_image"
                name="cover_image"
                type="url"
                value={form.cover_image}
                onChange={handleChange}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => openMediaPicker("cover")}
                className="gap-1.5 shrink-0"
              >
                <ImageIcon className="size-4" />
                Galeriden Seç
              </Button>
            </div>
            {form.cover_image && /^https?:\/\/.+/.test(form.cover_image) && (
              <div className="mt-3">
                <img
                  src={form.cover_image}
                  alt="Kapak önizleme"
                  className="h-40 w-auto rounded-lg border object-cover shadow-sm"
                />
              </div>
            )}
          </div>

          <Field label="Video URL" htmlFor="video_url" hint="YouTube linki yapıştırın.">
            <Input
              id="video_url"
              name="video_url"
              type="url"
              value={form.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>

          {/* Gallery images with DnD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none">
                Galeri Görselleri
                {galleryImages.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    ({galleryImages.length} görsel)
                  </span>
                )}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openMediaPicker("gallery")}
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
                Galeriden Ekle
              </Button>
            </div>

            {galleryImages.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGalleryDragEnd}
              >
                <SortableContext
                  items={galleryImages}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {galleryImages.map((url) => (
                      <SortableGalleryItem
                        key={url}
                        url={url}
                        onRemove={() => removeGalleryImage(url)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-muted-foreground">
                <ImageIcon className="size-8 mb-2 opacity-40" />
                <p className="text-sm">Henüz galeri görseli eklenmemiş</p>
                <p className="text-xs mt-1">Yukarıdaki butonu kullanarak görsel ekleyin</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Sürükleyerek sıralayabilir, X ile kaldırabilirsiniz.
            </p>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB: Özellikler                                                  */}
        {/* ================================================================ */}
        <TabsContent value="ozellikler" className="mt-6 space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-medium">Proje Özellikleri</p>
            <p className="text-xs text-muted-foreground">
              Projenin sahip olduğu özellikleri seçin. Özel bir özellik eklemek için alttaki alanı kullanın.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {PREDEFINED_FEATURES.map((feature) => (
                <label
                  key={feature}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                    selectedFeatures.has(feature)
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFeatures.has(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="size-4 rounded accent-primary"
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          {/* Custom feature input */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Özel Özellik Ekle</p>
            <div className="flex gap-2">
              <Input
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Örn: Özel plaj alanı"
                className="max-w-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomFeature}
                disabled={!customFeature.trim()}
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
                Ekle
              </Button>
            </div>
          </div>

          {/* Custom features that are not in predefined list */}
          {Array.from(selectedFeatures).filter((f) => !PREDEFINED_FEATURES.includes(f)).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Özel Eklenenler</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedFeatures)
                  .filter((f) => !PREDEFINED_FEATURES.includes(f))
                  .map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className="rounded-full hover:bg-destructive/20 p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Selected count */}
          {selectedFeatures.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedFeatures.size} özellik seçili
            </p>
          )}
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB: Durum                                                       */}
        {/* ================================================================ */}
        <TabsContent value="durum" className="mt-6 space-y-5">
          <Field label="Proje Durumu" htmlFor="status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm((prev) => ({ ...prev, status: v ?? "selling" }))}
            >
              <SelectTrigger id="status" className="h-9 w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selling">Satışta</SelectItem>
                <SelectItem value="under_construction">Yapım Aşamasında</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="upcoming">Yakında</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Switch
                id="is_featured"
                checked={form.is_featured}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_featured: !!checked }))
                }
              />
              <label htmlFor="is_featured" className="cursor-pointer text-sm">
                <span className="font-medium">Öne Çıkan Proje</span>
                <span className="ml-1 text-muted-foreground">— Ana sayfada ve listelerde öne çıkar.</span>
              </label>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_active: !!checked }))
                }
              />
              <label htmlFor="is_active" className="cursor-pointer text-sm">
                <span className="font-medium">Aktif</span>
                <span className="ml-1 text-muted-foreground">— Pasif projeler sitede görünmez.</span>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ---- Form Actions ---- */}
      <div className="flex gap-3 border-t pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Oluşturuluyor..."
              : "Kaydediliyor..."
            : mode === "create"
              ? "Proje Oluştur"
              : "Değişiklikleri Kaydet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/projeler")}
          disabled={isPending}
        >
          İptal
        </Button>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        currentUrl={mediaPickerTarget === "cover" ? form.cover_image : undefined}
      />
    </form>
  );
}
