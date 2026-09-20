"use client";

import { Marker } from "react-map-gl/maplibre";

import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { statusTint, statusVar, type DocumentationStatus } from "@/lib/status";
import { BaseMap } from "../shared";
import { MAP_STYLES } from "../data/constants";

/**
 * The mini-map's actual map, sized by its parent. Spec 034 T-24.
 *
 * Its own module so `mini-map.tsx` can `dynamic()` it into a separate chunk: when both
 * lived in one file, page code importing `MiniMap` already pulled `react-map-gl` and
 * `../shared` into the parent graph, so the dynamic boundary split nothing.
 */

export interface MiniMapCanvasProps {
  lat: number;
  lng: number;
  /** Defaults to a close-in view: a locator, not an overview. */
  zoom?: number;
  status: DocumentationStatus;
}

export const DEFAULT_ZOOM = 13;

/** Every map handler this component turns off, plus the attribution it hides. */
const NON_INTERACTIVE = {
  interactive: false,
  dragPan: false,
  dragRotate: false,
  scrollZoom: false,
  boxZoom: false,
  doubleClickZoom: false,
  keyboard: false,
  touchZoomRotate: false,
  attributionControl: false,
} as const;

export function MiniMapCanvas({
  lat,
  lng,
  zoom = DEFAULT_ZOOM,
  status,
}: MiniMapCanvasProps) {
  const resolvedTheme = useResolvedTheme();
  const style =
    resolvedTheme === "dark" ? MAP_STYLES.darkMatter : MAP_STYLES.positron;

  return (
    /*
      Keyed on the resolved theme so a switch rebuilds the map rather than restyling
      it. MapLibre's setStyle drops layers the new style does not declare, and the two
      CARTO styles do not share a layer set.
    */
    <div
      key={resolvedTheme}
      data-theme-key={resolvedTheme}
      // `relative` is load-bearing: `BaseMap` renders `position: absolute; inset: 0`,
      // which resolves against the nearest positioned ancestor. Without one the map
      // sizes itself to the viewport, and the sized box's `overflow-hidden` cannot
      // clip it, because clipping only applies to descendants whose containing block
      // is inside the clipper.
      className="relative h-full w-full"
    >
      <BaseMap
        center={{ lat, lng }}
        zoom={zoom}
        style={style}
        mapProps={NON_INTERACTIVE}
      >
        <Marker latitude={lat} longitude={lng}>
          <div
            data-testid="mini-map-marker"
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: statusVar(status),
              border: "3px solid var(--background)",
              boxShadow: `0 0 0 4px ${statusTint(status, 30)}`,
            }}
          />
        </Marker>
      </BaseMap>
    </div>
  );
}
