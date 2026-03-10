import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getCities } from "@/lib/queries/locations";
import { getFeaturesByCategory } from "@/lib/queries/features";
import { PropertyForm } from "@/components/admin/property-form";

export const metadata: Metadata = {
  title: "Yeni İlan Oluştur — Admin",
};

export default async function AdminPropertyNewPage() {
  const [cities, featuresByCategory] = await Promise.all([
    getCities(),
    getFeaturesByCategory(),
  ]);

  // Normalise featuresByCategory to the shape PropertyForm expects
  const normalisedFeatures: Record<
    string,
    Array<{ id: number; name: string; icon: string | null }>
  > = {};

  for (const [cat, features] of Object.entries(featuresByCategory)) {
    normalisedFeatures[cat] = features.map((f) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
    }));
  }

  const cityOptions = cities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/ilanlar"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          İlanlar
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yeni İlan Oluştur</h1>
        <p className="mt-1 text-sm text-slate-500">
          Formu doldurun ve oluştur butonuna tıklayın.
        </p>
      </div>

      <PropertyForm
        cities={cityOptions}
        featuresByCategory={normalisedFeatures}
      />
    </div>
  );
}
