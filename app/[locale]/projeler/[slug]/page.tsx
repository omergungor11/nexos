import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  MapPin,
  Building2,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  ArrowLeft,
  Play,
  ChevronRight,
  Home,
  Ruler,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjectBySlug } from "@/lib/queries/projects";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

type ProjectStatus = "upcoming" | "under_construction" | "completed" | "selling";

const STATUS_TKEYS: Record<ProjectStatus, string> = {
  selling: "statusSelling",
  under_construction: "statusUnderConstruction",
  completed: "statusCompleted",
  upcoming: "statusUpcoming",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  selling: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  under_construction: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  upcoming: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
};

function formatPrice(price: number | null, currency: string | null, fallback = "—"): string {
  if (!price) return fallback;
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "TRY" ? "₺" : "$";
  return `${sym}${price.toLocaleString("tr-TR")}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title}`,
    description: project.short_description ?? project.description?.slice(0, 160) ?? undefined,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "projects" });
  const { data: project } = await getProjectBySlug(slug);
  if (!project) notFound();

  const p = project as Record<string, unknown>;
  const title = p.title as string;
  const description = p.description as string | null;
  const shortDesc = p.short_description as string | null;
  const coverImage = p.cover_image as string | null;
  const galleryImages = (p.gallery_images as string[] | null) ?? [];
  const features = (p.features as string[] | null) ?? [];
  const status = (p.status as ProjectStatus) ?? "selling";
  const completionDate = p.completion_date as string | null;
  const totalUnits = p.total_units as number | null;
  const startingPrice = p.starting_price as number | null;
  const currency = p.currency as string | null;
  const location = p.location as string | null;
  const videoUrl = p.video_url as string | null;
  const lat = p.lat as number | null;
  const lng = p.lng as number | null;
  const city = p.city as { name: string; slug: string } | null;
  const district = p.district as { name: string; slug: string } | null;

  const locationText = [district?.name, city?.name, location].filter(Boolean).join(", ");

  return (
    <div>
      {/* Hero — Full width cover */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh]">
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back button */}
        <div className="absolute left-4 top-4 z-10 sm:left-8 sm:top-8">
          <Link
            href="/projeler"
            className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ArrowLeft className="size-4" />
            {t("backToProjects")}
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-12">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={`text-sm px-3 py-1 ${STATUS_CLASSES[status]}`}>
                {t(STATUS_TKEYS[status])}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {locationText && (
              <p className="mt-3 flex items-center gap-2 text-lg text-white/80">
                <MapPin className="size-5 text-primary" />
                {locationText}
              </p>
            )}
            {startingPrice && (
              <p className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                {formatPrice(startingPrice, currency, t("getPrice"))}
                <span className="ml-2 text-base font-normal text-white/60">{t("startingFrom")}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto grid grid-cols-2 divide-x sm:grid-cols-4">
          {[
            { icon: Building2, label: t("totalUnits"), value: totalUnits ? t("units", { count: totalUnits }) : "—" },
            { icon: Home, label: t("startingPrice"), value: formatPrice(startingPrice, currency, t("getPrice")) },
            { icon: MapPin, label: t("location"), value: city?.name ?? "—" },
            { icon: Calendar, label: t("deliveryDate"), value: completionDate ?? "—" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 px-4 py-5 sm:px-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-semibold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Description + Developer */}
      {(description || shortDesc) && (
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("aboutProject")}</h2>
            {shortDesc && <p className="mt-3 text-lg text-muted-foreground">{shortDesc}</p>}
            {description && (
              <div className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-2xl font-bold sm:text-3xl">{t("gallery")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl"
                >
                  <Image
                    src={img}
                    alt={`${title} - Görsel ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video */}
      {videoUrl && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">
            <Play className="mr-2 inline-block size-7 text-red-500" />
            {t("projectVideo")}
          </h2>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-lg">
            <div className="relative aspect-video">
              <iframe
                src={videoUrl.replace("watch?v=", "embed/")}
                title={`${title} Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {features.length > 0 && (
        <section className={videoUrl ? "bg-muted/20 py-16" : "container mx-auto px-4 py-16"}>
          <div className={videoUrl ? "container mx-auto px-4" : ""}>
            <h2 className="mb-8 text-2xl font-bold sm:text-3xl">{t("features")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      {locationText && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">{t("location")}</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{locationText}</p>
                  {lat && lng && (
                    <a
                      href={`https://www.google.com/maps?q=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {t("viewOnGoogleMaps")}
                      <ChevronRight className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("ctaHeading")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-300">
            {t("ctaDescription")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/iletisim"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Mail className="size-4" />
              {t("ctaContact")}
            </Link>
            <a
              href="https://wa.me/905488604030"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-8 text-sm font-medium text-white hover:bg-white/10"
            >
              <Phone className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
