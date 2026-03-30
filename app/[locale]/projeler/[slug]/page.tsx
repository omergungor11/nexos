import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  MapPin,
  Building2,
  Calendar,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjectBySlug } from "@/lib/queries/projects";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

type ProjectStatus = "upcoming" | "under_construction" | "completed" | "selling";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  selling: "Satışta",
  under_construction: "Yapım Aşamasında",
  completed: "Tamamlandı",
  upcoming: "Yakında",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  selling:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  under_construction:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  completed:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  upcoming:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
};

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return "Fiyat bilgisi alın";
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  return `${sym}${price.toLocaleString("tr-TR")}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.title} | Projeler | Nexos Investment`,
    description: project.short_description ?? project.description ?? undefined,
    openGraph: {
      title: project.title,
      description: project.short_description ?? project.description ?? undefined,
      ...(project.cover_image
        ? { images: [{ url: project.cover_image }] }
        : {}),
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { data: project } = await getProjectBySlug(slug);

  if (!project) notFound();

  const status = (project.status ?? "selling") as ProjectStatus;

  const cityName =
    project.city &&
    typeof project.city === "object" &&
    !Array.isArray(project.city)
      ? (project.city as { name: string }).name
      : null;
  const districtName =
    project.district &&
    typeof project.district === "object" &&
    !Array.isArray(project.district)
      ? (project.district as { name: string }).name
      : null;

  const displayLocation =
    project.location ??
    [districtName, cityName].filter(Boolean).join(", ") ??
    null;

  const galleryImages: string[] = Array.isArray(project.gallery_images)
    ? (project.gallery_images as string[])
    : [];

  const features: string[] = Array.isArray(project.features)
    ? (project.features as string[])
    : [];

  const mapsUrl =
    project.lat != null && project.lng != null
      ? `https://www.google.com/maps?q=${project.lat},${project.lng}`
      : null;

  return (
    <div>
      {/* ── Section 1: Hero ─────────────────────────────────────────── */}
      <div className="relative min-h-[420px] overflow-hidden bg-slate-900 sm:min-h-[500px]">
        {project.cover_image && (
          <Image
            src={project.cover_image}
            alt={project.title}
            fill
            className="object-cover opacity-50"
            priority
            sizes="100vw"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="relative container mx-auto flex h-full min-h-[420px] flex-col justify-end px-4 pb-12 sm:min-h-[500px]">
          <Link
            href="/projeler"
            className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Tüm Projeler
          </Link>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <span
                className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>
              {displayLocation && (
                <p className="mt-3 flex items-center gap-1.5 text-base text-white/70">
                  <MapPin className="h-5 w-5 shrink-0" />
                  {displayLocation}
                </p>
              )}
            </div>
            {project.starting_price && (
              <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white backdrop-blur-sm">
                <p className="text-xs text-white/60">Başlangıç Fiyatı</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(project.starting_price, project.currency)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Quick Stats ───────────────────────────────────── */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
            {[
              {
                icon: Users,
                label: "Toplam Ünite",
                value: project.total_units
                  ? `${project.total_units} Ünite`
                  : "—",
              },
              {
                icon: Building2,
                label: "Başlangıç Fiyatı",
                value: formatPrice(project.starting_price, project.currency),
              },
              {
                icon: Building2,
                label: "Geliştirici",
                value: project.developer ?? "—",
              },
              {
                icon: Calendar,
                label: "Teslim Tarihi",
                value: project.completion_date ?? "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 py-5 text-center"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* ── Main Content Column ─────────────────────────────────── */}
          <div className="space-y-12 lg:col-span-2">
            {/* ── Section 3: Gallery ──────────────────────────────── */}
            {galleryImages.length > 0 && (
              <section>
                <h2 className="mb-5 text-2xl font-bold">Galeri</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
                    >
                      <Image
                        src={img}
                        alt={`${project.title} — Görsel ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* ── Section 4: Description ──────────────────────────── */}
            {project.description && (
              <section>
                <h2 className="mb-5 text-2xl font-bold">Proje Hakkında</h2>
                <div className="prose prose-slate max-w-none leading-relaxed text-muted-foreground dark:prose-invert">
                  <p className="whitespace-pre-line leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </section>
            )}

            {/* ── Section 5: Features ─────────────────────────────── */}
            {features.length > 0 && (
              <section>
                <h2 className="mb-5 text-2xl font-bold">Özellikler</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Section 6: Location ─────────────────────────────── */}
            <section>
              <h2 className="mb-5 text-2xl font-bold">Konum</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex flex-wrap gap-4">
                    {cityName && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{cityName}</span>
                      </div>
                    )}
                    {districtName && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {districtName}
                        </span>
                      </div>
                    )}
                    {displayLocation && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{displayLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Map placeholder */}
                  <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {displayLocation ?? "Konum bilgisi"}
                      </p>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        >
                          Google Maps&apos;ta Görüntüle
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* ── Sidebar: CTA ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              {/* ── Section 7: CTA ────────────────────────────────── */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                  <h3 className="text-lg font-bold">
                    Bu Proje Hakkında Bilgi Alın
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    Uzman danışmanlarımız size yardımcı olmaktan mutluluk
                    duyar.
                  </p>
                </div>
                <CardContent className="space-y-4 p-6">
                  <a
                    href="tel:+905488604030"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Phone className="h-4 w-4" />
                    Hemen Ara
                  </a>
                  <a
                    href="mailto:info@nexosinvestment.com"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Mail className="h-4 w-4" />
                    E-posta Gönder
                  </a>
                  <Link
                    href="/iletisim"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    İletişim Formuna Git
                  </Link>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <span>+90 548 860 40 30</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <span>info@nexosinvestment.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project summary card */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Proje Özeti
                  </h4>
                  {project.developer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Geliştirici</span>
                      <span className="font-medium">{project.developer}</span>
                    </div>
                  )}
                  {project.total_units != null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Toplam Ünite
                      </span>
                      <span className="font-medium">
                        {project.total_units}
                      </span>
                    </div>
                  )}
                  {project.completion_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Teslim</span>
                      <span className="font-medium">
                        {project.completion_date}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Durum</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  {project.starting_price && (
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Başlangıç
                        </span>
                        <span className="text-base font-bold text-primary">
                          {formatPrice(
                            project.starting_price,
                            project.currency
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
