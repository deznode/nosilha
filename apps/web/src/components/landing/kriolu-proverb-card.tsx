import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import type { KrioluProverb } from "@/types/landing";

/**
 * KrioluProverbCard - Displays a Kriolu proverb with translation
 *
 * Blue background card with decorative elements and optional link
 * to learn more phrases.
 */
export function KrioluProverbCard({
  proverb,
  translation,
  href = "/language",
}: KrioluProverb) {
  return (
    <div className="bg-ocean-blue-light dark:bg-ocean-blue-deep rounded-container shadow-lift relative overflow-hidden p-8 text-white">
      {/* Decorative blur circle */}
      <div className="bg-sobrado-ochre absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full opacity-20 blur-xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-sobrado-ochre mb-4 flex items-center space-x-2 text-xs font-bold tracking-widest uppercase">
          <BookOpen className="h-4 w-4" />
          <span>Kriolu Wisdom</span>
        </div>

        {/* Proverb */}
        <blockquote className="mb-4 font-serif text-2xl leading-relaxed font-bold">
          &ldquo;{proverb}&rdquo;
        </blockquote>

        {/* Translation */}
        <p className="border-sobrado-ochre mb-4 border-l-2 pl-3 text-sm text-white/80 italic">
          &ldquo;{translation}&rdquo;
        </p>

        {/* Learn more link */}
        {href && (
          <Link
            href={href}
            className="text-sobrado-ochre inline-flex items-center text-xs font-bold transition-colors hover:text-white"
          >
            Learn more phrases <ArrowRight size={12} className="ml-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
