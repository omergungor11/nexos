import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  MessageSquare,
  Users,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactRequest {
  id: string;
  name: string;
  created_at: string;
  status: string;
  // Supabase returns one-to-many joins as arrays even for FK relations
  property:
    | {
        title: string;
        slug: string;
      }[]
    | null;
}

interface RecentProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  is_active: boolean;
  created_at: string;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  count,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold tabular-nums">{count}</p>
            </div>
            <div className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="size-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
            <TrendingUp className="size-3" />
            <span>Tümünü görüntüle</span>
            <ArrowRight className="size-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    closed: "bg-green-100 text-green-700",
    cancelled: "bg-slate-100 text-slate-600",
    // property statuses
    active: "bg-green-100 text-green-700",
    inactive: "bg-slate-100 text-slate-600",
  };

  const labels: Record<string, string> = {
    new: "Yeni",
    contacted: "İletişimde",
    closed: "Kapandı",
    cancelled: "İptal",
    active: "Aktif",
    inactive: "Pasif",
  };

  const style = styles[status] ?? "bg-slate-100 text-slate-600";
  const label = labels[status] ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // KPI counts — all parallel
  const [properties, contacts, agents, blogs] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
  ]);

  const kpis = {
    properties: properties.count ?? 0,
    contacts: contacts.count ?? 0,
    agents: agents.count ?? 0,
    blogs: blogs.count ?? 0,
  };

  // Recent data — parallel
  const [recentContactsResult, recentPropertiesResult] = await Promise.all([
    supabase
      .from("contact_requests")
      .select("id, name, created_at, status, property:properties(title, slug)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("properties")
      .select(
        "id, title, slug, price, currency, type, transaction_type, is_active, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const recentContacts = (
    (recentContactsResult.data ?? []) as unknown[]
  ) as ContactRequest[];
  const recentProperties = (recentPropertiesResult.data ??
    []) as RecentProperty[];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nexos Emlak yönetim panelinize hoş geldiniz.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Aktif İlan"
          count={kpis.properties}
          icon={Building2}
          color="bg-blue-600"
          href="/admin/ilanlar"
        />
        <KpiCard
          label="Yeni Talep"
          count={kpis.contacts}
          icon={MessageSquare}
          color="bg-amber-500"
          href="/admin/talepler"
        />
        <KpiCard
          label="Aktif Danışman"
          count={kpis.agents}
          icon={Users}
          color="bg-emerald-600"
          href="/admin/danismanlar"
        />
        <KpiCard
          label="Yayında Blog"
          count={kpis.blogs}
          icon={BookOpen}
          color="bg-purple-600"
          href="/admin/blog"
        />
      </div>

      {/* Recent data — two columns on wide screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent contact requests */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Son Talepler</CardTitle>
                <CardDescription>Son 5 iletişim talebi</CardDescription>
              </div>
              <Link
                href="/admin/talepler"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                Tümü <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentContacts.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Henüz talep bulunmuyor.
              </p>
            ) : (
              <ul className="divide-y">
                {recentContacts.map((contact) => (
                  <li key={contact.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {contact.name}
                      </p>
                      {contact.property?.[0] ? (
                        <Link
                          href={`/emlak/${contact.property[0].slug}`}
                          className="truncate text-xs text-muted-foreground hover:text-primary"
                        >
                          {contact.property[0].title}
                        </Link>
                      ) : (
                        <p className="truncate text-xs text-muted-foreground">
                          Genel talep
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatShortDate(contact.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={contact.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent properties */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Son İlanlar</CardTitle>
                <CardDescription>Son eklenen 5 ilan</CardDescription>
              </div>
              <Link
                href="/admin/ilanlar"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                Tümü <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentProperties.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Henüz ilan bulunmuyor.
              </p>
            ) : (
              <ul className="divide-y">
                {recentProperties.map((property) => (
                  <li key={property.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/emlak/${property.slug}`}
                        className="truncate text-sm font-medium text-slate-900 hover:text-primary"
                      >
                        {property.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {PROPERTY_TYPE_LABELS[property.type] ?? property.type} &middot;{" "}
                        {TRANSACTION_TYPE_LABELS[property.transaction_type] ??
                          property.transaction_type}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-700">
                        {formatPrice(property.price, property.currency)}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge
                        status={property.is_active ? "active" : "inactive"}
                      />
                      <p className="mt-1 text-right text-xs text-slate-400">
                        {formatShortDate(property.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
