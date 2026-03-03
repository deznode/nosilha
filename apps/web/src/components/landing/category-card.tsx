import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryCardProps } from "@/types/landing";

/**
 * CategoryCard - Navigation cards for main directory areas
 * Simplified: CSS-only hover effects, no lift animation
 */
export function CategoryCard({
  icon: Icon,
  title,
  description,
  colorClass,
  href,
  actionText = "Explore Section",
  className,
}: CategoryCardProps & { className?: string }) {
  return (
    <Link
      href={href}
      className={`group bg-surface relative block h-full overflow-hidden rounded-lg border-t-4 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md ${colorClass.replace("bg-", "border-")} ${className || ""}`}
    >
      {/* Icon container */}
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${colorClass} text-white shadow-md`}
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

      {/* CTA */}
      <div className="text-ocean-blue absolute bottom-6 left-6 flex items-center text-sm font-bold opacity-70 transition-opacity duration-200 group-hover:opacity-100">
        {actionText} <ArrowRight size={16} className="ml-1" />
      </div>
    </Link>
  );
}
