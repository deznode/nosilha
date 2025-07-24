"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/mapbox";
import useSupercluster from "use-supercluster";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";

import type { Feature, Point, BBox } from "geojson";
import type {
  ClusterFeature,
  PointFeature as SuperclusterPointFeature,
} from "supercluster";

import type { DirectoryEntry } from "@/types/directory";
import { getEntriesForMap } from "@/lib/api";
import { CategoryMarkerIcon } from "./category-marker-icon";
import { MapFilterControl } from "./map-filter-control";

const ALL_CATEGORIES = ["Restaurant", "Hotel", "Beach", "Landmark"];

// --- Type Definitions ---
// Define our custom properties for a single point.
type PointProperties = {
  cluster: false;
  entryId: string;
  category: string;
  name: string;
  slug: string;
};
type PointFeature = Feature<Point, PointProperties>;

// Define the shape of a cluster feature, inheriting the library's base properties.
type ClusterFeatureWithProps = ClusterFeature<{
  // We don't need to redefine cluster: true etc. The library handles this.
}>;

// The type guard now correctly distinguishes between the two feature types.
function isClusterFeature(
  feature: SuperclusterPointFeature<PointProperties> | ClusterFeatureWithProps
): feature is ClusterFeatureWithProps {
  return !!(feature.properties as any).cluster;
}

export function InteractiveMap() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(ALL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bounds, setBounds] = useState<BBox | undefined>(undefined);
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef<MapRef>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allEntries = await getEntriesForMap("all");
      setEntries(allEntries);
    } catch (err) {
      console.error("Failed to fetch map entries:", err);
      setError("Failed to load map data. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = () => {
    fetchEntries().catch(console.error);
  };

  const handleFilterChange = (category: string, isChecked: boolean) => {
    setSelectedCategories((prev) =>
      isChecked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  useEffect(() => {
    fetchEntries().catch(console.error);
  }, [fetchEntries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) =>
      selectedCategories.includes(entry.category)
    );
  }, [entries, selectedCategories]);

  const points: PointFeature[] = useMemo(
    () =>
      filteredEntries.map((entry) => ({
        type: "Feature",
        properties: {
          cluster: false,
          entryId: entry.id,
          category: entry.category,
          name: entry.name,
          slug: entry.slug,
        },
        geometry: {
          type: "Point",
          coordinates: [entry.longitude, entry.latitude],
        },
      })),
    [filteredEntries]
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxAccessToken) {
    console.error("Mapbox Access Token is not set!");
    return (
      <div className="flex h-full w-full items-center justify-center bg-background-secondary">
        <div className="text-center">
          <p className="text-lg font-semibold text-text-secondary">
            Map cannot be loaded
          </p>
          <p className="text-sm text-text-tertiary">Missing configuration</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background-secondary">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border-primary border-t-ocean-blue"></div>
          <p className="text-lg font-semibold text-text-secondary">Loading map...</p>
          <p className="text-sm text-text-tertiary">Please wait while we load the locations</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background-secondary">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.924-.833-2.598 0L3.732 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold text-gray-600">
            Unable to load map
          </p>
          <p className="mb-4 text-sm text-gray-500">{error}</p>
          <button
            onClick={handleRetry}
            className="rounded-md bg-ocean-blue px-4 py-2 text-sm font-medium text-white hover:bg-ocean-blue/90 focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background-secondary">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold text-gray-600">
            No locations found
          </p>
          <p className="mb-4 text-sm text-gray-500">
            There are currently no locations to display on the map
          </p>
          <button
            onClick={handleRetry}
            className="rounded-md bg-ocean-blue px-4 py-2 text-sm font-medium text-white hover:bg-ocean-blue/90 focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={{
          longitude: -24.706,
          latitude: 14.875,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(e) => {
          setZoom(e.viewState.zoom);
          if (e.target && e.target.getBounds) {
            const bounds = e.target.getBounds();
            if (bounds) {
              setBounds(bounds.toArray().flat() as BBox);
            }
          }
        }}
      >
        <div className="absolute right-4 top-4 z-10 space-y-2">
          <MapFilterControl
            categories={ALL_CATEGORIES}
            selectedCategories={selectedCategories}
            onFilterChange={handleFilterChange}
          />
          <button
            onClick={handleRetry}
            className="flex w-full items-center justify-center rounded-lg bg-ocean-blue px-3 py-2 text-sm font-medium text-white shadow-lg hover:bg-ocean-blue/90 focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
            title="Refresh map data"
          >
            <svg 
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="ml-2">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;

          if (isClusterFeature(cluster)) {
            const pointCount = cluster.properties.point_count;
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ocean-blue font-bold text-white"
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster?.getClusterExpansionZoom(
                        cluster.id as number
                      ) ?? 0,
                      20
                    );
                    mapRef.current?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      speed: 1.5,
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          const entryId = (cluster as PointFeature).properties.entryId;
          const entry = filteredEntries.find((e) => e.id === entryId);

          if (!entry) return null;

          return (
            <Marker
              key={`entry-${entry.id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
            >
              <button
                type="button"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntry(entry);
                }}
              >
                <CategoryMarkerIcon category={entry.category} />
              </button>
            </Marker>
          );
        })}

        {selectedEntry && (
          <Popup
            longitude={selectedEntry.longitude}
            latitude={selectedEntry.latitude}
            anchor="top"
            onClose={() => setSelectedEntry(null)}
            closeOnClick={false}
          >
            <div className="p-1">
              <h3 className="font-bold text-volcanic-gray-dark">
                {selectedEntry.name}
              </h3>
              <p className="text-sm text-volcanic-gray">
                {selectedEntry.category}
              </p>
              <Link
                href={`/directory/entry/${selectedEntry.slug}`}
                className="text-sm font-semibold text-ocean-blue hover:underline"
              >
                View Details &rarr;
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
