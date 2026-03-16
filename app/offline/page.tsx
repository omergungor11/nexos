import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <WifiOff className="mx-auto size-16 text-muted-foreground/40" />
        <h1 className="mt-6 text-2xl font-bold">Bağlantı Yok</h1>
        <p className="mt-2 text-muted-foreground">
          İnternet bağlantınızı kontrol edip tekrar deneyin.
        </p>
      </div>
    </div>
  );
}
