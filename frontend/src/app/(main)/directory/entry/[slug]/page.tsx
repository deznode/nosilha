import Image from "next/image";
import { getEntryBySlug } from "@/lib/api";
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
import { getRestaurantDetails, getHotelDetails } from "@/lib/api-validation";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            rating > i ? "text-sunny-yellow" : "text-gray-300"
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
              <PhoneIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
              <p className="ml-3 text-base text-volcanic-gray">
                {restaurantDetails.phoneNumber}
              </p>
            </div>
          )}
          {restaurantDetails.openingHours && (
            <div className="flex items-start">
              <ClockIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
              <p className="ml-3 text-base text-volcanic-gray">
                {restaurantDetails.openingHours}
              </p>
            </div>
          )}
          {restaurantDetails.cuisine.length > 0 && (
            <div className="flex items-start">
              <SparklesIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
              <p className="ml-3 text-base text-volcanic-gray">
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
              <PhoneIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
              <p className="ml-3 text-base text-volcanic-gray">
                {hotelDetails.phoneNumber}
              </p>
            </div>
          )}
          {hotelDetails.amenities.length > 0 && (
            <div className="flex items-start">
              <BuildingOffice2Icon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
              <p className="ml-3 text-base text-volcanic-gray">
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

  // Simulate image data with a static array
  const sampleImages = [
    "https://picsum.photos/800/600?random=11",
    "https://picsum.photos/800/600?random=12",
    "https://picsum.photos/800/600?random=13",
    "https://picsum.photos/800/600?random=14",
    "https://picsum.photos/800/600?random=15",
    "https://picsum.photos/800/600?random=16",
  ];

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
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <span className="text-xl text-gray-500">No image available</span>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
          {/* Left Column: Details & Reviews */}
          <div className="lg:col-span-2">
            <h1 className="font-serif text-4xl font-bold text-volcanic-gray-dark sm:text-5xl">
              {entry.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-volcanic-gray">
              {entry.description}
            </p>

            <div className="my-8 border-t border-gray-200" />

            {/* --- NEW: Image Gallery Section --- */}
            <div className="space-y-4">
              <h2 className="font-serif text-3xl font-bold text-volcanic-gray-dark">
                Gallery
              </h2>
              <ImageGallery imageUrls={sampleImages} />
            </div>

            <div className="my-8 border-t border-gray-200" />

            <h2 className="font-serif text-3xl font-bold text-volcanic-gray-dark">
              User Reviews
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-4xl font-bold text-volcanic-gray-dark">
                {entry.rating?.toFixed(1) || 'N/A'}
              </p>
              <div className="flex flex-col">
                <StarRating rating={entry.rating || 0} />
                <p className="text-sm text-volcanic-gray">
                  Based on {entry.reviewCount} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar): Map & Info */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="aspect-video w-full rounded-md bg-gray-200">
                <div className="flex h-full w-full items-center justify-center">
                  <MapPinIcon className="h-12 w-12 text-volcanic-gray" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <MapPinIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
                  <p className="ml-3 text-base text-volcanic-gray">
                    {entry.town}, Brava, Cape Verde
                  </p>
                </div>
                <CategorySpecificDetails entry={entry} />
              </div>
            </div>
          </div>
        </div>

        <div className="my-16 border-t border-gray-200" />

        {/* --- NEW: Image Uploader Section --- */}
        <ContributePhotosSection />
      </div>
    </div>
  );
}
