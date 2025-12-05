"use client";

import { MapPin, BookOpen, Compass, Music } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "./section-header";
import { CategoryCard } from "./category-card";
import type { CategoryCardProps } from "@/types/landing";

interface ExploreHeritageSectionProps {
  categories?: CategoryCardProps[];
}

const defaultCategories: CategoryCardProps[] = [
  {
    icon: MapPin,
    title: "Towns & Villages",
    description:
      "Detailed guides to Nova Sintra, Furna, Nossa Senhora do Monte, and more.",
    colorClass: "bg-ocean-blue",
    href: "/towns",
  },
  {
    icon: BookOpen,
    title: "History & Archive",
    description:
      "Digital archives of historical documents, genealogies, and timelines.",
    colorClass: "bg-bougainvillea-pink",
    href: "/history",
  },
  {
    icon: Compass,
    title: "Tourism Directory",
    description: "Curated listings of local hotels, restaurants, and guides.",
    colorClass: "bg-valley-green",
    href: "/directory/all",
  },
  {
    icon: Music,
    title: "Culture & Arts",
    description: "The home of Morna, festivals, and local artisans.",
    colorClass: "bg-sobrado-ochre",
    href: "/culture",
  },
];

/**
 * ExploreHeritageSection - Navigation grid (Bento Box Style)
 *
 * Displays category cards for navigating main sections of the site.
 * Features rounded top corners that overlap the hero section.
 * Now uses a Bento Grid layout for visual interest.
 */
export function ExploreHeritageSection({
  categories = defaultCategories,
}: ExploreHeritageSectionProps) {
  return (
    <section className="bg-background-secondary relative z-20 -mt-20 rounded-t-[3rem] py-20">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          title="Explore Our Heritage"
          subtitle="Dive into the rich tapestry of Brava's culture, from the mist-covered peaks of Nova Sintra to the historic shores of Furna."
          centered
        />

        <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={index === 0 ? "md:col-span-2 md:row-span-2" : ""}
            >
              <CategoryCard {...category} className="h-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
