"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { bulkImportProperties, type ImportRow } from "@/actions/properties-import";

function parseCSV(text: string): string[][] {
  const lines = text.trim().split("\n");
  return lines.map((line) =>
    line.split(";").map((cell) => cell.replace(/^"|"$/g, "").trim())
  );
}

export function PropertyImportDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        toast.error("CSV dosyası en az 2 satır içermelidir (başlık + veri)");
        return;
      }
      setHeaders(parsed[0]);
      setRows(parsed.slice(1));
      setStep("preview");
    };
    reader.readAsText(file, "utf-8");
  }

  function handleImport() {
    // Map CSV columns to ImportRow fields
    const titleIdx = headers.findIndex((h) => h.toLowerCase().includes("başlık") || h.toLowerCase().includes("title"));
    const typeIdx = headers.findIndex((h) => h.toLowerCase().includes("tip") || h.toLowerCase().includes("type"));
    const txIdx = headers.findIndex((h) => h.toLowerCase().includes("işlem") || h.toLowerCase().includes("transaction"));
    const priceIdx = headers.findIndex((h) => h.toLowerCase().includes("fiyat") || h.toLowerCase().includes("price"));
    const cityIdx = headers.findIndex((h) => h.toLowerCase().includes("şehir") || h.toLowerCase().includes("city"));

    const importRows: ImportRow[] = rows.map((row) => ({
      title: titleIdx >= 0 ? row[titleIdx] : row[0] ?? "",
      type: typeIdx >= 0 ? row[typeIdx] : undefined,
      transaction_type: txIdx >= 0 ? row[txIdx] : undefined,
      price: priceIdx >= 0 ? Number(row[priceIdx]?.replace(/\D/g, "")) || undefined : undefined,
      city_name: cityIdx >= 0 ? row[cityIdx] : undefined,
    }));

    startTransition(async () => {
      const res = await bulkImportProperties(importRows);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setResult(res.data);
        setStep("result");
        toast.success(`${res.data.imported} ilan içe aktarıldı.`);
      }
    });
  }

  function handleClose() {
    setOpen(false);
    setStep("upload");
    setRows([]);
    setHeaders([]);
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UploadIcon className="size-3.5" />
        CSV İçe Aktar
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "CSV Dosyası Yükle"}
            {step === "preview" && "Veri Ön İzleme"}
            {step === "result" && "İçe Aktarma Sonucu"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              CSV dosyanız noktalı virgül (;) ile ayrılmış olmalıdır. İlk satır başlık satırı olmalıdır.
              Beklenen sütunlar: Başlık, Tip, İşlem, Fiyat, Şehir
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
            />
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {rows.length} satır bulundu. İlk 5 satır:
            </p>
            <div className="overflow-x-auto rounded border">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="px-2 py-1.5 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-2 py-1.5 truncate max-w-[200px]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Geri
              </Button>
              <Button onClick={handleImport} disabled={isPending}>
                {isPending ? "İçe Aktarılıyor..." : `${rows.length} Satır İçe Aktar`}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {result.imported} ilan başarıyla içe aktarıldı (pasif olarak).
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium mb-1">{result.errors.length} hata:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>...ve {result.errors.length - 10} daha</li>
                  )}
                </ul>
              </div>
            )}
            <DialogFooter>
              <DialogClose render={<Button />}>
                Kapat
              </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
