"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon, PlusIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { deleteAgent, toggleAgentStatus } from "@/actions/agents";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminAgentRow = {
  id: string;
  name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  is_active: boolean;
  slug: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Delete confirm dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  agentId,
  agentName,
  onDeleted,
}: {
  agentId: string;
  agentName: string;
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAgent(agentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Danışman silindi.");
        onDeleted(agentId);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Sil" />
        }
      >
        <Trash2Icon className="size-4 text-destructive" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Danışmanı Sil</DialogTitle>
          <DialogDescription>
            &ldquo;{agentName}&rdquo; adlı danışman kalıcı olarak silinecek. Bu
            işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Vazgeç
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AgentDataTable({
  initialData,
}: {
  initialData: AdminAgentRow[];
}) {
  const [rows, setRows] = useState<AdminAgentRow[]>(initialData);
  const [, startTransition] = useTransition();

  function handleToggleActive(id: string, current: boolean) {
    startTransition(async () => {
      const result = await toggleAgentStatus(id, !current);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: !current } : r))
        );
        toast.success(!current ? "Danışman aktif edildi." : "Danışman devre dışı bırakıldı.");
      }
    });
  }

  function handleDeleted(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-4">
      {/* Add button row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{rows.length} danışman</span>
        <Link
          href="/admin/danismanlar/yeni"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <PlusIcon className="size-4" />
          Yeni Danışman
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Fotoğraf</th>
              <th className={thClass}>Ad Soyad</th>
              <th className={thClass}>Unvan</th>
              <th className={thClass}>Telefon</th>
              <th className={thClass}>E-posta</th>
              <th className={thClass}>Aktif</th>
              <th className={thClass}>İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Henüz danışman eklenmemiş.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Photo */}
                  <td className="px-3 py-2">
                    <div className="size-10 overflow-hidden rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                      {row.photo_url ? (
                        <Image
                          src={row.photo_url}
                          alt={row.name}
                          width={40}
                          height={40}
                          className="size-10 object-cover"
                        />
                      ) : (
                        <UserIcon className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-3 py-2 font-medium">{row.name}</td>

                  {/* Title */}
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.title ?? "—"}
                  </td>

                  {/* Phone */}
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {row.phone ? (
                      <a
                        href={`tel:${row.phone}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {row.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.email ? (
                      <a
                        href={`mailto:${row.email}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {row.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Active toggle */}
                  <td className="px-3 py-2">
                    <Switch
                      checked={row.is_active}
                      onCheckedChange={() =>
                        handleToggleActive(row.id, row.is_active)
                      }
                      aria-label={row.is_active ? "Devre dışı bırak" : "Aktif et"}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/danismanlar/${row.id}/duzenle`}>
                        <Button variant="ghost" size="icon-sm" aria-label="Düzenle">
                          <PencilIcon className="size-4" />
                        </Button>
                      </Link>
                      <DeleteDialog
                        agentId={row.id}
                        agentName={row.name}
                        onDeleted={handleDeleted}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
