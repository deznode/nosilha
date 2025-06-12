"use client";

import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import Link from "next/link";

// It's crucial to import the Mapbox GL CSS for the map to display correctly.
import "mapbox-gl/dist/mapbox-gl.css";

import type { DirectoryEntry } from "@/types/directory";
import { getEntriesByCategory } from "@/lib/api";

export default function InteractiveMap() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // --- Refactoring Applied ---
    // Fetch entries using the centralized API function
    const fetchEntries = async () => {
      try {
        const data = await getEntriesByCategory("all");
        if (data.length === 0) {
          // This could be a valid empty set or an error from the API returning []
          console.warn("No map entries found.");
        }
        setEntries(data);
      } catch (err) {
        console.error(err);
        setError("Could not load points of interest. Please try again later.");
      }
    };

    fetchEntries();
  }, []); // Empty dependency array ensures this runs once

  if (!mapboxToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <p className="text-red-600">Mapbox Access Token is not configured.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: -24.71,
        latitude: 14.87,
        zoom: 13,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {entries.map((entry) => (
        <Marker
          key={entry.id}
          longitude={entry.longitude}
          latitude={entry.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedEntry(entry);
          }}
        >
          <div className="cursor-pointer text-2xl">📍</div>
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
            <h3 className="font-bold">{selectedEntry.name}</h3>
            <Link
              href={`/directory/entry/${selectedEntry.slug}`} // Adjusted path based on file structure
              className="text-blue-600 hover:underline"
            >
              View Details &rarr;
            </Link>
          </div>
        </Popup>
      )}
    </Map>
  );
}
