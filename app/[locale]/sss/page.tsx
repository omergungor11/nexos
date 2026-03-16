import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  Home,
  Scale,
  Banknote,
  Globe,
  ShieldCheck,
  Building2,
  HelpCircle,
  ChevronDown,
  Sun,
  TrendingUp,
  GraduationCap,
  Plane,
  HeartPulse,
  Landmark,
  Key,
  Palmtree,
} from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sss" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  icon: React.ElementType;
  description: string;
  items: FaqItem[];
}

// Icons mapped by category index (same order as categories in translation JSON)
const CATEGORY_ICONS: React.ElementType[] = [
  TrendingUp,    // Kuzey Kıbrıs'ta Neden Yatırım Yapmalı?
  Sun,           // Kuzey Kıbrıs'ta Yaşam
  HelpCircle,    // Genel Bilgiler
  Home,          // Satın Alma Süreci
  Scale,         // Tapu ve Hukuki Süreçler
  Globe,         // Yabancı Alıcılar
  Landmark,      // Oturma İzni ve Vatandaşlık
  Banknote,      // Yatırım ve Finansman
  Key,           // Kiralama
  Building2,     // İnşaat ve Yeni Projeler
  ShieldCheck,   // Vergiler ve Masraflar
  Plane,         // Ulaşım ve Seyahat
  GraduationCap, // Eğitim ve Üniversiteler
  HeartPulse,    // Sağlık ve Güvenlik
  Palmtree,      // Yaşam Tarzı ve Kültür
];

// Generate FAQ structured data for SEO
function generateFaqJsonLd(categories: FaqCategory[]) {
  const allQuestions = categories.flatMap((cat) =>
    cat.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }))
  );

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions,
  };
}

export default async function SSSPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "sss" });

  // Load categories from translation JSON
  const messages = (await import(`@/messages/${locale}/sss.json`)).default;
  const rawCategories = messages.sss.categories as Array<{
    title: string;
    description: string;
    items: FaqItem[];
  }>;

  // Combine translation data with icons
  const categories: FaqCategory[] = rawCategories.map((cat, index) => ({
    ...cat,
    icon: CATEGORY_ICONS[index] || HelpCircle,
  }));

  const faqJsonLd = generateFaqJsonLd(categories);
  const totalQuestions = categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("heading")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("subheading", { totalQuestions: String(totalQuestions) })}
          </p>
        </div>

        {/* Category navigation */}
        <nav className="mb-12 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <a
              key={cat.title}
              href={`#${slugify(cat.title)}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary hover:text-white sm:px-4 sm:py-2 sm:text-sm"
            >
              <cat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {cat.title}
            </a>
          ))}
        </nav>

        {/* FAQ Categories */}
        <div className="space-y-14">
          {categories.map((category) => (
            <section key={category.title} id={slugify(category.title)}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {category.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-lg border bg-card transition-shadow hover:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 font-medium [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {categories.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("stats.categories")}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalQuestions}+</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("stats.questionsAndAnswers")}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">7/24</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("stats.whatsappSupport")}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">%100</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("stats.freeConsultation")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-primary/5 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold">
            {t("cta.title")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("cta.description")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/iletisim"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {t("cta.contactUs")}
            </Link>
            <a
              href="https://wa.me/905428806456"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-lg border px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              {t("cta.whatsapp")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
