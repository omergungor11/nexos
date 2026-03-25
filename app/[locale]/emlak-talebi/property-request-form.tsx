"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { submitPropertyRequest } from "@/actions/property-requests";

const PROPERTY_TYPES = [
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Daire" },
  { value: "land", label: "Arsa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "bungalow", label: "Bungalow" },
  { value: "shop", label: "Dükkan" },
];

const TRANSACTION_TYPES = [
  { value: "sale", label: "Satılık" },
  { value: "rent", label: "Kiralık" },
  { value: "daily_rental", label: "Günlük Kiralık" },
];

const CITIES = [
  { value: "Girne", label: "Girne" },
  { value: "Gazimağusa", label: "Gazimağusa" },
  { value: "İskele", label: "İskele" },
  { value: "Lefkoşa", label: "Lefkoşa" },
  { value: "Güzelyurt", label: "Güzelyurt" },
  { value: "Lefke", label: "Lefke" },
];

const CURRENCIES = [
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "TRY", label: "TRY (₺)" },
];

const ROOMS = [
  { value: "1+1", label: "1+1" },
  { value: "2+1", label: "2+1" },
  { value: "3+1", label: "3+1" },
  { value: "4+1", label: "4+1" },
  { value: "5+", label: "5 ve üzeri" },
];

export function PropertyRequestForm() {
  const [pending, setPending] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [city, setCity] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [rooms, setRooms] = useState("");

  const handlePropertyType = (v: string | null) => setPropertyType(v ?? "");
  const handleTransactionType = (v: string | null) =>
    setTransactionType(v ?? "");
  const handleCity = (v: string | null) => setCity(v ?? "");
  const handleCurrency = (v: string | null) => setCurrency(v ?? "GBP");
  const handleRooms = (v: string | null) => setRooms(v ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const minPriceRaw = fd.get("min_price") as string;
    const maxPriceRaw = fd.get("max_price") as string;
    const minAreaRaw = fd.get("min_area") as string;

    const result = await submitPropertyRequest({
      name: fd.get("name") as string,
      phone: (fd.get("phone") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      property_type: propertyType || undefined,
      transaction_type: transactionType || undefined,
      city_preference: city || undefined,
      min_price: minPriceRaw ? parseFloat(minPriceRaw) : null,
      max_price: maxPriceRaw ? parseFloat(maxPriceRaw) : null,
      currency: currency || "GBP",
      min_area: minAreaRaw ? parseFloat(minAreaRaw) : null,
      rooms_preference: rooms || undefined,
      notes: (fd.get("notes") as string) || undefined,
    });

    setPending(false);

    if (result.error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      return;
    }

    toast.success(
      "Talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz."
    );
    form.reset();
    setPropertyType("");
    setTransactionType("");
    setCity("");
    setCurrency("GBP");
    setRooms("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Kişisel Bilgiler
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Ad Soyad <span className="text-destructive">*</span>
            </label>
            <Input
              name="name"
              required
              placeholder="Adınız Soyadınız"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Telefon
            </label>
            <Input
              name="phone"
              type="tel"
              placeholder="+90 5XX XXX XX XX"
              autoComplete="tel"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-posta</label>
          <Input
            name="email"
            type="email"
            placeholder="email@ornek.com"
            autoComplete="email"
          />
        </div>
      </div>

      {/* Property Preferences */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Emlak Tercihleri
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Emlak Tipi
            </label>
            <Select value={propertyType} onValueChange={handlePropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              İşlem Tipi
            </label>
            <Select
              value={transactionType}
              onValueChange={handleTransactionType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Tercih Edilen Şehir
            </label>
            <Select value={city} onValueChange={handleCity}>
              <SelectTrigger>
                <SelectValue placeholder="Şehir seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Oda Sayısı
            </label>
            <Select value={rooms} onValueChange={handleRooms}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {ROOMS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Bütçe ve Alan
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Min. Fiyat
            </label>
            <Input
              name="min_price"
              type="number"
              min={0}
              step="any"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Max. Fiyat
            </label>
            <Input
              name="max_price"
              type="number"
              min={0}
              step="any"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Para Birimi</label>
            <Select value={currency} onValueChange={handleCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="sm:max-w-[200px]">
          <label className="mb-1.5 block text-sm font-medium">
            Min. Alan (m²)
          </label>
          <Input
            name="min_area"
            type="number"
            min={0}
            step="any"
            placeholder="0"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Ek Notlar / Özel İstekler
        </label>
        <Textarea
          name="notes"
          rows={4}
          placeholder="Ek beklentilerinizi, tercihlerinizi veya özel isteklerinizi buraya yazabilirsiniz..."
        />
      </div>

      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Gönderiliyor..." : "Talebi Gönder"}
      </Button>
    </form>
  );
}
