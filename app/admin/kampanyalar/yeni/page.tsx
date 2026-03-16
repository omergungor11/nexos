import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LandingPageForm } from "@/components/admin/landing-page-form";

export const metadata: Metadata = {
  title: "Yeni Kampanya Sayfası",
};

export default function AdminKampanyaNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/kampanyalar"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Kampanyalar
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yeni Kampanya Sayfası</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pazarlama kampanyası için özel landing page oluşturun.
        </p>
      </div>
      <LandingPageForm mode="create" />
    </div>
  );
}
