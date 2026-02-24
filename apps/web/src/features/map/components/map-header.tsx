"use client";

import Link from "next/link";
import { X, List } from "lucide-react";
import { useShowSidebar, useMapStore } from "@/stores/mapStore";

export function MapHeader() {
  const showSidebar = useShowSidebar();
  const toggleSidebar = useMapStore((state) => state.toggleSidebar);

  return (
    <div className="pointer-events-none absolute top-0 right-0 left-0 z-40 flex items-start justify-between p-4 md:p-6">
      <Link
        href="/"
        className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-2 pr-6 shadow-xl backdrop-blur-md transition-transform hover:scale-[1.02]"
        aria-label="Back to home"
      >
        <div className="from-ocean-blue to-ocean-blue/80 shadow-ocean-blue/20 flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-lg">
          <span className="font-serif text-xl font-bold">N</span>
        </div>
        <div>
          <h1 className="font-serif text-sm leading-tight font-bold text-white drop-shadow-sm">
            Nosilha
          </h1>
          <p className="font-sans text-[10px] font-bold tracking-widest text-white/90 uppercase">
            Brava Island
          </p>
        </div>
      </Link>
      <button
        onClick={toggleSidebar}
        className="pointer-events-auto rounded-xl border border-white/20 bg-white/10 p-3 text-white shadow-xl backdrop-blur-md md:hidden"
      >
        {showSidebar ? <X size={20} /> : <List size={20} />}
      </button>
    </div>
  );
}
