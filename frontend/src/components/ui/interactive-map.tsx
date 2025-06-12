"use client";

import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import Link from "next/link";

// It's crucial to import the Mapbox GL CSS for the map to display correctly.
import "mapbox-gl/dist/mapbox-gl.css";

import { MapPinIcon } from "@heroicons/react/24/solid";
import type { DirectoryEntry } from "@/types/directory";
import { getEntriesByCategory } from "@/lib/api";

export function InteractiveMap() {
  // 1. State for storing fetched directory entries
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  // 2. State for managing the currently selected marker's popup
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(
    null
  );

  // 3. Fetch all entries from the backend API on component mount
  useEffect(() => {
    async function fetchEntries() {
      const allEntries = await getEntriesByCategory("all");
      setEntries(allEntries);
    }
    fetchEntries();
  }, []);

  // 4. Read the Mapbox access token from environment variables
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxAccessToken) {
    console.error("Mapbox Access Token is not set!");
    return <div>Map cannot be loaded. Missing configuration.</div>;
  }

  return (
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
      {/* 5. Map over the fetched entries to create a Marker for each one */}
      {entries.map((entry) => (
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
            <MapPinIcon className="h-8 w-8 text-ocean-blue" />
          </button>
        </Marker>
      ))}

      {/* 6. Conditionally render a Popup if an entry is selected */}
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
  );
}
