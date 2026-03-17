"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type PanInfo } from "framer-motion";
import { X, ArrowRight, ChevronUp } from "lucide-react";
import { useSelectedLocation, useMapStore } from "@/stores/mapStore";

type SheetMode = "peek" | "expanded";

const PEEK_HEIGHT = 150;
const DRAG_THRESHOLD = 50;
const DISMISS_THRESHOLD = 80;

export function LocationBottomSheet() {
  const selectedLocation = useSelectedLocation();
  const clearSelection = useMapStore((state) => state.clearSelection);
  const [mode, setMode] = useState<SheetMode>("peek");

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset } = info;

      if (mode === "peek" && offset.y < -DRAG_THRESHOLD) {
        setMode("expanded");
      } else if (mode === "expanded" && offset.y > DRAG_THRESHOLD) {
        setMode("peek");
      } else if (mode === "peek" && offset.y > DISMISS_THRESHOLD) {
        clearSelection();
      }
    },
    [mode, clearSelection]
  );

  if (!selectedLocation) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{
        y: 0,
        height: mode === "peek" ? PEEK_HEIGHT : "60vh",
      }}
      exit={{ y: "100%" }}
      transition={{
        type: "spring",
        damping: 28,
        stiffness: 280,
        mass: 0.8,
      }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="bg-background-primary map-desktop:hidden absolute right-0 bottom-0 left-0 z-50 overflow-hidden rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
      style={{ touchAction: mode === "peek" ? "none" : "pan-y" }}
    >
      {/* Drag handle */}
      <div className="flex w-full cursor-grab items-center justify-center pt-3 pb-2 active:cursor-grabbing">
        <div className="bg-border-primary h-1 w-10 rounded-full" />
      </div>

      {/* Peek mode: compact info */}
      {mode === "peek" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 px-6 pb-4"
        >
          {/* Icon or thumbnail */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${selectedLocation.color}20` }}
          >
            <selectedLocation.icon
              size={24}
              style={{ color: selectedLocation.color }}
            />
          </div>

          {/* Name + category */}
          <div className="min-w-0 flex-1">
            <h2 className="text-text-primary truncate font-serif text-lg font-bold">
              {selectedLocation.name}
            </h2>
            <span
              className="text-xs font-medium tracking-wider uppercase"
              style={{ color: selectedLocation.color }}
            >
              {selectedLocation.category}
            </span>
          </div>

          {/* Expand hint */}
          <button
            onClick={() => setMode("expanded")}
            className="text-text-tertiary shrink-0 rounded-full p-2 transition-colors active:bg-black/5"
            aria-label="Expand details"
          >
            <ChevronUp size={20} />
          </button>
        </motion.div>
      )}

      {/* Expanded mode: full detail */}
      {mode === "expanded" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex h-full flex-col overflow-y-auto overscroll-contain"
        >
          <div className="relative h-52 w-full shrink-0 overflow-hidden">
            {selectedLocation.image ? (
              <>
                <Image
                  src={selectedLocation.image}
                  alt={selectedLocation.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
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
              className="absolute top-4 right-4 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/50"
              aria-label="Close details"
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
            {selectedLocation.detailUrl && (
              <Link
                href={selectedLocation.detailUrl}
                className="bg-ocean-blue shadow-ocean-blue/30 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
              >
                View Details <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
