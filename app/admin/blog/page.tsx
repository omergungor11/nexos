import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BlogDataTable } from "@/components/admin/blog-data-table";

export const metadata: Metadata = {
  title: "Blog Yazıları",
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  views_count: number;
  created_at: string;
};

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, author, is_published, published_at, views_count, created_at"
    )
    .order("created_at", { ascending: false });

  const rows = (posts ?? []) as BlogPostRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog Yazıları</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length} yazı — {rows.filter((r) => r.is_published).length}{" "}
            yayında
          </p>
        </div>
        <Link href="/admin/blog/yeni">
          <Button>
            <Plus className="size-4" />
            Yeni Yazı
          </Button>
        </Link>
      </div>

      {/* Table */}
      <BlogDataTable initialData={rows} />
    </div>
  );
}
