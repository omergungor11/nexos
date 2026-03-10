"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageInput = {
  title: string;
  slug: string;
  content?: string;
  seo_title?: string;
  seo_description?: string;
  is_published?: boolean;
};

export type CmsPageRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AdminCheckSuccess = {
  error: null;
  supabase: Awaited<ReturnType<typeof createClient>>;
};
type AdminCheckFailure = { error: string; supabase: null };
type AdminCheckResult = AdminCheckSuccess | AdminCheckFailure;

async function requireAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Giriş yapmanız gerekiyor", supabase: null };
  }

  const isAdmin = user.user_metadata?.role === "admin";
  if (!isAdmin) {
    return { error: "Yetkiniz yok", supabase: null };
  }

  return { error: null, supabase };
}

// ---------------------------------------------------------------------------
// updatePage
// ---------------------------------------------------------------------------

export async function updatePage(
  id: string,
  data: PageInput
): Promise<ActionResult<CmsPageRow>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { data: page, error } = await supabase
    .from("cms_pages")
    .update({
      title: data.title,
      slug: data.slug,
      content: data.content ?? null,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      is_published: data.is_published ?? false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("pages", {});
  return { data: page as CmsPageRow };
}
