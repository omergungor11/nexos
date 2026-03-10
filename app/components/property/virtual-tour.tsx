"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VirtualTourProps {
  tourUrl?: string;
  className?: string;
}

type EmbedType = "youtube" | "matterport" | "generic";

interface EmbedConfig {
  type: EmbedType;
  src: string;
}

function extractYouTubeId(url: string): string | null {
  // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/watch\?.*v=([^&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function resolveEmbed(url: string): EmbedConfig {
  if (/youtu\.be|youtube\.com/.test(url)) {
    const videoId = extractYouTubeId(url);
    const src = videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
      : url;
    return { type: "youtube", src };
  }

  if (/matterport\.com/.test(url)) {
    return { type: "matterport", src: url };
  }

  return { type: "generic", src: url };
}

export function VirtualTour({ tourUrl, className }: VirtualTourProps) {
  const [activated, setActivated] = useState(false);

  if (!tourUrl) return null;

  const embed = resolveEmbed(tourUrl);

  // For YouTube, use a click-to-load pattern to avoid loading the iframe eagerly
  const isYouTube = embed.type === "youtube";

  // Extract YouTube video ID for thumbnail
  const youtubeId = isYouTube ? extractYouTubeId(tourUrl) : null;
  const youtubeThumbnail = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : null;

  return (
    <section className={cn("space-y-3", className)}>
      <h2 className="text-lg font-semibold">Sanal Tur</h2>

      <div className="relative w-full overflow-hidden rounded-xl bg-muted" style={{ aspectRatio: "16/9" }}>
        {/* YouTube: show thumbnail + play button until user clicks */}
        {isYouTube && !activated ? (
          <button
            type="button"
            onClick={() => setActivated(true)}
            className="group absolute inset-0 flex items-center justify-center w-full h-full"
            aria-label="Sanal turu oynat"
          >
            {youtubeThumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={youtubeThumbnail}
                alt="Sanal tur önizlemesi"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-black/80 text-white shadow-lg transition-transform group-hover:scale-110 group-focus-visible:scale-110">
              <Play className="size-7 translate-x-0.5 fill-current" />
            </div>
            <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/30" />
          </button>
        ) : (
          <>
            {/* Loading skeleton shown while iframe loads */}
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">Yükleniyor...</span>
              </div>
            </div>

            <iframe
              src={embed.src}
              title="Sanal tur"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
              allowFullScreen
              className="absolute inset-0 z-10 h-full w-full border-0"
              loading="lazy"
            />
          </>
        )}
      </div>

      {embed.type === "matterport" && (
        <p className="text-xs text-muted-foreground">
          360 derece sanal tur — Matterport ile desteklenmektedir.
        </p>
      )}
    </section>
  );
}
