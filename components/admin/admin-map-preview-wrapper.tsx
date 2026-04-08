"use client";

import dynamic from "next/dynamic";

const AdminMapPreview = dynamic(() => import("./admin-map-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] w-full items-center justify-center rounded-lg border bg-muted">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

interface AdminMapPreviewWrapperProps {
  properties: Array<{ id: string; lat: number; lng: number; title: string }>;
}

export function AdminMapPreviewWrapper({ properties }: AdminMapPreviewWrapperProps) {
  return <AdminMapPreview properties={properties} />;
}
