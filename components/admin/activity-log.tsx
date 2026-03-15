"use client";

import { useState, useMemo } from "react";
import { Filter, Clock, Search } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  publish: "Yayınlama",
  unpublish: "Yayından Kaldırma",
  login: "Giriş",
  logout: "Cikis",
  assign: "Atama",
  upload: "Yükleme",
};

const ENTITY_LABELS: Record<string, string> = {
  property: "İlan",
  agent: "Danışman",
  blog_post: "Blog",
  contact_request: "Talep",
  settings: "Ayarlar",
  page: "Sayfa",
  image: "Görsel",
  location: "Konum",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  publish: "bg-violet-100 text-violet-700",
  unpublish: "bg-amber-100 text-amber-700",
  login: "bg-muted text-muted-foreground",
  logout: "bg-muted text-muted-foreground",
  assign: "bg-cyan-100 text-cyan-700",
  upload: "bg-pink-100 text-pink-700",
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
  }).format(new Date(dateString));
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

function formatMetadata(metadata: Record<string, unknown>): string {
  if (!metadata || Object.keys(metadata).length === 0) return "—";
  try {
    const entries = Object.entries(metadata)
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${String(v)}`);
    return entries.join(", ");
  } catch {
    return "—";
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ActivityLog({ initialData }: { initialData: ActivityLogRow[] }) {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Unique actions and entity types for filter dropdowns
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
        const matchEntity = row.entity_type.toLowerCase().includes(q);
        const matchAction = row.action.toLowerCase().includes(q);
        const matchId = row.entity_id?.toLowerCase().includes(q) ?? false;
        const matchMeta = JSON.stringify(row.metadata).toLowerCase().includes(q);
        if (!matchEntity && !matchAction && !matchId && !matchMeta) return false;
      }
      return true;
    });
  }, [initialData, actionFilter, entityFilter, search]);

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtre:</span>
            </div>

            {/* Action filter */}
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

            {/* Divider */}
            <div className="h-5 w-px bg-border" />

            {/* Entity filter */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={entityFilter === "all" ? "default" : "outline"}
                onClick={() => setEntityFilter("all")}
                className="h-7 text-xs"
              >
                Tüm Tipler
              </Button>
              {uniqueEntities.map((entity) => (
                <Button
                  key={entity}
                  size="sm"
                  variant={entityFilter === entity ? "default" : "outline"}
                  onClick={() => setEntityFilter(entity)}
                  className="h-7 text-xs"
                >
                  {getEntityLabel(entity)}
                </Button>
              ))}
            </div>

            {/* Search */}
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aktivite Kayıtları</CardTitle>
              <CardDescription>
                {filtered.length} kayıt gösteriliyor
                {filtered.length !== initialData.length &&
                  ` (toplam ${initialData.length})`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className={thClass}>Zaman</th>
                  <th className={thClass}>İşlem</th>
                  <th className={thClass}>Tür</th>
                  <th className={thClass}>Kayıt ID</th>
                  <th className={thClass}>Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-10 text-center text-muted-foreground"
                    >
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 shrink-0" />
                          <span className="text-xs">{formatDate(row.created_at)}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getActionColor(row.action)}`}
                        >
                          {getActionLabel(row.action)}
                        </span>
                      </td>

                      {/* Entity type */}
                      <td className="px-3 py-3 font-medium text-foreground">
                        {getEntityLabel(row.entity_type)}
                      </td>

                      {/* Entity ID */}
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                        {row.entity_id
                          ? row.entity_id.length > 12
                            ? `${row.entity_id.slice(0, 8)}...`
                            : row.entity_id
                          : "—"}
                      </td>

                      {/* Metadata */}
                      <td className="px-3 py-3 max-w-xs truncate text-xs text-muted-foreground">
                        {formatMetadata(row.metadata)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
