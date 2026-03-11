import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";

interface PriceChange {
  id: string;
  old_price: number;
  new_price: number;
  currency: string;
  changed_at: string;
}

interface PriceHistoryProps {
  history: PriceChange[];
  currentPrice: number;
  currency: string;
}

export function PriceHistory({ history, currentPrice, currency }: PriceHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Fiyat Geçmişi</h2>
      <div className="space-y-0">
        {/* Current price */}
        <div className="flex items-center gap-3 border-l-2 border-primary pl-4 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Minus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">
              {formatPrice(currentPrice, currency)}
            </p>
            <p className="text-xs text-muted-foreground">Güncel fiyat</p>
          </div>
        </div>

        {/* History entries */}
        {history.map((entry) => {
          const increased = entry.new_price > entry.old_price;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 border-l-2 border-muted pl-4 py-2"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                increased ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
              }`}>
                {increased ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm">
                  <span className="line-through text-muted-foreground">
                    {formatPrice(entry.old_price, entry.currency)}
                  </span>
                  {" → "}
                  <span className="font-medium">
                    {formatPrice(entry.new_price, entry.currency)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(entry.changed_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
