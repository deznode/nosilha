"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const BravaMap = dynamic(
  () =>
    import("@/features/map/components/BravaMap").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#e6e4e0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-ocean-blue" />
          <p className="animate-pulse font-serif text-lg font-bold text-ocean-blue">
            Loading Brava...
          </p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  return <BravaMap />;
}
