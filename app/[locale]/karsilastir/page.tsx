import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ComparisonTable } from "@/components/property/comparison-table";

export const metadata: Metadata = {
  title: "Karşılaştır",
  description: "İlanları yan yana karşılaştırın, en uygun seçimi yapın.",
};

export default async function KarsilastirPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          İlan Karşılaştırma
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          En fazla 4 ilanı yan yana karşılaştırabilirsiniz.
        </p>
      </div>

      <ComparisonTable />
    </main>
  );
}
