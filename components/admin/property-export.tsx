"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { AdminPropertyRow } from "./property-data-table";

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function escapeCSV(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return `"${value}"`;
}

function buildCSVRows(rows: AdminPropertyRow[]): string {
  const headers = [
    "Başlık", "Tip", "İşlem", "Fiyat", "Para Birimi", "Şehir",
    "Durum", "Danışman", "Tarih", "Görüntülenme", "Alan (m²)", "Oda",
  ];

  const csvRows = [
    headers.join(";"),
    ...rows.map((r) =>
      [
        r.title,
        PROPERTY_TYPE_LABELS[r.type] ?? r.type,
        TRANSACTION_TYPE_LABELS[r.transaction_type] ?? r.transaction_type,
        String(r.price),
        r.currency,
        r.city?.name ?? "",
        PROPERTY_STATUS_LABELS[r.status] ?? r.status,
        r.agent?.name ?? "",
        formatDate(r.created_at),
        String(r.views_count),
        "",
        "",
      ]
        .map(escapeCSV)
        .join(";")
    ),
  ];

  return "\uFEFF" + csvRows.join("\n");
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PropertyExportButtons({
  rows,
}: {
  rows: AdminPropertyRow[];
}) {
  function handleCSV() {
    const csv = buildCSVRows(rows);
    downloadBlob(csv, `ilanlar-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
  }

  return (
    <div className="flex gap-1.5">
      <Button variant="outline" size="sm" onClick={handleCSV}>
        <DownloadIcon className="size-3.5" />
        CSV İndir
      </Button>
    </div>
  );
}
