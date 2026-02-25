"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { X, ArrowRight, Star } from "lucide-react";
import { useSelectedLocation, useMapStore } from "@/stores/mapStore";

export function LocationDetailCard() {
  const selectedLocation = useSelectedLocation();
  const clearSelection = useMapStore((state) => state.clearSelection);

  if (!selectedLocation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="absolute bottom-10 left-[450px] z-30 hidden w-[350px] overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md md:block dark:border-white/10 dark:bg-black/60"
    >
      <div className="group relative h-48">
        {selectedLocation.image ? (
          <>
            <Image
              src={selectedLocation.image}
              alt={selectedLocation.name}
              fill
              sizes="350px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="from-volcanic-gray-dark/80 absolute inset-0 bg-gradient-to-t to-transparent" />
          </>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `${selectedLocation.color}20` }}
          >
            <selectedLocation.icon
              size={48}
              style={{ color: selectedLocation.color }}
            />
          </div>
        )}
        <button
          onClick={clearSelection}
          className="absolute top-3 right-3 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-black/50"
        >
          <X size={18} />
        </button>
        <div className="absolute bottom-4 left-4">
          <h3
            className="font-serif text-2xl font-bold"
            style={{
              color: selectedLocation.image ? "white" : selectedLocation.color,
            }}
          >
            {selectedLocation.name}
          </h3>
          <div
            className="flex items-center gap-1 font-sans text-xs font-medium opacity-90"
            style={{
              color: selectedLocation.image ? "white" : selectedLocation.color,
            }}
          >
            <Star size={12} className="text-sunny-yellow fill-sunny-yellow" />
            {selectedLocation.rating.toFixed(1)} &bull;{" "}
            {selectedLocation.reviews} reviews
          </div>
        </div>
      </div>
      <div className="p-5 font-sans">
        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
          {selectedLocation.description}
        </p>
        {selectedLocation.detailUrl && (
          <Link
            href={selectedLocation.detailUrl}
            className="bg-ocean-blue hover:bg-ocean-blue/90 shadow-ocean-blue/20 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-lg transition-colors"
          >
            View Details <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
