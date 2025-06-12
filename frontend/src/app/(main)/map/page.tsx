// frontend/src/app/(main)/map/page.tsx

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/page-header"; // Corrected import based on file structure
import { Suspense } from "react";

// Dynamically import the map component with the updated file name
const InteractiveMap = dynamic(
  () => import("@/components/ui/interactive-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-200" />
    ),
  }
);

export default function MapPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader
        title="Interactive Map of Brava"
        subtitle="Explore landmarks, businesses, and points of interest across the island."
      />

      <div className="mt-8 w-full h-[600px] rounded-lg shadow-md overflow-hidden">
        <Suspense fallback={<div className="h-full w-full bg-gray-200" />}>
          <InteractiveMap />
        </Suspense>
      </div>
    </main>
  );
}
