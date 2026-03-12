"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const COOKIE_CONSENT_KEY = "nexos_cookie_consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("cookie");

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-gray-900/95 px-4 py-4 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-200 leading-relaxed">
          {t("message")}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={"/gizlilik" as never}
            className="text-sm text-gray-400 underline underline-offset-2 hover:text-white transition-colors"
          >
            {t("moreInfo")}
          </Link>
          <button
            onClick={handleAccept}
            className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
