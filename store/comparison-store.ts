import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PropertyListItem } from "@/types";

interface ComparisonStore {
  items: PropertyListItem[];
  addItem: (item: PropertyListItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  isInComparison: (id: string) => boolean;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        if (items.length >= 4) return;
        if (items.some((i) => i.id === item.id)) return;
        set({ items: [...items, item] });
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      clear: () => set({ items: [] }),
      isInComparison: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "nexos-comparison" }
  )
);
