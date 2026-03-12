import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  Target,
  Eye,
  Heart,
  Shield,
  Users,
  Award,
  TrendingUp,
  Home,
  Handshake,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Nexos Emlak — Kuzey Kıbrıs'ın güvenilir gayrimenkul danışmanlık şirketi. Misyonumuz, vizyonumuz, değerlerimiz ve hikayemiz.",
};

const STATS = [
  { value: "500+", label: "Mutlu Müşteri" },
  { value: "1.200+", label: "İlan Portföyü" },
  { value: "8+", label: "Yıllık Deneyim" },
  { value: "15+", label: "Uzman Danışman" },
];

const VALUES = [
  {
    icon: Shield,
    title: "Güven & Şeffaflık",
    description:
      "Her işlemde tam şeffaflık sağlarız. Gizli maliyet, sürpriz komisyon veya yanıltıcı bilgi vermeyiz. Müşterilerimize her aşamada dürüst ve açık iletişim sunarız.",
  },
  {
    icon: Heart,
    title: "Müşteri Odaklılık",
    description:
      "Müşterilerimizin ihtiyaçlarını, bütçesini ve hayallerini anlamak önceliğimizdir. Satış odaklı değil, çözüm odaklı çalışırız. Her müşterimiz bizim için özeldir.",
  },
  {
    icon: Award,
    title: "Profesyonellik",
    description:
      "Sektördeki en güncel bilgilere sahip, sürekli kendini geliştiren bir ekibiz. Uluslararası standartlarda hizmet sunar, her detayı titizlikle takip ederiz.",
  },
  {
    icon: Handshake,
    title: "Uzun Vadeli İlişki",
    description:
      "Tek seferlik satış değil, ömür boyu sürecek bir ilişki kurarız. Satış sonrası destek, kiralama yönetimi ve danışmanlık hizmetlerimizle her zaman yanınızdayız.",
  },
  {
    icon: TrendingUp,
    title: "Yenilikçilik",
    description:
      "Teknolojiyi ve yenilikçi pazarlama yöntemlerini kullanarak mülklerinizi en geniş kitleye ulaştırırız. Dijital pazarlama, sanal turlar ve veri analitiğiyle fark yaratırız.",
  },
  {
    icon: Users,
    title: "Takım Ruhu",
    description:
      "Farklı uzmanlık alanlarından gelen ekip üyelerimiz, birlikte çalışarak müşterilerimize en kapsamlı hizmeti sunar. Her danışmanımız birbirini tamamlar.",
  },
];

const SERVICES_SUMMARY = [
  "Satılık ve kiralık mülk danışmanlığı",
  "Profesyonel mülk değerleme",
  "Yatırım portföy danışmanlığı",
  "Tapu devir ve hukuki süreç yönetimi",
  "Kiralama yönetimi (kiracı bulma, tahsilat, bakım)",
  "Anahtar teslim mobilya ve dekorasyon",
  "Oturma izni danışmanlığı",
  "Havalimanı transfer ve mülk turları",
  "Kısa dönem kiralama (Airbnb) yönetimi",
  "Satış sonrası tam destek",
];

const TIMELINE = [
  {
    year: "2016",
    title: "Kuruluş",
    description:
      "Nexos Emlak, İskele'de küçük bir ofisle kuruldu. İlk yılda 50'den fazla aileye hayallerindeki evi bulmalarında yardımcı olduk.",
  },
  {
    year: "2018",
    title: "Büyüme",
    description:
      "Ekibimizi genişlettik, Girne ve Lefkoşa'da da hizmet vermeye başladık. Portföyümüz 300+ mülke ulaştı.",
  },
  {
    year: "2020",
    title: "Dijital Dönüşüm",
    description:
      "Pandemi sürecinde dijital altyapımızı güçlendirdik. Sanal turlar, online danışmanlık ve dijital sözleşme süreçlerini hayata geçirdik.",
  },
  {
    year: "2022",
    title: "Uluslararası Açılım",
    description:
      "İngiliz, Alman ve Rus müşterilere yönelik çok dilli hizmet altyapımızı kurduk. Uluslararası emlak fuarlarına katılmaya başladık.",
  },
  {
    year: "2024",
    title: "Liderlik",
    description:
      "İskele bölgesinde en çok tercih edilen emlak danışmanlık şirketi konumuna ulaştık. 1.000+ mutlu müşteri ve 15+ kişilik uzman kadro.",
  },
];

export default async function HakkimizdaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 text-white sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,203,45,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,203,45,0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Kuzey Kıbrıs&apos;ın Güvenilir Emlak Danışmanı
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Hayalinizdeki Mülke
            <br />
            <span className="text-primary">Güvenle Ulaşın</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
            Nexos Emlak olarak, Kuzey Kıbrıs&apos;ta gayrimenkul alım-satım ve
            kiralama süreçlerinde yanınızdayız. Profesyonel kadromuz, şeffaf
            yaklaşımımız ve bölge bilgimizle sizin için en doğru yatırımı
            buluyoruz.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto grid grid-cols-2 divide-x sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center sm:py-8">
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Biz Kimiz */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Biz Kimiz?</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Nexos Emlak, Kuzey Kıbrıs&apos;ın önde gelen gayrimenkul
                danışmanlık şirketidir. 2016 yılında İskele&apos;de kurulan
                firmamız, bugün İskele, Girne, Lefkoşa, Gazimağusa ve
                Güzelyurt&apos;u kapsayan geniş bir hizmet ağına sahiptir.
              </p>
              <p>
                Satılık ve kiralık mülk danışmanlığından yatırım
                portföyü yönetimine, tapu işlemlerinden kiralama yönetimine
                kadar gayrimenkulün her alanında uçtan uca hizmet sunuyoruz.
                Müşterilerimizin %80&apos;inin referans yoluyla bize ulaşması,
                güven ve kalite odaklı yaklaşımımızın en somut kanıtıdır.
              </p>
              <p>
                Türk, İngiliz, Alman, Rus ve birçok farklı milletten
                müşterilerimize Türkçe ve İngilizce dillerinde profesyonel
                hizmet veriyoruz. Her müşterimiz için kişiye özel çözümler
                üretir, alım sürecinin her aşamasında şeffaf ve dürüst iletişim
                kurarız.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-6">
                  <div className="text-center">
                    <Users className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-2 text-sm font-semibold">15+</p>
                    <p className="text-xs text-muted-foreground">Uzman Danışman</p>
                  </div>
                </div>
                <div className="flex aspect-[3/2] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                  <div className="text-center">
                    <Award className="mx-auto h-8 w-8 text-primary" />
                    <p className="mt-2 text-sm font-semibold">%80</p>
                    <p className="text-xs text-gray-400">Referans Oranı</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <div className="flex aspect-[3/2] items-center justify-center rounded-2xl bg-primary p-6 text-white">
                  <div className="text-center">
                    <Home className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-semibold">1.200+</p>
                    <p className="text-xs text-white/80">İlan Portföyü</p>
                  </div>
                </div>
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                  <div className="text-center">
                    <MapPin className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-2 text-sm font-semibold">5 Bölge</p>
                    <p className="text-xs text-muted-foreground">Ada Geneli</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misyon & Vizyon */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8 sm:p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Misyonumuz</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Kuzey Kıbrıs&apos;ta gayrimenkul alım-satım ve kiralama
              süreçlerini şeffaf, güvenilir ve profesyonel bir şekilde
              yöneterek müşterilerimizin doğru yatırım kararları vermesini
              sağlamak. Her müşterimize kişiye özel çözümler sunarak,
              mülk edinme sürecini stressiz ve keyifli bir deneyime
              dönüştürmek.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 sm:p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Vizyonumuz</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Kuzey Kıbrıs&apos;ın uluslararası arenada en çok tanınan ve
              güvenilen gayrimenkul danışmanlık markası olmak. Teknolojiyi
              ve yenilikçi yaklaşımları benimseyerek sektöre yön veren,
              müşteri memnuniyetinde sınır tanımayan, sürdürülebilir
              büyümeyi hedefleyen bir kurum olmak.
            </p>
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Değerlerimiz</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Nexos Emlak olarak her kararımızda ve her müşteri ilişkimizde
            bu değerlerle hareket ediyoruz.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <value.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Hikayemiz - Timeline */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Hikayemiz</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              2016&apos;dan bugüne Nexos Emlak&apos;ın büyüme yolculuğu.
            </p>
          </div>
          <div className="relative mx-auto max-w-3xl">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 hidden h-full w-0.5 bg-border sm:left-1/2 sm:block sm:-translate-x-0.5" />

            <div className="space-y-8 sm:space-y-12">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex flex-col sm:flex-row ${
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 top-6 hidden h-3 w-3 rounded-full border-2 border-primary bg-background sm:left-1/2 sm:block sm:-translate-x-1.5" />

                  {/* Content */}
                  <div
                    className={`w-full pl-0 sm:w-1/2 ${
                      i % 2 === 0
                        ? "sm:pr-12 sm:text-right"
                        : "sm:pl-12 sm:text-left"
                    }`}
                  >
                    <div className="rounded-xl border bg-card p-5">
                      <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                        {item.year}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hizmetlerimiz Özet */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Neler Yapıyoruz?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Gayrimenkulün her alanında uçtan uca profesyonel hizmet
              sunuyoruz. İhtiyacınız ne olursa olsun, uzman ekibimiz
              yanınızda.
            </p>
            <ul className="mt-6 space-y-3">
              {SERVICES_SUMMARY.map((service) => (
                <li key={service} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{service}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/hizmetlerimiz"
              className="mt-8 inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Tüm Hizmetlerimiz
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { icon: Home, title: "Satılık & Kiralık Danışmanlık", desc: "Her bütçeye uygun mülk portföyü" },
              { icon: Shield, title: "Tapu & Hukuki Süreç Yönetimi", desc: "Güvenli ve şeffaf işlem süreci" },
              { icon: TrendingUp, title: "Yatırım Portföy Danışmanlığı", desc: "Karlı yatırım fırsatları" },
              { icon: Handshake, title: "Kiralama Yönetimi", desc: "Mülkünüz bizimle güvende" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neden Bizi Seçmelisiniz */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Neden Nexos Emlak?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Müşterilerimizin bizi tercih etme sebepleri.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-primary p-4 text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-xs text-white/80">Mutlu Müşteri</p>
                </div>
              </div>
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-900 p-4 text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold">8+</p>
                  <p className="text-xs text-gray-400">Yıl Deneyim</p>
                </div>
              </div>
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">7/24</p>
                  <p className="text-xs text-muted-foreground">Destek</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {[
              {
                title: "Bölge Uzmanlığı",
                desc: "İskele, Girne, Lefkoşa ve tüm Kuzey Kıbrıs'ı karış karış biliyoruz. Her mahallenin potansiyelini, her projenin artı-eksisini biliyoruz.",
              },
              {
                title: "Şeffaf Fiyatlandırma",
                desc: "Gizli maliyet yok. Tüm masrafları, vergileri ve komisyonları ilk görüşmede açıkça paylaşıyoruz.",
              },
              {
                title: "Hukuki Güvence",
                desc: "Anlaşmalı avukatlarımız tapu araştırması, sözleşme incelemesi ve tüm yasal süreçlerde tam destek sağlar.",
              },
              {
                title: "Satış Sonrası Destek",
                desc: "Mülkü satın aldıktan sonra da yanınızdayız. Mobilya, tadilat, kiralama yönetimi ve oturma izni süreçlerinde destek.",
              },
              {
                title: "Geniş Portföy",
                desc: "1.200+ aktif ilan ile her bütçeye ve ihtiyaca uygun mülk seçenekleri sunuyoruz.",
              },
              {
                title: "Dijital Deneyim",
                desc: "Web sitemizden mülk arayabilir, sanal tur yapabilir, online randevu alabilir ve tüm süreci dijital olarak takip edebilirsiniz.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl border bg-card p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center text-white sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,203,45,0.12),transparent_70%)]" />
          <h2 className="relative text-2xl font-bold sm:text-3xl">
            Hayalinizdeki Mülkü Birlikte Bulalım
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-gray-300">
            Kuzey Kıbrıs&apos;ta yatırım yapmak, yaşamak veya tatil evi
            almak istiyorsanız, uzman ekibimizle ücretsiz danışmanlık için
            hemen iletişime geçin.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/iletisim"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Ücretsiz Danışmanlık
            </Link>
            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-lg border border-white/20 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              WhatsApp ile Yazın
            </a>
            <Link
              href="/ekibimiz"
              className="inline-flex h-11 items-center rounded-lg border border-white/20 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Ekibimizi Tanıyın
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
