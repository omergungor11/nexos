"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  MessageCircle,
  LoaderCircle,
  User,
  Phone,
  Plus,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  createShowcasesBulk,
  updateShowcase,
} from "@/actions/showcases";
import {
  buildShowcaseMessage,
  buildWhatsAppUrl,
  isValidPhone,
} from "@/lib/whatsapp";
import type { PickerProperty } from "@/lib/queries/showcases";
import type { PropertyShowcase } from "@/types/showcase";

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

const AGENT_NONE = "__none__";

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

interface Recipient {
  id: string;          // local key (uuid-ish), not persisted
  name: string;
  phone: string;
}

function newRecipient(): Recipient {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    phone: "",
  };
}

/**
 * Parse a free-form paste like:
 *   Ahmet Yılmaz, +90 533 123 4567
 *   Ayşe Demir;+905321112233
 *   Mehmet  +90 542 000 00 00
 * into structured recipient rows. Splits on first phone-looking chunk so names
 * with spaces still work ("Ali Can Yıldız  +90...").
 */
function parseBulkPaste(raw: string): Recipient[] {
  const rows: Recipient[] = [];
  const phoneLike = /(\+?\d[\d\s().-]{7,})/;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(phoneLike);
    if (!match) continue;
    const phone = match[1].trim();
    const name = trimmed
      .slice(0, match.index)
      .replace(/[,;:\t]+\s*$/, "")
      .trim();
    if (!name) continue;
    rows.push({ ...newRecipient(), name, phone });
  }
  return rows;
}

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

  // Edit mode: stick with the single customer fields (we're editing a row).
  const [customerName, setCustomerName] = useState(initial?.customer_name ?? "");
  const [customerPhone, setCustomerPhone] = useState(
    initial?.customer_phone ?? ""
  );

  // Create mode: list of recipients. Seed with one empty row.
  const [recipients, setRecipients] = useState<Recipient[]>(() => [
    newRecipient(),
  ]);
  const [bulkPaste, setBulkPaste] = useState("");

  const [agentId, setAgentId] = useState<string>(
    initial?.agent_id ?? AGENT_NONE
  );
  const [expiresAt, setExpiresAt] = useState<string>(
    initial?.expires_at?.slice(0, 10) ?? defaultExpiresAt()
  );
  const [propertyIds, setPropertyIds] = useState<string[]>(
    initial?.property_ids ?? []
  );

  // Populated after a successful bulk create so we can show per-recipient
  // WhatsApp buttons instead of redirecting away.
  const [created, setCreated] = useState<PropertyShowcase[] | null>(null);

  const validate = (): string | null => {
    if (!title.trim()) return "Başlık zorunludur.";
    if (propertyIds.length === 0) return "En az bir ilan seçmelisiniz.";

    if (mode === "edit") {
      if (!customerName.trim()) return "Müşteri adı zorunludur.";
      if (!customerPhone.trim()) return "Telefon zorunludur.";
      if (!isValidPhone(customerPhone))
        return "Telefon numarası geçersiz görünüyor (örn. +90 533 123 4567).";
      return null;
    }

    const cleaned = recipients
      .map((r) => ({ name: r.name.trim(), phone: r.phone.trim() }))
      .filter((r) => r.name || r.phone);
    if (cleaned.length === 0) return "En az bir müşteri eklemelisiniz.";
    for (const r of cleaned) {
      if (!r.name) return "Her müşterinin adı dolu olmalı.";
      if (!r.phone) return "Her müşterinin telefonu dolu olmalı.";
      if (!isValidPhone(r.phone))
        return `"${r.name}" için telefon numarası geçersiz görünüyor.`;
    }
    const seen = new Set<string>();
    for (const r of cleaned) {
      const norm = r.phone.replace(/\D/g, "");
      if (seen.has(norm)) return `Aynı telefon birden fazla girildi: ${r.phone}`;
      seen.add(norm);
    }
    return null;
  };

  function handleAddRecipient() {
    setRecipients((rs) => [...rs, newRecipient()]);
  }

  function handleRemoveRecipient(id: string) {
    setRecipients((rs) => (rs.length <= 1 ? rs : rs.filter((r) => r.id !== id)));
  }

  function handleRecipientChange(id: string, patch: Partial<Recipient>) {
    setRecipients((rs) =>
      rs.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function handleApplyPaste() {
    const parsed = parseBulkPaste(bulkPaste);
    if (parsed.length === 0) {
      toast.error("Yapıştırdığın metinden telefon numarası okunamadı.");
      return;
    }
    setRecipients((rs) => {
      // Drop the empty seed row if the user hasn't typed anything into it.
      const hasTypedRows = rs.some(
        (r) => r.name.trim() || r.phone.trim()
      );
      return hasTypedRows ? [...rs, ...parsed] : parsed;
    });
    setBulkPaste("");
    toast.success(`${parsed.length} müşteri eklendi.`);
  }

  function buildEditPayload() {
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

  function buildBulkPayload() {
    return {
      title: title.trim(),
      description: description.trim() || null,
      agent_id: agentId === AGENT_NONE ? null : agentId,
      expires_at: expiresAt
        ? new Date(`${expiresAt}T23:59:59`).toISOString()
        : null,
      property_ids: propertyIds,
      recipients: recipients
        .map((r) => ({
          customer_name: r.name.trim(),
          customer_phone: r.phone.trim(),
        }))
        .filter((r) => r.customer_name && r.customer_phone),
    };
  }

  function openWhatsAppFor(s: PropertyShowcase) {
    const url = `${window.location.origin}/teklif/${s.slug}`;
    const agent = agents.find((a) => a.id === agentId);
    const message = buildShowcaseMessage({
      customerName: s.customer_name,
      title: s.title,
      url,
      agentName: agent?.name,
    });
    const waUrl = buildWhatsAppUrl({ phone: s.customer_phone, text: message });
    if (!waUrl) {
      toast.error("WhatsApp linki oluşturulamadı.");
      return;
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  function openWhatsAppEdit(slug: string) {
    const url = `${window.location.origin}/teklif/${slug}`;
    const agent = agents.find((a) => a.id === agentId);
    const message = buildShowcaseMessage({
      customerName: customerName.trim(),
      title: title.trim(),
      url,
      agentName: agent?.name,
    });
    const waUrl = buildWhatsAppUrl({ phone: customerPhone.trim(), text: message });
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
      if (mode === "edit") {
        const result = await updateShowcase(initial!.id, buildEditPayload());
        if (result.error || !result.data) {
          toast.error(result.error ?? "Kaydedilemedi");
          return;
        }
        toast.success("Teklif güncellendi");
        if (opts.sendWhatsApp) openWhatsAppEdit(result.data.slug);
        router.refresh();
        return;
      }

      // Create (bulk)
      const result = await createShowcasesBulk(buildBulkPayload());
      if (result.error || !result.data) {
        toast.error(result.error ?? "Oluşturulamadı");
        return;
      }
      toast.success(
        result.data.length === 1
          ? "Teklif oluşturuldu"
          : `${result.data.length} teklif oluşturuldu`
      );
      setCreated(result.data);

      if (opts.sendWhatsApp) {
        // Fire WhatsApp for the first recipient only; popup blockers kill the
        // rest anyway. Others are one click away from the success screen.
        openWhatsAppFor(result.data[0]);
      }
    });
  }

  // After a successful bulk create, swap the form for a result list so the
  // admin can send WhatsApp per recipient without leaving the page.
  if (created) {
    return (
      <BulkSuccessScreen
        created={created}
        onNewBatch={() => {
          setCreated(null);
          setRecipients([newRecipient()]);
          setTitle("");
          setDescription("");
          setPropertyIds([]);
        }}
        onGoToList={() => router.push("/admin/teklifler")}
        agentName={agents.find((a) => a.id === agentId)?.name}
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({ sendWhatsApp: false });
      }}
      className="space-y-6"
    >
      {/* Customer / recipients */}
      <section className="rounded-xl border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {mode === "edit" ? "Müşteri" : "Müşteriler"}
          </h2>
          {mode === "create" && recipients.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {recipients.length} alıcı
            </span>
          )}
        </div>

        {mode === "edit" ? (
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
          </div>
        ) : (
          <RecipientRepeater
            recipients={recipients}
            onAdd={handleAddRecipient}
            onRemove={handleRemoveRecipient}
            onChange={handleRecipientChange}
            bulkPaste={bulkPaste}
            onBulkPasteChange={setBulkPaste}
            onApplyPaste={handleApplyPaste}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2 pt-2">
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
          {mode === "create"
            ? recipients.length > 1
              ? `${recipients.length} Teklif Oluştur`
              : "Kaydet"
            : "Değişiklikleri Kaydet"}
        </Button>
        {mode === "edit" && (
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
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Recipient repeater — rows + bulk-paste textarea
// ---------------------------------------------------------------------------

interface RecipientRepeaterProps {
  recipients: Recipient[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Recipient>) => void;
  bulkPaste: string;
  onBulkPasteChange: (v: string) => void;
  onApplyPaste: () => void;
}

function RecipientRepeater({
  recipients,
  onAdd,
  onRemove,
  onChange,
  bulkPaste,
  onBulkPasteChange,
  onApplyPaste,
}: RecipientRepeaterProps) {
  const [showPaste, setShowPaste] = useState(false);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {recipients.map((r, i) => (
          <div key={r.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div className="relative">
              <User className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={r.name}
                onChange={(e) => onChange(r.id, { name: e.target.value })}
                placeholder={i === 0 ? "Müşteri adı" : `Müşteri ${i + 1} adı`}
                className="pl-7"
              />
            </div>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={r.phone}
                onChange={(e) => onChange(r.id, { phone: e.target.value })}
                placeholder="+90 533 123 4567"
                className="pl-7"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(r.id)}
              disabled={recipients.length <= 1}
              aria-label="Müşteriyi kaldır"
              className="shrink-0"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Müşteri Ekle
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPaste((s) => !s)}
          className="gap-1.5 text-muted-foreground"
        >
          <Copy className="size-3.5" />
          {showPaste ? "Yapıştırmayı Gizle" : "Toplu Yapıştır"}
        </Button>
      </div>

      {showPaste && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Her satıra bir müşteri yaz. Örn: <br />
            <code className="text-foreground/80">
              Ahmet Yılmaz, +90 533 123 4567
            </code>
          </p>
          <Textarea
            value={bulkPaste}
            onChange={(e) => onBulkPasteChange(e.target.value)}
            placeholder={"Ahmet Yılmaz, +90 533 123 4567\nAyşe Demir; +90 532 111 22 33"}
            rows={5}
            className="font-mono text-xs"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={onApplyPaste}
              disabled={!bulkPaste.trim()}
              className="gap-1.5"
            >
              <Check className="size-3.5" />
              Listeye Ekle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success screen — per-recipient WhatsApp buttons after bulk create
// ---------------------------------------------------------------------------

interface BulkSuccessScreenProps {
  created: PropertyShowcase[];
  onNewBatch: () => void;
  onGoToList: () => void;
  agentName?: string;
}

function BulkSuccessScreen({
  created,
  onNewBatch,
  onGoToList,
  agentName,
}: BulkSuccessScreenProps) {
  const [sent, setSent] = useState<Set<string>>(new Set());

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    []
  );

  function handleSend(s: PropertyShowcase) {
    const url = `${origin}/teklif/${s.slug}`;
    const message = buildShowcaseMessage({
      customerName: s.customer_name,
      title: s.title,
      url,
      agentName,
    });
    const waUrl = buildWhatsAppUrl({ phone: s.customer_phone, text: message });
    if (!waUrl) {
      toast.error("WhatsApp linki oluşturulamadı.");
      return;
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSent((s0) => new Set(s0).add(s.id));
  }

  function handleCopyLink(slug: string) {
    const url = `${origin}/teklif/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link kopyalandı."))
      .catch(() => toast.error("Kopyalanamadı."));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              {created.length} teklif oluşturuldu
            </h2>
            <p className="text-xs text-muted-foreground">
              Her müşteriye kendi linkiyle WhatsApp'tan gönderebilirsin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onGoToList}>
              Listeye Dön
            </Button>
            <Button size="sm" onClick={onNewBatch}>
              Yeni Gönderim
            </Button>
          </div>
        </div>
      </div>

      <div className="divide-y rounded-xl border bg-card">
        {created.map((s) => {
          const isSent = sent.has(s.id);
          return (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.customer_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.customer_phone} · /teklif/{s.slug}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyLink(s.slug)}
                  className="gap-1.5 text-muted-foreground"
                >
                  <Copy className="size-3.5" />
                  Link
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSend(s)}
                  className={
                    isSent
                      ? "gap-1.5 bg-muted text-foreground hover:bg-muted/80"
                      : "gap-1.5 bg-[#25D366] text-white hover:bg-[#1ea952]"
                  }
                >
                  {isSent ? (
                    <Check className="size-3.5" />
                  ) : (
                    <MessageCircle className="size-3.5" />
                  )}
                  {isSent ? "Gönderildi" : "WhatsApp"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
