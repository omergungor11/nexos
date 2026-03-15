import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageForm } from "@/components/admin/page-form";

export const metadata: Metadata = {
  title: "Sayfa Düzenle",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminSayfaEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("cms_pages")
    .select(
      "id, title, slug, content, seo_title, seo_description, is_published"
    )
    .eq("id", id)
    .single();

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/sayfalar"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Sayfalar
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Sayfa Düzenle
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{page.title}</p>
      </div>

      {/* Form */}
      <PageForm page={page} />
    </div>
  );
}
