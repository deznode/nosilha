"use client";

import { ImageWithCourtesy } from "@/components/ui/image-with-courtesy";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

// Mapping from Heroicons names to Lucide names for backwards compatibility
const heroToLucideMap: Record<string, string> = {
  GlobeAltIcon: "Globe",
  MusicalNoteIcon: "Music",
  ClockIcon: "Clock",
  BookOpenIcon: "BookOpen",
  HeartIcon: "Heart",
  UserGroupIcon: "Users",
  MapIcon: "Map",
  CameraIcon: "Camera",
  // Kebab-case variants (from some MDX files)
  "globe-alt": "Globe",
  "musical-note": "Music",
  "book-open": "BookOpen",
  clock: "Clock",
  heart: "Heart",
  users: "Users",
  map: "Map",
  camera: "Camera",
};

function getLucideIcon(iconName: string): LucideIcon | null {
  // First check the mapping for Heroicons names
  const mappedName = heroToLucideMap[iconName];
  const lookupName = mappedName || iconName;

  // Type-safe lookup into LucideIcons module
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const icon = icons[lookupName];

  // Verify it's a valid component (has a render function)
  if (icon && typeof icon === "function") {
    return icon;
  }
  return null;
}

export interface ThematicSection {
  title: string;
  description: string;
  content: string;
  image: string;
  imageCourtesy: string;
  icon?: string; // Lucide icon name (e.g., "Music", "Globe") or legacy Heroicon name
}

interface ThematicSectionsProps {
  sections: ThematicSection[];
  sectionTitle?: string;
  className?: string;
}

export function ThematicSections({
  sections,
  sectionTitle = "Chapters of Our Story",
  className = "",
}: ThematicSectionsProps) {
  return (
    <section className={`mt-16 ${className}`}>
      {sectionTitle && (
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-text-primary mb-8 text-center font-serif text-2xl font-bold"
        >
          {sectionTitle}
        </motion.h3>
      )}

      <div className="space-y-12">
        {sections.map((section, index) => {
          // Get icon component dynamically using Lucide
          const IconComponent = section.icon
            ? getLucideIcon(section.icon)
            : null;

          return (
            <motion.div
              key={`${section.title}-${index}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`grid items-center gap-8 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="mb-4 flex items-center">
                  {IconComponent && (
                    <IconComponent className="text-ocean-blue mr-3 h-8 w-8" />
                  )}
                  <h4 className="text-text-primary font-serif text-xl font-bold">
                    {section.title}
                  </h4>
                </div>
                <p className="text-text-secondary mb-3 text-sm font-medium">
                  {section.description}
                </p>
                <p className="text-text-secondary">{section.content}</p>
              </div>
              <div
                className={`relative aspect-video w-full ${
                  index % 2 === 1 ? "lg:col-start-1" : ""
                }`}
              >
                <ImageWithCourtesy
                  src={section.image}
                  alt={section.description}
                  courtesy={section.imageCourtesy}
                  fill
                  className="rounded-lg object-cover object-top shadow-md transition-shadow duration-300 hover:shadow-xl"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
