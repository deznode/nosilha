import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeaturedStoryCard } from "./featured-story-card";
import type { FeaturedItem } from "@/types/landing";
import type { DirectoryEntry } from "@/types/directory";

interface FeaturedStoriesSectionProps {
  stories?: FeaturedItem[];
  entries?: DirectoryEntry[];
}

const defaultStories: FeaturedItem[] = [
  {
    id: "1",
    title: "Eugénio Tavares",
    category: "Historical Figure",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/Eug%C3%A9nio_Tavares.jpg",
    description:
      "Explore the life of the poet who immortalized the soul of Brava through Morna.",
    link: "/people/eugenio-tavares",
  },
  {
    id: "2",
    title: "Fajã d'Agua",
    category: "Towns & Bays",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Faj%C3%A3_de_%C3%81gua_02.jpg/1280px-Faj%C3%A3_de_%C3%81gua_02.jpg",
    description:
      "A stunning natural bay known for its crystal clear pools and lush mango trees.",
    link: "/towns/faja-dagua",
  },
  {
    id: "3",
    title: "Fontainhas",
    category: "Landmarks",
    image:
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
    description:
      "Discover the architectural beauty of Nova Sintra's historic gardens.",
    link: "/towns/nova-sintra",
  },
];

/**
 * Category-based fallback images when entry doesn't have an image URL.
 * Using distinct, relevant images prevents the "placeholder wall" effect.
 */
const categoryFallbackImages: Record<string, string> = {
  Hotel: "/images/history/brava-culture.webp",
  Beach: "/images/history/brava-formation.jpg",
  Landmark: "/images/history/brava-maritime.jpg",
  Restaurant: "/images/history/whaling-heritage.jpg",
  default: "/images/hero.jpg",
};

/**
 * Gets a fallback image based on category, ensuring visual variety
 */
function getFallbackImage(category: string): string {
  return categoryFallbackImages[category] || categoryFallbackImages.default;
}

/**
 * Converts DirectoryEntry from API to FeaturedItem format
 */
function directoryEntryToFeaturedItem(entry: DirectoryEntry): FeaturedItem {
  return {
    id: entry.id,
    title: entry.name,
    category: entry.category,
    image: entry.imageUrl || getFallbackImage(entry.category),
    description: entry.description || "",
    link: `/directory/entry/${entry.slug}`,
  };
}

/**
 * FeaturedStoriesSection - Featured content grid
 *
 * Displays 3 featured story cards with images and gradient overlays.
 * Can accept either static stories or API-fetched directory entries.
 */
export function FeaturedStoriesSection({
  stories,
  entries,
}: FeaturedStoriesSectionProps) {
  // Convert entries to stories if provided, otherwise use static stories
  const displayStories = entries
    ? entries.slice(0, 3).map(directoryEntryToFeaturedItem)
    : stories || defaultStories;

  return (
    <section className="bg-background-secondary py-24 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header with View All link */}
        <div className="mb-14 flex flex-col items-end justify-between gap-4 md:mb-16 md:flex-row">
          <div>
            <h2 className="text-text-primary mb-2 font-serif text-3xl font-bold md:text-4xl">
              Featured Stories
            </h2>
            <p className="text-text-secondary">
              Highlights from the archive and community.
            </p>
            <p className="text-text-secondary mt-2 max-w-xl text-sm">
              A rotating selection of stories, places, and memories from
              Brava—curated to help you dive in quickly.
            </p>
          </div>
          <Link
            href="/history"
            className="group text-ocean-blue hover:text-bougainvillea-pink flex items-center font-bold transition-colors"
          >
            View full archive{" "}
            <ArrowRight
              size={20}
              className="ml-2 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Story Cards Grid */}
        <div className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-16">
          {displayStories.map((item) => (
            <FeaturedStoryCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
