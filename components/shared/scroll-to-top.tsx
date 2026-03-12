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
      className="fixed bottom-38 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Sayfanın başına dön"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
