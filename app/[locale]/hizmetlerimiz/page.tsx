import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Home,
  Building2,
  TrendingUp,
  Key,
  FileSearch,
  PaintBucket,
  Scale,
  Handshake,
  MapPin,
  Calculator,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Hizmetlerimiz",
  description:
    "Nexos Emlak hizmetleri — gayrimenkul danışmanlığı, yatırım rehberliği, mülk değerleme, kiralama yönetimi ve daha fazlası. Kuzey Kıbrıs'ta güvenilir emlak çözümleri.",
};

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

const SERVICES: Service[] = [
  {
    icon: Home,
    title: "Satılık Gayrimenkul Danışmanlığı",
    description:
      "Kuzey Kıbrıs'ta hayalinizdeki mülkü bulmanız için kapsamlı danışmanlık hizmeti sunuyoruz. İhtiyaç analizinden tapu devrine kadar her aşamada yanınızdayız.",
    features: [
      "Kişiselleştirilmiş mülk arama ve filtreleme",
      "Yerinde mülk gezisi organizasyonu",
      "Fiyat müzakeresi ve pazarlık desteği",
      "Tapu araştırması ve hukuki kontrol",
      "Satış sözleşmesi hazırlama",
      "Tapu devir sürecinin takibi",
    ],
  },
  {
    icon: Key,
    title: "Kiralık Gayrimenkul Hizmetleri",
    description:
      "Konut ve ticari kiralama süreçlerinde hem mülk sahiplerine hem kiracılara profesyonel destek sağlıyoruz.",
    features: [
      "Kiracı bulma ve ön değerlendirme",
      "Kira sözleşmesi hazırlama",
      "Depozito ve ödeme takibi",
      "Periyodik mülk kontrolü",
      "Kiracı-ev sahibi arabuluculuğu",
      "Tahliye süreç yönetimi",
    ],
  },
  {
    icon: TrendingUp,
    title: "Yatırım Danışmanlığı",
    description:
      "Kuzey Kıbrıs gayrimenkul piyasasında yüksek getiri potansiyeli taşıyan fırsatları analiz ediyor, yatırım stratejinizi birlikte oluşturuyoruz.",
    features: [
      "Piyasa analizi ve bölge karşılaştırması",
      "Yatırım getiri hesaplaması (ROI)",
      "Off-plan proje değerlendirmesi",
      "Portföy çeşitlendirme önerileri",
      "Kira geliri projeksiyonu",
      "Yeniden satış stratejisi planlaması",
    ],
  },
  {
    icon: FileSearch,
    title: "Mülk Değerleme",
    description:
      "Profesyonel değerleme raporlarıyla mülkünüzün gerçek piyasa değerini belirliyor, alım-satım kararlarınıza sağlam bir temel oluşturuyoruz.",
    features: [
      "Karşılaştırmalı piyasa analizi",
      "Bölgesel değer trend raporu",
      "Fiziksel durum değerlendirmesi",
      "Gelir yaklaşımı analizi (yatırım mülkleri)",
      "Resmi değerleme raporu hazırlama",
      "Banka ve kredi başvuru desteği",
    ],
  },
  {
    icon: Building2,
    title: "Proje Pazarlama",
    description:
      "Müteahhit ve proje sahiplerine özel pazarlama çözümleri sunuyor, projelerinizi doğru alıcı kitlesine ulaştırıyoruz.",
    features: [
      "Proje tanıtım stratejisi oluşturma",
      "Profesyonel fotoğraf ve video çekimi",
      "Dijital pazarlama ve sosyal medya yönetimi",
      "Yurt dışı yatırımcı ağına erişim",
      "Fuar ve etkinlik organizasyonu",
      "Satış ofisi kurulumu ve yönetimi",
    ],
  },
  {
    icon: Scale,
    title: "Hukuki Destek Koordinasyonu",
    description:
      "Gayrimenkul alım-satım sürecindeki hukuki işlemler için uzman avukat ağımızla koordineli çalışıyor, haklarınızı koruyoruz.",
    features: [
      "Bağımsız avukat yönlendirmesi",
      "Tapu türü araştırması ve doğrulama",
      "Sözleşme inceleme ve revizyon",
      "Bakanlar Kurulu izin başvurusu takibi",
      "Veraset ve miras işlemleri",
      "İmar ve yapı ruhsatı kontrolleri",
    ],
  },
  {
    icon: PaintBucket,
    title: "Tadilat ve Dekorasyon Rehberliği",
    description:
      "Mülkünüzün değerini artırmak veya yaşam alanınızı kişiselleştirmek için güvenilir tadilat ve dekorasyon firmalarıyla iş birliği yapıyoruz.",
    features: [
      "İç mimari danışmanlık yönlendirmesi",
      "Güvenilir müteahhit ve usta referansları",
      "Tadilat maliyet tahminleri",
      "Malzeme seçimi ve tedarik desteği",
      "Proje takibi ve kalite kontrolü",
      "Mobilya ve beyaz eşya tedarik rehberliği",
    ],
  },
  {
    icon: MapPin,
    title: "Yaşam ve Yerleşim Rehberliği",
    description:
      "Kuzey Kıbrıs'a taşınmayı düşünenler için kapsamlı yerleşim rehberliği sunuyor, yeni yaşamınıza sorunsuz geçiş yapmanızı sağlıyoruz.",
    features: [
      "Bölge ve mahalle tanıtımı",
      "Okul ve sağlık kuruluşu bilgilendirme",
      "Oturma izni başvuru rehberliği",
      "Elektrik, su, internet abonelik desteği",
      "Banka hesabı açma rehberliği",
      "Günlük yaşam ipuçları ve oryantasyon",
    ],
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "İhtiyaç Analizi",
    description: "Bütçe, konum, mülk tipi ve beklentilerinizi detaylı olarak değerlendiriyoruz.",
  },
  {
    step: "02",
    title: "Mülk Seçimi",
    description: "Kriterlerinize uygun mülkleri filtreliyor ve yerinde gezi organize ediyoruz.",
  },
  {
    step: "03",
    title: "Müzakere ve Sözleşme",
    description: "Fiyat müzakeresi yapıyor, avukat kontrolünden geçen sözleşmeyi hazırlıyoruz.",
  },
  {
    step: "04",
    title: "Tapu ve Teslim",
    description: "Tapu devir sürecini takip ediyor, mülkünüzü sorunsuz şekilde teslim ediyoruz.",
  },
];

const STATS = [
  { value: "850+", label: "Mutlu Müşteri" },
  { value: "%98", label: "Memnuniyet Oranı" },
  { value: "10+", label: "Yıllık Deneyim" },
  { value: "1.200+", label: "Tamamlanan İşlem" },
];

export default async function HizmetlerimizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Profesyonel Emlak{" "}
              <span className="text-primary">Hizmetlerimiz</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Kuzey Kıbrıs&apos;ta gayrimenkul alım-satım, kiralama ve yatırım
              süreçlerinde uçtan uca profesyonel danışmanlık. Her adımda
              yanınızdayız.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/iletisim"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Phone className="h-4 w-4" />
                Ücretsiz Danışmanlık
              </Link>
              <Link
                href="/emlak"
                className="inline-flex h-11 items-center gap-2 rounded-lg border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                İlanları İncele
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Sunduğumuz Hizmetler
          </h2>
          <p className="mt-2 text-muted-foreground">
            İhtiyacınıza özel kapsamlı gayrimenkul çözümleri
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <Card key={service.title} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold">{service.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <ul className="grid gap-2 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Nasıl Çalışıyoruz?</h2>
            <p className="mt-2 text-muted-foreground">
              4 adımda mülk sahibi olun
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+2.5rem)] hidden h-0.5 w-[calc(100%-5rem)] bg-primary/20 lg:block" />
                )}
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Neden <span className="text-primary">Nexos Emlak?</span>
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Kuzey Kıbrıs emlak sektöründe 10 yılı aşkın deneyimimizle,
              müşterilerimize güvenilir, şeffaf ve sonuç odaklı hizmet
              sunuyoruz. Her mülk alım-satım sürecini kişiselleştirilmiş bir
              deneyime dönüştürüyoruz.
            </p>
            <div className="mt-8 space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Güvenilir ve Şeffaf",
                  desc: "Tüm işlemlerde açık iletişim ve yasal güvence sağlıyoruz.",
                },
                {
                  icon: Handshake,
                  title: "Kişiselleştirilmiş Hizmet",
                  desc: "Her müşteriye özel ihtiyaç analizi ve çözüm üretiyoruz.",
                },
                {
                  icon: Calculator,
                  title: "Doğru Değerleme",
                  desc: "Piyasa verilerine dayalı gerçekçi mülk değerlemesi yapıyoruz.",
                },
                {
                  icon: MapPin,
                  title: "Yerel Uzmanlık",
                  desc: "İskele ve çevresini en iyi bilen ekiple çalışıyorsunuz.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/why-us.jpg"
              alt="Nexos Emlak ofisi"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Hayalinizdeki Mülkü Birlikte Bulalım
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Ücretsiz danışmanlık görüşmesi için hemen iletişime geçin.
            Uzman kadromuz tüm sorularınızı yanıtlamaya hazır.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/iletisim"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Phone className="h-4 w-4" />
              İletişime Geçin
            </Link>
            <Link
              href="/sss"
              className="inline-flex h-11 items-center rounded-lg border px-8 text-sm font-medium transition-colors hover:bg-muted"
            >
              Sıkça Sorulan Sorular
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
