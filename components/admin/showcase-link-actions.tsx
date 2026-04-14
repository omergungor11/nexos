"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, buildShowcaseMessage } from "@/lib/whatsapp";

interface ShowcaseLinkActionsProps {
  slug: string;
  customerName: string;
  customerPhone: string;
  title: string;
  agentName?: string | null;
  size?: "sm" | "default";
  showLabels?: boolean;
}

export function ShowcaseLinkActions({
  slug,
  customerName,
  customerPhone,
  title,
  agentName,
  size = "sm",
  showLabels = true,
}: ShowcaseLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/teklif/${slug}`
      : `/teklif/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link kopyalandı");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Link kopyalanamadı");
    }
  };

  const handleWhatsApp = () => {
    const message = buildShowcaseMessage({
      customerName,
      title,
      url,
      agentName,
    });
    const waUrl = buildWhatsAppUrl({ phone: customerPhone, text: message });
    if (!waUrl) {
      toast.error("Telefon numarası geçersiz");
      return;
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={handleCopy}
        className="gap-1.5"
      >
        {copied ? (
          <Check className="size-3.5 text-green-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {showLabels && <span>Link</span>}
      </Button>
      <Button
        type="button"
        size={size}
        onClick={handleWhatsApp}
        className="gap-1.5 bg-[#25D366] text-white hover:bg-[#1ea952]"
      >
        <MessageCircle className="size-3.5" />
        {showLabels && <span>WhatsApp</span>}
      </Button>
    </div>
  );
}
