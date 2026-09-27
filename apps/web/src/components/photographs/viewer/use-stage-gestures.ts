"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Drag to step, double tap to zoom, move to pan. Spec 038 FR-025.
 *
 * Pointer events cover mouse, pen and touch alike. A drag follows the pointer with no
 * transition and steps once it is released past 60px. A tap that doesn't move (under
 * 6px) and lands within 320ms of the previous one toggles a 2.2× zoom at that point;
 * while zoomed, moving the pointer pans by moving the zoom origin.
 */

export const SWIPE_THRESHOLD = 60;
export const TAP_SLOP = 6;
export const DOUBLE_TAP_MS = 320;
export const ZOOM_SCALE = 2.2;

const CENTRE = "50% 50%";

interface PointerStart {
  x: number;
  y: number;
  moved: boolean;
}

/** `x% y%` of a point within an element, for `transform-origin`. */
export function originWithin(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number
): string {
  if (!rect.width || !rect.height) return CENTRE;
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  return `${x.toFixed(1)}% ${y.toFixed(1)}%`;
}

/** Which way a released drag steps: 1 (next), -1 (previous) or 0 (snap back). */
export function swipeDirection(dx: number): 1 | -1 | 0 {
  if (Math.abs(dx) <= SWIPE_THRESHOLD) return 0;
  return dx < 0 ? 1 : -1;
}

export function useStageGestures({
  onStep,
  onActivity,
}: {
  onStep: (dir: 1 | -1) => void;
  /** Any pointer movement over the stage: keeps full-screen chrome awake. */
  onActivity?: () => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState(CENTRE);
  const pointer = useRef<PointerStart | null>(null);
  const lastTap = useRef(0);

  const originOf = (event: React.PointerEvent<HTMLElement>) =>
    originWithin(
      event.currentTarget.getBoundingClientRect(),
      event.clientX,
      event.clientY
    );

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest?.("button, a")) return;
    pointer.current = { x: event.clientX, y: event.clientY, moved: false };
    onActivity?.();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety; the drag still works while the pointer stays inside.
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    onActivity?.();
    const start = pointer.current;
    if (zoomed) {
      setOrigin(originOf(event));
      if (start) start.moved = true;
      return;
    }
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > TAP_SLOP) start.moved = true;
    if (start.moved) {
      setDragX(dx);
      setDragging(true);
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dir = zoomed ? 0 : swipeDirection(dx);
    setDragging(false);
    if (dir !== 0) {
      // The drag offset stays until the next photograph is up, then resets with it.
      onStep(dir);
      return;
    }
    setDragX(0);
    if (!start.moved) {
      const now = Date.now();
      if (lastTap.current && now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0;
        setOrigin(originOf(event));
        setZoomed((z) => !z);
      } else {
        lastTap.current = now;
      }
    }
  };

  const onPointerCancel = () => {
    pointer.current = null;
    setDragX(0);
    setDragging(false);
  };

  /** Back to fit and centred, no drag: on every step and every restore. */
  const resetGestures = useCallback(() => {
    pointer.current = null;
    setDragX(0);
    setDragging(false);
    setZoomed(false);
    setOrigin(CENTRE);
  }, []);

  const toggleZoom = useCallback(() => {
    setOrigin(CENTRE);
    setZoomed((z) => !z);
  }, []);

  return {
    dragX,
    dragging,
    zoomed,
    origin,
    setZoomed,
    toggleZoom,
    resetGestures,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
