"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import type { DashboardPreferences } from "@/hooks/use-dashboard-preferences";

interface DashboardCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: DashboardPreferences;
  onUpdate: (updates: Partial<DashboardPreferences>) => void;
  onReset: () => void;
}

const SECTIONS: Array<{ key: keyof DashboardPreferences; label: string }> = [
  { key: "showKpis", label: "KPI Kartları" },
  { key: "showQuickActions", label: "Hızlı Aksiyonlar" },
  { key: "showCharts", label: "Grafikler" },
  { key: "showRecentRequests", label: "Son Talepler" },
  { key: "showRecentProperties", label: "Son İlanlar" },
  { key: "showActivityFeed", label: "Aktivite Akışı" },
];

export function DashboardCustomizeDialog({
  open,
  onOpenChange,
  preferences,
  onUpdate,
  onReset,
}: DashboardCustomizeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Dashboard Özelleştir</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="flex items-center justify-between"
            >
              <label
                htmlFor={section.key}
                className="cursor-pointer text-sm font-medium"
              >
                {section.label}
              </label>
              <Switch
                id={section.key}
                checked={preferences[section.key]}
                onCheckedChange={(checked) =>
                  onUpdate({ [section.key]: checked })
                }
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" size="sm" onClick={onReset}>
            Varsayılana Dön
          </Button>
          <DialogClose render={<Button size="sm" />}>
            Tamam
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
