"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "admin") {
    return { error: "Yetkiniz yok" as const, supabase: null as never };
  }
  return { error: null, supabase };
}

export type LandingPageInput = {
  title: string;
  slug: string;
  subtitle?: string;
  hero_image?: string;
  content?: string;
  cta_text?: string;
  cta_url?: string;
  filter_params?: string;
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
};

export async function createLandingPage(
  data: LandingPageInput
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError) return { error: authError };

  const { data: page, error } = await supabase
    .from("landing_pages")
    .insert({
      title: data.title,
      slug: data.slug,
      subtitle: data.subtitle ?? null,
      hero_image: data.hero_image ?? null,
      content: data.content ?? null,
      cta_text: data.cta_text ?? "İletişime Geç",
      cta_url: data.cta_url ?? "/iletisim",
      filter_params: data.filter_params ?? null,
      is_published: data.is_published ?? false,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidateTag("landing-pages", {});
  void logAdminAction({ action: "create", entityType: "page", entityId: page.id });
  return { data: { id: page.id } };
}

export async function updateLandingPage(
  id: string,
  data: Partial<LandingPageInput>
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError) return { error: authError };

  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
  if (data.hero_image !== undefined) payload.hero_image = data.hero_image;
  if (data.content !== undefined) payload.content = data.content;
  if (data.cta_text !== undefined) payload.cta_text = data.cta_text;
  if (data.cta_url !== undefined) payload.cta_url = data.cta_url;
  if (data.filter_params !== undefined) payload.filter_params = data.filter_params;
  if (data.is_published !== undefined) payload.is_published = data.is_published;
  if (data.seo_title !== undefined) payload.seo_title = data.seo_title;
  if (data.seo_description !== undefined) payload.seo_description = data.seo_description;

  const { error } = await supabase
    .from("landing_pages")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateTag("landing-pages", {});
  void logAdminAction({ action: "update", entityType: "page", entityId: id });
  return { data: { id } };
}

export async function deleteLandingPage(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("landing_pages").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateTag("landing-pages", {});
  void logAdminAction({ action: "delete", entityType: "page", entityId: id });
  return { data: { id } };
}
