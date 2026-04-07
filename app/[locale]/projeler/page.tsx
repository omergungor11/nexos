import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MapPin, Building2, Users, ChevronRight, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjects } from "@/lib/queries/projects";

export const metadata: Metadata = {
  title: "Projeler | Nexos Investment",
  description:
    "Kuzey Kıbrıs'ta büyük ölçekli konut projeleri — daire kompleksleri, villa siteleri ve tatil projeleri.",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type ProjectStatus = "upcoming" | "under_construction" | "completed" | "selling";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  selling: "Satışta",
  under_construction: "Yapım Aşamasında",
  completed: "Tamamlandı",
  upcoming: "Yakında",
};

const STATUS_VARIANTS: Record<
  ProjectStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  selling: "default",
  under_construction: "secondary",
  completed: "outline",
  upcoming: "secondary",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  selling: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  under_construction: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  completed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  upcoming: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
};

const STATUS_FILTER_OPTIONS: Array<{ value: ProjectStatus | "all"; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "selling", label: "Satışta" },
  { value: "under_construction", label: "Yapım Aşamasında" },
  { value: "completed", label: "Tamamlandı" },
  { value: "upcoming", label: "Yakında" },
];

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return "Fiyat bilgisi alın";
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  return `${sym}${price.toLocaleString("tr-TR")}`;
}

export default async function ProjelerPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const statusFilter =
    typeof sp.durum === "string" ? (sp.durum as ProjectStatus | "all") : "all";

  const { data: allProjects } = await getProjects();

  const projects =
    statusFilter === "all" || !allProjects
      ? (allProjects ?? [])
      : allProjects.filter((p) => p.status === statusFilter);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto flex items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="size-3.5" />
            Anasayfa
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">Projeler</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
        </div>
        <div className="container relative mx-auto px-4 text-center text-white">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Building2 className="h-4 w-4" />
            Kuzey Kıbrıs
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Projelerimiz
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Kuzey Kıbrıs&apos;ın en değerli lokasyonlarında büyük ölçekli konut
            projeleri. Daire komplekslerinden villa sitelerine, tatil
            köylerinden rezidanslara.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filter Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={
                opt.value === "all"
                  ? "/projeler"
                  : (`/projeler?durum=${opt.value}` as never)
              }
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                statusFilter === opt.value ||
                (opt.value === "all" && statusFilter === "all")
                  ? "border-primary bg-primary text-white"
                  : "border-input hover:bg-muted"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Project Grid */}
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const status = (project.status ?? "selling") as ProjectStatus;
              const cityName =
                project.city && typeof project.city === "object" && !Array.isArray(project.city)
                  ? (project.city as { name: string }).name
                  : null;
              const districtName =
                project.district && typeof project.district === "object" && !Array.isArray(project.district)
                  ? (project.district as { name: string }).name
                  : null;
              const displayLocation =
                project.location ??
                [districtName, cityName].filter(Boolean).join(", ") ??
                null;

              return (
                <Link
                  key={project.id}
                  href={{
                    pathname: "/projeler/[slug]",
                    params: { slug: project.slug },
                  }}
                >
                  <Card className="group h-full gap-0 overflow-hidden py-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                    {/* Cover Image */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {project.cover_image ? (
                        <Image
                          src={project.cover_image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                          <Building2 className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      {/* Status Badge on image */}
                      <div className="absolute left-3 top-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                      {project.is_featured && (
                        <div className="absolute right-3 top-3">
                          <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                            Öne Çıkan
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="flex flex-col gap-3 p-5">
                      <div>
                        <h2 className="line-clamp-1 text-lg font-bold leading-tight group-hover:text-primary">
                          {project.title}
                        </h2>
                        {displayLocation && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {displayLocation}
                          </p>
                        )}
                      </div>

                      {project.short_description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {project.short_description}
                        </p>
                      )}

                      <div className="mt-auto border-t pt-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Başlangıç Fiyatı
                            </p>
                            <p className="text-base font-bold text-primary">
                              {formatPrice(
                                project.starting_price,
                                project.currency
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {project.total_units != null && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {project.total_units} Ünite
                              </span>
                            )}
                            {project.developer && (
                              <span className="text-xs text-muted-foreground">
                                {project.developer}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              {statusFilter === "all"
                ? "Henüz proje eklenmemiş."
                : `Bu kategoride henüz proje bulunmamaktadır.`}
            </p>
            {statusFilter !== "all" && (
              <Link
                href="/projeler"
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Tüm projeleri göster
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
