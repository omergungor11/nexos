"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-8" disabled>
        <Sun className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Açık tema" : "Koyu tema"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">{isDark ? "Açık temaya geç" : "Koyu temaya geç"}</span>
    </Button>
  );
}
