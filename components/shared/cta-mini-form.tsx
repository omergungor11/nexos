"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = [
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Daire" },
  { value: "land", label: "Arsa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "other", label: "Diğer" },
];

export function CtaMiniForm() {
  const [pending, setPending] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const phone = fd.get("phone") as string;
    const message = fd.get("message") as string;

    if (!name.trim() || !phone.trim()) {
      toast.error("İsim ve telefon zorunludur.");
      setPending(false);
      return;
    }

    try {
      const { submitPropertyRequest } = await import("@/actions/property-requests");
      const result = await submitPropertyRequest({
        name: name.trim(),
        phone: phone.trim(),
        email: "",
        property_type: propertyType || undefined,
        currency: "GBP",
        notes: message.trim() || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.");
        setSubmitted(true);
      }
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-primary-foreground/10 p-6 text-center backdrop-blur-sm">
        <p className="text-lg font-semibold text-primary-foreground">Teşekkürler!</p>
        <p className="mt-1 text-sm text-primary-foreground/80">Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name="name"
          placeholder="Adınız Soyadınız *"
          required
          className="h-11 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground"
        />
        <Input
          name="phone"
          placeholder="Telefon Numaranız *"
          required
          className="h-11 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={propertyType || undefined} onValueChange={(v) => setPropertyType(v ?? "")}>
          <SelectTrigger className="h-11 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
            <SelectValue placeholder="Emlak Tipi (opsiyonel)" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          name="message"
          placeholder="Mesajınız (opsiyonel)"
          rows={1}
          className="min-h-[44px] resize-none border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {pending ? "Gönderiliyor..." : "Ücretsiz Değerleme Talep Et"}
      </Button>
    </form>
  );
}
