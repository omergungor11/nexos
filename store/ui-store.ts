import { create } from "zustand";

interface UIStore {
  isMobileMenuOpen: boolean;
  isFilterDrawerOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setFilterDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isMobileMenuOpen: false,
  isFilterDrawerOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setFilterDrawerOpen: (open) => set({ isFilterDrawerOpen: open }),
}));
