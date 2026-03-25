import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Emlak Talepleri",
};

type PropertyRequestRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  property_type: string | null;
  transaction_type: string | null;
  city_preference: string | null;
  min_price: number | null;
  max_price: number | null;
  currency: string | null;
  min_area: number | null;
  rooms_preference: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  reviewing: "İnceleniyor",
  matched: "Eşleştirildi",
  closed: "Kapatıldı",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  new: "default",
  reviewing: "secondary",
  matched: "outline",
  closed: "destructive",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  apartment: "Daire",
  land: "Arsa",
  penthouse: "Penthouse",
  bungalow: "Bungalow",
  shop: "Dükkan",
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  sale: "Satılık",
  rent: "Kiralık",
  daily_rental: "Günlük Kiralık",
};

function formatPrice(
  min: number | null,
  max: number | null,
  currency: string | null
): string {
  const sym = currency ?? "GBP";
  if (!min && !max) return "—";
  if (min && max)
    return `${min.toLocaleString()} – ${max.toLocaleString()} ${sym}`;
  if (min) return `Min. ${min.toLocaleString()} ${sym}`;
  return `Max. ${max!.toLocaleString()} ${sym}`;
}

export default async function AdminEmlakTalepleriPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("property_requests")
    .select(
      "id, name, phone, email, property_type, transaction_type, city_preference, min_price, max_price, currency, min_area, rooms_preference, notes, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[emlak-talepleri] Query error:", error.message);
  }

  const requests: PropertyRequestRow[] = (rows ?? []) as PropertyRequestRow[];
  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Emlak Talepleri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {requests.length} talep — {newCount} yeni
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Emlak Tipi</th>
                <th className="px-4 py-3">İşlem</th>
                <th className="px-4 py-3">Şehir</th>
                <th className="px-4 py-3">Fiyat Aralığı</th>
                <th className="px-4 py-3">Alan / Oda</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-muted-foreground"
                  >
                    Henüz emlak talebi bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{req.name}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {req.phone && (
                          <a
                            href={`tel:${req.phone}`}
                            className="block text-primary hover:underline"
                          >
                            {req.phone}
                          </a>
                        )}
                        {req.email && (
                          <a
                            href={`mailto:${req.email}`}
                            className="block text-muted-foreground hover:text-foreground"
                          >
                            {req.email}
                          </a>
                        )}
                        {!req.phone && !req.email && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {req.property_type
                        ? (PROPERTY_TYPE_LABELS[req.property_type] ??
                          req.property_type)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {req.transaction_type
                        ? (TRANSACTION_TYPE_LABELS[req.transaction_type] ??
                          req.transaction_type)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {req.city_preference ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {formatPrice(req.min_price, req.max_price, req.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {req.min_area && (
                          <span className="block">
                            {req.min_area.toLocaleString()} m²+
                          </span>
                        )}
                        {req.rooms_preference && (
                          <span className="block text-muted-foreground">
                            {req.rooms_preference}
                          </span>
                        )}
                        {!req.min_area && !req.rooms_preference && "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={STATUS_VARIANTS[req.status] ?? "outline"}
                      >
                        {STATUS_LABELS[req.status] ?? req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
