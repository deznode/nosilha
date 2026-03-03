/**
 * ThematicSections Component
 *
 * Renders thematic content sections with alternating image layouts.
 * Supports icons, images with courtesy attribution, and rich content.
 * Designed for cultural heritage content pages.
 */

import { ImageWithCourtesy } from "@/components/ui/image-with-courtesy";
import * as HeroIcons from "@heroicons/react/24/outline";

export interface ThematicSection {
  title: string;
  description: string;
  content: string;
  image: string;
  imageCourtesy: string;
  icon?: string; // Name of Heroicon (e.g., "MusicalNoteIcon")
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
        <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
          {sectionTitle}
        </h3>
      )}

      <div className="space-y-12">
        {sections.map((section, index) => {
          // Get icon component dynamically
          const IconComponent = section.icon
            ? (
                HeroIcons as Record<
                  string,
                  React.ComponentType<{ className?: string }>
                >
              )[section.icon]
            : null;

          return (
            <div
              key={`${section.title}-${index}`}
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
                  className="rounded-lg object-cover object-top"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
