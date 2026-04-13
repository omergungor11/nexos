"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImportRow = {
  title: string;
  type?: string;
  transaction_type?: string;
  price?: number;
  currency?: string;
  city_name?: string;
  status?: string;
  description?: string;
};

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ı: "i", İ: "i", ö: "o", Ö: "o", ü: "u", Ü: "u",
    ş: "s", Ş: "s", ç: "c", Ç: "c", ğ: "g", Ğ: "g",
  };
  return text
    .split("")
    .map((c) => turkishMap[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type AdminCheckSuccess = {
  error: null;
  supabase: Awaited<ReturnType<typeof createClient>>;
};
type AdminCheckFailure = { error: string; supabase: null };

async function requireAdmin(): Promise<AdminCheckSuccess | AdminCheckFailure> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmanız gerekiyor", supabase: null };
  if (user.user_metadata?.role !== "admin") return { error: "Yetkiniz yok", supabase: null };
  return { error: null, supabase };
}

// ---------------------------------------------------------------------------
// bulkImportProperties
// ---------------------------------------------------------------------------

export async function bulkImportProperties(
  rows: ImportRow[]
): Promise<ActionResult<{ imported: number; errors: string[] }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (rows.length === 0) return { data: { imported: 0, errors: [] } };

  // Fetch cities for name-to-id mapping
  const { data: cities } = await supabase.from("cities").select("id, name");
  const cityMap = new Map((cities ?? []).map((c) => [c.name.toLowerCase(), c.id]));

  const errors: string[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.title?.trim()) {
      errors.push(`Satır ${i + 1}: Başlık boş`);
      continue;
    }

    const cityId = row.city_name
      ? cityMap.get(row.city_name.toLowerCase())
      : undefined;

    if (!cityId) {
      errors.push(`Satır ${i + 1}: Şehir bulunamadı (${row.city_name ?? "boş"})`);
      continue;
    }

    const slug = slugify(row.title) + "-" + Math.random().toString(16).slice(2, 6);

    const { error } = await supabase.from("properties").insert({
      title: row.title.trim(),
      slug,
      type: (row.type ?? "apartment") as never,
      transaction_type: (row.transaction_type ?? "sale") as never,
      price: row.price ?? 0,
      currency: row.currency ?? "GBP",
      city_id: cityId,
      is_active: false,
    });

    if (error) {
      errors.push(`Satır ${i + 1}: ${error.message}`);
    } else {
      imported++;
    }
  }

  revalidateTag("properties", {});
  void logAdminAction({ action: "create", entityType: "property", metadata: { imported, errors: errors.length, total: rows.length } });
  return { data: { imported, errors } };
}
