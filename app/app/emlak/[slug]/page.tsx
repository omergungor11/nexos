import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Maximize2,
  BedDouble,
  Building2,
  Calendar,
  Flame,
  Eye,
  ArrowLeft,
  Share2,
  Heart,
  Phone,
  Mail,
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
import type { PropertyListItem } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: property } = await getPropertyBySlug(slug);
  if (!property) return {};

  return {
    title: property.seo_title || property.title,
    description:
      property.seo_description ||
      `${property.title} - ${formatPrice(property.price, property.currency)}`,
    openGraph: {
      title: property.title,
      description: `${TRANSACTION_TYPE_LABELS[property.transaction_type]} ${PROPERTY_TYPE_LABELS[property.type]} - ${formatPrice(property.price, property.currency)}`,
      images: property.images?.[0]?.url ? [property.images[0].url] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: property } = await getPropertyBySlug(slug);

  if (!property) notFound();

  const images = (property.images ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order
  );
  const coverImage = images.find((i: { is_cover: boolean }) => i.is_cover) ?? images[0];

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

  return (
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
          {/* Image Gallery */}
          <div className="overflow-hidden rounded-xl">
            {coverImage ? (
              <div className="relative aspect-[16/10]">
                <Image
                  src={coverImage.url}
                  alt={coverImage.alt_text || property.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                <Building2 className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            {images.length > 1 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {images.slice(1, 5).map(
                  (
                    img: { url: string; alt_text: string | null; id: string },
                    i: number
                  ) => (
                    <div
                      key={img.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-lg"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt_text || `Fotoğraf ${i + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 16vw"
                      />
                      {i === 3 && images.length > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold">
                          +{images.length - 5}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex gap-2">
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
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(property.price, property.currency)}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                      <span className="text-primary">✓</span>
                      {f.name}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Date */}
          <p className="text-sm text-muted-foreground">
            İlan Tarihi: {formatDate(property.created_at)}
          </p>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          {property.agent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emlak Danışmanı</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={property.agent.photo_url ?? undefined} />
                    <AvatarFallback>
                      {property.agent.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{property.agent.name}</p>
                    {property.agent.title && (
                      <p className="text-sm text-muted-foreground">
                        {property.agent.title}
                      </p>
                    )}
                  </div>
                </div>
                {property.agent.phone && (
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted"
                  >
                    <Phone className="h-4 w-4" />
                    {property.agent.phone}
                  </a>
                )}
                {property.agent.email && (
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted"
                  >
                    <Mail className="h-4 w-4" />
                    E-posta Gönder
                  </a>
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
              <form className="space-y-3">
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                />
                <input
                  type="tel"
                  placeholder="Telefon"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                />
                <textarea
                  placeholder="Mesajınız"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                  defaultValue={`Merhaba, "${property.title}" ilanı hakkında bilgi almak istiyorum.`}
                />
                <Button type="submit" className="w-full">
                  Mesaj Gönder
                </Button>
              </form>
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
    is_featured: p.is_featured as boolean,
    views_count: p.views_count as number,
    city: p.city as PropertyListItem["city"],
    district: p.district as PropertyListItem["district"],
    cover_image: cov?.url ?? null,
  };
}
