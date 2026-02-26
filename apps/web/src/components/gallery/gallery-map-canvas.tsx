"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Marker, Popup, type ViewStateChangeEvent } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import { Loader2, Camera, MapPin } from "lucide-react";
import { clsx } from "clsx";
import { BaseMap, useMapClustering } from "@/features/map/shared";
import type { MapBounds } from "@/features/map/shared";
import { MAP_CONFIG } from "@/features/map/data/constants";
import {
  mediaItemToGeoFeature,
  type GalleryGeoProperties,
} from "@/lib/gallery-mappers";
import { GalleryMapMarker } from "./gallery-map-marker";
import { GalleryMapPopup } from "./gallery-map-popup";
import type { MediaItem } from "@/types/media";

interface GalleryMapCanvasProps {
  photos: MediaItem[];
  onPhotoSelect: (photo: MediaItem) => void;
  selectedPhotoId?: string;
  flyToCoords?: { lat: number; lng: number; photoId: string } | null;
  onViewChange?: (view: "grid") => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

/**
 * Gallery-specific map component. Flat 2D map of Brava Island
 * showing geo-tagged photos as clustered markers.
 */
export function GalleryMapCanvas({
  photos,
  onPhotoSelect,
  selectedPhotoId,
  flyToCoords,
  onViewChange,
  hasActiveFilters,
  onClearFilters,
}: GalleryMapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState<number>(MAP_CONFIG.DEFAULT_ZOOM);
  const [bounds, setBounds] = useState<MapBounds>(undefined);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [popupPhoto, setPopupPhoto] = useState<MediaItem | null>(null);
  const lastFlyToRef = useRef<string | null>(null);

  // Convert photos to GeoJSON features
  const geoFeatures = useMemo(
    () =>
      photos
        .map(mediaItemToGeoFeature)
        .filter(
          (f): f is NonNullable<typeof f> => f !== null
        ),
    [photos]
  );

  const { clusters, expandCluster } = useMapClustering<GalleryGeoProperties>({
    points: geoFeatures,
    zoom,
    bounds,
  });

  // Lookup map for quick photo retrieval by ID
  const photoById = useMemo(() => {
    const map = new Map<string, MediaItem>();
    for (const p of photos) {
      map.set(p.id, p);
    }
    return map;
  }, [photos]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setZoom(evt.viewState.zoom);
    const b = mapRef.current?.getMap().getBounds();
    if (b) {
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    }
  }, []);

  const handleMapLoad = useCallback(() => {
    setMapReady(true);
    const b = mapRef.current?.getMap().getBounds();
    if (b) {
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    }
  }, []);

  const handleMapError = useCallback(() => {
    setMapError(true);
  }, []);

  const handleClusterClick = useCallback(
    (clusterId: number, lat: number, lng: number) => {
      const expansionZoom = expandCluster(clusterId);
      if (expansionZoom != null) {
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: expansionZoom,
          duration: MAP_CONFIG.EASE_DURATION,
        });
      }
    },
    [expandCluster]
  );

  const handleMarkerClick = useCallback(
    (mediaId: string, lat: number, lng: number) => {
      const photo = photoById.get(mediaId);
      if (!photo) return;
      setPopupPhoto(photo);
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: Math.max(zoom, MAP_CONFIG.LOCATION_ZOOM),
        duration: MAP_CONFIG.EASE_DURATION,
      });
    },
    [photoById, zoom]
  );

  // Handle flyTo from external source (e.g., "Show on Map" button)
  useEffect(() => {
    if (
      !flyToCoords ||
      flyToCoords.photoId === lastFlyToRef.current ||
      !mapReady ||
      !mapRef.current
    ) {
      return;
    }
    lastFlyToRef.current = flyToCoords.photoId;
    const photo = photoById.get(flyToCoords.photoId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- popup must sync with flyTo animation trigger
    if (photo) setPopupPhoto(photo);
    mapRef.current.flyTo({
      center: [flyToCoords.lng, flyToCoords.lat],
      zoom: MAP_CONFIG.LOCATION_ZOOM,
      duration: MAP_CONFIG.ANIMATION_DURATION,
    });
  }, [flyToCoords, photoById, mapReady]);

  // Auto-fit bounds when few markers exist (1-3) so all are visible
  useEffect(() => {
    if (!mapReady || !mapRef.current || geoFeatures.length === 0 || geoFeatures.length > 3) return;
    // Don't override a flyToCoords that's pending
    if (flyToCoords && flyToCoords.photoId !== lastFlyToRef.current) return;

    const lngs = geoFeatures.map((f) => f.geometry.coordinates[0]);
    const lats = geoFeatures.map((f) => f.geometry.coordinates[1]);

    if (geoFeatures.length === 1) {
      mapRef.current.flyTo({
        center: [lngs[0], lats[0]],
        zoom: MAP_CONFIG.LOCATION_ZOOM,
        duration: MAP_CONFIG.EASE_DURATION,
      });
    } else {
      mapRef.current.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 80, maxZoom: MAP_CONFIG.LOCATION_ZOOM, duration: MAP_CONFIG.EASE_DURATION }
      );
    }
  }, [mapReady, geoFeatures, flyToCoords]);

  // Empty state: no geo-tagged photos
  if (geoFeatures.length === 0) {
    const isFiltered = hasActiveFilters && photos.length > 0;
    return (
      <div className="bg-surface-alt flex h-[60vh] min-h-[400px] flex-col items-center justify-center rounded-card p-8 text-center">
        <div className="bg-surface mb-4 rounded-full p-4">
          <div className="relative">
            <MapPin className="text-muted h-10 w-10" />
            <Camera className="text-muted absolute -bottom-1 -right-1 h-5 w-5" />
          </div>
        </div>
        <h3 className="text-body text-lg font-medium">
          {isFiltered
            ? "No photos with locations match your filters"
            : "No photos with location data yet"}
        </h3>
        <p className="text-muted mt-2 max-w-sm text-sm">
          {isFiltered
            ? "Try adjusting your filters to see more results."
            : "Photos taken with GPS-enabled cameras will appear on this map."}
        </p>
        <div className="mt-6 flex gap-3">
          {isFiltered && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="bg-brand text-white hover:bg-brand/90 rounded-button px-4 py-2 text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}
          {onViewChange && (
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={clsx(
                "rounded-button px-4 py-2 text-sm font-medium transition-colors",
                isFiltered
                  ? "border-hairline text-body hover:bg-surface border"
                  : "bg-brand text-white hover:bg-brand/90"
              )}
            >
              Switch to Grid View
            </button>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (mapError) {
    return (
      <div className="bg-surface-alt flex h-[60vh] min-h-[400px] flex-col items-center justify-center rounded-card p-8 text-center">
        <MapPin className="text-muted mb-4 h-10 w-10" />
        <h3 className="text-body text-lg font-medium">
          Map unavailable
        </h3>
        <p className="text-muted mt-2 max-w-sm text-sm">
          Try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative h-[60vh] min-h-[400px] overflow-hidden rounded-card"
      role="application"
      aria-label="Gallery photo map of Brava Island"
    >
      {/* Loading overlay */}
      {!mapReady && (
        <div className="bg-surface-alt absolute inset-0 z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="text-brand h-8 w-8 animate-spin" />
            <p className="text-muted text-sm">Loading map...</p>
          </div>
        </div>
      )}

      <BaseMap
        ref={mapRef}
        onMove={handleMove}
        onLoad={handleMapLoad}
        onError={handleMapError}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const props = cluster.properties as Record<string, unknown>;
          const isCluster = props.cluster as boolean;

          if (isCluster) {
            const pointCount = props.point_count as number;
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClusterClick(
                      cluster.id as number,
                      latitude,
                      longitude
                    );
                  }}
                  className={clsx(
                    "bg-brand z-30 flex h-10 w-10 cursor-pointer items-center justify-center",
                    "rounded-full border-[3px] border-white text-sm font-bold text-white shadow-medium",
                    "transition-transform duration-200 hover:scale-110"
                  )}
                  aria-label={`Cluster of ${pointCount} photos. Click to expand.`}
                >
                  {pointCount}
                </button>
              </Marker>
            );
          }

          const geoProps = props as unknown as GalleryGeoProperties;
          const isSelected = geoProps.mediaId === selectedPhotoId;

          return (
            <Marker
              key={geoProps.mediaId}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
            >
              <GalleryMapMarker
                thumbnailUrl={geoProps.thumbnailUrl}
                title={geoProps.title}
                isSelected={isSelected}
                onClick={() =>
                  handleMarkerClick(geoProps.mediaId, latitude, longitude)
                }
              />
            </Marker>
          );
        })}

        {/* Photo popup */}
        {popupPhoto &&
          popupPhoto.latitude != null &&
          popupPhoto.longitude != null && (
            <Popup
              longitude={popupPhoto.longitude}
              latitude={popupPhoto.latitude}
              anchor="bottom"
              offset={[0, -60] as [number, number]}
              closeOnClick={false}
              closeButton={false}
              onClose={() => setPopupPhoto(null)}
            >
              <GalleryMapPopup
                photo={popupPhoto}
                onOpenInGallery={onPhotoSelect}
                onClose={() => setPopupPhoto(null)}
              />
            </Popup>
          )}
      </BaseMap>

      {/* Photo count badge */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="bg-surface/90 text-muted border-hairline rounded-badge border px-3 py-1.5 text-xs font-medium shadow-subtle backdrop-blur-sm">
          {geoFeatures.length} photo{geoFeatures.length !== 1 ? "s" : ""} with
          locations
        </span>
      </div>
    </div>
  );
}
