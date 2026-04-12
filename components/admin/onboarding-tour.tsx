"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  ImageIcon,
  Map,
  Command,
  HelpCircle,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Tour steps
// ---------------------------------------------------------------------------

interface TourStep {
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    icon: Rocket,
    title: "Nexos Admin'e Hoş Geldiniz!",
    description:
      "Bu tur size admin panelinin temel özelliklerini tanıtacak. İstediğiniz zaman \"İleri\" ile devam edebilir veya turu kapatabilirsiniz.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Giriş sayfanız. Aktif ilan sayısı, yeni talepler, görüntülenme verileri ve hızlı aksiyonlar burada. Her şeye genel bir bakış.",
  },
  {
    icon: Building2,
    title: "İlan Yönetimi",
    description:
      "Yeni ilan oluşturun, mevcut ilanları düzenleyin, görselleri yönetin. İlanları haritada göstermek için harita yönetimi sayfasını kullanabilirsiniz.",
  },
  {
    icon: FolderKanban,
    title: "Proje Yönetimi",
    description:
      "Büyük ölçekli konut projelerini ekleyin ve yönetin. Galeri, özellikler, konum bilgileri ve fiyat detaylarını tek formdan düzenleyin.",
  },
  {
    icon: ImageIcon,
    title: "Galeri & Medya",
    description:
      "Tüm görselleri tek yerden yönetin. Görseller otomatik olarak WebP formatına sıkıştırılır. Sürükle-bırak ile toplu yükleme yapabilirsiniz.",
  },
  {
    icon: Map,
    title: "Harita Yönetimi",
    description:
      "İlanların haritada görünüp görünmeyeceğini kontrol edin. Toplu seçim ile birden fazla ilanı aynı anda haritaya ekleyin veya kaldırın.",
  },
  {
    icon: Command,
    title: "Komut Paleti (⌘K)",
    description:
      "Herhangi bir sayfadayken ⌘K (Mac) veya Ctrl+K (Windows) ile hızlı navigasyon yapabilirsiniz. Sayfalar arasında anında geçiş.",
  },
  {
    icon: HelpCircle,
    title: "Yardım Her Zaman Yanınızda",
    description:
      "Üst menüdeki \"?\" butonundan yardım sayfasına ulaşabilir veya bu turu tekrar başlatabilirsiniz. İyi çalışmalar!",
  },
];

const STORAGE_KEY = "nexos_onboarding_done";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OnboardingTourProps {
  autoStart?: boolean;
}

export function OnboardingTour({ autoStart = false }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (autoStart) {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // Small delay so the page renders first
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [autoStart]);

  const close = useCallback(() => {
    setIsOpen(false);
    setStep(0);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      close();
    }
  }, [step, close]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, next, prev, close]);

  // Public method to start tour
  function start() {
    setStep(0);
    setIsOpen(true);
  }

  // Expose start method via ref or global
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__startOnboardingTour = start;
    return () => {
      delete (window as unknown as Record<string, unknown>).__startOnboardingTour;
    };
  });

  if (!isOpen) return null;

  const current = STEPS[step];
  const StepIcon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="px-6 pt-5">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <StepIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{current.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {current.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-xs text-muted-foreground">
              {step + 1} / {STEPS.length}
            </div>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={prev}>
                  Geri
                </Button>
              )}
              {step === 0 && (
                <Button variant="ghost" size="sm" onClick={close}>
                  Atla
                </Button>
              )}
              <Button size="sm" onClick={next}>
                {isLast ? "Turu Bitir" : "İleri"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
