import Link from "next/link";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShowcaseNotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <CalendarX className="size-7 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Teklif bulunamadı</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Bu teklif kaldırılmış, arşivlenmiş veya geçerlilik süresi dolmuş
        olabilir. Daha güncel bilgi için danışmanınızla iletişime geçebilirsiniz.
      </p>
      <Button
        render={<Link href="https://www.nexosinvestment.com" />}
        variant="outline"
        className="mt-2"
      >
        Anasayfaya dön
      </Button>
    </div>
  );
}
