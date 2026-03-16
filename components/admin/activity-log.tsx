"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Filter,
  Clock,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Upload,
  UserPlus,
  ToggleLeft,
  Star,
  FileText,
  Building2,
  Users,
  MessageSquare,
  Settings,
  MapPin,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityLogRow = {
  id: number;
  admin_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  create: "Oluşturma",
  update: "Güncelleme",
  delete: "Silme",
  toggle_status: "Durum Değişikliği",
  toggle_featured: "Öne Çıkarma",
  toggle_published: "Yayın Durumu",
  assign_agent: "Danışman Atama",
  bulk_update: "Toplu Güncelleme",
  bulk_delete: "Toplu Silme",
  duplicate: "Kopyalama",
  update_settings: "Ayar Güncelleme",
  update_contact_status: "Talep Durumu",
  publish: "Yayınlama",
  unpublish: "Yayından Kaldırma",
  login: "Giriş",
  logout: "Çıkış",
  assign: "Atama",
  upload: "Yükleme",
};

const ENTITY_LABELS: Record<string, string> = {
  property: "İlan",
  agent: "Danışman",
  blog_post: "Blog Yazısı",
  contact_request: "İletişim Talebi",
  settings: "Site Ayarları",
  page: "Sayfa",
  image: "Görsel",
  location: "Konum",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  toggle_status: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  toggle_featured: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  toggle_published: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  assign_agent: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  bulk_update: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  bulk_delete: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  duplicate: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
  update_settings: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  update_contact_status: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  publish: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  unpublish: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  upload: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  toggle_status: ToggleLeft,
  toggle_featured: Star,
  toggle_published: Eye,
  assign_agent: UserPlus,
  bulk_update: Pencil,
  bulk_delete: Trash2,
  duplicate: FileText,
  update_settings: Settings,
  update_contact_status: MessageSquare,
  upload: Upload,
};

const ENTITY_ICONS: Record<string, React.ElementType> = {
  property: Building2,
  agent: Users,
  blog_post: FileText,
  contact_request: MessageSquare,
  settings: Settings,
  page: FileText,
  image: ImageIcon,
  location: MapPin,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString));
}

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return formatDate(dateString);
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function getEntityLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] ?? entityType;
}

function getActionColor(action: string): string {
  return ACTION_COLORS[action] ?? "bg-muted text-muted-foreground";
}

function getEntityLink(entityType: string, entityId: string | null): string | null {
  if (!entityId) return null;
  switch (entityType) {
    case "property": return `/admin/ilanlar/${entityId}/duzenle`;
    case "agent": return `/admin/danismanlar`;
    case "blog_post": return `/admin/blog/${entityId}/duzenle`;
    case "contact_request": return `/admin/talepler`;
    default: return null;
  }
}

function getActivityDescription(row: ActivityLogRow): string {
  const action = getActionLabel(row.action);
  const entity = getEntityLabel(row.entity_type);
  return `${entity} ${action.toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Detail Dialog
// ---------------------------------------------------------------------------

function ActivityDetailDialog({
  row,
  open,
  onClose,
}: {
  row: ActivityLogRow;
  open: boolean;
  onClose: () => void;
}) {
  const link = getEntityLink(row.entity_type, row.entity_id);
  const ActionIcon = ACTION_ICONS[row.action] ?? Pencil;
  const EntityIcon = ENTITY_ICONS[row.entity_type] ?? FileText;
  const metadataEntries = Object.entries(row.metadata ?? {});

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`flex size-8 items-center justify-center rounded-lg ${getActionColor(row.action)}`}>
              <ActionIcon className="size-4" />
            </div>
            Aktivite Detayı
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Summary */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="font-medium text-foreground">
              {getActivityDescription(row)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(row.created_at)} ({formatRelativeTime(row.created_at)})
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">İşlem</p>
              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getActionColor(row.action)}`}>
                <ActionIcon className="size-3" />
                {getActionLabel(row.action)}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Kayıt Türü</p>
              <div className="mt-1 flex items-center gap-1.5">
                <EntityIcon className="size-4 text-muted-foreground" />
                <span className="font-medium">{getEntityLabel(row.entity_type)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Kayıt ID</p>
              <p className="mt-1 font-mono text-xs">
                {row.entity_id ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Tarih & Saat</p>
              <p className="mt-1">{formatDate(row.created_at)}</p>
            </div>
          </div>

          {/* Entity link */}
          {link && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">İlgili Kayıt</p>
              <Link
                href={link}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <EntityIcon className="size-3.5" />
                {getEntityLabel(row.entity_type)} sayfasına git
              </Link>
            </div>
          )}

          {/* Metadata */}
          {metadataEntries.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Ek Bilgiler
              </p>
              <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
                {metadataEntries.map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <span className="text-xs font-medium text-muted-foreground">{key}</span>
                    <span className="text-right text-xs font-mono">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin user */}
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Admin Kullanıcı ID</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {row.admin_user_id ?? "Bilinmiyor"}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <DialogClose render={<Button variant="outline" />}>
            Kapat
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ActivityLog({ initialData }: { initialData: ActivityLogRow[] }) {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<ActivityLogRow | null>(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  const uniqueActions = useMemo(
    () => Array.from(new Set(initialData.map((r) => r.action))).sort(),
    [initialData]
  );
  const uniqueEntities = useMemo(
    () => Array.from(new Set(initialData.map((r) => r.entity_type))).sort(),
    [initialData]
  );

  const filtered = useMemo(() => {
    return initialData.filter((row) => {
      if (actionFilter !== "all" && row.action !== actionFilter) return false;
      if (entityFilter !== "all" && row.entity_type !== entityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchEntity = getEntityLabel(row.entity_type).toLowerCase().includes(q);
        const matchAction = getActionLabel(row.action).toLowerCase().includes(q);
        const matchId = row.entity_id?.toLowerCase().includes(q) ?? false;
        const matchMeta = JSON.stringify(row.metadata).toLowerCase().includes(q);
        if (!matchEntity && !matchAction && !matchId && !matchMeta) return false;
      }
      return true;
    });
  }, [initialData, actionFilter, entityFilter, search]);

  const visible = filtered.slice(0, visibleCount);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayCount = initialData.filter(
      (r) => new Date(r.created_at) >= today
    ).length;
    const weekCount = initialData.filter(
      (r) => new Date(r.created_at) >= weekAgo
    ).length;

    const actionCounts: Record<string, number> = {};
    for (const r of initialData) {
      actionCounts[r.action] = (actionCounts[r.action] ?? 0) + 1;
    }
    const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];

    return { todayCount, weekCount, total: initialData.length, topAction };
  }, [initialData]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.todayCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Bugün</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.weekCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Bu Hafta</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Toplam</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.topAction ? getActionLabel(stats.topAction[0]) : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              En Sık İşlem {stats.topAction ? `(${stats.topAction[1]})` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtre:</span>
              </div>

              {/* Entity filter */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={entityFilter === "all" ? "default" : "outline"}
                  onClick={() => setEntityFilter("all")}
                  className="h-7 text-xs"
                >
                  Tümü
                </Button>
                {uniqueEntities.map((entity) => {
                  const Icon = ENTITY_ICONS[entity] ?? FileText;
                  return (
                    <Button
                      key={entity}
                      size="sm"
                      variant={entityFilter === entity ? "default" : "outline"}
                      onClick={() => setEntityFilter(entity)}
                      className="h-7 gap-1 text-xs"
                    >
                      <Icon className="size-3" />
                      {getEntityLabel(entity)}
                    </Button>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  placeholder="Ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-48 text-sm"
                />
              </div>
            </div>

            {/* Action filters — collapsible */}
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowAllFilters((v) => !v)}
            >
              İşlem Türüne Göre
              {showAllFilters ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>

            {showAllFilters && (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={actionFilter === "all" ? "default" : "outline"}
                  onClick={() => setActionFilter("all")}
                  className="h-7 text-xs"
                >
                  Tüm İşlemler
                </Button>
                {uniqueActions.map((action) => (
                  <Button
                    key={action}
                    size="sm"
                    variant={actionFilter === action ? "default" : "outline"}
                    onClick={() => setActionFilter(action)}
                    className="h-7 text-xs"
                  >
                    {getActionLabel(action)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aktivite Zaman Çizelgesi</CardTitle>
              <CardDescription>
                {filtered.length} kayıt
                {filtered.length !== initialData.length &&
                  ` / toplam ${initialData.length}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {visible.length === 0 ? (
              <div className="px-4 py-10 text-center text-muted-foreground">
                Kayıt bulunamadı.
              </div>
            ) : (
              visible.map((row) => {
                const ActionIcon = ACTION_ICONS[row.action] ?? Pencil;
                const EntityIcon = ENTITY_ICONS[row.entity_type] ?? FileText;
                return (
                  <button
                    key={row.id}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                    onClick={() => setSelectedRow(row)}
                  >
                    {/* Action icon */}
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${getActionColor(row.action)}`}>
                      <ActionIcon className="size-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {getActionLabel(row.action)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <EntityIcon className="size-3" />
                          {getEntityLabel(row.entity_type)}
                        </div>
                      </div>
                      {row.entity_id && (
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          ID: {row.entity_id.slice(0, 12)}...
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(row.created_at)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Load more */}
          {visibleCount < filtered.length && (
            <div className="border-t p-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((v) => v + 50)}
              >
                Daha Fazla Göster ({filtered.length - visibleCount} kalan)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      {selectedRow && (
        <ActivityDetailDialog
          row={selectedRow}
          open={!!selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
}
