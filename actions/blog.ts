"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ü: "u",
    Ü: "u",
    ş: "s",
    Ş: "s",
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
  };

  return text
    .split("")
    .map((c) => turkishMap[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let attempt = 0;

  while (true) {
    let query = supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      return candidate;
    }

    attempt += 1;
    const suffix = Math.random().toString(16).slice(2, 6);
    candidate = `${base}-${suffix}`;

    if (attempt > 10) {
      candidate = `${base}-${Date.now()}`;
      return candidate;
    }
  }
}

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
// Input types
// ---------------------------------------------------------------------------

export type BlogPostInput = {
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  cover_image?: string;
  seo_title?: string;
  seo_description?: string;
  is_published?: boolean;
};

// ---------------------------------------------------------------------------
// Action return types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  author: string | null;
  cover_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// createBlogPost
// ---------------------------------------------------------------------------

export async function createBlogPost(
  data: BlogPostInput
): Promise<ActionResult<BlogPostRow>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const slug =
    data.slug?.trim()
      ? slugify(data.slug)
      : await generateUniqueSlug(supabase, data.title);

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({
      title: data.title,
      slug,
      content: data.content ?? null,
      excerpt: data.excerpt ?? null,
      author: data.author ?? null,
      cover_image: data.cover_image ?? null,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      is_published: data.is_published ?? false,
      published_at: data.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("blog", {});
  void logAdminAction({ action: "create", entityType: "blog_post", entityId: post.id });
  return { data: post as BlogPostRow };
}

// ---------------------------------------------------------------------------
// updateBlogPost
// ---------------------------------------------------------------------------

export async function updateBlogPost(
  id: string,
  data: Partial<BlogPostInput>
): Promise<ActionResult<BlogPostRow>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) {
    payload.title = data.title;
    payload.slug =
      data.slug?.trim()
        ? slugify(data.slug)
        : await generateUniqueSlug(supabase, data.title, id);
  } else if (data.slug !== undefined) {
    payload.slug = slugify(data.slug);
  }

  if (data.content !== undefined) payload.content = data.content;
  if (data.excerpt !== undefined) payload.excerpt = data.excerpt;
  if (data.author !== undefined) payload.author = data.author;
  if (data.cover_image !== undefined) payload.cover_image = data.cover_image;
  if (data.seo_title !== undefined) payload.seo_title = data.seo_title;
  if (data.seo_description !== undefined)
    payload.seo_description = data.seo_description;
  if (data.is_published !== undefined) {
    payload.is_published = data.is_published;
    if (data.is_published) {
      // Only set published_at on first publish — fetch current value first
      const { data: current } = await supabase
        .from("blog_posts")
        .select("published_at, is_published")
        .eq("id", id)
        .single();

      if (current && !current.is_published) {
        payload.published_at = new Date().toISOString();
      }
    }
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag("blog", {});
  void logAdminAction({ action: "update", entityType: "blog_post", entityId: id });
  return { data: post as BlogPostRow };
}

// ---------------------------------------------------------------------------
// deleteBlogPost
// ---------------------------------------------------------------------------

export async function deleteBlogPost(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("blog", {});
  void logAdminAction({ action: "delete", entityType: "blog_post", entityId: id });
  return { data: { id } };
}

// ---------------------------------------------------------------------------
// toggleBlogPublished
// ---------------------------------------------------------------------------

export async function toggleBlogPublished(
  id: string,
  isPublished: boolean
): Promise<ActionResult<{ id: string; is_published: boolean }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const updatePayload: Record<string, unknown> = { is_published: isPublished };

  if (isPublished) {
    const { data: current } = await supabase
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .single();

    if (current && !current.published_at) {
      updatePayload.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("blog_posts")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag("blog", {});
  void logAdminAction({ action: "toggle_published", entityType: "blog_post", entityId: id, metadata: { is_published: isPublished } });
  return { data: { id, is_published: isPublished } };
}
