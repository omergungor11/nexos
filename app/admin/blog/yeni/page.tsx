import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = {
  title: "Yeni Blog Yazısı",
};

export default function AdminBlogNewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Form */}
      <BlogForm mode="create" />
    </div>
  );
}
