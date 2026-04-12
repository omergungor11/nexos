"use client";

import { ScrollReveal, StaggerChildren, HoverScale, CountUp } from "./animate-wrapper";

// ---------------------------------------------------------------------------
// Re-export wrapper components that can be conditionally used in pages
// ---------------------------------------------------------------------------

export { ScrollReveal, StaggerChildren, HoverScale, CountUp };

// ---------------------------------------------------------------------------
// AnimateSection — a simple section wrapper with scroll reveal
// ---------------------------------------------------------------------------

export function AnimateSection({
  children,
  className,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
}) {
  return (
    <ScrollReveal direction={direction} delay={delay} className={className}>
      {children}
    </ScrollReveal>
  );
}

// ---------------------------------------------------------------------------
// AnimateGrid — stagger grid items entrance
// ---------------------------------------------------------------------------

export function AnimateGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <StaggerChildren className={className} staggerDelay={0.1} direction="up">
      {children}
    </StaggerChildren>
  );
}

// ---------------------------------------------------------------------------
// AnimateCard — hover lift + scale
// ---------------------------------------------------------------------------

export function AnimateCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HoverScale className={className} scale={1.02}>
      {children}
    </HoverScale>
  );
}

// ---------------------------------------------------------------------------
// StatCounter — animated stat number
// ---------------------------------------------------------------------------

export function StatCounter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  return <CountUp end={value} suffix={suffix} className={className} duration={2} />;
}
