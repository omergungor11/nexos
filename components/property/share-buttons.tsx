"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

interface ShareTarget {
  label: string;
  getHref: (url: string, title: string) => string;
  icon: React.ReactNode;
  colorClass: string;
}

const SHARE_TARGETS: ShareTarget[] = [
  {
    label: "WhatsApp",
    getHref: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    colorClass:
      "hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30",
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 fill-current"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    getHref: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    colorClass:
      "hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30",
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 fill-current"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

const iconButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Bağlantı kopyalandı");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalama başarısız oldu");
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && Boolean(navigator.share);

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1.5", className)}>
        {canNativeShare && (
          <Tooltip>
            <TooltipTrigger
              className={cn(iconButtonClass, "hover:bg-muted hover:text-foreground")}
              onClick={handleNativeShare}
              aria-label="Paylaş"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </TooltipTrigger>
            <TooltipContent>Paylaş</TooltipContent>
          </Tooltip>
        )}

        {SHARE_TARGETS.map((target) => (
          <Tooltip key={target.label}>
            <TooltipTrigger
              render={
                <a
                  href={target.getHref(url, title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${target.label} ile paylaş`}
                />
              }
              className={cn(iconButtonClass, target.colorClass)}
            >
              {target.icon}
            </TooltipTrigger>
            <TooltipContent>{target.label}</TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger
            className={cn(
              iconButtonClass,
              "hover:bg-muted hover:text-foreground",
              copied && "text-green-600"
            )}
            onClick={handleCopyLink}
            aria-label="Bağlantıyı kopyala"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Link2 className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {copied ? "Kopyalandı!" : "Bağlantıyı kopyala"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
