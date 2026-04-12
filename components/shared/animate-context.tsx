"use client";

import { createContext, useContext } from "react";

const AnimateUIContext = createContext(false);

export function AnimateUIProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimateUIContext.Provider value={enabled}>
      {children}
    </AnimateUIContext.Provider>
  );
}

export function useAnimateUI() {
  return useContext(AnimateUIContext);
}
