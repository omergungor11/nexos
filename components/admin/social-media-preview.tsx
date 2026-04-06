"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialMediaPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  generated: boolean;
}

type PreviewMode = "ig-mobile" | "ig-desktop" | "fb-mobile" | "fb-desktop";

const PREVIEW_CONFIGS: { id: PreviewMode; label: string; platform: string; device: string }[] = [
  { id: "ig-mobile", label: "Instagram Mobil", platform: "instagram", device: "mobile" },
  { id: "ig-desktop", label: "Instagram Desktop", platform: "instagram", device: "desktop" },
  { id: "fb-mobile", label: "Facebook Mobil", platform: "facebook", device: "mobile" },
  { id: "fb-desktop", label: "Facebook Desktop", platform: "facebook", device: "desktop" },
];

export function SocialMediaPreview({ canvasRef, generated }: SocialMediaPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("ig-mobile");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (generated && canvasRef.current) {
      setDataUrl(canvasRef.current.toDataURL("image/png"));
    } else {
      setDataUrl("");
    }
  }, [generated, canvasRef]);

  if (!generated || !dataUrl) return null;

  const config = PREVIEW_CONFIGS.find((c) => c.id === mode)!;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Önizleme</h3>
        <div className="flex gap-1">
          {PREVIEW_CONFIGS.map((c) => (
            <Button
              key={c.id}
              variant={mode === c.id ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setMode(c.id)}
            >
              {c.device === "mobile" ? <Smartphone className="size-3" /> : <Monitor className="size-3" />}
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
        {/* Instagram Mobile */}
        {mode === "ig-mobile" && (
          <div className="w-[320px] rounded-2xl border bg-white shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <div className="size-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500" />
              <div>
                <p className="text-xs font-semibold text-black">nexosinvestment</p>
                <p className="text-[10px] text-gray-500">Girne, Kuzey Kıbrıs</p>
              </div>
            </div>
            {/* Image — full width, 4:5 */}
            <div className="relative w-full" style={{ aspectRatio: "4/5" }}>
              <img src={dataUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            {/* Actions */}
            <div className="flex items-center gap-4 px-3 py-2">
              <svg className="size-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <svg className="size-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <svg className="size-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </div>
            <div className="px-3 pb-3">
              <p className="text-xs text-black"><span className="font-semibold">nexosinvestment</span> Detaylı bilgi için bize ulaşın.</p>
            </div>
          </div>
        )}

        {/* Instagram Desktop */}
        {mode === "ig-desktop" && (
          <div className="flex w-[560px] rounded-lg border bg-white shadow-lg overflow-hidden">
            {/* Left — image */}
            <div className="relative w-[340px] shrink-0 bg-black" style={{ aspectRatio: "4/5" }}>
              <img src={dataUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
            </div>
            {/* Right — comments */}
            <div className="flex flex-col w-full border-l">
              <div className="flex items-center gap-2 px-3 py-3 border-b">
                <div className="size-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500" />
                <p className="text-xs font-semibold text-black">nexosinvestment</p>
              </div>
              <div className="flex-1 px-3 py-3">
                <p className="text-xs text-black"><span className="font-semibold">nexosinvestment</span> Kuzey Kıbrıs&apos;ta gayrimenkul yatırımı</p>
              </div>
              <div className="border-t px-3 py-2">
                <p className="text-[10px] text-gray-400">2 SANİYE ÖNCE</p>
              </div>
            </div>
          </div>
        )}

        {/* Facebook Mobile */}
        {mode === "fb-mobile" && (
          <div className="w-[320px] rounded-xl border bg-white shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-black">Nexos Investment</p>
                <p className="text-[10px] text-gray-500">Şimdi · 🌐</p>
              </div>
            </div>
            <div className="px-3 pb-2">
              <p className="text-xs text-black">Kuzey Kıbrıs&apos;ta hayalinizdeki mülkü bulun 🏠</p>
            </div>
            {/* Image — Facebook crops to ~1:1 from center */}
            <div className="relative w-full bg-gray-100" style={{ aspectRatio: "1/1" }}>
              <img src={dataUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center center" }} />
            </div>
            {/* Reactions */}
            <div className="flex items-center justify-between px-3 py-2 border-t">
              <div className="flex items-center gap-1">
                <span className="text-xs">👍</span>
                <span className="text-[10px] text-gray-500">24</span>
              </div>
              <div className="flex gap-3 text-[10px] text-gray-500">
                <span>5 yorum</span>
                <span>3 paylaşım</span>
              </div>
            </div>
            <div className="flex border-t">
              {["👍 Beğen", "💬 Yorum", "↗ Paylaş"].map((a) => (
                <button key={a} className="flex-1 py-2 text-center text-[11px] font-medium text-gray-600 hover:bg-gray-50">{a}</button>
              ))}
            </div>
          </div>
        )}

        {/* Facebook Desktop */}
        {mode === "fb-desktop" && (
          <div className="w-[500px] rounded-lg border bg-white shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Nexos Investment</p>
                <p className="text-xs text-gray-500">Şimdi · 🌐</p>
              </div>
            </div>
            <div className="px-4 pb-2">
              <p className="text-sm text-black">Kuzey Kıbrıs&apos;ta hayalinizdeki mülkü bulun 🏠</p>
            </div>
            {/* Image — Facebook feed crop ~1.91:1 on desktop */}
            <div className="relative w-full bg-gray-100" style={{ aspectRatio: "1.91/1" }}>
              <img src={dataUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center center" }} />
            </div>
            {/* Reactions */}
            <div className="flex items-center justify-between px-4 py-2 border-t">
              <div className="flex items-center gap-1">
                <span>👍</span>
                <span className="text-xs text-gray-500">24</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>5 yorum</span>
                <span>3 paylaşım</span>
              </div>
            </div>
            <div className="flex border-t">
              {["👍 Beğen", "💬 Yorum Yap", "↗ Paylaş"].map((a) => (
                <button key={a} className="flex-1 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-50">{a}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
