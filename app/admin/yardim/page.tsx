import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  FolderKanban,
  Users,
  ImageIcon,
  BookOpen,
  MessageSquare,
  ClipboardList,
  Tag,
  Map,
  Monitor,
  BarChart3,
  Settings,
  MapPin,
  Share2,
  PlusCircle,
  Pencil,
  Eye,
  Upload,
  Command,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Yardım Merkezi — Admin",
};

// ---------------------------------------------------------------------------
// Help categories and items
// ---------------------------------------------------------------------------

interface HelpItem {
  title: string;
  description: string;
  href: string;
  icon: typeof Building2;
}

interface HelpCategory {
  title: string;
  icon: typeof Building2;
  color: string;
  items: HelpItem[];
}

const CATEGORIES: HelpCategory[] = [
  {
    title: "İlan Yönetimi",
    icon: Building2,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    items: [
      {
        title: "Yeni İlan Oluştur",
        description: "Satılık, kiralık veya günlük kiralık ilan ekleyin. Tüm bilgileri tab'lar halinde düzenleyin.",
        href: "/admin/ilanlar/yeni",
        icon: PlusCircle,
      },
      {
        title: "İlanları Düzenle",
        description: "Mevcut ilanların bilgilerini, fotoğraflarını ve konumlarını güncelleyin.",
        href: "/admin/ilanlar",
        icon: Pencil,
      },
      {
        title: "Haritada Göster",
        description: "İlanların haritadaki görünürlüğünü yönetin. Toplu seçim ile hızlı güncelleme yapın.",
        href: "/admin/harita",
        icon: Map,
      },
    ],
  },
  {
    title: "Proje Yönetimi",
    icon: FolderKanban,
    color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
    items: [
      {
        title: "Yeni Proje Ekle",
        description: "Konut projesi bilgileri, galeri, özellikler ve fiyat detaylarını girin.",
        href: "/admin/projeler/yeni",
        icon: PlusCircle,
      },
      {
        title: "Projeleri Yönet",
        description: "Mevcut projelerin durumunu, görsellerini ve bilgilerini güncelleyin.",
        href: "/admin/projeler",
        icon: Pencil,
      },
    ],
  },
  {
    title: "Danışmanlar",
    icon: Users,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    items: [
      {
        title: "Danışman Ekle",
        description: "Yeni danışman profili oluşturun. Ad, unvan, telefon, fotoğraf ve biyografi.",
        href: "/admin/danismanlar/yeni",
        icon: PlusCircle,
      },
      {
        title: "Danışmanları Yönet",
        description: "Mevcut danışman profillerini düzenleyin veya devre dışı bırakın.",
        href: "/admin/danismanlar",
        icon: Users,
      },
    ],
  },
  {
    title: "İçerik Yönetimi",
    icon: BookOpen,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    items: [
      {
        title: "Blog Yazısı Ekle",
        description: "Rehber, yatırım ipuçları ve emlak haberleri yayınlayın.",
        href: "/admin/blog/yeni",
        icon: BookOpen,
      },
      {
        title: "Galeri Yönetimi",
        description: "Tüm görselleri tek yerden yönetin. WebP sıkıştırma, toplu yükleme.",
        href: "/admin/galeri",
        icon: ImageIcon,
      },
      {
        title: "Sosyal Medya",
        description: "Sosyal medya paylaşım görselleri oluşturun.",
        href: "/admin/sosyal-medya",
        icon: Share2,
      },
      {
        title: "Sunum Oluştur",
        description: "Profesyonel emlak sunumları hazırlayın.",
        href: "/admin/sunumlar",
        icon: Monitor,
      },
    ],
  },
  {
    title: "Talepler & Teklifler",
    icon: MessageSquare,
    color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30",
    items: [
      {
        title: "İletişim Talepleri",
        description: "Web sitesinden gelen iletişim formlarını görüntüleyin ve yanıtlayın.",
        href: "/admin/talepler",
        icon: MessageSquare,
      },
      {
        title: "Emlak Talepleri",
        description: "Müşterilerin aradığı gayrimenkul taleplerini yönetin.",
        href: "/admin/emlak-talepleri",
        icon: ClipboardList,
      },
      {
        title: "Teklifler",
        description: "Müşterilere özel teklif dosyaları oluşturun.",
        href: "/admin/teklifler",
        icon: Tag,
      },
    ],
  },
  {
    title: "Araçlar & Ayarlar",
    icon: Settings,
    color: "text-slate-600 bg-slate-100 dark:bg-slate-900/30",
    items: [
      {
        title: "Analiz & Raporlar",
        description: "İlan görüntülenme, talep ve dönüşüm analizlerini inceleyin.",
        href: "/admin/analiz",
        icon: BarChart3,
      },
      {
        title: "Konum Yönetimi",
        description: "Şehir ve ilçe bilgilerini yönetin.",
        href: "/admin/konumlar",
        icon: MapPin,
      },
      {
        title: "Site Ayarları",
        description: "Genel site ayarları, SEO ve yapılandırma.",
        href: "/admin/ayarlar",
        icon: Settings,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Tips
// ---------------------------------------------------------------------------

const TIPS = [
  { icon: Command, text: "⌘K (Mac) veya Ctrl+K (Windows) ile herhangi bir sayfadan hızlı arama yapabilirsiniz." },
  { icon: Upload, text: "Görseller yüklenirken otomatik olarak WebP formatına sıkıştırılır. Maksimum 25 MB." },
  { icon: Eye, text: "İlanları haritada göstermek için Harita Yönetimi sayfasından toggle butonunu kullanın." },
  { icon: Map, text: "İlan koordinatı yoksa, şehir veya ilçe koordinatları otomatik olarak kullanılır." },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminYardimPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Yardım Merkezi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin panelinin tüm özelliklerini burada bulabilirsiniz.
        </p>
      </div>

      {/* Quick tips */}
      <div className="rounded-xl border bg-primary/5 p-5">
        <h2 className="mb-3 text-sm font-semibold text-primary">İpuçları</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <tip.icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <section key={cat.title}>
              <div className="mb-4 flex items-center gap-2.5">
                <div className={`flex size-8 items-center justify-center rounded-lg ${cat.color}`}>
                  <CatIcon className="size-4" />
                </div>
                <h2 className="text-lg font-semibold">{cat.title}</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Card className="group h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${cat.color}`}>
                              <ItemIcon className="size-4" />
                            </div>
                            <div>
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
