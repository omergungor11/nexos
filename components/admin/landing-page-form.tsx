"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createLandingPage, updateLandingPage } from "@/actions/landing-pages";

type ExistingPage = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  hero_image: string | null;
  content: string | null;
  cta_text: string | null;
  cta_url: string | null;
  filter_params: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

type Props = {
  mode: "create" | "edit";
  page?: ExistingPage;
};

function slugify(text: string): string {
  const map: Record<string, string> = { ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g", İ: "i", Ö: "o", Ü: "u", Ş: "s", Ç: "c", Ğ: "g" };
  return text.split("").map((c) => map[c] ?? c).join("").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function LandingPageForm({ mode, page }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    subtitle: page?.subtitle ?? "",
    hero_image: page?.hero_image ?? "",
    content: page?.content ?? "",
    cta_text: page?.cta_text ?? "İletişime Geç",
    cta_url: page?.cta_url ?? "/iletisim",
    filter_params: page?.filter_params ?? "",
    is_published: page?.is_published ?? false,
    seo_title: page?.seo_title ?? "",
    seo_description: page?.seo_description ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title" && mode === "create") next.slug = slugify(value);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Başlık ve slug zorunludur.");
      return;
    }

    startTransition(async () => {
      if (mode === "create") {
        const result = await createLandingPage(form);
        if (result.error) toast.error(result.error);
        else { toast.success("Kampanya sayfası oluşturuldu."); router.push("/admin/kampanyalar"); }
      } else if (page) {
        const result = await updateLandingPage(page.id, form);
        if (result.error) toast.error(result.error);
        else { toast.success("Kampanya sayfası güncellendi."); router.push("/admin/kampanyalar"); }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="Başlık" htmlFor="title">
        <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Girne'de Yatırım Fırsatları" />
      </Field>

      <Field label="Slug" htmlFor="slug" hint="URL'de kullanılacak: /kampanya/slug">
        <Input id="slug" name="slug" value={form.slug} onChange={handleChange} placeholder="girne-yatirim-firsatlari" />
      </Field>

      <Field label="Alt Başlık" htmlFor="subtitle">
        <Input id="subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Kuzey Kıbrıs'ın en gözde bölgesinde..." />
      </Field>

      <Field label="Hero Görsel URL" htmlFor="hero_image">
        <Input id="hero_image" name="hero_image" type="url" value={form.hero_image} onChange={handleChange} placeholder="https://..." />
      </Field>

      <Field label="İçerik" htmlFor="content" hint="HTML veya düz metin">
        <Textarea id="content" name="content" value={form.content} onChange={handleChange} rows={8} placeholder="Kampanya detayları..." />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="CTA Buton Metni" htmlFor="cta_text">
          <Input id="cta_text" name="cta_text" value={form.cta_text} onChange={handleChange} />
        </Field>
        <Field label="CTA Buton URL" htmlFor="cta_url">
          <Input id="cta_url" name="cta_url" value={form.cta_url} onChange={handleChange} />
        </Field>
      </div>

      <Field label="İlan Filtre Parametreleri" htmlFor="filter_params" hint="Örnek: islem=satilik&tip=villa&sehir=girne — İlgili ilanları listelemek için">
        <Input id="filter_params" name="filter_params" value={form.filter_params} onChange={handleChange} placeholder="islem=satilik&tip=villa" />
      </Field>

      <div className="border-t pt-4">
        <p className="mb-3 text-sm font-semibold">SEO</p>
        <div className="space-y-4">
          <Field label="SEO Başlık" htmlFor="seo_title">
            <Input id="seo_title" name="seo_title" value={form.seo_title} onChange={handleChange} />
          </Field>
          <Field label="SEO Açıklama" htmlFor="seo_description">
            <Textarea id="seo_description" name="seo_description" value={form.seo_description} onChange={handleChange} rows={2} />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Switch id="is_published" checked={form.is_published} onCheckedChange={(c) => setForm((p) => ({ ...p, is_published: c }))} />
        <label htmlFor="is_published" className="cursor-pointer text-sm">
          <span className="font-medium">{form.is_published ? "Yayında" : "Taslak"}</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : mode === "create" ? "Oluştur" : "Kaydet"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/kampanyalar")}>İptal</Button>
      </div>
    </form>
  );
}
