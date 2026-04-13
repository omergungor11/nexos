"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  total: number;
  /** Swipe threshold in px before we commit to a direction. */
  threshold?: number;
}

/**
 * Controls sliding an inline image preview inside a card:
 *  - index state with next/prev/goTo
 *  - pointer handlers for touch swipe + desktop drag
 *  - keyboard handlers for left/right arrow keys
 *
 * The returned `isDragging` flag is used by the parent to suppress the
 * card's click-through link so a swipe doesn't accidentally navigate.
 */
export function useCardImagePreview({ total, threshold = 10 }: Options) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const movedX = useRef(0);
  const pointerId = useRef<number | null>(null);

  // Reset if the image list changes length (e.g. navigating between routes)
  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [total, index]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(total, 1));
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + Math.max(total, 1)) % Math.max(total, 1));
  }, [total]);

  const goTo = useCallback(
    (i: number) => {
      if (i >= 0 && i < total) setIndex(i);
    },
    [total]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (total <= 1) return;
      startX.current = e.clientX;
      movedX.current = 0;
      pointerId.current = e.pointerId;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [total]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (startX.current == null) return;
      movedX.current = e.clientX - startX.current;
      if (Math.abs(movedX.current) > threshold && !isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging, threshold]
  );

  const finish = useCallback(() => {
    if (Math.abs(movedX.current) > 40) {
      if (movedX.current < 0) next();
      else prev();
    }
    startX.current = null;
    movedX.current = 0;
    pointerId.current = null;
    // Defer clearing isDragging so the card's onClick handler can check it
    // synchronously and suppress navigation on the same tick.
    setTimeout(() => setIsDragging(false), 0);
  }, [next, prev]);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current !== null) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(pointerId.current);
        } catch {
          // pointer already released
        }
      }
      finish();
    },
    [finish]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (total <= 1) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    },
    [next, prev, total]
  );

  return {
    index,
    isDragging,
    next,
    prev,
    goTo,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    onKeyDown,
  };
}
