"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";

// ---------------------------------------------------------------------------
// ScrollReveal — reveals content when scrolled into view
// ---------------------------------------------------------------------------

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });

  const directionMap = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// StaggerChildren — staggers child element animations
// ---------------------------------------------------------------------------

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "left" | "none";
  once?: boolean;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.08,
  direction = "up",
  once = true,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0.1 });

  const dirMap = {
    up: { y: 30 },
    left: { x: 30 },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, ...dirMap[direction] },
                visible: {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  transition: { delay: i * staggerDelay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HoverScale — scales up on hover with spring
// ---------------------------------------------------------------------------

interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({ children, className, scale = 1.03 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// TextReveal — reveals text word by word or character by character
// ---------------------------------------------------------------------------

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  mode?: "word" | "char";
}

export function TextReveal({
  text,
  className,
  delay = 0,
  mode = "word",
}: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const parts = mode === "word" ? text.split(" ") : text.split("");
  const separator = mode === "word" ? " " : "";

  return (
    <span ref={ref} className={className}>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: delay + i * 0.04,
            duration: 0.4,
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {part}{separator}
        </motion.span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CountUp — animated number counter
// ---------------------------------------------------------------------------

interface CountUpProps {
  end: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function CountUp({ end, suffix = "", className, duration = 2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {display}{suffix}
    </span>
  );
}
