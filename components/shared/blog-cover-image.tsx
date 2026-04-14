"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  sizes?: string;
}

/**
 * Blog post cover image with graceful fallback.
 * External URLs (e.g. Unsplash seed images) can 404 over time; when they do
 * we swap in the house "Nexos N" placeholder instead of breaking the card.
 */
export function BlogCoverImage({ src, alt, sizes }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl font-bold text-primary">N</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Nexos Investment</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
      onError={() => setFailed(true)}
    />
  );
}
