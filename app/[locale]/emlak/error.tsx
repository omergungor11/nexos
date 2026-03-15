"use client";

import { useEffect } from "react";

export default function EmlakError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-bold">İlanlar yüklenemedi</h2>
      <p className="text-muted-foreground">
        İlan listesi yüklenirken bir sorun oluştu.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
