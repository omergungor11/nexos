"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DownloadIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { updateContactStatus, updateContactAssignment, deleteContactRequest } from "@/actions/contacts";
import type { ContactRequestRow, AgentOption } from "@/app/admin/talepler/page";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  in_progress: "İşlemde",
  resolved: "Çözüldü",
  spam: "Spam",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  spam: "bg-red-100 text-red-700",
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "new", label: "Yeni" },
  { value: "in_progress", label: "İşlemde" },
  { value: "resolved", label: "Çözüldü" },
  { value: "spam", label: "Spam" },
];

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

function exportToCsv(rows: ContactRequestRow[]) {
  const headers = ["Ad", "Telefon", "E-posta", "İlan", "Durum", "Tarih", "Mesaj"];
  const csvRows = [
    headers.join(";"),
    ...rows.map((r) =>
      [
        r.name,
        r.phone ?? "",
        r.email ?? "",
        r.property?.title ?? "",
        STATUS_LABELS[r.status] ?? r.status,
        formatDate(r.created_at),
        (r.message ?? "").replace(/[\r\n;]/g, " "),
      ]
        .map((v) => `"${v}"`)
        .join(";")
    ),
  ];

  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `talepler-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail dialog
// ---------------------------------------------------------------------------

function DetailDialog({
  row,
  open,
  onClose,
  onStatusChange,
  onAssignmentChange,
  onDelete,
  agents,
}: {
  row: ContactRequestRow;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onAssignmentChange: (id: string, agentId: string | null, notes: string | null) => void;
  onDelete: (id: string) => void;
  agents: AgentOption[];
}) {
  const [, startTransition] = useTransition();
  const [notes, setNotes] = useState(row.admin_notes ?? "");

  function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    startTransition(async () => {
      const result = await updateContactStatus(row.id, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        onStatusChange(row.id, newStatus);
        toast.success("Durum güncellendi.");
      }
    });
  }

  function handleAgentChange(agentId: string | null) {
    const realAgentId = agentId === "__none__" ? null : agentId;
    startTransition(async () => {
      const result = await updateContactAssignment(row.id, realAgentId, null);
      if (result.error) {
        toast.error(result.error);
      } else {
        onAssignmentChange(row.id, realAgentId, null);
        toast.success("Danışman atandı.");
      }
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      const result = await updateContactAssignment(row.id, undefined as unknown as string | null, notes);
      if (result.error) {
        toast.error(result.error);
      } else {
        onAssignmentChange(row.id, undefined as unknown as string | null, notes);
        toast.success("Notlar kaydedildi.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Talep Detayı</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Kişi bilgileri */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Ad Soyad
              </p>
              <p className="mt-0.5 font-medium">{row.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Tarih
              </p>
              <p className="mt-0.5">{formatDate(row.created_at)}</p>
            </div>
            {row.phone && (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Telefon
                </p>
                <a
                  href={`tel:${row.phone}`}
                  className="mt-0.5 block text-primary hover:underline"
                >
                  {row.phone}
                </a>
              </div>
            )}
            {row.email && (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  E-posta
                </p>
                <a
                  href={`mailto:${row.email}`}
                  className="mt-0.5 block text-primary hover:underline"
                >
                  {row.email}
                </a>
              </div>
            )}
          </div>

          {/* İlan */}
          {row.property && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                İlgili İlan
              </p>
              <Link
                href={`/emlak/${row.property.slug}`}
                target="_blank"
                className="mt-0.5 block text-primary hover:underline"
              >
                {row.property.title}
              </Link>
            </div>
          )}

          {/* Mesaj */}
          {row.message && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Mesaj
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">
                {row.message}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
              Durum
            </p>
            <Select value={row.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue>
                  {STATUS_LABELS[row.status] ?? row.status}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Yeni</SelectItem>
                <SelectItem value="in_progress">İşlemde</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Danışman Atama */}
          {agents.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
                Sorumlu Danışman
              </p>
              <Select
                value={row.assigned_agent_id ?? "__none__"}
                onValueChange={handleAgentChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Danışman seç">
                    {row.assigned_agent_id && row.assigned_agent_id !== "__none__"
                      ? (agents.find((a) => a.id === row.assigned_agent_id)?.name ?? "Danışman seç")
                      : "Atanmamış"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Atanmamış</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Admin Notları */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
              Admin Notları
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Bu talep hakkında not ekleyin..."
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleSaveNotes}
            >
              Notu Kaydet
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Bu talep silinecek. Emin misiniz?")) {
                onDelete(row.id);
                onClose();
              }
            }}
          >
            <Trash2Icon className="size-3.5" />
            Talebi Sil
          </Button>
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

export function ContactRequestsTable({
  initialData,
  agents = [],
}: {
  initialData: ContactRequestRow[];
  agents?: AgentOption[];
}) {
  const [rows, setRows] = useState<ContactRequestRow[]>(initialData);
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [selectedRow, setSelectedRow] = useState<ContactRequestRow | null>(
    null
  );

  const filtered = useMemo(() => {
    let result = rows;
    if (activeTab !== "all") {
      result = result.filter((r) => r.status === activeTab);
    }
    if (agentFilter !== "all") {
      if (agentFilter === "__unassigned__") {
        result = result.filter((r) => !r.assigned_agent_id);
      } else {
        result = result.filter((r) => r.assigned_agent_id === agentFilter);
      }
    }
    return result;
  }, [rows, activeTab, agentFilter]);

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteContactRequest(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) => prev.filter((r) => r.id !== id));
        setSelectedRow(null);
        toast.success("Talep silindi.");
      }
    });
  }

  function handleStatusChange(id: string, status: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setSelectedRow((prev) =>
      prev?.id === id ? { ...prev, status } : prev
    );
  }

  function handleAssignmentChange(id: string, agentId: string | null, notes: string | null) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updates: Partial<ContactRequestRow> = {};
        if (agentId !== undefined) {
          updates.assigned_agent_id = agentId;
          updates.assigned_agent = agentId ? agents.find((a) => a.id === agentId) ?? null : null;
        }
        if (notes !== undefined) updates.admin_notes = notes;
        return { ...r, ...updates };
      })
    );
  }

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-4">
      {/* Tabs + Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? rows.length
                : rows.filter((r) => r.status === tab.value).length;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                    activeTab === tab.value
                      ? "bg-white/20"
                      : "bg-background"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {agents.length > 0 && (
          <Select value={agentFilter} onValueChange={(v) => setAgentFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue placeholder="Danışman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Danışmanlar</SelectItem>
              <SelectItem value="__unassigned__">Atanmamış</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCsv(filtered)}
        >
          <DownloadIcon className="size-3.5" />
          CSV İndir
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Ad Soyad</th>
              <th className={thClass}>Telefon</th>
              <th className={thClass}>E-posta</th>
              <th className={thClass}>İlan</th>
              <th className={thClass}>Danışman</th>
              <th className={thClass}>Durum</th>
              <th className={thClass}>Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Bu kategoride talep bulunmuyor.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => setSelectedRow(row)}
                >
                  <td className="px-3 py-2 font-medium">{row.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {row.phone ? (
                      <a
                        href={`tel:${row.phone}`}
                        className="hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate text-muted-foreground">
                    {row.email ? (
                      <a
                        href={`mailto:${row.email}`}
                        className="hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate">
                    {row.property ? (
                      <Link
                        href={`/emlak/${row.property.slug}`}
                        target="_blank"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.property.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Genel talep</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {row.assigned_agent?.name ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      {selectedRow && (
        <DetailDialog
          row={selectedRow}
          open={selectedRow !== null}
          onClose={() => setSelectedRow(null)}
          onStatusChange={handleStatusChange}
          onAssignmentChange={handleAssignmentChange}
          onDelete={handleDelete}
          agents={agents}
        />
      )}
    </div>
  );
}
