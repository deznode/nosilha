"use client";

import { forwardRef, type ReactNode } from "react";
import Map, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type maplibregl from "maplibre-gl";
import { MAP_CONFIG, MAP_STYLES } from "../data/constants";

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
// CARTO's font CDN (tiles.basemaps.cartocdn.com/fonts) serves glyph PBFs without
// Access-Control-Allow-Origin, so MapLibre's fetch is blocked and labels never
// render. Redirect glyph requests to the OpenMapTiles font CDN, which serves the
// same font stacks with permissive CORS. `replace` is a no-op for other URLs.
const transformCartoGlyphs = (url: string) => ({
  url: url.replace(
    "https://tiles.basemaps.cartocdn.com/fonts/",
    "https://fonts.openmaptiles.org/"
  ),
});

export const BaseMap = forwardRef<MapRef, BaseMapProps>(
  (
    {
      children,
      center = MAP_CONFIG.DEFAULT_CENTER,
      zoom = MAP_CONFIG.DEFAULT_ZOOM,
      style = MAP_STYLES.voyager,
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
