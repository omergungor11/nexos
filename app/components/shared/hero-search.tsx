"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";

export function HeroSearch() {
  const router = useRouter();
  const [islem, setIslem] = useState<string>("satilik");
  const [tip, setTip] = useState<string>("");
  const [sehir, setSehir] = useState<string>("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (islem) params.set("islem", islem);
    if (tip) params.set("tip", tip);
    if (sehir) params.set("sehir", sehir);
    router.push(`/emlak?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-3xl rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:p-6">
      {/* Transaction Type Tabs */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={islem === "satilik" ? "default" : "outline"}
          size="sm"
          onClick={() => setIslem("satilik")}
        >
          Satılık
        </Button>
        <Button
          variant={islem === "kiralik" ? "default" : "outline"}
          size="sm"
          onClick={() => setIslem("kiralik")}
        >
          Kiralık
        </Button>
      </div>

      {/* Search Fields */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={tip} onValueChange={(v) => setTip(v ?? "")}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Emlak Tipi" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Şehir, ilçe veya mahalle ara..."
          value={sehir}
          onChange={(e) => setSehir(e.target.value)}
          className="flex-1"
        />

        <Button onClick={handleSearch} className="gap-2">
          <Search className="h-4 w-4" />
          Ara
        </Button>
      </div>
    </div>
  );
}
