"use client";

import dynamic from "next/dynamic";

const ContactMap = dynamic(() => import("./contact-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full animate-pulse rounded-lg bg-muted" />
  ),
});

export function ContactMapWrapper() {
  return <ContactMap />;
}
