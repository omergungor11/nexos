"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deleteBlogPost, toggleBlogPublished } from "@/actions/blog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  views_count: number;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

// ---------------------------------------------------------------------------
// Delete dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  postId,
  postTitle,
  onDeleted,
}: {
  postId: string;
  postTitle: string;
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBlogPost(postId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Yazı silindi.");
        onDeleted(postId);
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
          <DialogTitle>Yazıyı Sil</DialogTitle>
          <DialogDescription>
            &ldquo;{postTitle}&rdquo; başlıklı yazı kalıcı olarak silinecek.
            Bu işlem geri alınamaz.
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

export function BlogDataTable({ initialData }: { initialData: BlogPostRow[] }) {
  const [rows, setRows] = useState<BlogPostRow[]>(initialData);
  const [, startTransition] = useTransition();

  function handleTogglePublished(id: string, current: boolean) {
    startTransition(async () => {
      const result = await toggleBlogPublished(id, !current);
      if (result.error) {
        toast.error(result.error);
      } else {
        setRows((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, is_published: !current } : r
          )
        );
        toast.success(
          !current ? "Yazı yayına alındı." : "Yazı yayından kaldırıldı."
        );
      }
    });
  }

  function handleDeleted(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className={thClass}>Başlık</th>
            <th className={thClass}>Kategori</th>
            <th className={thClass}>Durum</th>
            <th className={thClass}>Yayın Tarihi</th>
            <th className={thClass}>Görüntülenme</th>
            <th className={thClass}>İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-8 text-center text-muted-foreground"
              >
                Henüz blog yazısı bulunmuyor.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-muted/30"
              >
                {/* Title */}
                <td className="px-3 py-2 max-w-sm">
                  <Link
                    href={`/blog/${row.slug}`}
                    target="_blank"
                    className="font-medium hover:underline line-clamp-2"
                  >
                    {row.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(row.created_at)}
                  </p>
                </td>

                {/* Author */}
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                  {row.author ?? "—"}
                </td>

                {/* Status */}
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.is_published ? "Yayında" : "Taslak"}
                  </span>
                </td>

                {/* Published date */}
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                  {formatDate(row.published_at)}
                </td>

                {/* Views */}
                <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                  {row.views_count.toLocaleString("tr-TR")}
                </td>

                {/* Actions */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {/* Toggle published */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={
                        row.is_published ? "Yayından kaldır" : "Yayına al"
                      }
                      onClick={() =>
                        handleTogglePublished(row.id, row.is_published)
                      }
                      title={
                        row.is_published
                          ? "Yayında — kaldırmak için tıkla"
                          : "Taslak — yayına almak için tıkla"
                      }
                    >
                      {row.is_published ? (
                        <EyeIcon className="size-4 text-green-600" />
                      ) : (
                        <EyeOffIcon className="size-4 text-muted-foreground" />
                      )}
                    </Button>

                    {/* Edit */}
                    <Link href={`/admin/blog/${row.id}/duzenle`}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Düzenle"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                    </Link>

                    {/* Delete */}
                    <DeleteDialog
                      postId={row.id}
                      postTitle={row.title}
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
  );
}
