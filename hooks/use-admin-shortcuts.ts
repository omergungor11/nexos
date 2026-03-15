"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAdminShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // N → New property (only on ilanlar page)
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && pathname === "/admin/ilanlar") {
        e.preventDefault();
        router.push("/admin/ilanlar/yeni");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);
}
