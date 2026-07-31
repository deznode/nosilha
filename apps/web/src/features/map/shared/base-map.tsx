"use client";

import { forwardRef, type ReactNode } from "react";
import Map, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type maplibregl from "maplibre-gl";
import { MAP_CONFIG } from "../data/constants";

export interface BaseMapProps {
  children?: ReactNode;
  center?: { lng: number; lat: number };
  zoom?: number;
  style?: string;
  onMove?: (evt: ViewStateChangeEvent) => void;
  onLoad?: () => void;
  onError?: (event: maplibregl.ErrorEvent) => void;
  onClick?: (event: maplibregl.MapLayerMouseEvent) => void;
  interactiveLayerIds?: string[];
  /** Additional props to spread onto the react-map-gl Map component */
  mapProps?: Record<string, unknown>;
}

/**
 * Wrapper around react-map-gl/maplibre with MapLibre GL JS, default center/zoom,
 * open tile style (CARTO Voyager), CSS import, and ref forwarding.
 */
const transformCartoGlyphs = (url: string, resourceType?: string) => {
  if (
    resourceType === "Glyphs" ||
    url.includes("tiles.basemaps.cartocdn.com/fonts/")
  ) {
    return {
      url: url.replace(
        "https://tiles.basemaps.cartocdn.com/fonts/",
        "https://fonts.openmaptiles.org/"
      ),
    };
  }
  return { url };
};

export const BaseMap = forwardRef<MapRef, BaseMapProps>(
  (
    {
      children,
      center = MAP_CONFIG.DEFAULT_CENTER,
      zoom = MAP_CONFIG.DEFAULT_ZOOM,
      style = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
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
        transformRequest={transformCartoGlyphs}
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
