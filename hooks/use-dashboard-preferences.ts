"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

export interface DashboardPreferences {
  showKpis: boolean;
  showCharts: boolean;
  showRecentRequests: boolean;
  showRecentProperties: boolean;
  showActivityFeed: boolean;
  showQuickActions: boolean;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  showKpis: true,
  showCharts: true,
  showRecentRequests: true,
  showRecentProperties: true,
  showActivityFeed: true,
  showQuickActions: true,
};

const STORAGE_KEY = "nexos-dashboard-prefs";

function readStoredPreferences(): DashboardPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_PREFERENCES;
}

const subscribe = () => () => {};

export function useDashboardPreferences() {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const [preferences, setPreferences] = useState<DashboardPreferences>(() =>
    typeof window !== "undefined" ? readStoredPreferences() : DEFAULT_PREFERENCES
  );
  const loaded = isClient;

  const updatePreferences = useCallback((updates: Partial<DashboardPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { preferences, updatePreferences, resetPreferences, loaded };
}
