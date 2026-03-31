"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Settings,
  Search,
  Phone,
  Share2,
  Mail,
  Palette,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Info,
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSettings } from "@/actions/settings";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function SaveButton({
  onClick,
  isPending,
}: {
  onClick: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex justify-end pt-4">
      <Button onClick={onClick} disabled={isPending} className="gap-2">
        <Save className="size-4" />
        {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </Button>
    </div>
  );
}

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
      <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
      <p className="text-sm text-blue-800 dark:text-blue-300">{children}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface SettingsPageProps {
  settings: Record<string, string>;
}

export function SettingsPage({ settings: initial }: SettingsPageProps) {
  const [values, setValues] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function get(key: string) {
    return values[key] ?? "";
  }

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setBool(key: string, checked: boolean) {
    set(key, checked ? "true" : "false");
  }

  function isBool(key: string) {
    return get(key) === "true";
  }

  function saveKeys(keys: string[]) {
    const payload: Record<string, string> = {};
    for (const k of keys) payload[k] = get(k);

    startTransition(async () => {
      const result = await updateSettings(payload);
      if (result.error) {
        toast.error(`Kayıt hatası: ${result.error}`);
      } else {
        toast.success("Ayarlar kaydedildi.");
      }
    });
  }

  function handlePasswordChange() {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(`Şifre değiştirilemedi: ${error.message}`);
      } else {
        toast.success("Şifre başarıyla değiştirildi.");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Tab definitions
  // ---------------------------------------------------------------------------

  const TABS = [
    { value: "genel", label: "Genel", icon: Settings },
    { value: "seo", label: "SEO", icon: Search },
    { value: "iletisim", label: "İletişim", icon: Phone },
    { value: "sosyal", label: "Sosyal Medya", icon: Share2 },
    { value: "eposta", label: "E-posta", icon: Mail },
    { value: "gorunum", label: "Görünüm", icon: Palette },
    { value: "bildirimler", label: "Bildirimler", icon: Bell },
    { value: "guvenlik", label: "Güvenlik", icon: Shield },
  ] as const;

  return (
    <Tabs defaultValue="genel">
      <TabsList className="h-auto flex-wrap gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              <Icon className="size-3.5" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* ─── Genel ─────────────────────────────────────────────── */}
      <TabsContent value="genel" className="mt-6 space-y-6">
        <SettingsSection title="Site Bilgileri" description="Temel site bilgilerini düzenleyin.">
          <SettingsField label="Site Başlığı">
            <Input value={get("site_title")} onChange={(e) => set("site_title", e.target.value)} />
          </SettingsField>
          <SettingsField label="Site Açıklaması">
            <Textarea value={get("site_description")} onChange={(e) => set("site_description", e.target.value)} rows={3} />
          </SettingsField>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Ana Renk">
              <div className="flex gap-2">
                <input type="color" value={get("primary_color") || "#ffca3e"} onChange={(e) => set("primary_color", e.target.value)} className="h-9 w-14 cursor-pointer rounded border" />
                <Input value={get("primary_color")} onChange={(e) => set("primary_color", e.target.value)} placeholder="#ffca3e" className="flex-1" />
              </div>
            </SettingsField>
            <SettingsField label="Google Maps Linki">
              <Input type="url" value={get("google_maps_link")} onChange={(e) => set("google_maps_link", e.target.value)} />
            </SettingsField>
          </div>
        </SettingsSection>

        <SettingsSection title="İletişim Bilgileri" description="Header, footer ve iletişim sayfasında görünen bilgiler.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Telefon">
              <Input value={get("company_phone")} onChange={(e) => set("company_phone", e.target.value)} />
            </SettingsField>
            <SettingsField label="E-posta">
              <Input type="email" value={get("company_email")} onChange={(e) => set("company_email", e.target.value)} />
            </SettingsField>
          </div>
          <SettingsField label="Adres">
            <Textarea value={get("company_address")} onChange={(e) => set("company_address", e.target.value)} rows={2} />
          </SettingsField>
        </SettingsSection>

        <SaveButton isPending={isPending} onClick={() => saveKeys(["site_title", "site_description", "primary_color", "google_maps_link", "company_phone", "company_email", "company_address"])} />
      </TabsContent>

      {/* ─── SEO ───────────────────────────────────────────────── */}
      <TabsContent value="seo" className="mt-6 space-y-6">
        <SettingsSection title="Arama Motoru Optimizasyonu" description="Google ve diğer arama motorları için ayarlar.">
          <SettingsField label="Meta Başlık Şablonu" hint="%s yerine sayfa başlığı gelir. Örn: %s | Nexos Investment">
            <Input value={get("meta_title_template")} onChange={(e) => set("meta_title_template", e.target.value)} />
          </SettingsField>
          <SettingsField label="Varsayılan Meta Açıklama" hint="Arama sonuçlarında görünecek genel açıklama.">
            <Textarea value={get("default_meta_description")} onChange={(e) => set("default_meta_description", e.target.value)} rows={3} />
          </SettingsField>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Google Analytics ID" hint="Örn: G-XXXXXXXXXX">
              <Input value={get("google_analytics_id")} onChange={(e) => set("google_analytics_id", e.target.value)} placeholder="G-" />
            </SettingsField>
            <SettingsField label="Search Console Doğrulama" hint="Meta tag doğrulama kodu">
              <Input value={get("search_console_verification")} onChange={(e) => set("search_console_verification", e.target.value)} />
            </SettingsField>
          </div>
        </SettingsSection>

        <SaveButton isPending={isPending} onClick={() => saveKeys(["meta_title_template", "default_meta_description", "google_analytics_id", "search_console_verification"])} />
      </TabsContent>

      {/* ─── İletişim ──────────────────────────────────────────── */}
      <TabsContent value="iletisim" className="mt-6 space-y-6">
        <SettingsSection title="İletişim Detayları" description="Müşterilerin size ulaşabileceği bilgiler.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Telefon">
              <Input value={get("company_phone")} onChange={(e) => set("company_phone", e.target.value)} />
            </SettingsField>
            <SettingsField label="WhatsApp Numarası">
              <Input value={get("whatsapp_number")} onChange={(e) => set("whatsapp_number", e.target.value)} />
            </SettingsField>
          </div>
          <SettingsField label="E-posta">
            <Input type="email" value={get("company_email")} onChange={(e) => set("company_email", e.target.value)} />
          </SettingsField>
        </SettingsSection>

        <SettingsSection title="Çalışma Saatleri">
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField label="Hafta İçi">
              <Input value={get("working_hours_weekdays")} onChange={(e) => set("working_hours_weekdays", e.target.value)} placeholder="09:00-18:00" />
            </SettingsField>
            <SettingsField label="Cumartesi">
              <Input value={get("working_hours_saturday")} onChange={(e) => set("working_hours_saturday", e.target.value)} placeholder="09:00-14:00" />
            </SettingsField>
            <SettingsField label="Pazar">
              <Input value={get("working_hours_sunday")} onChange={(e) => set("working_hours_sunday", e.target.value)} placeholder="Kapalı" />
            </SettingsField>
          </div>
        </SettingsSection>

        <SettingsSection title="Ofis Konumu">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Enlem (Lat)" hint="Harita koordinatı">
              <Input value={get("office_lat")} onChange={(e) => set("office_lat", e.target.value)} />
            </SettingsField>
            <SettingsField label="Boylam (Lng)" hint="Harita koordinatı">
              <Input value={get("office_lng")} onChange={(e) => set("office_lng", e.target.value)} />
            </SettingsField>
          </div>
        </SettingsSection>

        <SaveButton isPending={isPending} onClick={() => saveKeys(["company_phone", "whatsapp_number", "company_email", "working_hours_weekdays", "working_hours_saturday", "working_hours_sunday", "office_lat", "office_lng"])} />
      </TabsContent>

      {/* ─── Sosyal Medya ──────────────────────────────────────── */}
      <TabsContent value="sosyal" className="mt-6 space-y-6">
        <SettingsSection title="Sosyal Medya Hesapları" description="Profil URL'lerinizi girin.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Facebook">
              <Input type="url" value={get("social_facebook")} onChange={(e) => set("social_facebook", e.target.value)} placeholder="https://facebook.com/..." />
            </SettingsField>
            <SettingsField label="Instagram">
              <Input type="url" value={get("social_instagram")} onChange={(e) => set("social_instagram", e.target.value)} placeholder="https://instagram.com/..." />
            </SettingsField>
            <SettingsField label="YouTube">
              <Input type="url" value={get("social_youtube")} onChange={(e) => set("social_youtube", e.target.value)} placeholder="https://youtube.com/..." />
            </SettingsField>
            <SettingsField label="TikTok">
              <Input type="url" value={get("social_tiktok")} onChange={(e) => set("social_tiktok", e.target.value)} placeholder="https://tiktok.com/..." />
            </SettingsField>
          </div>
        </SettingsSection>

        <SettingsSection title="İçerik Ayarları">
          <SettingsField label="Varsayılan Hashtagler" hint="Virgülle ayırın. Sosyal medya paylaşımlarında kullanılır.">
            <Textarea value={get("default_hashtags")} onChange={(e) => set("default_hashtags", e.target.value)} rows={2} placeholder="KuzeyKıbrıs,KKTC,NexosInvestment" />
          </SettingsField>
        </SettingsSection>

        <SaveButton isPending={isPending} onClick={() => saveKeys(["social_facebook", "social_instagram", "social_youtube", "social_tiktok", "default_hashtags"])} />
      </TabsContent>

      {/* ─── E-posta ───────────────────────────────────────────── */}
      <TabsContent value="eposta" className="mt-6 space-y-6">
        <SettingsSection title="E-posta Ayarları" description="Bildirim ve iletişim e-posta ayarları.">
          <SettingsField label="Bildirim E-postası" hint="Yeni talepler ve teklifler bu adrese gönderilir.">
            <Input type="email" value={get("notification_email")} onChange={(e) => set("notification_email", e.target.value)} />
          </SettingsField>
        </SettingsSection>

        <InfoBanner>
          SMTP şifresi güvenlik nedeniyle ortam değişkenlerinde (.env) saklanır. SMTP ayarlarını değiştirmek için Vercel Dashboard &gt; Environment Variables bölümünü kullanın.
        </InfoBanner>

        <SaveButton isPending={isPending} onClick={() => saveKeys(["notification_email"])} />
      </TabsContent>

      {/* ─── Görünüm ───────────────────────────────────────────── */}
      <TabsContent value="gorunum" className="mt-6 space-y-6">
        <SettingsSection title="Tema" description="Sitenin varsayılan görünüm ayarları.">
          <SettingsField label="Varsayılan Tema">
            <Select value={get("theme_default") || "system"} onValueChange={(v) => v && set("theme_default", String(v))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistem</SelectItem>
                <SelectItem value="light">Açık</SelectItem>
                <SelectItem value="dark">Koyu</SelectItem>
              </SelectContent>
            </Select>
          </SettingsField>
        </SettingsSection>

        <SettingsSection title="Anasayfa Bölümleri" description="Hangi bölümlerin anasayfada görüneceğini seçin.">
          <div className="space-y-4">
            {[
              { key: "homepage_deals_visible", label: "Fırsat İlanlar" },
              { key: "homepage_featured_visible", label: "Vitrin İlanları" },
              { key: "homepage_slider_visible", label: "İlan Slider" },
              { key: "homepage_blog_visible", label: "Blog / Rehber" },
              { key: "homepage_video_visible", label: "Video Bölümü" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {isBool(item.key) ? (
                    <Eye className="size-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="size-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Switch
                  checked={isBool(item.key)}
                  onCheckedChange={(checked) => setBool(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </SettingsSection>

        <SaveButton isPending={isPending} onClick={() => saveKeys(["theme_default", "homepage_deals_visible", "homepage_featured_visible", "homepage_slider_visible", "homepage_blog_visible", "homepage_video_visible"])} />
      </TabsContent>

      {/* ─── Bildirimler ───────────────────────────────────────── */}
      <TabsContent value="bildirimler" className="mt-6 space-y-6">
        <SettingsSection title="E-posta Bildirimleri" description="Hangi durumlarda e-posta bildirimi almak istediğinizi seçin.">
          <div className="space-y-4">
            {[
              { key: "notify_new_contact", label: "Yeni İletişim Talebi", desc: "Bir müşteri iletişim formu doldurduğunda" },
              { key: "notify_new_offer", label: "Yeni Teklif Oluşturulduğunda", desc: "Admin panelden yeni teklif oluşturulduğunda" },
              { key: "notify_property_expiry", label: "İlan Süresi Dolduğunda", desc: "Bir ilanın yayın süresi dolmak üzereyken" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={isBool(item.key)}
                  onCheckedChange={(checked) => setBool(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </SettingsSection>

        <SaveButton isPending={isPending} onClick={() => saveKeys(["notify_new_contact", "notify_new_offer", "notify_property_expiry"])} />
      </TabsContent>

      {/* ─── Güvenlik ──────────────────────────────────────────── */}
      <TabsContent value="guvenlik" className="mt-6 space-y-6">
        <SettingsSection title="Şifre Değiştir" description="Admin hesabınızın şifresini güncelleyin.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Yeni Şifre">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </SettingsField>
            <SettingsField label="Şifre Tekrar">
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreyi tekrar girin"
              />
            </SettingsField>
          </div>
          <Button onClick={handlePasswordChange} disabled={isPending} variant="destructive" className="gap-2">
            <Shield className="size-4" />
            Şifreyi Değiştir
          </Button>
        </SettingsSection>

        <InfoBanner>
          İki faktörlü doğrulama (2FA) yakında eklenecektir. Hesap güvenliğiniz için güçlü bir şifre kullanmanızı öneririz.
        </InfoBanner>
      </TabsContent>
    </Tabs>
  );
}
