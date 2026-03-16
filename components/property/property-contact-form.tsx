"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PropertyContactFormProps {
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
}

export function PropertyContactForm({
  propertyId,
  propertyTitle,
  propertyUrl,
}: PropertyContactFormProps) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
      property_id: propertyId,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Mesajınız gönderildi. En kısa sürede dönüş yapılacaktır.");
      form.reset();
    } catch {
      toast.error("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  const defaultMessage = `Merhaba, "${propertyTitle}" ilanı hakkında bilgi almak istiyorum.\n\nİlan linki: ${propertyUrl}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        name="name"
        required
        placeholder="Ad Soyad"
        minLength={2}
      />
      <Input
        name="phone"
        type="tel"
        placeholder="Telefon"
      />
      <Textarea
        name="message"
        required
        rows={4}
        minLength={10}
        defaultValue={defaultMessage}
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Mesaj Gönder
      </Button>
    </form>
  );
}
