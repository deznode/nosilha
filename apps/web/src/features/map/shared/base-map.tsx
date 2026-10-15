"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import Map, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import { MAP_CONFIG, MAP_STYLES } from "../data/constants";

export interface BaseMapProps {
  children?: ReactNode;
  center?: { lng: number; lat: number };
  zoom?: number;
  /** A style URL, or an inline style such as the satellite raster. */
  style?: string | StyleSpecification;
  onMove?: (evt: ViewStateChangeEvent) => void;
  onLoad?: () => void;
  onError?: (event: maplibregl.ErrorEvent) => void;
  onClick?: (event: maplibregl.MapLayerMouseEvent) => void;
  interactiveLayerIds?: string[];
  /** Additional props to spread onto the react-map-gl Map component */
  mapProps?: Record<string, unknown>;
}

/**
 * MapLibre's own interface strings (the canvas and marker labels, the zoom and
 * attribution buttons) in the page's language. MapLibre merges these over its
 * English defaults, which the English messages repeat word for word. Spec 041 FR-004.
 */
function useMapLibreLocale(): Record<string, string> {
  const t = useTranslations("map.engine");
  return useMemo(
    () => ({
      "Map.Title": t("map"),
      "Marker.Title": t("marker"),
      "NavigationControl.ZoomIn": t("zoomIn"),
      "NavigationControl.ZoomOut": t("zoomOut"),
      "NavigationControl.ResetBearing": t("resetBearing"),
      "AttributionControl.ToggleAttribution": t("toggleAttribution"),
      "AttributionControl.MapFeedback": t("mapFeedback"),
      "LogoControl.Title": t("logo"),
      "Popup.Close": t("popupClose"),
      "GeolocateControl.FindMyLocation": t("findMyLocation"),
      "GeolocateControl.LocationNotAvailable": t("locationNotAvailable"),
      "FullscreenControl.Enter": t("fullscreenEnter"),
      "FullscreenControl.Exit": t("fullscreenExit"),
    }),
    [t]
  );
}

/**
 * Wrapper around react-map-gl/maplibre with MapLibre GL JS, default center/zoom,
 * open tile style (CARTO Voyager), CSS import, and ref forwarding.
 */
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
    const locale = useMapLibreLocale();
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
        locale={locale}
        {...mapProps}
      >
        {children}
      </Map>
    );
  }
);
BaseMap.displayName = "BaseMap";
