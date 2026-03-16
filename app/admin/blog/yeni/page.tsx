import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = {
  title: "Yeni Blog Yazısı",
};

export default async function AdminBlogNewPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("blog_categories").select("id, name").order("sort_order"),
    supabase.from("blog_tags").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/blog"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Blog Yazıları
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Yeni Blog Yazısı</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yeni bir blog yazısı oluşturun.
        </p>
      </div>

      <BlogForm
        mode="create"
        categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
        tags={(tags ?? []).map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
