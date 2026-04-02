"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ImageIcon, Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Quote, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaPicker } from "@/components/admin/media-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createBlogPost,
  updateBlogPost,
  type BlogPostInput,
} from "@/actions/blog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryOption = { id: number; name: string };
type TagOption = { id: number; name: string };

type ExistingPost = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  author: string | null;
  cover_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  category_id?: number | null;
  tag_ids?: number[];
};

type BlogFormProps = {
  mode: "create" | "edit";
  post?: ExistingPost;
  categories?: CategoryOption[];
  tags?: TagOption[];
};

type FormState = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  cover_image: string;
  seo_title: string;
  seo_description: string;
  is_published: boolean;
  category_id: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ü: "u",
    Ü: "u",
    ş: "s",
    Ş: "s",
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
  };

  return text
    .split("")
    .map((c) => turkishMap[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

export function BlogForm({ mode, post, categories = [], tags = [] }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    mode === "edit"
  );
  const [selectedTags, setSelectedTags] = useState<Set<number>>(
    new Set(post?.tag_ids ?? [])
  );

  const [form, setForm] = useState<FormState>({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    content: post?.content ?? "",
    excerpt: post?.excerpt ?? "",
    author: post?.author ?? "",
    cover_image: post?.cover_image ?? "",
    seo_title: post?.seo_title ?? "",
    seo_description: post?.seo_description ?? "",
    is_published: post?.is_published ?? false,
    category_id: post?.category_id ? String(post.category_id) : "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [contentMode, setContentMode] = useState<"visual" | "html">("visual");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    if (name === "slug") {
      setSlugManuallyEdited(true);
    }

    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-generate slug from title when not manually edited
      if (name === "title" && !slugManuallyEdited) {
        next.slug = slugify(value);
      }
      return next;
    });

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

    if (
      form.cover_image &&
      !/^https?:\/\/.+/.test(form.cover_image)
    ) {
      next.cover_image = "Geçerli bir URL girin (https:// ile başlamalı).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildPayload(): BlogPostInput {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      content: form.content.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      author: form.author.trim() || undefined,
      cover_image: form.cover_image.trim() || undefined,
      seo_title: form.seo_title.trim() || undefined,
      seo_description: form.seo_description.trim() || undefined,
      is_published: form.is_published,
      category_id: form.category_id ? Number(form.category_id) : null,
      tag_ids: Array.from(selectedTags),
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    const payload = buildPayload();

    startTransition(async () => {
      if (mode === "create") {
        const result = await createBlogPost(payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Blog yazısı oluşturuldu.");
          router.push("/admin/blog");
        }
      } else {
        const result = await updateBlogPost(post!.id, payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Blog yazısı güncellendi.");
          router.push("/admin/blog");
        }
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
          placeholder="Blog yazısı başlığı"
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
        hint="URL'de kullanılacak kısa ad. Başlık değiştikçe otomatik güncellenir."
      >
        <Input
          id="slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="blog-yazisi-basligi"
          aria-invalid={!!errors.slug}
        />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug}</p>
        )}
      </Field>

      {/* Excerpt */}
      <Field
        label="Özet"
        htmlFor="excerpt"
        hint="Liste sayfasında ve meta açıklamasında görünür."
      >
        <Textarea
          id="excerpt"
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          placeholder="Yazının kısa özeti..."
          rows={2}
        />
      </Field>

      {/* Content with Visual/HTML tabs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">İçerik</label>
          <div className="flex gap-1 rounded-lg border p-0.5">
            <button
              type="button"
              onClick={() => setContentMode("visual")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${contentMode === "visual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Metin
            </button>
            <button
              type="button"
              onClick={() => setContentMode("html")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${contentMode === "html" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              HTML
            </button>
          </div>
        </div>

        {contentMode === "visual" ? (
          <div className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
              {[
                { cmd: "bold", icon: Bold, title: "Kalın" },
                { cmd: "italic", icon: Italic, title: "İtalik" },
              ].map((btn) => (
                <button key={btn.cmd} type="button" title={btn.title} onClick={() => document.execCommand(btn.cmd)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <btn.icon className="size-4" />
                </button>
              ))}
              <div className="mx-1 h-5 w-px bg-border" />
              <button type="button" title="Başlık 2" onClick={() => document.execCommand("formatBlock", false, "h2")} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Heading2 className="size-4" />
              </button>
              <button type="button" title="Başlık 3" onClick={() => document.execCommand("formatBlock", false, "h3")} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Heading3 className="size-4" />
              </button>
              <button type="button" title="Paragraf" onClick={() => document.execCommand("formatBlock", false, "p")} className="rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                P
              </button>
              <div className="mx-1 h-5 w-px bg-border" />
              <button type="button" title="Madde Listesi" onClick={() => document.execCommand("insertUnorderedList")} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <List className="size-4" />
              </button>
              <button type="button" title="Numaralı Liste" onClick={() => document.execCommand("insertOrderedList")} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <ListOrdered className="size-4" />
              </button>
              <button type="button" title="Alıntı" onClick={() => document.execCommand("formatBlock", false, "blockquote")} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Quote className="size-4" />
              </button>
              <div className="mx-1 h-5 w-px bg-border" />
              <button type="button" title="Link Ekle" onClick={() => {
                const url = prompt("Link URL'si girin:");
                if (url) document.execCommand("createLink", false, url);
              }} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Link2 className="size-4" />
              </button>
              <button type="button" title="Yatay Çizgi" onClick={() => document.execCommand("insertHorizontalRule")} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Minus className="size-4" />
              </button>
            </div>
            {/* Editable area */}
            <div className="p-4">
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setForm((prev) => ({ ...prev, content: e.currentTarget.innerHTML }))}
                dangerouslySetInnerHTML={{ __html: form.content }}
                className="min-h-[300px] text-sm leading-relaxed outline-none prose prose-sm max-w-none dark:prose-invert [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic"
              />
            </div>
          </div>
        ) : (
          <Textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="<h2>Başlık</h2><p>İçerik...</p>"
            rows={16}
            className="font-mono text-xs leading-relaxed"
          />
        )}
        <p className="text-xs text-muted-foreground">
          {contentMode === "visual" ? "Metni düzenleyin. Başlık, liste, link gibi biçimlendirmeler desteklenir." : "HTML kodunu doğrudan düzenleyin."}
        </p>
      </div>

      {/* Author */}
      <Field label="Yazar" htmlFor="author">
        <Input
          id="author"
          name="author"
          value={form.author}
          onChange={handleChange}
          placeholder="Yazar adı"
        />
      </Field>

      {/* Category */}
      {categories.length > 0 && (
        <Field label="Kategori" htmlFor="category_id">
          <Select
            value={form.category_id || "__none__"}
            onValueChange={(v) =>
              setForm((prev) => ({ ...prev, category_id: v === "__none__" ? "" : (v ?? "") }))
            }
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Kategori seçiniz">
                {form.category_id
                  ? categories.find((c) => String(c.id) === form.category_id)?.name ?? "Seçiniz"
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Kategorisiz</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Field label="Etiketler" htmlFor="tags" hint="Birden fazla etiket seçebilirsiniz">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = selectedTags.has(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags((prev) => {
                      const next = new Set(prev);
                      if (next.has(tag.id)) next.delete(tag.id);
                      else next.add(tag.id);
                      return next;
                    });
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      {/* Cover image with media picker */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Kapak Görseli</label>
        <div className="flex gap-2">
          <Input
            id="cover_image"
            name="cover_image"
            type="url"
            value={form.cover_image}
            onChange={handleChange}
            placeholder="https://... veya galeriden seçin"
            aria-invalid={!!errors.cover_image}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={() => setMediaPickerOpen(true)} className="gap-1.5 shrink-0">
            <ImageIcon className="size-4" />
            Galeri
          </Button>
        </div>
        {form.cover_image && /^https?:\/\/.+/.test(form.cover_image) && (
          <div className="relative mt-2 h-32 w-48 overflow-hidden rounded-lg border">
            <img src={form.cover_image} alt="Kapak önizleme" className="h-full w-full object-cover" />
          </div>
        )}
        {errors.cover_image && (
          <p className="text-xs text-destructive">{errors.cover_image}</p>
        )}
        <p className="text-xs text-muted-foreground">URL girin veya medya kütüphanesinden seçin.</p>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setForm((prev) => ({ ...prev, cover_image: url }))}
        currentUrl={form.cover_image}
      />

      {/* SEO divider */}
      <div className="border-t pt-2">
        <p className="text-sm font-semibold text-foreground">SEO Ayarları</p>
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
              ? "— yazı sitede görünür"
              : "— yazı henüz yayınlanmadı"}
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Oluşturuluyor..."
              : "Kaydediliyor..."
            : mode === "create"
              ? "Yazı Oluştur"
              : "Değişiklikleri Kaydet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
          disabled={isPending}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
