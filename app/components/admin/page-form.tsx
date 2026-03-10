"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { updatePage, type PageInput } from "@/actions/pages";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageData = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
};

type FormState = {
  title: string;
  slug: string;
  content: string;
  seo_title: string;
  seo_description: string;
  is_published: boolean;
};

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function PageForm({ page }: { page: PageData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>({
    title: page.title,
    slug: page.slug,
    content: page.content ?? "",
    seo_title: page.seo_title ?? "",
    seo_description: page.seo_description ?? "",
    is_published: page.is_published,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

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

    if (!form.title.trim()) {
      next.title = "Başlık zorunludur.";
    }

    if (!form.slug.trim()) {
      next.slug = "Slug zorunludur.";
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      next.slug = "Slug yalnızca küçük harf, rakam ve tire içerebilir.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    const payload: PageInput = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content.trim() || undefined,
      seo_title: form.seo_title.trim() || undefined,
      seo_description: form.seo_description.trim() || undefined,
      is_published: form.is_published,
    };

    startTransition(async () => {
      const result = await updatePage(page.id, payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Sayfa güncellendi.");
        router.push("/admin/sayfalar");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Title */}
      <Field label="Başlık" htmlFor="title" required>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Sayfa başlığı"
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </Field>

      {/* Slug */}
      <Field
        label="Slug"
        htmlFor="slug"
        required
        hint="URL'de kullanılacak kısa ad (ör: hakkimizda, iletisim)."
      >
        <Input
          id="slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="hakkimizda"
          aria-invalid={!!errors.slug}
        />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug}</p>
        )}
      </Field>

      {/* Content */}
      <Field
        label="İçerik"
        htmlFor="content"
        hint="HTML veya düz metin girebilirsiniz. TipTap editör ileride entegre edilecektir."
      >
        <Textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Sayfa içeriği..."
          rows={14}
          className="font-mono text-sm"
        />
      </Field>

      {/* SEO divider */}
      <div className="border-t pt-2">
        <p className="text-sm font-semibold text-slate-700">SEO Ayarları</p>
      </div>

      {/* SEO title */}
      <Field label="SEO Başlık" htmlFor="seo_title">
        <Input
          id="seo_title"
          name="seo_title"
          value={form.seo_title}
          onChange={handleChange}
          placeholder="Arama motorlarında görünecek başlık"
        />
      </Field>

      {/* SEO description */}
      <Field label="SEO Açıklama" htmlFor="seo_description">
        <Textarea
          id="seo_description"
          name="seo_description"
          value={form.seo_description}
          onChange={handleChange}
          placeholder="Arama motorlarında görünecek açıklama (max 160 karakter)"
          rows={2}
        />
      </Field>

      {/* Publish toggle */}
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Switch
          id="is_published"
          checked={form.is_published}
          onCheckedChange={(checked) =>
            setForm((prev) => ({ ...prev, is_published: checked }))
          }
        />
        <label htmlFor="is_published" className="cursor-pointer text-sm">
          <span className="font-medium">
            {form.is_published ? "Yayında" : "Taslak"}
          </span>
          <span className="ml-1 text-muted-foreground">
            {form.is_published
              ? "— sayfa sitede görünür"
              : "— sayfa henüz yayınlanmadı"}
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/sayfalar")}
          disabled={isPending}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
