"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ImageIcon, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPicker } from "@/components/admin/media-picker";

import { createAgent, updateAgent, type AgentInput } from "@/actions/agents";
import type { AdminAgentRow } from "@/components/admin/agent-data-table";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AgentFormProps =
  | { mode: "create"; agent?: never }
  | { mode: "edit"; agent: AdminAgentRow & { bio?: string | null; cover_image?: string | null } };

type FormState = {
  name: string;
  title: string;
  phone: string;
  email: string;
  bio: string;
  photo_url: string;
  cover_image: string;
};

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile preview
// ---------------------------------------------------------------------------

function ProfilePreview({ form }: { form: FormState }) {
  const hasPhoto = form.photo_url && /^https?:\/\/.+/.test(form.photo_url);
  const hasCover = form.cover_image && /^https?:\/\/.+/.test(form.cover_image);
  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <Card className="overflow-hidden">
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 to-primary/5">
        {hasCover && (
          <img
            src={form.cover_image}
            alt="Kapak"
            className="h-full w-full object-cover"
          />
        )}
        {!hasCover && (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Kapak fotoğrafı ekleyin
          </div>
        )}
        {/* Avatar overlapping cover */}
        <div className="absolute -bottom-10 left-6">
          {hasPhoto ? (
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-background ring-2 ring-primary/10">
              <img
                src={form.photo_url}
                alt="Profil"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-muted text-lg font-semibold ring-2 ring-primary/10">
              {initials}
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-14 pb-5 px-6">
        <h3 className="text-lg font-bold">{form.name || "Ad Soyad"}</h3>
        {form.title && (
          <p className="text-sm text-muted-foreground">{form.title}</p>
        )}
        {form.bio && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {form.bio}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {form.phone && (
            <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-[0.75rem]">
              <Phone className="h-3 w-3" /> {form.phone}
            </span>
          )}
          {form.email && (
            <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-[0.75rem]">
              <Mail className="h-3 w-3" /> {form.email}
            </span>
          )}
          {form.phone && (
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-green-500 px-2.5 text-[0.75rem] text-white">
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

export function AgentForm({ mode, agent }: AgentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: agent?.name ?? "",
    title: agent?.title ?? "",
    phone: agent?.phone ?? "",
    email: agent?.email ?? "",
    bio: agent?.bio ?? "",
    photo_url: agent?.photo_url ?? "",
    cover_image: agent?.cover_image ?? "",
  });

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

    if (!form.name.trim()) {
      next.name = "Ad Soyad zorunludur.";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Geçerli bir e-posta adresi girin.";
    }

    if (form.photo_url && !/^https?:\/\/.+/.test(form.photo_url)) {
      next.photo_url = "Geçerli bir URL girin (https:// ile başlamalı).";
    }

    if (form.cover_image && !/^https?:\/\/.+/.test(form.cover_image)) {
      next.cover_image = "Geçerli bir URL girin (https:// ile başlamalı).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    const payload: AgentInput = {
      name: form.name.trim(),
      title: form.title.trim() || "",
      phone: form.phone.trim() || "",
      email: form.email.trim() || "",
      bio: form.bio.trim() || "",
      photo_url: form.photo_url.trim() || "",
      cover_image: form.cover_image.trim() || "",
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createAgent(payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Danışman oluşturuldu.");
          router.push("/admin/danismanlar");
        }
      } else {
        const result = await updateAgent(agent.id, payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Danışman güncellendi.");
          router.push("/admin/danismanlar");
        }
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        {/* Name */}
        <Field label="Ad Soyad" htmlFor="name" required>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ahmet Yılmaz"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </Field>

        {/* Title */}
        <Field label="Unvan" htmlFor="title">
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Kıdemli Emlak Danışmanı"
          />
        </Field>

        {/* Phone */}
        <Field label="Telefon" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+90 555 000 00 00"
          />
        </Field>

        {/* Email */}
        <Field label="E-posta" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ahmet@nexosinvestment.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </Field>

        {/* Photo URL with media picker */}
        <div className="space-y-1.5">
          <label htmlFor="photo_url" className="text-sm font-medium leading-none">Profil Fotoğrafı</label>
          <div className="flex gap-2">
            <Input
              id="photo_url"
              name="photo_url"
              type="url"
              value={form.photo_url}
              onChange={handleChange}
              placeholder="https://... veya galeriden seçin"
              aria-invalid={!!errors.photo_url}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={() => setMediaPickerOpen(true)} className="gap-1.5 shrink-0">
              <ImageIcon className="size-4" />
              Galeri
            </Button>
          </div>
          {form.photo_url && /^https?:\/\/.+/.test(form.photo_url) && (
            <div className="mt-2 flex items-center gap-3">
              <div className="relative size-16 overflow-hidden rounded-full border">
                <img src={form.photo_url} alt="Önizleme" className="h-full w-full object-cover" />
              </div>
              <p className="text-xs text-muted-foreground">Profil fotoğrafı önizleme</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setForm((prev) => ({ ...prev, photo_url: "" }))}
              >
                Kaldır
              </Button>
            </div>
          )}
          {errors.photo_url && (
            <p className="text-xs text-destructive">{errors.photo_url}</p>
          )}
        </div>

        {/* Cover Image with media picker */}
        <div className="space-y-1.5">
          <label htmlFor="cover_image" className="text-sm font-medium leading-none">Kapak Fotoğrafı</label>
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
            <Button type="button" variant="outline" onClick={() => setCoverPickerOpen(true)} className="gap-1.5 shrink-0">
              <ImageIcon className="size-4" />
              Galeri
            </Button>
          </div>
          {form.cover_image && /^https?:\/\/.+/.test(form.cover_image) && (
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-16 w-28 overflow-hidden rounded-md border">
                <img src={form.cover_image} alt="Kapak önizleme" className="h-full w-full object-cover" />
              </div>
              <p className="text-xs text-muted-foreground">Kapak fotoğrafı önizleme</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setForm((prev) => ({ ...prev, cover_image: "" }))}
              >
                Kaldır
              </Button>
            </div>
          )}
          {errors.cover_image && (
            <p className="text-xs text-destructive">{errors.cover_image}</p>
          )}
        </div>

        <MediaPicker
          open={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(url) => setForm((prev) => ({ ...prev, photo_url: url }))}
          currentUrl={form.photo_url}
        />

        <MediaPicker
          open={coverPickerOpen}
          onClose={() => setCoverPickerOpen(false)}
          onSelect={(url) => setForm((prev) => ({ ...prev, cover_image: url }))}
          currentUrl={form.cover_image}
        />

        {/* Bio */}
        <Field label="Biyografi" htmlFor="bio">
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Danışman hakkında kısa bir açıklama..."
            className="h-auto w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 resize-y"
          />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === "create"
                ? "Oluşturuluyor..."
                : "Kaydediliyor..."
              : mode === "create"
                ? "Danışman Oluştur"
                : "Değişiklikleri Kaydet"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/danismanlar")}
            disabled={isPending}
          >
            İptal
          </Button>
        </div>
      </form>

      {/* Live preview */}
      <div className="space-y-3 lg:sticky lg:top-24">
        <p className="text-sm font-medium text-muted-foreground">Canlı Önizleme</p>
        <ProfilePreview form={form} />
      </div>
    </div>
  );
}
