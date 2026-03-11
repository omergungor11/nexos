import type { Metadata } from "next";
import {
  Home,
  Scale,
  Banknote,
  Globe,
  FileText,
  ShieldCheck,
  Building2,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular (SSS)",
  description:
    "Kuzey Kıbrıs'ta gayrimenkul alım-satım, kiralama, tapu, yatırım ve yasal süreçler hakkında en çok sorulan sorular ve cevapları.",
};

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

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "Genel Bilgiler",
    icon: HelpCircle,
    description: "Nexos Emlak ve hizmetlerimiz hakkında temel sorular",
    items: [
      {
        question: "Nexos Emlak ne tür hizmetler sunuyor?",
        answer:
          "Nexos Emlak, Kuzey Kıbrıs'ta satılık ve kiralık gayrimenkul danışmanlığı, mülk değerleme, yatırım danışmanlığı, tapu devir işlemleri ve kiralama yönetimi hizmetleri sunmaktadır. Uzman kadromuzla alım-satım sürecinin her aşamasında yanınızdayız.",
      },
      {
        question: "Hangi bölgelerde hizmet veriyorsunuz?",
        answer:
          "Ağırlıklı olarak İskele, Gazimağusa, Girne, Lefkoşa ve Güzelyurt bölgelerinde hizmet vermekteyiz. İskele Long Beach ve çevresi özellikle yatırım açısından en aktif çalıştığımız bölgedir.",
      },
      {
        question: "İlanlarınız ne sıklıkla güncelleniyor?",
        answer:
          "İlanlarımız günlük olarak güncellenmektedir. Satılan veya kiralanan mülkler aynı gün içinde sistemden kaldırılır. Yeni ilanlar eklendikçe web sitemizde ve sosyal medya hesaplarımızda paylaşılır.",
      },
      {
        question: "Danışmanlarınızla nasıl iletişime geçebilirim?",
        answer:
          "Web sitemizdeki iletişim formunu doldurabilir, WhatsApp hattımızdan mesaj atabilir, doğrudan ofisimizi arayabilir veya ilan sayfalarındaki danışman iletişim bilgilerini kullanabilirsiniz. Çalışma saatlerimiz hafta içi ve Cumartesi 09:00-18:00 arasıdır.",
      },
    ],
  },
  {
    title: "Satın Alma Süreci",
    icon: Home,
    description: "Mülk satın alma adımları ve dikkat edilmesi gerekenler",
    items: [
      {
        question: "Kuzey Kıbrıs'ta ev satın alma süreci nasıl işliyor?",
        answer:
          "Süreç şu adımlardan oluşur: 1) Mülk seçimi ve yerinde inceleme, 2) Fiyat müzakeresi, 3) Ön sözleşme (depozito ödenir), 4) Avukat kontrolü ve tapu araştırması, 5) Satış sözleşmesinin imzalanması, 6) Bakanlar Kurulu izni başvurusu (yabancılar için), 7) Tapu devri. Süreç ortalama 3-6 ay sürmektedir.",
      },
      {
        question: "Satın almadan önce nelere dikkat etmeliyim?",
        answer:
          "Tapu türü (Türk Koçanı, Eşdeğer Koçan, Tahsis), mülkün imar durumu, altyapı (su, elektrik, yol), inşaat kalitesi, bölgenin gelişim potansiyeli ve yasal durumu mutlaka kontrol edilmelidir. Bağımsız bir avukat tutmanızı şiddetle tavsiye ederiz.",
      },
      {
        question: "Ev alırken hangi masraflar çıkar?",
        answer:
          "Tapu devir vergisi (%6, genellikle alıcı-satıcı paylaşır), KDV (%5), damga vergisi (%0.5), avukatlık ücreti, ve varsa emlak komisyonu (%3-5). İlk mülk alımında tapu devir vergisinde %3 indirim uygulanabilir. Toplam ek masraflar mülk değerinin yaklaşık %10-12'si kadardır.",
      },
      {
        question: "Taksitli satış seçenekleri var mı?",
        answer:
          "Evet, birçok yeni proje taksitli ödeme planı sunmaktadır. Genellikle %30-40 peşinat alınır, kalan tutar 12-60 ay arası taksitlendirilir. Bazı projeler faizsiz taksit imkanı da sağlar. Detaylar proje ve müteahhide göre değişir.",
      },
    ],
  },
  {
    title: "Tapu ve Hukuki Süreçler",
    icon: Scale,
    description: "Tapu türleri, yasal haklar ve resmi prosedürler",
    items: [
      {
        question: "Kuzey Kıbrıs'ta kaç tür tapu vardır?",
        answer:
          "Üç ana tapu türü vardır: 1) Türk Koçanı — 1974 öncesi Türk mülkiyetinde olan araziler, en güvenli tapu türüdür. 2) Eşdeğer Koçan (İTEM) — Güneye göç eden Kıbrıslı Türklere verilen mülkler, devlet güvencesindedir. 3) Tahsis — Devlet tarafından tahsis edilmiş araziler, koşullu mülkiyet hakkı verir.",
      },
      {
        question: "Tapu devri ne kadar sürer?",
        answer:
          "Vatandaşlar için tapu devri genellikle 1-2 hafta içinde tamamlanır. Yabancı uyruklu alıcılar için Bakanlar Kurulu izni gerektiğinden süreç 3-12 ay arasında değişebilir. Bu süre zarfında satış sözleşmesi Tapu Dairesi'ne kaydedilerek alıcının hakları güvence altına alınır.",
      },
      {
        question: "Sözleşmemi Tapu Dairesi'ne kaydettirmeli miyim?",
        answer:
          "Kesinlikle evet. Satış sözleşmesinin Tapu Dairesi'ne kaydı, mülkün üçüncü şahıslara satılmasını veya üzerine ipotek konulmasını engeller. Bu kayıt yasal hakkınızı korur ve tapu devri tamamlanana kadar en önemli güvencenizdir.",
      },
      {
        question: "Avukat tutmak zorunlu mu?",
        answer:
          "Yasal olarak zorunlu olmasa da kesinlikle tavsiye edilir. Bağımsız bir avukat tapu araştırması yapar, sözleşmeyi inceler, Bakanlar Kurulu başvurusunu takip eder ve olası hukuki riskleri önceden tespit eder. Avukatlık ücreti genellikle mülk değerinin %1-2'si kadardır.",
      },
    ],
  },
  {
    title: "Yabancı Alıcılar",
    icon: Globe,
    description: "Yabancı uyrukluların mülk edinme koşulları",
    items: [
      {
        question: "Yabancılar Kuzey Kıbrıs'ta mülk satın alabilir mi?",
        answer:
          "Evet, yabancı uyruklu kişiler Kuzey Kıbrıs'ta mülk satın alabilir. Ancak Bakanlar Kurulu'ndan izin alınması gerekir. Her yabancı vatandaş bir adet mülk (maksimum 1 dönüm = 1338 m² arazi) satın alabilir. Şirket kurarak bu sınır aşılabilir.",
      },
      {
        question: "Bakanlar Kurulu izni nedir ve nasıl alınır?",
        answer:
          "Yabancı uyrukluların mülk edinimi için gereken resmi izindir. Başvuru için pasaport kopyası, sabıka kaydı, satış sözleşmesi ve tapu fotokopisi gerekir. Avukatınız başvuruyu yapar, süreç 3-12 ay arası sürebilir. İzin çıkana kadar sözleşmeniz Tapu Dairesi'nde kayıtlı olarak korunur.",
      },
      {
        question: "Türk vatandaşları için farklı kurallar var mı?",
        answer:
          "Türk vatandaşları Kuzey Kıbrıs'ta diğer yabancılara göre daha avantajlı konumdadır. Bakanlar Kurulu izni gerekmez, tapu devri doğrudan yapılabilir. Mülk sınırlaması da yoktur, birden fazla mülk satın alabilirsiniz.",
      },
      {
        question: "Oturma izni alabilir miyim?",
        answer:
          "Mülk sahibi olan yabancılar geçici oturma izni başvurusunda bulunabilir. Oturma izni yıllık olarak yenilenir. Kira geliri elde etmek veya Kuzey Kıbrıs'ta yaşamak isteyenler için önemli bir avantajdır. Başvuru İçişleri Bakanlığı Muhaceret Dairesi'ne yapılır.",
      },
    ],
  },
  {
    title: "Yatırım ve Finansman",
    icon: Banknote,
    description: "Gayrimenkul yatırımı, getiri ve finansman seçenekleri",
    items: [
      {
        question: "Kuzey Kıbrıs'ta gayrimenkul yatırımı karlı mı?",
        answer:
          "Kuzey Kıbrıs, özellikle İskele ve Girne bölgelerinde son 5 yılda yıllık %15-25 arası değer artışı göstermiştir. Kiralık getiri oranı yıllık %6-10 arasındadır. Üniversite öğrencileri ve tatilciler sayesinde kiralama talebi yüksektir. Ancak her yatırım gibi riskleri de vardır, profesyonel danışmanlık almanızı öneririz.",
      },
      {
        question: "Kira geliri ne kadar bekleyebilirim?",
        answer:
          "Bölge ve mülk tipine göre değişir. İskele Long Beach'te 1+1 daire aylık 400-600 GBP, 2+1 daire 600-900 GBP kira getirisi sağlayabilir. Girne merkezde rakamlar biraz daha yüksektir. Kısa dönem (Airbnb tarzı) kiralama ile yaz aylarında günlük 50-150 GBP gelir elde edilebilir.",
      },
      {
        question: "Banka kredisi kullanabilir miyim?",
        answer:
          "Kuzey Kıbrıs'taki bankalar sınırlı koşullarla konut kredisi vermektedir. Genellikle mülk değerinin %50-60'ına kadar kredi kullandırılır, vade 10-15 yıl, faiz oranları yıllık %8-12 arasındadır. Türkiye'deki bankalardan alınan konut kredileri de kullanılabilir ancak mülkün Kuzey Kıbrıs'ta olması bazı bankalarda kısıtlama yaratabilir.",
      },
      {
        question: "Mülkümü kiraya vermemi yönetebilir misiniz?",
        answer:
          "Evet, kiralama yönetimi hizmetimiz kapsamında kiracı bulma, kira sözleşmesi hazırlama, kira tahsilatı, bakım-onarım koordinasyonu ve periyodik mülk kontrolü yapılmaktadır. Bu hizmet özellikle yurt dışında yaşayan mülk sahipleri için idealdir.",
      },
    ],
  },
  {
    title: "Kiralama",
    icon: FileText,
    description: "Kiralık mülk arama ve kiracı hakları",
    items: [
      {
        question: "Kiralama süreci nasıl işliyor?",
        answer:
          "Mülk seçimi sonrası kira sözleşmesi hazırlanır. Genellikle 1 yıllık sözleşme yapılır, 2-3 aylık depozito ve ilk ay kirası peşin alınır. Sözleşme İngilizce ve Türkçe olarak iki dilde hazırlanır. Kiracı ve ev sahibi hakları yasalarla korunmaktadır.",
      },
      {
        question: "Kiracı olarak haklarım nelerdir?",
        answer:
          "Kira sözleşmesi süresince mülkten çıkarılamazsınız (yasal sebep olmadıkça), depozito sözleşme bitiminde iade edilir (hasar yoksa), ev sahibi habersiz mülke giremez ve kira artışı yıllık enflasyon oranıyla sınırlıdır. Haklarınızı bilmek için sözleşmeyi dikkatlice okuyun.",
      },
      {
        question: "Evcil hayvan kabul eden mülkler var mı?",
        answer:
          "Bazı mülk sahipleri evcil hayvanlara izin vermektedir. Bu durum ilan detayında belirtilir veya danışmanımıza sorabilirsiniz. Evcil hayvan kabul eden mülklerde ek depozito istenebilir.",
      },
      {
        question: "Faturalar kiraya dahil mi?",
        answer:
          "Genellikle elektrik, su ve internet faturaları kiraya dahil değildir ve kiracı tarafından ödenir. Bazı apart daire ve site yönetimli komplekslerde ortak alan aidatı da kiracıya aittir. Detaylar kira sözleşmesinde belirtilir.",
      },
    ],
  },
  {
    title: "İnşaat ve Projeler",
    icon: Building2,
    description: "Yeni projeler, inşaat kalitesi ve teslim süreçleri",
    items: [
      {
        question: "Off-plan (proje aşamasında) mülk almak güvenli mi?",
        answer:
          "Güvenilir müteahhitlerden off-plan mülk almak avantajlı olabilir çünkü fiyatlar teslim fiyatından %15-30 daha uygun olabilir. Ancak mutlaka müteahhidin geçmiş projelerini inceleyin, teslim garantisi ve cezai şart içeren sözleşme yapın, avukat kontrolünden geçirin ve ödeme planını inşaat ilerlemesine bağlayın.",
      },
      {
        question: "İnşaat kalitesini nasıl değerlendirebilirim?",
        answer:
          "Müteahhidin tamamlanmış projelerini ziyaret edin, kullanılan malzeme markalarını sorun, yapı denetim raporlarını isteyin ve mümkünse bağımsız bir mühendis ile inceleme yaptırın. Depreme dayanıklılık, ısı-ses yalıtımı ve kullanılan beton sınıfı önemli kriterlerdir.",
      },
      {
        question: "Teslim tarihi gecikirse ne olur?",
        answer:
          "Satış sözleşmesinde gecikme durumunda cezai şart (genellikle aylık kira bedeli kadar tazminat) ve belirli bir süre sonra sözleşmeden cayma hakkı bulunmalıdır. Bu maddelerin sözleşmede yer aldığından emin olun. Gecikme durumunda avukatınız aracılığıyla haklarınızı takip edin.",
      },
      {
        question: "Tapu alana kadar mülk benim adıma mı kayıtlı?",
        answer:
          "Satış sözleşmeniz Tapu Dairesi'ne kaydedildiğinde mülk üzerinde şerh konulur. Bu, satıcının mülkü başkasına satmasını veya üzerine ipotek koymasını engeller. Tapu devri tamamlanana kadar bu kayıt sizin yasal güvencenizdir.",
      },
    ],
  },
  {
    title: "Vergiler ve Masraflar",
    icon: ShieldCheck,
    description: "Emlak vergileri, harçlar ve yıllık masraflar",
    items: [
      {
        question: "Gayrimenkul sahipliğinde hangi vergiler var?",
        answer:
          "Yıllık emlak vergisi mülk değerine göre belirlenir ve oldukça düşüktür (yıllık birkaç yüz TL). Kira geliri elde ediyorsanız gelir vergisi beyannamesi verilmesi gerekir. Mülk satışında değer artış kazancı vergisi uygulanabilir. Kuzey Kıbrıs vergi oranları genel olarak Türkiye ve Avrupa'ya göre düşüktür.",
      },
      {
        question: "Site aidatı ne kadar?",
        answer:
          "Site aidatları kompleksin sunduğu hizmetlere göre değişir. Havuz, güvenlik, jeneratör, bahçe bakımı gibi hizmetler için aylık 50-200 GBP arasında aidat ödenir. Bazı lüks projelerde bu rakam daha yüksek olabilir. Aidatı mülk satın almadan önce mutlaka öğrenin.",
      },
      {
        question: "Mülkü satarken hangi masraflar çıkar?",
        answer:
          "Satış sırasında tapu devir vergisi (genellikle alıcıyla paylaşılır), emlak komisyonu, ve varsa değer artış kazancı vergisi ödenir. Satış bedelinin sözleşmede gerçeğe uygun yazılması hem alıcı hem satıcı için önemlidir.",
      },
      {
        question: "Sigorta yaptırmak zorunlu mu?",
        answer:
          "Zorunlu değildir ancak şiddetle tavsiye edilir. Yangın, deprem, sel ve hırsızlık sigortası yıllık 200-500 GBP arasında değişir. Özellikle yatırım amaçlı mülklerde ve kiralık mülklerde sigorta yaptırmak riskleri minimize eder.",
      },
    ],
  },
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

export default function SSSPage() {
  const faqJsonLd = generateFaqJsonLd(FAQ_CATEGORIES);

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Sıkça Sorulan Sorular
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Kuzey Kıbrıs&apos;ta gayrimenkul alım-satım, kiralama ve yatırım
            süreçleri hakkında merak ettikleriniz.
          </p>
        </div>

        {/* Category navigation */}
        <nav className="mb-12 flex flex-wrap justify-center gap-2">
          {FAQ_CATEGORIES.map((cat) => (
            <a
              key={cat.title}
              href={`#${slugify(cat.title)}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <cat.icon className="h-4 w-4" />
              {cat.title}
            </a>
          ))}
        </nav>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {FAQ_CATEGORIES.map((category) => (
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

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary/5 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold">Sorunuzun cevabını bulamadınız mı?</h2>
          <p className="mt-2 text-muted-foreground">
            Uzman ekibimiz tüm sorularınızı yanıtlamaya hazır.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/iletisim"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Bize Ulaşın
            </a>
            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-lg border px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              WhatsApp ile Yazın
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
