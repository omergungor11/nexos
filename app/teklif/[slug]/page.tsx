import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartPropertyCard } from "@/components/property/smart-property-card";
import { ViewTracker } from "@/components/showcase/view-tracker";
import { getShowcaseBySlug } from "@/lib/queries/showcases";
import {
  buildWhatsAppUrl,
  buildShowcaseMessage,
} from "@/lib/whatsapp";

interface Props {
  params: Promise<{ slug: string }>;
}

const COMPANY_PHONE = "+905488604030";
const COMPANY_NAME = "Nexos Investment";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: showcase } = await getShowcaseBySlug(slug);
  if (!showcase) {
    return {
      title: "Teklif Bulunamadı",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${showcase.title} | Nexos Investment`,
    description: showcase.description?.slice(0, 160) ?? showcase.title,
    robots: { index: false, follow: false },
  };
}

export default async function ShowcasePage({ params }: Props) {
  const { slug } = await params;
  const { data: showcase } = await getShowcaseBySlug(slug);

  if (!showcase) notFound();

  const agentName = showcase.agent?.name ?? null;
  const agentPhone = showcase.agent?.phone ?? COMPANY_PHONE;
  const agentPhoto = showcase.agent?.photo_url ?? null;

  const ctaUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nexosinvestment.com"}/teklif/${slug}`;
  const ctaMessage = buildShowcaseMessage({
    customerName: showcase.customer_name,
    title: showcase.title,
    url: ctaUrl,
    agentName,
  });
  const waUrl = buildWhatsAppUrl({ phone: agentPhone, text: ctaMessage });

  // Description may be HTML (TipTap) or null
  const isHtml = showcase.description
    ? /^\s*<[a-z]/i.test(showcase.description)
    : false;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <ViewTracker slug={slug} />

      {/* Hero */}
      <header className="mx-auto max-w-3xl text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Sizin için hazırlandı
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          {showcase.title}
        </h1>
        <p className="text-base text-muted-foreground">
          Merhaba <span className="font-medium text-foreground">{showcase.customer_name}</span>
          , aşağıda sizin için seçtiğimiz {showcase.properties.length} ilan
          listelenmiştir. Detay için tıklayabilirsiniz.
        </p>
        {showcase.description && (
          isHtml ? (
            <div
              className="rte-content mx-auto max-w-2xl pt-2 text-left text-sm text-muted-foreground sm:text-base"
              dangerouslySetInnerHTML={{ __html: showcase.description }}
            />
          ) : (
            <p className="mx-auto max-w-2xl whitespace-pre-line pt-2 text-sm text-muted-foreground sm:text-base">
              {showcase.description}
            </p>
          )
        )}
      </header>

      {/* Property grid */}
      {showcase.properties.length > 0 ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showcase.properties.map((p, i) => (
            <SmartPropertyCard key={p.id} property={p} index={i} priority={i < 3} />
          ))}
        </section>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Henüz ilan eklenmemiş.
        </p>
      )}

      {/* Footer CTA */}
      <section className="mt-16 rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          {agentPhoto ? (
            <Image
              src={agentPhoto}
              alt={agentName ?? COMPANY_NAME}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              N
            </div>
          )}
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Danışmanınız
            </p>
            <h2 className="text-lg font-semibold">
              {agentName ?? COMPANY_NAME}
            </h2>
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" />
                <a href={`tel:${agentPhone}`} className="hover:text-foreground">
                  {agentPhone}
                </a>
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3.5" />
                <a
                  href="mailto:info@nexosinvestment.com"
                  className="hover:text-foreground"
                >
                  info@nexosinvestment.com
                </a>
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                Kuzey Kıbrıs
              </span>
            </p>
          </div>
          {waUrl && (
            <Button
              size="lg"
              className="gap-2 bg-[#25D366] text-white hover:bg-[#1ea952]"
              render={
                <a href={waUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <MessageCircle className="size-4" />
              WhatsApp ile İletişim
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
