import {
  TrendingDown,
  TrendingUp,
  Minus,
  Eye,
  CalendarPlus,
  Star,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";

interface PriceChange {
  id: string;
  old_price: number;
  new_price: number;
  currency: string;
  changed_at: string;
}

interface PropertyTimelineProps {
  history: PriceChange[];
  currentPrice: number;
  currency: string;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export function PropertyTimeline({
  history,
  currentPrice,
  currency,
  viewsCount,
  isFeatured,
  createdAt,
}: PropertyTimelineProps) {
  // Build timeline entries sorted by date
  type TimelineEntry = {
    id: string;
    date: string;
    type: "price_change" | "created" | "current_price";
    data?: PriceChange;
  };

  const entries: TimelineEntry[] = [];

  // Current price
  entries.push({
    id: "current",
    date: new Date().toISOString(),
    type: "current_price",
  });

  // Price changes
  for (const h of history) {
    entries.push({
      id: h.id,
      date: h.changed_at,
      type: "price_change",
      data: h,
    });
  }

  // Created
  entries.push({
    id: "created",
    date: createdAt,
    type: "created",
  });

  // Sort newest first
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">İlan Geçmişi</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {viewsCount} görüntülenme
          </span>
          {isFeatured && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="size-3.5" fill="currentColor" />
              Öne Çıkan
            </span>
          )}
        </div>
      </div>

      <div className="space-y-0">
        {entries.map((entry) => {
          if (entry.type === "current_price") {
            return (
              <div key={entry.id} className="flex items-center gap-3 border-l-2 border-primary pl-4 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Minus className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(currentPrice, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">Güncel fiyat</p>
                </div>
              </div>
            );
          }

          if (entry.type === "price_change" && entry.data) {
            const d = entry.data;
            const increased = d.new_price > d.old_price;
            const pct = Math.abs(((d.new_price - d.old_price) / d.old_price) * 100).toFixed(1);
            return (
              <div key={entry.id} className="flex items-center gap-3 border-l-2 border-muted pl-4 py-2.5">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  increased ? "bg-red-50 text-red-500 dark:bg-red-950" : "bg-green-50 text-green-500 dark:bg-green-950"
                }`}>
                  {increased ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="line-through text-muted-foreground">
                      {formatPrice(d.old_price, d.currency)}
                    </span>
                    {" → "}
                    <span className="font-medium">
                      {formatPrice(d.new_price, d.currency)}
                    </span>
                    <span className={`ml-2 text-xs font-medium ${increased ? "text-red-500" : "text-green-500"}`}>
                      {increased ? "+" : "-"}{pct}%
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(d.changed_at)}
                  </p>
                </div>
              </div>
            );
          }

          if (entry.type === "created") {
            return (
              <div key={entry.id} className="flex items-center gap-3 border-l-2 border-muted pl-4 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950">
                  <CalendarPlus className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">İlan oluşturuldu</p>
                  <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
