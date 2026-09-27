"use client";

import { useRef, useState, type RefObject } from "react";

/** Travel, in pixels, past which a released drag moves the sheet. */
const DRAG_THRESHOLD = 40;
/** Movement under this is a tap, not a drag. */
const DRAG_SLOP = 4;

interface DragStart {
  id: number;
  y: number;
  height: number;
  max: number;
  moved: boolean;
}

interface UseSheetDragOptions {
  sheetRef: RefObject<HTMLElement | null>;
  /** The tallest the sheet follows a finger to, as a share of its container. */
  maxShare: number;
  /** A release after dragging up past the threshold. */
  onUp: () => void;
  /** A release after dragging down past the threshold. */
  onDown: () => void;
}

/**
 * Drags the bottom sheet by its handle: the sheet follows the finger, and a release
 * past the threshold settles it up or down. Pointer events cover touch and mouse
 * alike. Spec 039 (M5).
 *
 * A drag can end in a click on the handle; the handlers swallow that one, so a
 * button handle does not also act on it.
 */
export function useSheetDrag({
  sheetRef,
  maxShare,
  onUp,
  onDown,
}: UseSheetDragOptions) {
  const start = useRef<DragStart | null>(null);
  const dragged = useRef(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    dragged.current = false;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const container = sheet.parentElement?.clientHeight ?? window.innerHeight;
    start.current = {
      id: event.pointerId,
      y: event.clientY,
      height: sheet.getBoundingClientRect().height,
      max: container * maxShare,
      moved: false,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety; the drag still works while the pointer stays inside.
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s || event.pointerId !== s.id) return;
    const dy = event.clientY - s.y;
    if (!s.moved && Math.abs(dy) <= DRAG_SLOP) return;
    s.moved = true;
    setDragHeight(Math.min(Math.max(s.height - dy, 0), s.max));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s || event.pointerId !== s.id) return;
    start.current = null;
    setDragHeight(null);
    if (!s.moved) return;
    dragged.current = true;
    const dy = event.clientY - s.y;
    if (dy <= -DRAG_THRESHOLD) onUp();
    else if (dy >= DRAG_THRESHOLD) onDown();
  };

  const onPointerCancel = () => {
    start.current = null;
    setDragHeight(null);
  };

  const onClickCapture = (event: React.MouseEvent<HTMLElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    event.stopPropagation();
  };

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
    },
    dragHeight,
  };
}
