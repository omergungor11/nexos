"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { createOffer, updateOffer } from "@/actions/offers";
import { CURRENCY_SYMBOLS } from "@/lib/constants";
import type { OfferCreateInput } from "@/types/offer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PropertyOption = {
  id: string;
  title: string;
  price: number;
  currency: string;
};

type ExistingOffer = {
  property_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  offer_price: number;
  currency: string;
  notes: string | null;
  expires_at: string | null;
};

interface OfferFormProps {
  properties: PropertyOption[];
  initialData?: ExistingOffer;
  offerId?: string;
}

type FormState = {
  property_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  offer_price: string;
  currency: string;
  notes: string;
  expires_at: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPropertyPrice(price: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${new Intl.NumberFormat("tr-TR").format(price)}`;
}

function calcDiscount(offerPrice: number, listingPrice: number): number | null {
  if (!listingPrice || !offerPrice || offerPrice >= listingPrice) return null;
  return Math.round(((listingPrice - offerPrice) / listingPrice) * 100);
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

export function OfferForm({ properties, initialData, offerId }: OfferFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!offerId && !!initialData;

  const [form, setForm] = useState<FormState>({
    property_id: initialData?.property_id ?? "",
    customer_name: initialData?.customer_name ?? "",
    customer_phone: initialData?.customer_phone ?? "",
    customer_email: initialData?.customer_email ?? "",
    offer_price: initialData?.offer_price ? String(initialData.offer_price) : "",
    currency: initialData?.currency ?? "GBP",
    notes: initialData?.notes ?? "",
    expires_at: initialData?.expires_at
      ? initialData.expires_at.slice(0, 10)
      : "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Derive selected property for reference price display
  const selectedProperty = properties.find((p) => p.id === form.property_id);
  const offerPriceNum = parseFloat(form.offer_price);
  const discount =
    selectedProperty && !isNaN(offerPriceNum)
      ? calcDiscount(offerPriceNum, selectedProperty.price)
      : null;

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
    const next: FormErrors = {};

    if (!form.property_id) {
      next.property_id = "İlan seçimi zorunludur.";
    }
    if (!form.customer_name.trim()) {
      next.customer_name = "Müşteri adı zorunludur.";
    }
    if (!form.offer_price || isNaN(Number(form.offer_price)) || Number(form.offer_price) <= 0) {
      next.offer_price = "Geçerli bir teklif fiyatı girin.";
    }
    if (
      form.customer_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)
    ) {
      next.customer_email = "Geçerli bir e-posta adresi girin.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildPayload(): OfferCreateInput {
    return {
      property_id: form.property_id,
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim() || undefined,
      customer_email: form.customer_email.trim() || undefined,
      offer_price: Number(form.offer_price),
      currency: form.currency,
      notes: form.notes.trim() || undefined,
      expires_at: form.expires_at || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const payload = buildPayload();

    startTransition(async () => {
      if (isEdit) {
        const result = await updateOffer(offerId, payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Teklif güncellendi.");
          router.push("/admin/teklifler");
        }
      } else {
        const result = await createOffer(payload);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Teklif oluşturuldu.");
          router.push("/admin/teklifler");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Property selector */}
      <Field label="İlan" htmlFor="property_id" required>
        <Select
          value={form.property_id || "__none__"}
          onValueChange={(v) => {
            const nextId = v === "__none__" ? "" : String(v);
            setForm((prev) => ({ ...prev, property_id: nextId as string }));
            if (errors.property_id) {
              setErrors((prev) => ({ ...prev, property_id: undefined }));
            }
          }}
        >
          <SelectTrigger className="w-full" aria-invalid={!!errors.property_id}>
            <SelectValue placeholder="İlan seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">İlan seçiniz</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title} — {formatPropertyPrice(p.price, p.currency)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.property_id && (
          <p className="text-xs text-destructive">{errors.property_id}</p>
        )}
        {selectedProperty && (
          <p className="text-xs text-muted-foreground">
            İlan Fiyatı:{" "}
            <span className="font-medium text-foreground">
              {formatPropertyPrice(selectedProperty.price, selectedProperty.currency)}
            </span>
          </p>
        )}
      </Field>

      {/* Customer name */}
      <Field label="Müşteri Adı Soyadı" htmlFor="customer_name" required>
        <Input
          id="customer_name"
          name="customer_name"
          value={form.customer_name}
          onChange={handleChange}
          placeholder="Ad Soyad"
          aria-invalid={!!errors.customer_name}
        />
        {errors.customer_name && (
          <p className="text-xs text-destructive">{errors.customer_name}</p>
        )}
      </Field>

      {/* Phone + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefon" htmlFor="customer_phone">
          <Input
            id="customer_phone"
            name="customer_phone"
            type="tel"
            value={form.customer_phone}
            onChange={handleChange}
            placeholder="+90 500 000 00 00"
          />
        </Field>
        <Field label="E-posta" htmlFor="customer_email">
          <Input
            id="customer_email"
            name="customer_email"
            type="email"
            value={form.customer_email}
            onChange={handleChange}
            placeholder="musteri@ornek.com"
            aria-invalid={!!errors.customer_email}
          />
          {errors.customer_email && (
            <p className="text-xs text-destructive">{errors.customer_email}</p>
          )}
        </Field>
      </div>

      {/* Offer price + currency */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none">
          Teklif Fiyatı <span className="ml-0.5 text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          <Input
            id="offer_price"
            name="offer_price"
            type="number"
            min={0}
            step="any"
            value={form.offer_price}
            onChange={handleChange}
            placeholder="285000"
            className="flex-1"
            aria-invalid={!!errors.offer_price}
          />
          <Select
            value={form.currency}
            onValueChange={(v) => setForm((prev) => ({ ...prev, currency: String(v) }))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                <SelectItem key={code} value={code}>
                  {code} {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {errors.offer_price && (
          <p className="text-xs text-destructive">{errors.offer_price}</p>
        )}
        {discount !== null && (
          <p className="text-xs text-amber-600 font-medium">
            (İlan fiyatından %{discount} indirimli)
          </p>
        )}
        {selectedProperty &&
          !isNaN(offerPriceNum) &&
          offerPriceNum >= selectedProperty.price &&
          offerPriceNum > 0 && (
            <p className="text-xs text-muted-foreground">
              Teklif fiyatı ilan fiyatına eşit veya yüksek.
            </p>
          )}
      </div>

      {/* Notes */}
      <Field label="Notlar" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Müşteriye özel notlar..."
          rows={3}
        />
      </Field>

      {/* Expires at */}
      <Field
        label="Son Geçerlilik Tarihi"
        htmlFor="expires_at"
        hint="Teklifin geçerli olacağı son tarih."
      >
        <Input
          id="expires_at"
          name="expires_at"
          type="date"
          value={form.expires_at}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 10)}
        />
      </Field>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEdit
              ? "Kaydediliyor..."
              : "Oluşturuluyor..."
            : isEdit
              ? "Güncelle"
              : "Teklif Oluştur"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/teklifler")}
          disabled={isPending}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
