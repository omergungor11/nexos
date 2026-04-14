"use client";

import { useEffect } from "react";
import { trackShowcaseView } from "@/actions/showcases";

interface ViewTrackerProps {
  slug: string;
}

/**
 * Fires `increment_showcase_view` exactly once per browser session per slug.
 * Server-rendering it would let bots / Vercel prefetch inflate the counter,
 * so we keep it on the client behind a sessionStorage flag.
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `nexos:showcase-view:${slug}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void trackShowcaseView(slug);
  }, [slug]);

  return null;
}
