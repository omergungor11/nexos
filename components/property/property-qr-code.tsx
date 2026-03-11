"use client";

import { useEffect, useRef } from "react";

interface PropertyQrCodeProps {
  url: string;
  size?: number;
}

export function PropertyQrCode({ url, size = 128 }: PropertyQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Use a simple QR code via a Google Charts API image
    // This avoids adding a QR library dependency
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=png`;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
      }
    };
  }, [url, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-lg border bg-white"
      />
      <p className="text-xs text-muted-foreground">QR kodu okutarak ilana ulaşın</p>
    </div>
  );
}
