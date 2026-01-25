import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { FeaturedItem } from "@/types/landing";

interface FeaturedStoryCardProps {
  item: FeaturedItem;
}

/**
 * FeaturedStoryCard - Highlighting specific heritage items
 *
 * Full-height image card with gradient overlay and hover effects.
 * Used in the Featured Stories section.
 */
export function FeaturedStoryCard({ item }: FeaturedStoryCardProps) {
  return (
    <Link
      href={item.link}
      className="group rounded-container shadow-elevated ease-calm hover:shadow-floating relative block h-96 cursor-pointer overflow-hidden transition-shadow duration-200"
    >
      {/* Image Background */}
      <div className="bg-mist-200 absolute inset-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Gradient Overlay - Strengthened for WCAG text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 transition-opacity duration-300 group-hover:from-black/100" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full translate-y-2 transform p-6 text-white transition-transform duration-300 group-hover:translate-y-0 md:p-8">
        <span className="bg-bougainvillea-pink mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-md">
          {item.category}
        </span>
        <h3 className="mb-2 font-serif text-2xl leading-tight font-bold">
          {item.title}
        </h3>
        <p className="text-mist-200 mb-4 line-clamp-2 text-sm opacity-0 transition-opacity delay-100 duration-500 group-hover:opacity-100">
          {item.description}
        </p>
        <div className="text-sobrado-ochre flex w-max items-center border-b border-white/30 pb-1 text-sm font-bold transition-colors group-hover:border-white group-hover:text-amber-100">
          Read Story{" "}
          <ArrowRight
            size={16}
            className="ml-2 transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}
