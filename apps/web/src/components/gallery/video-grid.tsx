"use client";

import { motion, useReducedMotion } from "framer-motion";
import { listStagger, listItem } from "@/lib/animation/variants";
import { CompactVideoCard } from "@/components/gallery/compact-video-card";
import type { MediaItem } from "@/types/media";

interface VideoGridProps {
  items: MediaItem[];
  categoryFilter: string | null;
}

export function VideoGrid({ items, categoryFilter }: VideoGridProps) {
  const shouldReduceMotion = useReducedMotion();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="text-muted">No videos found</span>
      </div>
    );
  }

  if (shouldReduceMotion) {
    return (
      <>
        {/* Desktop/tablet grid */}
        <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <CompactVideoCard key={item.id} item={item} />
          ))}
        </div>
        {/* Mobile carousel */}
        <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:hidden">
          {items.map((item) => (
            <div key={item.id} className="w-72 flex-shrink-0 snap-start">
              <CompactVideoCard item={item} />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop/tablet grid */}
      <motion.div
        key={categoryFilter ?? "all"}
        variants={listStagger}
        initial="hidden"
        animate="show"
        className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => (
          <CompactVideoCard key={item.id} item={item} />
        ))}
      </motion.div>

      {/* Mobile carousel */}
      <motion.div
        key={`mobile-${categoryFilter ?? "all"}`}
        variants={listStagger}
        initial="hidden"
        animate="show"
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:hidden"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={listItem}
            className="w-72 flex-shrink-0 snap-start"
          >
            <CompactVideoCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
