import { DirectoryCardSkeleton } from "./directory-card-skeleton";

interface DirectoryGridSkeletonProps {
  /**
   * Number of skeleton cards to render
   * @default 8
   */
  count?: number;
  /**
   * Additional CSS classes for the grid container
   */
  className?: string;
}

/**
 * Skeleton loading component for directory grids.
 * Renders a grid of DirectoryCardSkeleton components that matches
 * the responsive grid layout used throughout the application.
 */
export function DirectoryGridSkeleton({
  count = 8,
  className = "",
}: DirectoryGridSkeletonProps) {
  return (
    <div
      className={`mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}
      aria-label="Loading directory entries"
    >
      {Array.from({ length: count }, (_, index) => (
        <DirectoryCardSkeleton key={index} />
      ))}
    </div>
  );
}
