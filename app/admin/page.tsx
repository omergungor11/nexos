import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  MessageSquare,
  Users,
  Eye,
  CalendarPlus,
  ArrowRight,
  BarChart3,
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
import { DashboardKpiCard, type KpiTrend } from "@/components/admin/dashboard-kpi-card";
import { DashboardQuickActions } from "@/components/admin/dashboard-quick-actions";
import {
  DashboardActivityFeed,
  type ActivityContact,
  type ActivityProperty,
} from "@/components/admin/dashboard-activity-feed";

export const metadata: Metadata = {
  title: "Dashboard",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactRequest {
  id: string;
  name: string;
  created_at: string;
  status: string;
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

// ─── Trend helper ─────────────────────────────────────────────────────────────

function computeTrend(current: number, previous: number): KpiTrend {
  if (previous === 0 && current === 0) {
    return { value: 0, direction: "neutral" };
  }
  if (previous === 0) {
    return { value: 100, direction: "up" };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return { value: pct, direction: "up" };
  if (pct < 0) return { value: pct, direction: "down" };
  return { value: 0, direction: "neutral" };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    closed: "bg-green-100 text-green-700",
    cancelled: "bg-muted text-muted-foreground",
    active: "bg-green-100 text-green-700",
    inactive: "bg-muted text-muted-foreground",
  };

  const labels: Record<string, string> = {
    new: "Yeni",
    contacted: "İletişimde",
    closed: "Kapandı",
    cancelled: "İptal",
    active: "Aktif",
    inactive: "Pasif",
  };

  const style = styles[status] ?? "bg-muted text-muted-foreground";
  const label = labels[status] ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

  // ── Date boundaries for trend calculation ───────────────────────────────
  const now = new Date();

  // This week: Mon 00:00 → now
  const startOfThisWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0=Sun … 6=Sat
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfThisWeek.setDate(now.getDate() - daysFromMonday);
  startOfThisWeek.setHours(0, 0, 0, 0);

  // Last week: 7 days before startOfThisWeek → startOfThisWeek
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  // This month start
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekISO = startOfThisWeek.toISOString();
  const lastWeekISO = startOfLastWeek.toISOString();
  const thisMonthISO = startOfThisMonth.toISOString();

  // ── All queries in parallel ──────────────────────────────────────────────
  const [
    // KPI totals
    activePropertiesRes,
    newContactsRes,
    totalViewsRes,
    thisMonthPropertiesRes,
    activeAgentsRes,
    totalContactsRes,

    // Trend — this week
    propertiesThisWeekRes,
    contactsThisWeekRes,
    agentsThisWeekRes,

    // Trend — last week
    propertiesLastWeekRes,
    contactsLastWeekRes,
    agentsLastWeekRes,

    // Recent lists
    recentContactsRes,
    recentPropertiesRes,
  ] = await Promise.all([
    // --- KPI totals ---
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),

    supabase.from("properties").select("views_count").eq("is_active", true),

    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonthISO),

    supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true }),

    // --- Trend this week ---
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", thisWeekISO),

    supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "new")
      .gte("created_at", thisWeekISO),

    supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", thisWeekISO),

    // --- Trend last week ---
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", lastWeekISO)
      .lt("created_at", thisWeekISO),

    supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "new")
      .gte("created_at", lastWeekISO)
      .lt("created_at", thisWeekISO),

    supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", lastWeekISO)
      .lt("created_at", thisWeekISO),

    // --- Recent lists ---
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

  // ── Compute KPI values ───────────────────────────────────────────────────
  const activeProperties = activePropertiesRes.count ?? 0;
  const newContacts = newContactsRes.count ?? 0;
  const totalViews = (totalViewsRes.data ?? []).reduce(
    (sum, row) => sum + ((row as { views_count: number | null }).views_count ?? 0),
    0
  );
  const thisMonthProperties = thisMonthPropertiesRes.count ?? 0;
  const activeAgents = activeAgentsRes.count ?? 0;
  const totalContacts = totalContactsRes.count ?? 0;

  // Conversion rate: new contact requests / total views * 100 (capped at 100)
  const conversionRate =
    totalViews > 0
      ? Math.min(100, parseFloat(((newContacts / totalViews) * 100).toFixed(1)))
      : 0;

  // ── Compute trends ────────────────────────────────────────────────────────
  const propertiesTrend = computeTrend(
    propertiesThisWeekRes.count ?? 0,
    propertiesLastWeekRes.count ?? 0
  );
  const contactsTrend = computeTrend(
    contactsThisWeekRes.count ?? 0,
    contactsLastWeekRes.count ?? 0
  );
  const agentsTrend = computeTrend(
    agentsThisWeekRes.count ?? 0,
    agentsLastWeekRes.count ?? 0
  );

  // ── Recent data ───────────────────────────────────────────────────────────
  const recentContacts = (
    (recentContactsRes.data ?? []) as unknown[]
  ) as ContactRequest[];
  const recentProperties = (recentPropertiesRes.data ?? []) as RecentProperty[];

  // ── Activity feed data (top 5 each, feed sorts internally) ───────────────
  const activityContacts = recentContacts as unknown as ActivityContact[];
  const activityProperties = recentProperties as unknown as ActivityProperty[];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nexos Emlak yönetim panelinize hoş geldiniz.
        </p>
      </div>

      {/* KPI Cards — 3 cols on md, 6 cols on xl */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <DashboardKpiCard
          label="Aktif İlan"
          count={activeProperties}
          icon={Building2}
          color="bg-blue-600"
          href="/admin/ilanlar"
          trend={propertiesTrend}
        />
        <DashboardKpiCard
          label="Yeni Talep"
          count={newContacts}
          icon={MessageSquare}
          color="bg-amber-500"
          href="/admin/talepler"
          trend={contactsTrend}
        />
        <DashboardKpiCard
          label="Toplam Görüntülenme"
          count={new Intl.NumberFormat("tr-TR").format(totalViews)}
          icon={Eye}
          color="bg-sky-600"
          href="/admin/ilanlar"
        />
        <DashboardKpiCard
          label="Aylık İlan Ekleme"
          count={thisMonthProperties}
          icon={CalendarPlus}
          color="bg-violet-600"
          href="/admin/ilanlar"
        />
        <DashboardKpiCard
          label="Dönüşüm Oranı"
          count={conversionRate}
          suffix="%"
          icon={BarChart3}
          color="bg-rose-500"
          href="/admin/talepler"
        />
        <DashboardKpiCard
          label="Aktif Danışman"
          count={activeAgents}
          icon={Users}
          color="bg-emerald-600"
          href="/admin/danismanlar"
          trend={agentsTrend}
        />
      </div>

      {/* Quick actions */}
      <DashboardQuickActions />

      {/* Middle row: activity feed + recent contacts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity feed — left */}
        <DashboardActivityFeed
          contacts={activityContacts}
          properties={activityProperties}
        />

        {/* Recent contact requests — right */}
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
                  <li
                    key={contact.id}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
      </div>

      {/* Recent properties — full width */}
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
                <li
                  key={property.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/emlak/${property.slug}`}
                      className="truncate text-sm font-medium text-foreground hover:text-primary"
                    >
                      {property.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {PROPERTY_TYPE_LABELS[property.type] ?? property.type}{" "}
                      &middot;{" "}
                      {TRANSACTION_TYPE_LABELS[property.transaction_type] ??
                        property.transaction_type}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-foreground">
                      {formatPrice(property.price, property.currency)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge
                      status={property.is_active ? "active" : "inactive"}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
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
  );
}
