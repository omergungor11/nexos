import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = {
  title: "Blog Yazısı Düzenle",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, content, excerpt, author, cover_image, seo_title, seo_description, is_published"
    )
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
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
        <h1 className="text-2xl font-bold text-foreground">
          Blog Yazısı Düzenle
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{post.title}</p>
      </div>

      {/* Form */}
      <BlogForm mode="edit" post={post} />
    </div>
  );
}
