// frontend/src/components/ui/InteractiveMap.tsx

"use client";

import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import Link from "next/link";

// It's crucial to import the Mapbox GL CSS for the map to display correctly.
import "mapbox-gl/dist/mapbox-gl.css";

// Define a type for our directory entries to ensure type safety
interface DirectoryEntry {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
}

export default function InteractiveMap() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all directory entries from our Spring Boot backend
    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/directory/entries`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch map data");
        }
        const data: DirectoryEntry[] = await response.json();
        setEntries(data);
      } catch (err) {
        console.error(err);
        setError("Could not load points of interest. Please try again later.");
      }
    };

    fetchEntries();
  }, []); // Empty dependency array ensures this runs once on component mount

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
            // Stop event propagation to prevent map click events
            e.originalEvent.stopPropagation();
            setSelectedEntry(entry);
          }}
        >
          {/* You can use a custom SVG icon here */}
          <div className="cursor-pointer text-2xl">📍</div>
        </Marker>
      ))}

      {selectedEntry && (
        <Popup
          longitude={selectedEntry.longitude}
          latitude={selectedEntry.latitude}
          anchor="top"
          onClose={() => setSelectedEntry(null)}
          closeOnClick={false} // We handle the close button explicitly
        >
          <div className="p-1">
            <h3 className="font-bold">{selectedEntry.name}</h3>
            <Link
              href={`/directory/slug/${selectedEntry.slug}`}
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
