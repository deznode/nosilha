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
  console.log("entry=", entry);
  return (
    <Link
      href={`/directory/entry/${entry.slug}`}
      aria-label={`View details for ${entry.name}`}
      className="block h-full"
    >
      <Card className="h-full overflow-hidden transition-shadow duration-200 ease-in-out hover:shadow-lg">
        {/* Image Section */}
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={entry.imageUrl}
            alt={`Photo of ${entry.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1">
            <p className="text-sm text-volcanic-gray">
              {entry.category} &middot; {entry.town}
            </p>
            <h3 className="mt-1 font-semibold text-lg text-volcanic-gray-dark">
              {entry.name}
            </h3>
          </div>

          {/* Rating Section */}
          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={entry.rating} />
            <p className="text-sm text-volcanic-gray">
              ({entry.reviewCount} reviews)
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
