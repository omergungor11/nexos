"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ImageIcon,
  Info,
  Building2,
  MapPin,
  Banknote,
  Film,
  ListChecks,
  Settings2,
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
  developer: string;
  developer_logo: string;
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
  gallery_images: string;
  features: string;
  status: string;
  is_featured: boolean;
  is_active: boolean;
};

type DistrictOption = { id: number; name: string };

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const TABS = [
  { value: "temel", label: "Temel Bilgiler", icon: Info },
  { value: "gelistirici", label: "Geliştirici", icon: Building2 },
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
// Main form component
// ---------------------------------------------------------------------------

export function ProjectForm({ mode, project, cities }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("temel");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "logo">("cover");
  const [districts, setDistricts] = useState<DistrictOption[]>([]);

  const [form, setForm] = useState<FormState>({
    title: project?.title ?? "",
    short_description: project?.short_description ?? "",
    description: project?.description ?? "",
    developer: project?.developer ?? "",
    developer_logo: project?.developer_logo ?? "",
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
    gallery_images: (project?.gallery_images ?? []).join(", "),
    features: (project?.features ?? []).join(", "),
    status: project?.status ?? "selling",
    is_featured: project?.is_featured ?? false,
    is_active: project?.is_active ?? true,
  });

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

    // Jump to first tab with error
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

    const galleryArr = form.gallery_images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const featuresArr = form.features
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: ProjectInput = {
      title: form.title.trim(),
      short_description: form.short_description.trim() || undefined,
      description: form.description.trim() || undefined,
      developer: form.developer.trim() || undefined,
      developer_logo: form.developer_logo.trim() || undefined,
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
      gallery_images: galleryArr.length > 0 ? galleryArr : undefined,
      features: featuresArr.length > 0 ? featuresArr : undefined,
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

  function openMediaPicker(target: "cover" | "logo") {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
  }

  function handleMediaSelect(url: string) {
    if (mediaPickerTarget === "cover") {
      setForm((prev) => ({ ...prev, cover_image: url }));
    } else {
      setForm((prev) => ({ ...prev, developer_logo: url }));
    }
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
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB: Geliştirici                                                 */}
        {/* ================================================================ */}
        <TabsContent value="gelistirici" className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Geliştirici Firma" htmlFor="developer">
              <Input
                id="developer"
                name="developer"
                value={form.developer}
                onChange={handleChange}
                placeholder="ABC İnşaat"
              />
            </Field>

            <Field label="Teslim Tarihi" htmlFor="completion_date">
              <Input
                id="completion_date"
                name="completion_date"
                value={form.completion_date}
                onChange={handleChange}
                placeholder="2026 Q3"
              />
            </Field>
          </div>

          {/* Developer logo */}
          <div className="space-y-1.5">
            <label htmlFor="developer_logo" className="text-sm font-medium leading-none">
              Geliştirici Logosu
            </label>
            <div className="flex gap-2">
              <Input
                id="developer_logo"
                name="developer_logo"
                type="url"
                value={form.developer_logo}
                onChange={handleChange}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => openMediaPicker("logo")}
                className="gap-1.5 shrink-0"
              >
                <ImageIcon className="size-4" />
                Galeri
              </Button>
            </div>
            {form.developer_logo && /^https?:\/\/.+/.test(form.developer_logo) && (
              <div className="mt-2">
                <img
                  src={form.developer_logo}
                  alt="Logo önizleme"
                  className="h-12 object-contain rounded border bg-white p-1.5"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">URL girin veya medya kütüphanesinden seçin.</p>
          </div>
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
                  <SelectValue placeholder="Seçiniz" />
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
                  <SelectValue placeholder="Seçiniz" />
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Enlem (Lat)" htmlFor="lat" hint="Haritada pin için gerekli.">
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
        <TabsContent value="medya" className="mt-6 space-y-5">
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
                Galeri
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
            <p className="text-xs text-muted-foreground">URL girin veya medya kütüphanesinden seçin.</p>
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

          <Field
            label="Galeri Görselleri"
            htmlFor="gallery_images"
            hint="URL'leri virgülle ayırarak girin. Her URL bir galeri görseli olarak gösterilir."
          >
            <textarea
              id="gallery_images"
              name="gallery_images"
              value={form.gallery_images}
              onChange={handleChange}
              rows={4}
              placeholder="https://img1.jpg, https://img2.jpg, ..."
              className={textareaClass}
            />
          </Field>
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB: Özellikler                                                  */}
        {/* ================================================================ */}
        <TabsContent value="ozellikler" className="mt-6 space-y-5">
          <Field
            label="Proje Özellikleri"
            htmlFor="features"
            hint="Virgülle ayırarak girin. Proje detay sayfasında liste olarak gösterilir."
          >
            <textarea
              id="features"
              name="features"
              value={form.features}
              onChange={handleChange}
              rows={5}
              placeholder="Yüzme Havuzu, Fitness Salonu, 24 Saat Güvenlik, Çocuk Oyun Alanı, Sauna, Türk Hamamı"
              className={textareaClass}
            />
          </Field>

          {/* Feature preview */}
          {form.features.trim() && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Önizleme</p>
              <div className="flex flex-wrap gap-2">
                {form.features
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean)
                  .map((feature, i) => (
                    <span
                      key={i}
                      className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
              </div>
            </div>
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
        currentUrl={mediaPickerTarget === "cover" ? form.cover_image : form.developer_logo}
      />
    </form>
  );
}
