"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  PhotoIcon,
  HeartIcon,
  CameraIcon
} from "@heroicons/react/24/outline";

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

export function PhotoGalleryFilter({ galleries, categories }: PhotoGalleryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const filteredGalleries = galleries.filter(gallery => 
    selectedCategory === "all" || gallery.category.toLowerCase() === selectedCategory
  );
  
  const featuredGalleries = filteredGalleries.filter(gallery => gallery.featured);
  const otherGalleries = filteredGalleries.filter(gallery => !gallery.featured);

  return (
    <>
      {/* Category Filter */}
      <section className="mt-16">
        <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
          Browse by Category
        </h3>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.value
                  ? "bg-ocean-blue text-white"
                  : "bg-background-primary text-text-primary hover:bg-ocean-blue/10 border border-border-primary"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <div key={category.value} className="bg-background-primary p-6 rounded-lg shadow-sm text-center border border-border-primary">
              <div className="text-2xl font-bold text-ocean-blue mb-1">{category.count}</div>
              <div className="text-sm text-text-primary font-medium">{category.name}</div>
              <div className="text-xs text-text-secondary">photographs</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Galleries */}
      {featuredGalleries.length > 0 && (
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
            {selectedCategory === "all" ? "Featured Galleries" : `Featured ${categories.find(c => c.value === selectedCategory)?.name} Galleries`}
          </h3>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {featuredGalleries.map((gallery) => (
              <div key={gallery.id} className="bg-background-primary rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-border-primary">
                <div className="relative h-48">
                  <Image
                    src={gallery.coverImage}
                    alt={`${gallery.title} gallery cover`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background-primary/90 text-text-primary px-2 py-1 rounded text-xs font-medium">
                      {gallery.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                      <PhotoIcon className="h-3 w-3 mr-1" />
                      {gallery.imageCount}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-serif text-xl font-bold text-text-primary mb-2">
                    {gallery.title}
                  </h4>
                  <p className="text-text-secondary mb-4">
                    {gallery.description}
                  </p>
                  
                  {/* Photo Preview Grid */}
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {gallery.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href={`/media/photos/${gallery.id}`}
                    className="block w-full bg-ocean-blue text-white py-2 px-4 rounded font-medium hover:bg-ocean-blue/90 transition-colors text-center"
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
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
            {selectedCategory === "all" ? "More Galleries" : `More ${categories.find(c => c.value === selectedCategory)?.name} Galleries`}
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherGalleries.map((gallery) => (
              <div key={gallery.id} className="bg-background-primary p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border-primary">
                <div className="flex items-start space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={gallery.coverImage}
                      alt={`${gallery.title} gallery cover`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-xs bg-valley-green/10 text-valley-green px-2 py-1 rounded">
                        {gallery.category}
                      </span>
                      <span className="text-xs text-text-secondary ml-2 flex items-center">
                        <PhotoIcon className="h-3 w-3 mr-1" />
                        {gallery.imageCount}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg text-text-primary mb-1">
                      {gallery.title}
                    </h4>
                    <p className="text-sm text-text-secondary mb-3">
                      {gallery.description}
                    </p>
                    <Link
                      href={`/media/photos/${gallery.id}`}
                      className="text-sm text-ocean-blue hover:text-ocean-blue/80 font-medium"
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
      {featuredGalleries.length === 0 && otherGalleries.length === 0 && selectedCategory !== "all" && (
        <section className="mt-16 text-center">
          <div className="bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
            <PhotoIcon className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
              No {categories.find(c => c.value === selectedCategory)?.name} Galleries Yet
            </h3>
            <p className="text-text-secondary mb-4">
              We're always looking for new photographs to showcase our island's beauty.
            </p>
            <Link
              href="/contribute"
              className="inline-flex items-center text-ocean-blue hover:text-ocean-blue/80 font-medium"
            >
              Share your photos with us →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}