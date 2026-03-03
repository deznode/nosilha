import { getEntryBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  BuildingOffice2Icon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { DirectoryEntry } from "@/types/directory";

interface DetailPageProps {
  params: { slug: string };
}

// A helper component to render the star rating display
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

// A helper to display category-specific details, demonstrating the power of the new type
function CategorySpecificDetails({ entry }: { entry: DirectoryEntry }) {
  // The 'details' object is now type-safe based on the category
  switch (entry.category) {
    case "Restaurant":
      return (
        <>
          <div className="flex items-start">
            <PhoneIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
            <p className="ml-3 text-base text-volcanic-gray">
              {entry.details.phoneNumber}
            </p>
          </div>
          <div className="flex items-start">
            <ClockIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
            <p className="ml-3 text-base text-volcanic-gray">
              {entry.details.openingHours}
            </p>
          </div>
          <div className="flex items-start">
            <SparklesIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
            <p className="ml-3 text-base text-volcanic-gray">
              Cuisine: {entry.details.cuisine.join(", ")}
            </p>
          </div>
        </>
      );
    case "Hotel":
      return (
        <>
          <div className="flex items-start">
            <PhoneIcon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
            <p className="ml-3 text-base text-volcanic-gray">
              {entry.details.phoneNumber}
            </p>
          </div>
          <div className="flex items-start">
            <BuildingOffice2Icon className="mt-1 h-5 w-5 flex-shrink-0 text-ocean-blue" />
            <p className="ml-3 text-base text-volcanic-gray">
              Amenities: {entry.details.amenities.join(", ")}
            </p>
          </div>
        </>
      );
    default:
      // No specific details to render for Beach or Landmark
      return null;
  }
}

export default async function DirectoryEntryDetailPage({
  params,
}: DetailPageProps) {
  const entry = await getEntryBySlug(params.slug);

  if (!entry) {
    notFound();
  }

  return (
    <div className="bg-off-white font-sans">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* --- Image Gallery --- */}
        <div className="grid h-[500px] grid-cols-3 grid-rows-2 gap-4">
          <div className="relative col-span-3 row-span-2 overflow-hidden rounded-xl lg:col-span-2">
            <Image
              src={entry.imageUrl}
              alt={`Main photo of ${entry.name}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>
          <div className="relative hidden overflow-hidden rounded-xl lg:block">
            <Image
              src={entry.imageUrl.replace("random=1", "random=5")}
              alt={`Secondary photo 1 of ${entry.name}`}
              fill
              className="object-cover"
              sizes="33vw"
            />
          </div>
          <div className="relative hidden overflow-hidden rounded-xl lg:block">
            <Image
              src={entry.imageUrl.replace("random=1", "random=6")}
              alt={`Secondary photo 2 of ${entry.name}`}
              fill
              className="object-cover"
              sizes="33vw"
            />
          </div>
        </div>

        {/* --- Main Content Layout (2-column) --- */}
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

            <h2 className="font-serif text-3xl font-bold text-volcanic-gray-dark">
              User Reviews
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-4xl font-bold text-volcanic-gray-dark">
                {entry.rating.toFixed(1)}
              </p>
              <div className="flex flex-col">
                <StarRating rating={entry.rating} />
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
                {/* Conditionally render details based on category */}
                <CategorySpecificDetails entry={entry} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
