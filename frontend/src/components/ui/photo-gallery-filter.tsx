"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

interface Photo {
  src: string;
  alt: string;
  location: string;
  date: string;
  description: string;
}

interface Gallery {
  id: string;
  title: string;
  description: string;
  category: string;
  imageCount: number;
  coverImage: string;
  featured: boolean;
  culturalContext: string;
  location: string;
  photos: Photo[];
}

interface Category {
  name: string;
  value: string;
  count: number;
}

interface PhotoGalleryFilterProps {
  galleries: Gallery[];
  categories: Category[];
}

export function PhotoGalleryFilter({
  galleries,
  categories,
}: PhotoGalleryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredGalleries = galleries.filter(
    (gallery) =>
      selectedCategory === "all" ||
      gallery.category.toLowerCase() === selectedCategory
  );

  const featuredGalleries = filteredGalleries.filter(
    (gallery) => gallery.featured
  );
  const otherGalleries = filteredGalleries.filter(
    (gallery) => !gallery.featured
  );

  return (
    <>
      {/* Category Filter */}
      <section className="mt-16">
        <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
          Browse by Category
        </h3>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`rounded-full px-4 py-2 font-medium transition-colors ${
                selectedCategory === category.value
                  ? "bg-ocean-blue text-white"
                  : "bg-background-primary text-text-primary hover:bg-ocean-blue/10 border-border-primary border"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <div
              key={category.value}
              className="bg-background-primary border-border-primary rounded-lg border p-6 text-center shadow-sm"
            >
              <div className="text-ocean-blue mb-1 text-2xl font-bold">
                {category.count}
              </div>
              <div className="text-text-primary text-sm font-medium">
                {category.name}
              </div>
              <div className="text-text-secondary text-xs">photographs</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Galleries */}
      {featuredGalleries.length > 0 && (
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
            {selectedCategory === "all"
              ? "Featured Galleries"
              : `Featured ${categories.find((c) => c.value === selectedCategory)?.name} Galleries`}
          </h3>

          <div className="grid gap-8 lg:grid-cols-3">
            {featuredGalleries.map((gallery) => (
              <div
                key={gallery.id}
                className="bg-background-primary border-border-primary overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-48">
                  <Image
                    src={gallery.coverImage}
                    alt={`${gallery.title} gallery cover`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background-primary/90 text-text-primary rounded px-2 py-1 text-xs font-medium">
                      {gallery.category}
                    </span>
                  </div>
                  <div className="absolute right-4 bottom-4">
                    <span className="flex items-center rounded bg-black/70 px-2 py-1 text-xs text-white">
                      <PhotoIcon className="mr-1 h-3 w-3" />
                      {gallery.imageCount}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-text-primary mb-2 font-serif text-xl font-bold">
                    {gallery.title}
                  </h4>
                  <p className="text-text-secondary mb-4">
                    {gallery.description}
                  </p>

                  {/* Photo Preview Grid */}
                  <div className="mb-4 grid grid-cols-3 gap-1">
                    {gallery.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/media/photos/${gallery.id}`}
                    className="bg-ocean-blue hover:bg-ocean-blue/90 block w-full rounded px-4 py-2 text-center font-medium text-white transition-colors"
                  >
                    View Gallery
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other Galleries */}
      {otherGalleries.length > 0 && (
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
            {selectedCategory === "all"
              ? "More Galleries"
              : `More ${categories.find((c) => c.value === selectedCategory)?.name} Galleries`}
          </h3>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherGalleries.map((gallery) => (
              <div
                key={gallery.id}
                className="bg-background-primary border-border-primary rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={gallery.coverImage}
                      alt={`${gallery.title} gallery cover`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center">
                      <span className="bg-valley-green/10 text-valley-green rounded px-2 py-1 text-xs">
                        {gallery.category}
                      </span>
                      <span className="text-text-secondary ml-2 flex items-center text-xs">
                        <PhotoIcon className="mr-1 h-3 w-3" />
                        {gallery.imageCount}
                      </span>
                    </div>
                    <h4 className="text-text-primary mb-1 text-lg font-semibold">
                      {gallery.title}
                    </h4>
                    <p className="text-text-secondary mb-3 text-sm">
                      {gallery.description}
                    </p>
                    <Link
                      href={`/media/photos/${gallery.id}`}
                      className="text-ocean-blue hover:text-ocean-blue/80 text-sm font-medium"
                    >
                      View Gallery →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No Results Message */}
      {featuredGalleries.length === 0 &&
        otherGalleries.length === 0 &&
        selectedCategory !== "all" && (
          <section className="mt-16 text-center">
            <div className="bg-background-primary border-border-primary rounded-lg border p-8 shadow-sm">
              <PhotoIcon className="text-text-secondary mx-auto mb-4 h-12 w-12" />
              <h3 className="text-text-primary mb-2 font-serif text-xl font-bold">
                No {categories.find((c) => c.value === selectedCategory)?.name}{" "}
                Galleries Yet
              </h3>
              <p className="text-text-secondary mb-4">
                We're always looking for new photographs to showcase our
                island's beauty.
              </p>
              <Link
                href="/contribute"
                className="text-ocean-blue hover:text-ocean-blue/80 inline-flex items-center font-medium"
              >
                Share your photos with us →
              </Link>
            </div>
          </section>
        )}
    </>
  );
}
