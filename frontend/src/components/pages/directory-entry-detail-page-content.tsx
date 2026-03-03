import Image from "next/image";
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  BuildingOffice2Icon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { ContributePhotosSection } from "@/components/ui/contribute-photos-section";
import { ContentActionToolbar } from "@/components/ui/content-action-toolbar";
import { ImageGallery } from "@/components/ui/image-gallery";
import { RelatedContent } from "@/components/ui/related-content";
import StarRating from "@/components/ui/start-rating";
import { getHotelDetails, getRestaurantDetails } from "@/lib/api-validation";
import { siteConfig } from "@/lib/metadata";
import type { DirectoryEntry } from "@/types/directory";

export interface DirectoryEntryDetailPageContentProps {
  entry: DirectoryEntry;
}

function CategorySpecificDetails({ entry }: { entry: DirectoryEntry }) {
  switch (entry.category) {
    case "Restaurant": {
      const restaurantDetails = getRestaurantDetails(entry);
      return (
        <>
          {restaurantDetails.phoneNumber && (
            <div className="flex items-start">
              <PhoneIcon className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                {restaurantDetails.phoneNumber}
              </p>
            </div>
          )}
          {restaurantDetails.openingHours && (
            <div className="flex items-start">
              <ClockIcon className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                {restaurantDetails.openingHours}
              </p>
            </div>
          )}
          {restaurantDetails.cuisine.length > 0 && (
            <div className="flex items-start">
              <SparklesIcon className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                Cuisine: {restaurantDetails.cuisine.join(", ")}
              </p>
            </div>
          )}
        </>
      );
    }
    case "Hotel": {
      const hotelDetails = getHotelDetails(entry);
      return (
        <>
          {hotelDetails.phoneNumber && (
            <div className="flex items-start">
              <PhoneIcon className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                {hotelDetails.phoneNumber}
              </p>
            </div>
          )}
          {hotelDetails.amenities.length > 0 && (
            <div className="flex items-start">
              <BuildingOffice2Icon className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                Amenities: {hotelDetails.amenities.join(", ")}
              </p>
            </div>
          )}
        </>
      );
    }
    default:
      return null;
  }
}

export function DirectoryEntryDetailPageContent({
  entry,
}: DirectoryEntryDetailPageContentProps) {
  const canonicalUrl = new URL(
    `/directory/entry/${entry.slug}`,
    siteConfig.url
  ).toString();

  const sampleImages: string[] = [];

  return (
    <div className="bg-off-white pb-24 font-sans md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative h-[400px] w-full overflow-hidden rounded-xl shadow-lg">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={`Main photo of ${entry.name}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="bg-background-tertiary flex h-full w-full items-center justify-center">
              <span className="text-text-tertiary text-xl">
                No image available
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-text-primary font-serif text-4xl font-bold sm:text-5xl">
              {entry.name}
            </h1>
            <p className="text-text-secondary mt-4 text-lg leading-relaxed">
              {entry.description}
            </p>

            <div className="mt-6">
              <ContentActionToolbar
                contentId={entry.id}
                contentSlug={entry.slug}
                contentTitle={entry.name}
                contentUrl={canonicalUrl}
                contentType={entry.category}
                reactions={[
                  {
                    id: "LOVE",
                    emoji: "❤️",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "React with love",
                  },
                  {
                    id: "CELEBRATE",
                    emoji: "🎉",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "React to celebrate",
                  },
                  {
                    id: "INSIGHTFUL",
                    emoji: "💡",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "Mark as insightful",
                  },
                  {
                    id: "SUPPORT",
                    emoji: "👏",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "Show support",
                  },
                ]}
                isAuthenticated={true}
              />
            </div>

            <div className="border-border-primary my-8 border-t" />

            <RelatedContent
              contentId={entry.id}
              limit={5}
              heading="Explore Related Heritage"
            />

            <div className="border-border-primary my-8 border-t" />

            <div className="space-y-4">
              <h2 className="text-text-primary font-serif text-3xl font-bold">
                Gallery
              </h2>
              <ImageGallery imageUrls={sampleImages} />
            </div>

            <div className="border-border-primary my-8 border-t" />

            <h2 className="text-text-primary font-serif text-3xl font-bold">
              User Reviews
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-text-primary text-4xl font-bold">
                {entry.rating?.toFixed(1) || "N/A"}
              </p>
              <div className="flex flex-col">
                <StarRating rating={entry.rating || 0} />
                <p className="text-text-secondary text-sm">
                  Based on {entry.reviewCount} reviews
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-background-primary rounded-lg p-6 shadow-md">
              <div className="bg-background-tertiary aspect-video w-full rounded-md">
                <div className="flex h-full w-full items-center justify-center">
                  <MapPinIcon className="text-text-secondary h-12 w-12" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <MapPinIcon className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
                  <p className="text-text-secondary ml-3 text-base">
                    {entry.town}, Brava, Cape Verde
                  </p>
                </div>
                <CategorySpecificDetails entry={entry} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-border-primary my-16 border-t" />

        <ContributePhotosSection />
      </div>
    </div>
  );
}
