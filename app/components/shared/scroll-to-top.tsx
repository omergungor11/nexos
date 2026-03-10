"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const SCROLL_THRESHOLD = 400;

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-background border border-border text-foreground shadow-md transition-all hover:scale-110 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Sayfanın başına dön"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
