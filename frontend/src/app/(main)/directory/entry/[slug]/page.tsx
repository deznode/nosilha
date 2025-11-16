import type { Metadata } from "next";
import Image from "next/image";
import { getEntryBySlug } from "@/lib/api";
import { generateDirectoryEntryMetadata, siteConfig } from "@/lib/metadata";
import { notFound } from "next/navigation";

// Enable ISR with 30 minute revalidation for individual entries
export const revalidate = 1800;
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  BuildingOffice2Icon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

import type { DirectoryEntry } from "@/types/directory";
import { ImageGallery } from "@/components/ui/image-gallery";
import { ContributePhotosSection } from "@/components/ui/contribute-photos-section";
import { ContentActionToolbar } from "@/components/ui/content-action-toolbar";
import { RelatedContent } from "@/components/ui/related-content";
import { getRestaurantDetails, getHotelDetails } from "@/lib/api-validation";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for directory entries
export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    return {
      title: "Entry Not Found",
      description: "The requested directory entry could not be found.",
    };
  }

  return generateDirectoryEntryMetadata({
    entry,
    baseUrl: siteConfig.url,
    siteName: siteConfig.name,
    defaultImage: siteConfig.ogImage,
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            rating > i ? "text-sunny-yellow" : "text-text-tertiary"
          }`}
        />
      ))}
    </div>
  );
}

function CategorySpecificDetails({ entry }: { entry: DirectoryEntry }) {
  // Logic for displaying details based on category using safe accessors
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

export default async function DirectoryEntryDetailPage({
  params,
}: DetailPageProps) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const canonicalUrl = new URL(
    `/directory/entry/${entry.slug}`,
    siteConfig.url
  ).toString();

  // Gallery images - will be populated from actual entry data or fallback to empty array
  const sampleImages: string[] = [];

  return (
    <div className="bg-off-white font-sans">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main hero image */}
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
          {/* Left Column: Details & Reviews */}
          <div className="lg:col-span-2">
            <h1 className="text-text-primary font-serif text-4xl font-bold sm:text-5xl">
              {entry.name}
            </h1>
            <p className="text-text-secondary mt-4 text-lg leading-relaxed">
              {entry.description}
            </p>

            {/* Content Action Toolbar - Refactored (Feature 005) */}
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

            {/* Related Content Section - Phase 9: User Story 5 */}
            <RelatedContent
              contentId={entry.id}
              limit={5}
              heading="Explore Related Heritage"
            />

            <div className="border-border-primary my-8 border-t" />

            {/* --- NEW: Image Gallery Section --- */}
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

          {/* Right Column (Sidebar): Map & Info */}
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

        {/* --- NEW: Image Uploader Section --- */}
        <ContributePhotosSection />
      </div>
    </div>
  );
}
