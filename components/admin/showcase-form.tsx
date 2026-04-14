"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, MessageCircle, LoaderCircle, User, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { PropertyMultiPicker } from "@/components/admin/property-multi-picker";
import {
  createShowcase,
  updateShowcase,
} from "@/actions/showcases";
import {
  buildShowcaseMessage,
  buildWhatsAppUrl,
  isValidPhone,
} from "@/lib/whatsapp";
import type { PickerProperty } from "@/lib/queries/showcases";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AgentOption {
  id: string;
  name: string;
  phone?: string | null;
}

interface ShowcaseFormProps {
  mode: "create" | "edit";
  availableProperties: PickerProperty[];
  agents: AgentOption[];
  initial?: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    customer_name: string;
    customer_phone: string;
    agent_id: string | null;
    expires_at: string | null;
    property_ids: string[];
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AGENT_NONE = "__none__";

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ShowcaseForm({
  mode,
  availableProperties,
  agents,
  initial,
}: ShowcaseFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [customerName, setCustomerName] = useState(
    initial?.customer_name ?? ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    initial?.customer_phone ?? ""
  );
  const [agentId, setAgentId] = useState<string>(
    initial?.agent_id ?? AGENT_NONE
  );
  const [expiresAt, setExpiresAt] = useState<string>(
    initial?.expires_at?.slice(0, 10) ?? defaultExpiresAt()
  );
  const [propertyIds, setPropertyIds] = useState<string[]>(
    initial?.property_ids ?? []
  );

  const validate = (): string | null => {
    if (!title.trim()) return "Başlık zorunludur.";
    if (!customerName.trim()) return "Müşteri adı zorunludur.";
    if (!customerPhone.trim()) return "Telefon zorunludur.";
    if (!isValidPhone(customerPhone))
      return "Telefon numarası geçersiz görünüyor (örn. +90 533 123 4567).";
    if (propertyIds.length === 0) return "En az bir ilan seçmelisiniz.";
    return null;
  };

  function buildPayload() {
    return {
      title: title.trim(),
      description: description.trim() || null,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      agent_id: agentId === AGENT_NONE ? null : agentId,
      expires_at: expiresAt
        ? new Date(`${expiresAt}T23:59:59`).toISOString()
        : null,
      property_ids: propertyIds,
    };
  }

  function openWhatsApp(slug: string) {
    const url = `${window.location.origin}/teklif/${slug}`;
    const agent = agents.find((a) => a.id === agentId);
    const message = buildShowcaseMessage({
      customerName: customerName.trim(),
      title: title.trim(),
      url,
      agentName: agent?.name,
    });
    const waUrl = buildWhatsAppUrl({
      phone: customerPhone.trim(),
      text: message,
    });
    if (!waUrl) {
      toast.error("WhatsApp linki oluşturulamadı.");
      return;
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  function handleSubmit(opts: { sendWhatsApp: boolean }) {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    startTransition(async () => {
      const payload = buildPayload();
      const result =
        mode === "create"
          ? await createShowcase(payload)
          : await updateShowcase(initial!.id, payload);

      if (result.error || !result.data) {
        toast.error(result.error ?? "Kaydedilemedi");
        return;
      }

      toast.success(
        mode === "create" ? "Teklif oluşturuldu" : "Teklif güncellendi"
      );

      if (opts.sendWhatsApp) {
        openWhatsApp(result.data.slug);
      }

      if (mode === "create") {
        router.push(`/admin/teklifler/${result.data.id}/duzenle`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({ sendWhatsApp: false });
      }}
      className="space-y-6"
    >
      {/* Customer + agent */}
      <section className="rounded-xl border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold">Müşteri & Danışman</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="customer_name">
              Müşteri Adı *
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ör. Ahmet Yılmaz"
                required
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="customer_phone">
              WhatsApp Telefon *
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="customer_phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+90 533 123 4567"
                required
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="agent_id">
              Danışman
            </label>
            <Select
              value={agentId}
              onValueChange={(v) => setAgentId(v ?? AGENT_NONE)}
            >
              <SelectTrigger id="agent_id">
                <SelectValue>
                  {agentId === AGENT_NONE
                    ? "Belirtilmedi"
                    : agents.find((a) => a.id === agentId)?.name ?? "Seçin"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AGENT_NONE}>Belirtilmedi</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="expires_at">
              Son Geçerlilik (opsiyonel)
            </label>
            <Input
              id="expires_at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="rounded-xl border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold">İçerik</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium" htmlFor="title">
            Başlık *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ör. Girne 3+1 Sahil Seçenekleri"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Açıklama</label>
          <RichTextEditor
            value={description ?? ""}
            onChange={setDescription}
            placeholder="Müşteriye iletmek istediğin kısa not, öne çıkan özellikler vb."
          />
        </div>
      </section>

      {/* Property picker */}
      <section className="rounded-xl border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold">İlanlar</h2>
        <PropertyMultiPicker
          available={availableProperties}
          selectedIds={propertyIds}
          onChange={setPropertyIds}
        />
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 sticky bottom-0 z-10 -mx-1 border-t bg-background/95 p-3 backdrop-blur">
        <Button
          type="submit"
          variant="outline"
          disabled={pending}
          className="gap-1.5"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === "create" ? "Kaydet" : "Değişiklikleri Kaydet"}
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => handleSubmit({ sendWhatsApp: true })}
          className="gap-1.5 bg-[#25D366] text-white hover:bg-[#1ea952]"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <MessageCircle className="size-4" />
          )}
          Kaydet ve WhatsApp'a Gönder
        </Button>
      </div>
    </form>
  );
}
