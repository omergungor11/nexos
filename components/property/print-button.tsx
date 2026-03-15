"use client";

import { Printer } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PrintButtonProps {
  propertySlug: string;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PrintButton({ propertySlug, className }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print-specific styles injected into the document */}
      <style>{`
        @media print {
          /* Hide navigation and interactive chrome */
          header,
          footer,
          nav,
          [data-print="hidden"],
          .print\\:hidden {
            display: none !important;
          }

          /* Hide floating / sticky elements */
          [class*="whatsapp"],
          [class*="scroll-to-top"],
          [aria-label="Yukarı çık"],
          [aria-label="WhatsApp"] {
            display: none !important;
          }

          /* Remove page gutters and let content breathe */
          body {
            margin: 0;
            padding: 0;
            font-size: 12pt;
            color: #000;
            background: #fff;
          }

          /* Ensure the main container uses full width */
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }

          /* Stack the sidebar column below main content */
          .lg\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
          }

          /* Property images: cap height so they don't bleed across pages */
          img {
            max-height: 300px;
            object-fit: cover;
            page-break-inside: avoid;
          }

          /* Avoid orphaned cards and spec items */
          .rounded-lg,
          .rounded-xl,
          section {
            page-break-inside: avoid;
          }

          /* Suppress shadows */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          @page {
            margin: 1.5cm;
          }
        }
      `}</style>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={handlePrint}
            aria-label="İlanı yazdır"
            data-print="hidden"
            className={[
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Printer className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Yazdır</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
