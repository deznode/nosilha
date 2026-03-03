"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Button } from "@/components/catalyst-ui/button";

/**
 * HistoricalFigures Component
 *
 * Renders a grid of historical figures with their roles, years, and descriptions.
 * Designed for cultural heritage content pages.
 */

export interface HistoricalFigure {
  name: string;
  role: string;
  years: string;
  description: string;
  slug?: string;
}

interface HistoricalFiguresProps {
  figures: HistoricalFigure[];
  title?: string;
  subtitle?: string;
  exploreLink?: string;
  exploreLinkText?: string;
  className?: string;
}

export function HistoricalFigures({
  figures,
  title = "Cultural Architects",
  subtitle,
  exploreLink,
  exploreLinkText = "Explore All Historical Figures",
  className,
}: HistoricalFiguresProps) {
  return (
    <section
      className={clsx(
        "bg-surface border-hairline mt-16 rounded-lg border p-8 shadow-sm",
        className
      )}
    >
      <div className="mb-8 text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-text-primary mb-4 font-serif text-2xl font-bold"
        >
          {title}
        </motion.h3>
        {subtitle && <p className="text-text-secondary mb-6">{subtitle}</p>}
        {exploreLink && (
          <Button href={exploreLink} color="blue">
            {exploreLinkText}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              data-slot="icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {figures.map((figure, index) => (
          <motion.div
            key={`${figure.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="hover-surface border-ocean-blue rounded-r-lg border-l-4 p-4 pl-6 transition-colors duration-300"
          >
            <h4 className="text-text-primary text-lg font-semibold">
              {figure.slug ? (
                <Link
                  href={`/people/${figure.slug}`}
                  className="hover:text-ocean-blue transition-colors"
                >
                  {figure.name}
                </Link>
              ) : (
                figure.name
              )}
            </h4>
            <p className="text-ocean-blue mb-2 text-sm font-medium">
              {figure.role} • {figure.years}
            </p>
            <p className="text-text-secondary text-sm">{figure.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
