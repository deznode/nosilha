import { Card } from "@/components/ui/card";

/**
 * Skeleton loading component that matches the DirectoryCard layout structure.
 * Provides visual feedback while directory entries are being loaded.
 * Uses semantic color tokens that automatically adapt to light/dark mode.
 */
export function DirectoryCardSkeleton() {
  return (
    <Card className="h-full animate-pulse overflow-hidden">
      {/* Image Section Skeleton - matches aspect-[16/10] from DirectoryCard */}
      <div className="bg-background-tertiary relative aspect-[16/10] w-full" />

      {/* Content Section Skeleton */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          {/* Category & Town Line - matches entry.category & entry.town */}
          <div className="bg-background-tertiary mb-2 h-4 w-2/3 rounded" />

          {/* Title Line - matches entry.name */}
          <div className="bg-background-tertiary h-6 w-3/4 rounded" />
        </div>

        {/* Rating Section Skeleton - matches StarRating & review count */}
        <div className="mt-3 flex items-center gap-2">
          {/* Star rating placeholder */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-background-tertiary h-4 w-4 rounded"
              />
            ))}
          </div>
          {/* Review count placeholder */}
          <div className="bg-background-tertiary h-4 w-20 rounded" />
        </div>
      </div>
    </Card>
  );
}
