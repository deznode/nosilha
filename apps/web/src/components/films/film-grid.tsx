"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { VideoGrid } from "@/components/gallery/video-grid";
import { filmToMediaItem, type Film } from "@/lib/films";

/** A grid of films in which every card opens the film's own page. */
export function FilmGrid({
  films,
  featuredId,
  selectedId,
  animationKey = "all",
}: {
  films: Film[];
  /** Left out of the desktop grid because a hero above already shows it. */
  featuredId?: string | null;
  selectedId?: string | null;
  /** Replays the grid's entrance when it changes, e.g. on a facet switch. */
  animationKey?: string;
}) {
  const router = useRouter();
  const items = useMemo(() => films.map(filmToMediaItem), [films]);

  return (
    <VideoGrid
      items={items}
      categoryFilter={animationKey}
      featuredVideoId={featuredId}
      selectedVideoId={selectedId}
      onVideoSelect={(item) => router.push(`/films/${item.id}`)}
      mobileLayout="cards"
    />
  );
}
