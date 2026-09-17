"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Collision handling for HTML marker labels. Spec 034 FR-011, handoff SPECS §3a.
 *
 * MapLibre gives DOM markers no collision detection, and pins 0.004° apart still stack
 * at zoom 14. After each marker build and on `zoomend`/`moveend`, one animation frame
 * places labels greedily by priority and hides any that would touch one already
 * placed. Reads every rect first, then writes only the labels whose visibility
 * changed, so the pass never interleaves layout reads with style writes.
 */

/** 3 selected, 2 documented, 1 has records. */
export type LabelPriority = 1 | 2 | 3;

export const LABEL_PAD_X = 6;
export const LABEL_PAD_Y = 4;

export interface LabelRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface LabelCandidate {
  key: string;
  priority: LabelPriority;
  rect: LabelRect;
}

const collides = (a: LabelRect, b: LabelRect) =>
  a.left < b.right + LABEL_PAD_X &&
  b.left < a.right + LABEL_PAD_X &&
  a.top < b.bottom + LABEL_PAD_Y &&
  b.top < a.bottom + LABEL_PAD_Y;

/**
 * The keys of the labels to show, or null when the highest-priority label measures
 * nothing — the route is hidden (`display: none` under Activity), every rect is zero,
 * and deciding anything from them would hide every label.
 */
export function placeLabels(labels: LabelCandidate[]): Set<string> | null {
  // `sort` is stable, so equal priorities keep their input order.
  const ordered = [...labels].sort((a, b) => b.priority - a.priority);
  const first = ordered[0];
  if (first && first.rect.width === 0 && first.rect.height === 0) return null;

  const placed: LabelRect[] = [];
  const visible = new Set<string>();

  for (const { key, rect } of ordered) {
    // An individual empty rect is not a collision candidate; leave it be.
    if (rect.width === 0 && rect.height === 0) {
      visible.add(key);
      continue;
    }
    if (placed.some((other) => collides(rect, other))) continue;
    placed.push(rect);
    visible.add(key);
  }

  return visible;
}

interface Registered {
  el: HTMLElement;
  priority: LabelPriority;
}

type LabelRef = (el: HTMLElement | null) => void | (() => void);

export function useLabelDeclutter() {
  const registry = useRef(new Map<string, Registered>());
  const refs = useRef(new Map<string, LabelRef>());
  const frame = useRef<number | null>(null);

  const run = useCallback(() => {
    frame.current = null;
    const entries = [...registry.current];
    if (entries.length === 0) return;

    // Read
    const candidates = entries.map(([key, { el, priority }]) => ({
      key,
      priority,
      rect: el.getBoundingClientRect(),
    }));
    // Compute
    const visible = placeLabels(candidates);
    if (!visible) return;
    // Write
    for (const [key, { el }] of entries) {
      const next = visible.has(key) ? "visible" : "hidden";
      const current = el.style.visibility || "visible";
      if (current !== next) el.style.setProperty("visibility", next);
    }
  }, []);

  const scheduleDeclutter = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(run);
  }, [run]);

  /**
   * A ref callback for one label. The same key and priority always get the same
   * function, so React does not detach and reattach the label on every render. The
   * returned cleanup prunes the registry, and the cached callback, when the label
   * unmounts.
   */
  const registerLabel = useCallback(
    (key: string, priority: LabelPriority): LabelRef => {
      const id = `${priority}|${key}`;
      const cached = refs.current.get(id);
      if (cached) return cached;

      const ref: LabelRef = (el) => {
        if (!el) return;
        registry.current.set(key, { el, priority });
        return () => {
          if (registry.current.get(key)?.el === el) {
            registry.current.delete(key);
          }
          // Keys come and go as modes and loads change; keep only live callbacks.
          refs.current.delete(id);
        };
      };
      refs.current.set(id, ref);
      return ref;
    },
    []
  );

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    []
  );

  return { registerLabel, scheduleDeclutter };
}
