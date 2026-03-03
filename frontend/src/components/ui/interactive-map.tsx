"use client";

import { useState, useEffect, useMemo } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";

import type { DirectoryEntry } from "@/types/directory";
import { getEntriesByCategory } from "@/lib/api";
import { CategoryMarkerIcon } from "./category-marker-icon";
import { MapFilterControl } from "./map-filter-control"; // <-- Import the filter control

const ALL_CATEGORIES = ["Restaurant", "Hotel", "Beach", "Landmark"];

export function InteractiveMap() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(
    null
  );

  // 1. State for managing the active category filters
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(ALL_CATEGORIES);

  useEffect(() => {
    async function fetchEntries() {
      const allEntries = await getEntriesByCategory("all");
      setEntries(allEntries);
    }
    fetchEntries();
  }, []);

  // 2. Memoized array of entries that match the current filters
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) =>
      selectedCategories.includes(entry.category)
    );
  }, [entries, selectedCategories]);

  // Handler function to update the selected categories state
  const handleFilterChange = (category: string, isChecked: boolean) => {
    setSelectedCategories(
      (prev) =>
        isChecked
          ? [...prev, category] // Add category to filter
          : prev.filter((c) => c !== category) // Remove category from filter
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
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={{
          longitude: -24.706,
          latitude: 14.875,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {/* 3. Render the filter control as an overlay */}
        <div className="absolute right-4 top-4 z-10">
          <MapFilterControl
            categories={ALL_CATEGORIES}
            selectedCategories={selectedCategories}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* 4. Map over the *filtered* entries to render markers */}
        {filteredEntries.map((entry) => (
          <Marker
            key={entry.id}
            longitude={entry.longitude}
            latitude={entry.latitude}
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
        ))}

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
