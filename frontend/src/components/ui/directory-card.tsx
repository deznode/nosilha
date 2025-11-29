import { Card } from "@/components/ui/card";
import { DirectoryEntry } from "@/types/directory";
import Image from "next/image";
import Link from "next/link";
import StarRating from "./start-rating";

interface DirectoryCardProps {
  entry: DirectoryEntry;
}

/**
 * A project-specific card component for displaying a directory entry.
 * It composes the base Catalyst Card component and is wrapped in a Next.js Link.
 *
 * @param {DirectoryCardProps} props The props for the component.
 * @param {DirectoryEntry} props.entry The directory entry data to display.
 */
export function DirectoryCard({ entry }: DirectoryCardProps) {
  return (
    <Link
      href={`/directory/entry/${entry.slug}`}
      aria-label={`View details for ${entry.name}`}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={`Photo of ${entry.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="bg-background-tertiary flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <span className="text-text-tertiary">No image available</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1">
            <p className="text-text-secondary text-sm">
              {entry.category} &middot; {entry.town}
            </p>
            <h3 className="text-text-primary mt-1 text-lg font-semibold">
              {entry.name}
            </h3>
          </div>

          {/* Rating Section */}
          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={entry.rating} />
            <p className="text-text-secondary text-sm">
              ({entry.reviewCount} reviews)
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
