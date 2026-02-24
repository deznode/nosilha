"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { X, Navigation } from "lucide-react";
import { useSelectedLocation, useMapStore } from "@/stores/mapStore";

export function LocationBottomSheet() {
  const selectedLocation = useSelectedLocation();
  const clearSelection = useMapStore((state) => state.clearSelection);

  if (!selectedLocation) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{
        type: "spring",
        damping: 28,
        stiffness: 280,
        mass: 0.8,
      }}
      className="bg-background-primary absolute right-0 bottom-0 left-0 z-50 max-h-[60vh] overflow-y-auto overscroll-contain rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:hidden"
      style={{ touchAction: "pan-y" }}
    >
      <motion.div
        className="sticky top-0 z-20 flex w-full cursor-pointer justify-center bg-white/95 pt-4 pb-2 backdrop-blur-sm"
        onClick={clearSelection}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="bg-border-primary h-1 w-10 rounded-full"
          initial={{ width: 40 }}
          whileHover={{ width: 48, backgroundColor: "#005a85" }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
      <div className="relative h-52 w-full overflow-hidden">
        <motion.div
          className="relative h-full w-full"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={selectedLocation.image}
            alt={selectedLocation.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <button
          onClick={clearSelection}
          className="absolute top-4 right-4 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/50"
        >
          <X size={18} />
        </button>
      </div>
      <div className="space-y-4 p-6 font-sans">
        <h2 className="text-text-primary font-serif text-2xl leading-tight font-bold">
          {selectedLocation.name}
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          {selectedLocation.description}
        </p>
        <button className="bg-ocean-blue shadow-ocean-blue/30 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-lg transition-transform active:scale-[0.98]">
          <Navigation size={18} /> Navigate Here
        </button>
      </div>
    </motion.div>
  );
}
