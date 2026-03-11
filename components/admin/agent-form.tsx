"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createAgent, updateAgent, type AgentInput } from "@/actions/agents";
import type { AdminAgentRow } from "@/components/admin/agent-data-table";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AgentFormProps =
  | { mode: "create"; agent?: never }
  | { mode: "edit"; agent: AdminAgentRow & { bio?: string | null } };

type FormState = {
  name: string;
  title: string;
  phone: string;
  email: string;
  bio: string;
  photo_url: string;
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
// Main form component
// ---------------------------------------------------------------------------

export function AgentForm({ mode, agent }: AgentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [form, setForm] = useState<FormState>({
    name: agent?.name ?? "",
    title: agent?.title ?? "",
    phone: agent?.phone ?? "",
    email: agent?.email ?? "",
    bio: agent?.bio ?? "",
    photo_url: agent?.photo_url ?? "",
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

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    const payload: AgentInput = {
      name: form.name.trim(),
      title: form.title.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      bio: form.bio.trim() || undefined,
      photo_url: form.photo_url.trim() || undefined,
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
          placeholder="ahmet@nexos.com.tr"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </Field>

      {/* Photo URL */}
      <Field label="Fotoğraf URL" htmlFor="photo_url">
        <Input
          id="photo_url"
          name="photo_url"
          type="url"
          value={form.photo_url}
          onChange={handleChange}
          placeholder="https://cdn.nexos.com.tr/photos/ahmet.jpg"
          aria-invalid={!!errors.photo_url}
        />
        {errors.photo_url && (
          <p className="text-xs text-destructive">{errors.photo_url}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Fotoğraf yüklemek için önce CDN veya storage&apos;a yükleyin, ardından URL&apos;yi girin.
        </p>
      </Field>

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
  );
}
