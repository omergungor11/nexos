import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/json-ld";
import { FeatureIcon } from "@/components/shared/feature-icon";
import {
  MapPin,
  Maximize2,
  BedDouble,
  Building2,
  Calendar,
  Flame,
  Eye,
  ArrowLeft,
  Heart,
  Phone,
  Mail,
  MessageCircle,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getPropertyBySlug,
  getRelatedProperties,
} from "@/lib/queries/properties";
import { formatPrice, formatArea, formatRooms, formatDate } from "@/lib/format";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  HEATING_TYPE_LABELS,
} from "@/lib/constants";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyLightbox } from "@/components/property/property-lightbox";
import { PropertyMap } from "@/components/property/property-map-wrapper";
import { ShareButtons } from "@/components/property/share-buttons";
import { PrintButton } from "@/components/property/print-button";
import { PropertyQrCode } from "@/components/property/property-qr-code";
import { NearbyPlaces } from "@/components/property/nearby-places";
import { VideoTour } from "@/components/property/video-tour";
import { PropertyTimeline } from "@/components/property/property-timeline";
import { PropertyContactForm } from "@/components/property/property-contact-form";
import type { PropertyListItem } from "@/types";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: property } = await getPropertyBySlug(slug);
  if (!property) return {};

  const title = property.seo_title || property.title;
  const description =
    property.seo_description ||
    `${property.title} - ${formatPrice(property.price, property.currency)}`;
  const ogSubtitle = `${TRANSACTION_TYPE_LABELS[property.transaction_type]} ${PROPERTY_TYPE_LABELS[property.type]} — ${formatPrice(property.price, property.currency)}`;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(property.title)}&subtitle=${encodeURIComponent(ogSubtitle)}&type=property`;

  return {
    title,
    description,
    openGraph: {
      title: property.title,
      description: ogSubtitle,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: property.title,
        },
        ...(property.images?.[0]?.url ? [{ url: property.images[0].url }] : []),
      ],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { data: property } = await getPropertyBySlug(slug);

  if (!property) notFound();

  const images = (property.images ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order
  );

  const location = [
    property.neighborhood?.name,
    property.district?.name,
    property.city?.name,
  ]
    .filter(Boolean)
    .join(", ");

  const { data: related } = await getRelatedProperties(
    property.id,
    property.city?.id,
    property.type,
    4
  );

  const features = (property.features ?? []).map(
    (f: { feature: { name: string; icon: string | null; category: string } }) =>
      f.feature
  );

  const priceHistory = (property.price_history ?? []).sort(
    (a: { changed_at: string }, b: { changed_at: string }) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  );

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexosinvestment.com";
  const propertyUrl = `${siteUrl}/emlak/${property.slug}`;
  const imageUrls = (property.images ?? []).map(
    (img: { url: string }) => img.url
  );

  const jsonLdData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    url: propertyUrl,
    description:
      property.seo_description ||
      property.description ||
      `${TRANSACTION_TYPE_LABELS[property.transaction_type]} ${PROPERTY_TYPE_LABELS[property.type]}`,
    ...(imageUrls.length > 0 && { image: imageUrls }),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency || "TRY",
    },
    ...(location && { address: location }),
  };

  // Generate listing number from UUID (stable 6-digit number)
  const listingNumber = Math.abs(
    property.id.split("").reduce((acc: number, ch: string) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0)
  ) % 900000 + 100000;

  const agentWhatsApp = property.agent?.phone
    ? property.agent.phone.replace(/[\s()-]/g, "").replace(/^\+/, "")
    : null;

  return (
    <>
      <JsonLd data={jsonLdData} />
      <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/emlak" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          İlanlar
        </Link>
        <span>/</span>
        <span className="truncate">{property.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Lightbox Image Gallery */}
          {images.length > 0 ? (
            <PropertyLightbox
              images={images.map((img: { url: string; alt_text: string | null }) => ({
                url: img.url,
                alt_text: img.alt_text,
              }))}
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-muted">
              <Building2 className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Title & Price */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                İlan No: {listingNumber}
              </Badge>
              <Badge>
                {TRANSACTION_TYPE_LABELS[property.transaction_type]}
              </Badge>
              <Badge variant="outline">
                {PROPERTY_TYPE_LABELS[property.type]}
              </Badge>
              <Badge variant="secondary">
                {PROPERTY_STATUS_LABELS[property.status]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {property.title}
            </h1>
            {location && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            )}
            <p className="text-3xl font-bold text-primary">
              {formatPrice(property.price, property.currency)}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <PrintButton propertySlug={property.slug} />
              <ShareButtons url={propertyUrl} title={property.title} />
            </div>
          </div>

          <Separator />

          {/* Property Specs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {property.rooms !== null && (
              <SpecItem
                icon={BedDouble}
                label="Oda Sayısı"
                value={formatRooms(property.rooms, property.living_rooms)}
              />
            )}
            {property.area_sqm && (
              <SpecItem
                icon={Maximize2}
                label="Net Alan"
                value={formatArea(property.area_sqm)}
              />
            )}
            {property.gross_area_sqm && (
              <SpecItem
                icon={Maximize2}
                label="Brüt Alan"
                value={formatArea(property.gross_area_sqm)}
              />
            )}
            {property.floor !== null && (
              <SpecItem
                icon={Building2}
                label="Bulunduğu Kat"
                value={`${property.floor}/${property.total_floors ?? "?"}`}
              />
            )}
            {property.year_built && (
              <SpecItem
                icon={Calendar}
                label="Bina Yaşı"
                value={`${new Date().getFullYear() - property.year_built} yıl`}
              />
            )}
            {property.heating_type && property.heating_type !== "none" && (
              <SpecItem
                icon={Flame}
                label="Isıtma"
                value={HEATING_TYPE_LABELS[property.heating_type]}
              />
            )}
            {property.bathrooms !== null && (
              <SpecItem
                icon={Building2}
                label="Banyo"
                value={String(property.bathrooms)}
              />
            )}
            <SpecItem
              icon={Eye}
              label="Görüntülenme"
              value={String(property.views_count)}
            />
          </div>

          <Separator />

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">Açıklama</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {property.description.split("\n").map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">Özellikler</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {features.map(
                  (f: { name: string; icon: string | null }, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <FeatureIcon name={f.icon} className="size-4 text-primary" />
                      {f.name}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* 8. Video / 3D Tour */}
          <VideoTour
            videoUrl={property.video_url}
            virtualTourUrl={property.virtual_tour_url}
          />

          {/* 7. Nearby Places */}
          <NearbyPlaces lat={property.lat} lng={property.lng} />

          {/* 1. Property Map */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Konum</h2>
            <PropertyMap
              lat={property.lat}
              lng={property.lng}
              title={property.title}
              address={property.address}
              cityLat={property.city?.lat}
              cityLng={property.city?.lng}
              districtLat={property.district?.lat}
              districtLng={property.district?.lng}
            />
          </div>

          {/* 10. Property Timeline */}
          <PropertyTimeline
            history={priceHistory}
            currentPrice={property.price}
            currency={property.currency}
            viewsCount={property.views_count ?? 0}
            isFeatured={property.is_featured ?? false}
            createdAt={property.created_at}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          {property.agent && (
            <Card className="overflow-hidden">
              <div className="bg-primary/5 px-6 pt-6 pb-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                    <AvatarImage src={property.agent.photo_url ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                      {property.agent.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 text-lg font-semibold">{property.agent.name}</h3>
                  {property.agent.title && (
                    <p className="text-sm text-muted-foreground">
                      {property.agent.title}
                    </p>
                  )}
                </div>
              </div>
              <CardContent className="space-y-2.5 p-4">
                {property.agent.phone && (
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex h-10 w-full items-center gap-3 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                    {property.agent.phone}
                  </a>
                )}
                {property.agent.email && (
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex h-10 w-full items-center gap-3 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                    E-posta Gönder
                  </a>
                )}
                {agentWhatsApp && (
                  <a
                    href={`https://wa.me/${agentWhatsApp}?text=${encodeURIComponent(`Merhaba, "${property.title}" ilanı hakkında bilgi almak istiyorum.\n\n${propertyUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-medium text-white transition-colors hover:bg-[#20bd5a]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp ile Ulaş
                  </a>
                )}
                {property.agent.slug && (
                  <Link
                    href={{ pathname: "/ekibimiz/[slug]", params: { slug: property.agent.slug } }}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <User className="h-4 w-4" />
                    Danışman Profilini Gör
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bilgi Al</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyContactForm
                propertyId={property.id}
                propertyTitle={property.title}
                propertyUrl={propertyUrl}
              />
            </CardContent>
          </Card>

          {/* 9. QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">QR Kod</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyQrCode url={propertyUrl} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Properties */}
      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">Benzer İlanlar</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p: Record<string, unknown>) => (
              <PropertyCard
                key={p.id as string}
                property={mapRelatedItem(p)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function mapRelatedItem(p: Record<string, unknown>): PropertyListItem {
  const imgs = p.images as Array<{ url: string; is_cover: boolean }> | null;
  const cov = imgs?.find((i) => i.is_cover) ?? imgs?.[0];
  return {
    id: p.id as string,
    slug: p.slug as string,
    title: p.title as string,
    price: p.price as number,
    currency: p.currency as PropertyListItem["currency"],
    type: p.type as PropertyListItem["type"],
    transaction_type: p.transaction_type as PropertyListItem["transaction_type"],
    area_sqm: p.area_sqm as number | null,
    rooms: p.rooms as number | null,
    living_rooms: p.living_rooms as number | null,
    floor: p.floor as number | null,
    status: p.status as PropertyListItem["status"],
    is_featured: p.is_featured as boolean,
    views_count: p.views_count as number,
    listing_number: (p.listing_number as number) ?? 0,
    city: p.city as PropertyListItem["city"],
    district: p.district as PropertyListItem["district"],
    cover_image: cov?.url ?? null,
  };
}
