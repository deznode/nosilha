"use client";

import { MapPin, Trash2, Bookmark } from "lucide-react";
import type { SavedPlace } from "@/types/user-profile";

interface SavedPlacesTabProps {
  places: SavedPlace[];
  isLoading?: boolean;
  onRemove?: (id: string) => void;
}

function SavedPlaceSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        <div>
          <div className="mb-2 h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function SavedPlacesTab({
  places,
  isLoading,
  onRemove,
}: SavedPlacesTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Saved Places
        </h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <SavedPlaceSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bookmark className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No saved places
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bookmark places you want to visit or remember.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        Saved Places ({places.length})
      </h3>
      {places.map((place) => (
        <div
          key={place.id}
          className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-[var(--color-ocean-blue)] dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-4">
            {place.imageUrl ? (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="h-16 w-16 rounded object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-200 dark:bg-slate-700">
                <MapPin className="text-slate-400" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                {place.name}
              </h4>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <MapPin size={14} className="mr-1" /> {place.town} &bull;{" "}
                {place.category}
              </div>
            </div>
          </div>
          <button
            onClick={() => onRemove?.(place.id)}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
            title="Remove"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
