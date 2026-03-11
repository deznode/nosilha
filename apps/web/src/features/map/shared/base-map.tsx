"use client";

import { forwardRef, type ReactNode } from "react";
import Map, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type mapboxgl from "mapbox-gl";
import { env } from "@/lib/env";
import { MAP_CONFIG } from "../data/constants";

export interface BaseMapProps {
  children?: ReactNode;
  center?: { lng: number; lat: number };
  zoom?: number;
  style?: string;
  onMove?: (evt: ViewStateChangeEvent) => void;
  onLoad?: () => void;
  onError?: (event: mapboxgl.ErrorEvent) => void;
  onClick?: (event: mapboxgl.MapLayerMouseEvent) => void;
  interactiveLayerIds?: string[];
  /** Additional props to spread onto the react-map-gl Map component */
  mapProps?: Record<string, unknown>;
}

/**
 * Thin wrapper around react-map-gl Map with Mapbox token, default center/zoom,
 * CSS import, and ref forwarding.
 *
 * Error and loading states are the consumer's responsibility.
 */
export const BaseMap = forwardRef<MapRef, BaseMapProps>(
  (
    {
      children,
      center = MAP_CONFIG.DEFAULT_CENTER,
      zoom = MAP_CONFIG.DEFAULT_ZOOM,
      style = "mapbox://styles/mapbox/light-v11",
      onMove,
      onLoad,
      onError,
      onClick,
      interactiveLayerIds,
      mapProps,
    },
    ref
  ) => {
    return (
      <Map
        ref={ref}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom,
          pitch: MAP_CONFIG.PITCH_2D,
          bearing: MAP_CONFIG.DEFAULT_BEARING,
        }}
        mapStyle={style}
        mapboxAccessToken={env.mapboxAccessToken}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        onMove={onMove}
        onLoad={onLoad}
        onError={onError}
        onClick={onClick}
        interactiveLayerIds={interactiveLayerIds}
        {...mapProps}
      >
        {children}
      </Map>
    );
  }
);
BaseMap.displayName = "BaseMap";
