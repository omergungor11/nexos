"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getUnreadNotifications,
  type NotificationItem,
} from "@/actions/notifications";

function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    getUnreadNotifications().then((result) => {
      if (!cancelled && result.data) {
        setCount(result.data.count);
        setItems(result.data.items);
      }
    });
    return () => { cancelled = true; };
  }, [pathname]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Bildirimler"
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Bildirimler
              </p>
              {count > 0 && (
                <p className="text-xs text-muted-foreground">
                  {count} yeni talep
                </p>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Yeni bildirim yok
              </div>
            ) : (
              <ul className="divide-y max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href="/admin/talepler"
                      className="block px-4 py-3 hover:bg-muted/50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      {item.property_title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.property_title}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTimeAgo(item.created_at)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t px-4 py-2">
              <Link
                href="/admin/talepler"
                className="block text-center text-xs font-medium text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                Tüm talepleri görüntüle
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
