"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { updateSettings } from "@/actions/settings";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SiteSettingRow = {
  key: string;
  value: string | null;
  label: string | null;
  category: string | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  company: "Firma Bilgileri",
  hero: "Hero Bölümü",
  social: "Sosyal Medya",
  seo: "SEO",
  contact: "İletişim",
};

// Long-value keys that should use a textarea
const TEXTAREA_KEYS = new Set([
  "hero_description",
  "about_text",
  "footer_text",
  "seo_description",
]);

// ---------------------------------------------------------------------------
// Field component
// ---------------------------------------------------------------------------

function SettingField({
  setting,
  value,
  onChange,
}: {
  setting: SiteSettingRow;
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  const label = setting.label ?? setting.key;
  const isTextarea = TEXTAREA_KEYS.has(setting.key);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`setting-${setting.key}`}
        className="text-sm font-medium leading-none"
      >
        {label}
      </label>
      {isTextarea ? (
        <Textarea
          id={`setting-${setting.key}`}
          value={value}
          onChange={(e) => onChange(setting.key, e.target.value)}
          rows={3}
          placeholder={label}
        />
      ) : (
        <Input
          id={`setting-${setting.key}`}
          value={value}
          onChange={(e) => onChange(setting.key, e.target.value)}
          placeholder={label}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: SiteSettingRow[];
}) {
  const [isPending, startTransition] = useTransition();

  // Build value map from initial settings
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const s of initialSettings) {
      map[s.key] = s.value ?? "";
    }
    return map;
  });

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success(
          `${result.data.updated} ayar güncellendi.`
        );
      }
    });
  }

  // Group settings by category
  const grouped = initialSettings.reduce<
    Record<string, SiteSettingRow[]>
  >((acc, setting) => {
    const category = setting.category ?? "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => {
    // Sort known categories first
    const aLabel = CATEGORY_LABELS[a] ?? a;
    const bLabel = CATEGORY_LABELS[b] ?? b;
    return aLabel.localeCompare(bLabel, "tr");
  });

  if (initialSettings.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Henüz site ayarı tanımlanmamış. Supabase&apos;de{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          site_settings
        </code>{" "}
        tablosuna kayıt ekleyin.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {categories.map((category) => {
        const categorySettings = grouped[category];
        if (!categorySettings || categorySettings.length === 0) return null;

        const categoryLabel =
          CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);

        return (
          <div key={category} className="rounded-lg border p-5 space-y-5">
            <h2 className="text-base font-semibold text-slate-800 border-b pb-3">
              {categoryLabel}
            </h2>
            {categorySettings.map((setting) => (
              <SettingField
                key={setting.key}
                setting={setting}
                value={values[setting.key] ?? ""}
                onChange={handleChange}
              />
            ))}
          </div>
        );
      })}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>
    </form>
  );
}
