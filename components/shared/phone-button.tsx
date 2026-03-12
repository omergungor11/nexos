"use client";

import { Phone } from "lucide-react";

export function PhoneButton() {
  const phoneNumber = "+905551234567";

  return (
    <a
      href={`tel:${phoneNumber}`}
      className="fixed bottom-22 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
      aria-label="Bizi arayın"
    >
      <Phone className="h-6 w-6" />
    </a>
  );
}
