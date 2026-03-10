"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ContactForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Mesajınız başarıyla gönderildi!");
      form.reset();
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Ad Soyad *</label>
          <Input name="name" required placeholder="Adınız Soyadınız" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Telefon</label>
          <Input name="phone" type="tel" placeholder="05XX XXX XX XX" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">E-posta</label>
        <Input name="email" type="email" placeholder="email@ornek.com" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Mesajınız *</label>
        <Textarea
          name="message"
          required
          rows={5}
          placeholder="Mesajınızı yazın..."
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Gönder
      </Button>
    </form>
  );
}
