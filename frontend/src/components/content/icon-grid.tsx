"use client";

import { Music, BookOpen, Globe } from "lucide-react";

interface IconGridItem {
  icon: "musical-note" | "book-open" | "globe-alt";
  title: string;
  description: string;
  iconColor?:
    | "ocean-blue"
    | "valley-green"
    | "bougainvillea-pink"
    | "sobrado-ochre";
}

interface IconGridProps {
  title?: string;
  items: IconGridItem[];
  columns?: 2 | 3 | 4;
}

const iconComponents = {
  "musical-note": Music,
  "book-open": BookOpen,
  "globe-alt": Globe,
};

const iconColorClasses = {
  "ocean-blue": "text-ocean-blue",
  "valley-green": "text-valley-green",
  "bougainvillea-pink": "text-bougainvillea-pink",
  "sobrado-ochre": "text-sobrado-ochre",
};

export function IconGrid({ title, items, columns = 3 }: IconGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <section className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8">
      {title && (
        <h3 className="text-text-primary mb-6 text-center font-serif text-2xl font-bold">
          {title}
        </h3>
      )}

      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {items.map((item, index) => {
          const IconComponent = iconComponents[item.icon];
          const iconColor = item.iconColor || "ocean-blue";

          return (
            <div key={index} className="text-center">
              <IconComponent
                className={`${iconColorClasses[iconColor]} mx-auto mb-3 h-12 w-12`}
              />
              <h4 className="text-text-primary mb-2 font-semibold">
                {item.title}
              </h4>
              <p className="text-text-secondary text-sm">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
