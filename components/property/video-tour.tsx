interface VideoTourProps {
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function isMatterportUrl(url: string): boolean {
  return url.includes("matterport.com") || url.includes("my.matterport.com");
}

export function VideoTour({ videoUrl, virtualTourUrl }: VideoTourProps) {
  const hasVideo = videoUrl && videoUrl.trim().length > 0;
  const hasTour = virtualTourUrl && virtualTourUrl.trim().length > 0;

  if (!hasVideo && !hasTour) return null;

  const youtubeEmbed = hasVideo ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="space-y-4">
      {/* Video */}
      {youtubeEmbed && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Video</h2>
          <div className="relative aspect-video overflow-hidden rounded-lg border">
            <iframe
              src={youtubeEmbed}
              title="İlan videosu"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}

      {/* 3D Virtual Tour */}
      {hasTour && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">3D Sanal Tur</h2>
          {isMatterportUrl(virtualTourUrl) ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border">
              <iframe
                src={virtualTourUrl}
                title="3D Sanal Tur"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : (
            <a
              href={virtualTourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Sanal Turu Görüntüle
            </a>
          )}
        </div>
      )}
    </div>
  );
}
