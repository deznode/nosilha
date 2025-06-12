"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { getEntriesByCategory } from "@/lib/api";
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
  feature: SuperclusterPointFeature<PointProperties>
): feature is ClusterFeatureWithProps {
  return !!feature.properties.cluster;
}

export function InteractiveMap() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(ALL_CATEGORIES);

  const [bounds, setBounds] = useState<BBox | undefined>(undefined);
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    async function fetchEntries() {
      const allEntries = await getEntriesByCategory("all");
      setEntries(allEntries);
    }
    fetchEntries();
  }, []);

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

  const handleFilterChange = (category: string, isChecked: boolean) => {
    setSelectedCategories((prev) =>
      isChecked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxAccessToken) {
    console.error("Mapbox Access Token is not set!");
    return <div>Map cannot be loaded. Missing configuration.</div>;
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
          if (e.target) {
            setBounds(e.target.getBounds().toArray().flat() as BBox);
          }
        }}
      >
        <div className="absolute right-4 top-4 z-10">
          <MapFilterControl
            categories={ALL_CATEGORIES}
            selectedCategories={selectedCategories}
            onFilterChange={handleFilterChange}
          />
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

          const entryId = cluster.properties.entryId;
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
