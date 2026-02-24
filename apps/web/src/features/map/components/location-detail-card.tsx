"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { X, Navigation, Info, Star } from "lucide-react";
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
      className="absolute bottom-10 left-[450px] z-30 hidden w-[350px] overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-black/60 md:block"
    >
      <div className="group relative h-48">
        <Image
          src={selectedLocation.image}
          alt={selectedLocation.name}
          fill
          sizes="350px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="from-volcanic-gray-dark/80 absolute inset-0 bg-linear-to-t to-transparent" />
        <button
          onClick={clearSelection}
          className="absolute top-3 right-3 rounded-full bg-white/20 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/40"
        >
          <X size={18} />
        </button>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-serif text-2xl font-bold">
            {selectedLocation.name}
          </h3>
          <div className="flex items-center gap-1 font-sans text-xs font-medium opacity-90">
            <Star size={12} className="text-sunny-yellow fill-sunny-yellow" />
            {selectedLocation.rating.toFixed(1)} &bull; {selectedLocation.reviews} reviews
          </div>
        </div>
      </div>
      <div className="p-5 font-sans">
        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
          {selectedLocation.description}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-ocean-blue hover:bg-ocean-blue/90 shadow-ocean-blue/20 col-span-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-lg transition-colors">
            <Navigation size={14} /> Directions
          </button>
          <button className="border-border-primary text-text-secondary hover:bg-background-secondary col-span-1 flex items-center justify-center gap-2 rounded-xl border bg-white py-3 text-xs font-bold transition-colors dark:bg-white/10">
            <Info size={14} /> More Info
          </button>
        </div>
      </div>
    </motion.div>
  );
}
