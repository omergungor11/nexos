interface PropertyQrCodeProps {
  url: string;
  size?: number;
}

export function PropertyQrCode({ url, size = 150 }: PropertyQrCodeProps) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=png&margin=8`;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrSrc}
        alt="QR Kod"
        width={size}
        height={size}
        className="rounded-lg border bg-white"
      />
      <p className="text-xs text-muted-foreground">QR kodu okutarak ilana ulaşın</p>
    </div>
  );
}
