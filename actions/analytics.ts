"use server";

import { createClient } from "@/lib/supabase/server";
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnalyticsSummary = {
  propertyTypeCounts: Array<{ name: string; count: number }>;
  transactionTypeCounts: Array<{ name: string; value: number }>;
  cityCounts: Array<{ name: string; count: number }>;
  dailyRequests: Array<{ date: string; count: number }>;
  monthlyListings: Array<{ month: string; count: number }>;
};

export type AnalyticsOverview = {
  totalViews: number;
  uniqueViewers: number;
  conversionRate: number;
  avgPrice: number;
  dailyViews: Array<{ date: string; views: number }>;
  topProperties: Array<{ name: string; views: number }>;
  requestStatusCounts: Array<{ name: string; value: number }>;
  monthlyListings: Array<{ month: string; count: number }>;
};

export type AgentPerformance = {
  id: string;
  name: string;
  photo_url: string | null;
  propertyCount: number;
  totalViews: number;
  requestCount: number;
  conversionRate: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AdminCheckSuccess = {
  error: null;
  supabase: Awaited<ReturnType<typeof createClient>>;
};
type AdminCheckFailure = { error: string; supabase: null };
type AdminCheckResult = AdminCheckSuccess | AdminCheckFailure;

async function requireAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Giriş yapmanız gerekiyor", supabase: null };
  if (user.user_metadata?.role !== "admin")
    return { error: "Yetkiniz yok", supabase: null };
  return { error: null, supabase };
}

// ---------------------------------------------------------------------------
// getAnalyticsSummary — Dashboard charts data
// ---------------------------------------------------------------------------

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { supabase } = await requireAdmin();
  if (!supabase) return emptyAnalyticsSummary();

  // Property type distribution
  const { data: properties } = await supabase
    .from("properties")
    .select("type, transaction_type, city:cities(name), created_at")
    .eq("is_active", true);

  const typeCounts: Record<string, number> = {};
  const txCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};

  for (const p of properties ?? []) {
    typeCounts[p.type] = (typeCounts[p.type] ?? 0) + 1;
    txCounts[p.transaction_type] = (txCounts[p.transaction_type] ?? 0) + 1;
    const cityName = Array.isArray(p.city) ? p.city[0]?.name : (p.city as { name: string } | null)?.name;
    if (cityName) {
      cityCounts[cityName] = (cityCounts[cityName] ?? 0) + 1;
    }
  }

  const propertyTypeCounts = Object.entries(typeCounts)
    .map(([key, count]) => ({ name: PROPERTY_TYPE_LABELS[key] ?? key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const transactionTypeCounts = Object.entries(txCounts).map(([key, value]) => ({
    name: TRANSACTION_TYPE_LABELS[key] ?? key,
    value,
  }));

  const cityCountsArr = Object.entries(cityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Daily requests (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: requests } = await supabase
    .from("contact_requests")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const dailyRequestMap: Record<string, number> = {};
  for (const r of requests ?? []) {
    const date = r.created_at.slice(0, 10);
    dailyRequestMap[date] = (dailyRequestMap[date] ?? 0) + 1;
  }

  const dailyRequests = generateDateRange(thirtyDaysAgo, new Date()).map((date) => ({
    date: formatShortDate(date),
    count: dailyRequestMap[date] ?? 0,
  }));

  // Monthly listings (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const { data: allProps } = await supabase
    .from("properties")
    .select("created_at")
    .gte("created_at", twelveMonthsAgo.toISOString());

  const monthlyMap: Record<string, number> = {};
  for (const p of allProps ?? []) {
    const month = p.created_at.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] ?? 0) + 1;
  }

  const monthlyListings = generateMonthRange(twelveMonthsAgo, new Date()).map((month) => ({
    month: formatMonth(month),
    count: monthlyMap[month] ?? 0,
  }));

  return {
    propertyTypeCounts,
    transactionTypeCounts,
    cityCounts: cityCountsArr,
    dailyRequests,
    monthlyListings,
  };
}

// ---------------------------------------------------------------------------
// getAnalyticsOverview — Analytics page data
// ---------------------------------------------------------------------------

export async function getAnalyticsOverview(
  days: number = 30
): Promise<AnalyticsOverview> {
  const { supabase } = await requireAdmin();
  if (!supabase) return emptyAnalyticsOverview();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startIso = startDate.toISOString();

  // Total views from property_views table
  const { count: totalViews } = await supabase
    .from("property_views")
    .select("*", { count: "exact", head: true })
    .gte("viewed_at", startIso);

  // Unique viewers (approximate by distinct session)
  const { data: viewerData } = await supabase
    .from("property_views")
    .select("viewer_session")
    .gte("viewed_at", startIso);

  const uniqueSessions = new Set((viewerData ?? []).map((v) => v.viewer_session).filter(Boolean));

  // Contact requests in period
  const { count: requestCount } = await supabase
    .from("contact_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startIso);

  // Avg price of active properties
  const { data: priceData } = await supabase
    .from("properties")
    .select("price")
    .eq("is_active", true);

  const prices = (priceData ?? []).map((p) => p.price);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  // Conversion rate
  const views = totalViews ?? 0;
  const requests = requestCount ?? 0;
  const conversionRate = views > 0 ? (requests / views) * 100 : 0;

  // Daily views
  const { data: dailyViewData } = await supabase
    .from("property_views")
    .select("viewed_at")
    .gte("viewed_at", startIso);

  const dailyViewMap: Record<string, number> = {};
  for (const v of dailyViewData ?? []) {
    const date = v.viewed_at.slice(0, 10);
    dailyViewMap[date] = (dailyViewMap[date] ?? 0) + 1;
  }

  const dailyViews = generateDateRange(startDate, new Date()).map((date) => ({
    date: formatShortDate(date),
    views: dailyViewMap[date] ?? 0,
  }));

  // Top 10 properties by views
  const { data: topProps } = await supabase
    .from("properties")
    .select("title, views_count")
    .eq("is_active", true)
    .order("views_count", { ascending: false })
    .limit(10);

  const topProperties = (topProps ?? []).map((p) => ({
    name: p.title.length > 30 ? p.title.slice(0, 30) + "..." : p.title,
    views: p.views_count,
  }));

  // Request status distribution
  const { data: requestStatusData } = await supabase
    .from("contact_requests")
    .select("status")
    .gte("created_at", startIso);

  const statusMap: Record<string, number> = {};
  for (const r of requestStatusData ?? []) {
    statusMap[r.status] = (statusMap[r.status] ?? 0) + 1;
  }

  const STATUS_LABELS: Record<string, string> = {
    new: "Yeni",
    in_progress: "İşlemde",
    resolved: "Çözüldü",
    spam: "Spam",
  };

  const requestStatusCounts = Object.entries(statusMap).map(([status, value]) => ({
    name: STATUS_LABELS[status] ?? status,
    value,
  }));

  // Monthly listings (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const { data: allProps } = await supabase
    .from("properties")
    .select("created_at")
    .gte("created_at", twelveMonthsAgo.toISOString());

  const monthlyMap: Record<string, number> = {};
  for (const p of allProps ?? []) {
    const month = p.created_at.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] ?? 0) + 1;
  }

  const monthlyListings = generateMonthRange(twelveMonthsAgo, new Date()).map((month) => ({
    month: formatMonth(month),
    count: monthlyMap[month] ?? 0,
  }));

  return {
    totalViews: views,
    uniqueViewers: uniqueSessions.size,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgPrice: Math.round(avgPrice),
    dailyViews,
    topProperties,
    requestStatusCounts,
    monthlyListings,
  };
}

// ---------------------------------------------------------------------------
// getAgentPerformance — Agent analytics
// ---------------------------------------------------------------------------

export async function getAgentPerformance(): Promise<AgentPerformance[]> {
  const { supabase } = await requireAdmin();
  if (!supabase) return [];

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, photo_url")
    .eq("is_active", true);

  if (!agents || agents.length === 0) return [];

  const results: AgentPerformance[] = [];

  for (const agent of agents) {
    // Property count and total views
    const { data: props } = await supabase
      .from("properties")
      .select("views_count")
      .eq("agent_id", agent.id);

    const propertyCount = props?.length ?? 0;
    const totalViews = (props ?? []).reduce((sum, p) => sum + p.views_count, 0);

    // Request count
    const { count: requestCount } = await supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .eq("assigned_agent_id", agent.id);

    const requests = requestCount ?? 0;
    const conversionRate = totalViews > 0 ? (requests / totalViews) * 100 : 0;

    results.push({
      id: agent.id,
      name: agent.name,
      photo_url: agent.photo_url,
      propertyCount,
      totalViews,
      requestCount: requests,
      conversionRate: Math.round(conversionRate * 100) / 100,
    });
  }

  return results.sort((a, b) => b.totalViews - a.totalViews);
}

// ---------------------------------------------------------------------------
// getPropertyAnalytics — Single property analytics
// ---------------------------------------------------------------------------

export async function getPropertyAnalytics(propertyId: string) {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Daily views for this property
  const { data: viewsData } = await supabase
    .from("property_views")
    .select("viewed_at")
    .eq("property_id", propertyId)
    .gte("viewed_at", thirtyDaysAgo.toISOString());

  const dailyMap: Record<string, number> = {};
  for (const v of viewsData ?? []) {
    const date = v.viewed_at.slice(0, 10);
    dailyMap[date] = (dailyMap[date] ?? 0) + 1;
  }

  const dailyViews = generateDateRange(thirtyDaysAgo, new Date()).map((date) => ({
    date: formatShortDate(date),
    views: dailyMap[date] ?? 0,
  }));

  // Total stats
  const { data: property } = await supabase
    .from("properties")
    .select("views_count, type, city_id")
    .eq("id", propertyId)
    .single();

  // Requests for this property
  const { count: requestCount } = await supabase
    .from("contact_requests")
    .select("*", { count: "exact", head: true })
    .eq("property_id", propertyId);

  // Avg views for same type/city
  let avgViews = 0;
  if (property) {
    const { data: sameTypeProps } = await supabase
      .from("properties")
      .select("views_count")
      .eq("type", property.type)
      .eq("city_id", property.city_id)
      .eq("is_active", true);

    if (sameTypeProps && sameTypeProps.length > 0) {
      avgViews = sameTypeProps.reduce((sum, p) => sum + p.views_count, 0) / sameTypeProps.length;
    }
  }

  return {
    dailyViews,
    totalViews: property?.views_count ?? 0,
    requestCount: requestCount ?? 0,
    avgViewsInCategory: Math.round(avgViews),
  };
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function generateMonthRange(start: Date, end: Date): string[] {
  const months: string[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= endMonth) {
    months.push(current.toISOString().slice(0, 7));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][d.getMonth()]}`;
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${months[parseInt(month, 10) - 1]} ${year.slice(2)}`;
}

function emptyAnalyticsSummary(): AnalyticsSummary {
  return {
    propertyTypeCounts: [],
    transactionTypeCounts: [],
    cityCounts: [],
    dailyRequests: [],
    monthlyListings: [],
  };
}

function emptyAnalyticsOverview(): AnalyticsOverview {
  return {
    totalViews: 0,
    uniqueViewers: 0,
    conversionRate: 0,
    avgPrice: 0,
    dailyViews: [],
    topProperties: [],
    requestStatusCounts: [],
    monthlyListings: [],
  };
}
