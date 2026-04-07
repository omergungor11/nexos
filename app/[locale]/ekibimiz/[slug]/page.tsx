import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Phone, Mail, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/property/property-card";
import { getAgentBySlug } from "@/lib/queries/content";
import { getPropertiesByAgent } from "@/lib/queries/properties";
import type { AgentRow, PropertyListItem } from "@/types";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: agent } = await getAgentBySlug(slug);

  if (!agent) {
    return { title: "Danışman Bulunamadı" };
  }

  const agentJobTitle = (agent as { title?: string | null }).title ?? "Emlak Danışmanı";
  const title = `${agent.name} — ${agentJobTitle}`;
  const description =
    agent.bio ??
    `${agent.name} — Nexos Investment danışmanının aktif ilanlarını ve iletişim bilgilerini görüntüleyin.`;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(agent.name)}&subtitle=${encodeURIComponent(agentJobTitle)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: agent.name,
        },
      ],
    },
  };
}

function buildWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const normalized = cleaned.startsWith("0") ? `90${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${normalized}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function normalizeProperties(
  raw: unknown[] | null
): PropertyListItem[] {
  if (!raw) return [];

  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => {
      const images = Array.isArray(item["images"]) ? item["images"] : [];
      const coverImageObj = images.find(
        (img: unknown) =>
          typeof img === "object" && img !== null && (img as Record<string, unknown>)["is_cover"] === true
      );
      const coverImage =
        coverImageObj !== undefined && typeof (coverImageObj as Record<string, unknown>)["url"] === "string"
          ? (coverImageObj as Record<string, unknown>)["url"] as string
          : images.length > 0 && typeof (images[0] as Record<string, unknown>)["url"] === "string"
            ? (images[0] as Record<string, unknown>)["url"] as string
            : null;

      const city = item["city"] as Record<string, unknown> | null;
      const district = item["district"] as Record<string, unknown> | null;

      return {
        id: String(item["id"] ?? ""),
        slug: String(item["slug"] ?? ""),
        title: String(item["title"] ?? ""),
        price: Number(item["price"] ?? 0),
        currency: (item["currency"] as "TRY" | "USD" | "EUR") ?? "TRY",
        type: (item["type"] as PropertyListItem["type"]) ?? "apartment",
        transaction_type:
          (item["transaction_type"] as PropertyListItem["transaction_type"]) ?? "sale",
        area_sqm: typeof item["area_sqm"] === "number" ? item["area_sqm"] : null,
        rooms: typeof item["rooms"] === "number" ? item["rooms"] : null,
        living_rooms: typeof item["living_rooms"] === "number" ? item["living_rooms"] : null,
        floor: typeof item["floor"] === "number" ? item["floor"] : null,
        is_featured: Boolean(item["is_featured"]),
        views_count: Number(item["views_count"] ?? 0),
        status: (item["status"] as PropertyListItem["status"]) ?? "available",
        listing_number: Number(item["listing_number"] ?? 0),
        city: {
          id: Number(city?.["id"] ?? 0),
          name: String(city?.["name"] ?? ""),
          slug: String(city?.["slug"] ?? ""),
        },
        district: district
          ? {
              id: Number(district["id"] ?? 0),
              name: String(district["name"] ?? ""),
              slug: String(district["slug"] ?? ""),
            }
          : null,
        cover_image: coverImage,
      } satisfies PropertyListItem;
    });
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { data: agentData } = await getAgentBySlug(slug);

  if (!agentData) {
    notFound();
  }

  const agent = agentData as AgentRow;

  const { data: rawProperties } = await getPropertiesByAgent(agent.id);
  const properties = normalizeProperties(rawProperties as unknown[] | null);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/ekibimiz"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Ekibimize Dön
        </Link>
      </div>

      {/* Agent info card */}
      <Card className="mb-12 overflow-hidden">
        {/* Cover image */}
        {agent.cover_image ? (
          <div className="relative h-48 sm:h-56">
            <Image
              src={agent.cover_image}
              alt={`${agent.name} kapak`}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start -mt-16 sm:-mt-20">
            {/* Photo */}
            <div className="shrink-0">
              {agent.photo_url ? (
                <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-background ring-4 ring-primary/10">
                  <Image
                    src={agent.photo_url}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    sizes="144px"
                    priority
                  />
                </div>
              ) : (
                <Avatar className="h-36 w-36 border-4 border-background">
                  <AvatarFallback className="text-3xl">
                    {getInitials(agent.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left sm:pt-8">
              <h1 className="text-2xl font-bold sm:text-3xl">{agent.name}</h1>
              {agent.title && (
                <p className="mt-1 text-base text-muted-foreground">{agent.title}</p>
              )}

              {agent.bio && (
                <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {agent.bio}
                </p>
              )}

              {/* Contact buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Phone className="h-4 w-4" />
                    {agent.phone}
                  </a>
                )}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Mail className="h-4 w-4" />
                    {agent.email}
                  </a>
                )}
                {agent.phone && (
                  <a
                    href={buildWhatsAppUrl(agent.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent's property listings */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">
          {agent.name} — İlanları
          {properties.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({properties.length} ilan)
            </span>
          )}
        </h2>

        {properties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            Bu danışmana ait aktif ilan bulunmuyor.
          </div>
        )}
      </section>
    </div>
  );
}
