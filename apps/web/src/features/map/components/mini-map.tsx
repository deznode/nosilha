"use client";

import dynamic from "next/dynamic";

import type { DocumentationStatus } from "@/lib/status";

/**
 * A small, non-interactive map showing where one thing is. Spec 034 T-24.
 *
 * Every handler is off: this is a locator, not something to explore — the full map at
 * `/map` is one click away, and a mini-map that pans inside a scrolling page steals
 * the scroll. The marker reads its colour from the one status table (FR-002), so the
 * settlement dot, the record dot and the pins on `/map` cannot disagree.
 */

export interface MiniMapProps {
  lat: number;
  lng: number;
  /** Defaults to a close-in view: a locator, not an overview. */
  zoom?: number;
  status: DocumentationStatus;
  /** Rendered height in pixels. */
  height?: number;
}

const DEFAULT_HEIGHT = 160;

/**
 * Split into its own chunk: MapLibre and the shared map wrappers are a large
 * dependency for a component most pages embed below the fold.
 */
const LazyCanvas = dynamic(
  () => import("./mini-map-canvas").then((mod) => mod.MiniMapCanvas),
  {
    ssr: false,
    // The parent already holds the height open, so the placeholder just fills it and
    // the page never jumps when the map arrives.
    loading: () => (
      <div className="h-full w-full" style={{ background: "var(--muted)" }} />
    ),
  }
);

/**
 * The public component: a sized, bordered box that holds its height open while the
 * map loads.
 */
export function MiniMap({
  lat,
  lng,
  zoom,
  status,
  height = DEFAULT_HEIGHT,
}: MiniMapProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ height, borderColor: "var(--border-subtle)" }}
    >
      <LazyCanvas lat={lat} lng={lng} zoom={zoom} status={status} />
    </div>
  );
}

export default MiniMap;
