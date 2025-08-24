import { Card } from "@/components/ui/card";

/**
 * Skeleton loading component that matches the DirectoryCard layout structure.
 * Provides visual feedback while directory entries are being loaded.
 * Uses semantic color tokens that automatically adapt to light/dark mode.
 */
export function DirectoryCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden animate-pulse">
      {/* Image Section Skeleton - matches aspect-[16/10] from DirectoryCard */}
      <div className="relative aspect-[16/10] w-full bg-background-tertiary" />

      {/* Content Section Skeleton */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          {/* Category & Town Line - matches entry.category & entry.town */}
          <div className="h-4 bg-background-tertiary rounded w-2/3 mb-2" />
          
          {/* Title Line - matches entry.name */}
          <div className="h-6 bg-background-tertiary rounded w-3/4" />
        </div>

        {/* Rating Section Skeleton - matches StarRating & review count */}
        <div className="mt-3 flex items-center gap-2">
          {/* Star rating placeholder */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 w-4 bg-background-tertiary rounded" />
            ))}
          </div>
          {/* Review count placeholder */}
          <div className="h-4 bg-background-tertiary rounded w-20" />
        </div>
      </div>
    </Card>
  );
}