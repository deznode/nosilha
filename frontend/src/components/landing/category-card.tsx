import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryCardProps } from "@/types/landing";

/**
 * CategoryCard - Navigation cards for main directory areas
 *
 * Features color-coded icons, hover effects, and animated arrow reveal.
 */
export function CategoryCard({
  icon: Icon,
  title,
  description,
  colorClass,
  href,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group border-border-secondary hover:border-ocean-blue/30 relative block h-full overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Background accent circle */}
      <div
        className={`absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass}`}
      />

      {/* Icon container */}
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colorClass} text-white shadow-md`}
      >
        <Icon size={24} />
      </div>

      {/* Content */}
      <h3 className="text-text-primary group-hover:text-ocean-blue mb-2 font-serif text-xl font-bold transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary mb-8 text-sm leading-relaxed">
        {description}
      </p>

      {/* Hover reveal arrow */}
      <div className="text-ocean-blue absolute bottom-6 left-6 flex -translate-x-4 items-center text-sm font-bold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        Explore Section <ArrowRight size={16} className="ml-1" />
      </div>
    </Link>
  );
}
