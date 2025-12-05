"use client";

import { motion } from "framer-motion";

interface PersonPage {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  tags: string[];
  category: string;
  language: string;
  draft?: boolean;
}

interface PeopleGridProps {
  people: PersonPage[];
}

export function PeopleGrid({ people }: PeopleGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (people.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 text-center"
      >
        <div className="border-hairline bg-surface mx-auto max-w-2xl rounded-lg border p-8 shadow-sm">
          <div className="mb-6">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Coming Soon
            </span>
          </div>
          <h2 className="font-merriweather text-body mb-4 text-2xl font-bold">
            Research in Progress
          </h2>
          <p className="text-muted mb-6">
            We are conducting careful research to properly document the
            remarkable individuals who shaped Brava&apos;s cultural heritage.
            Our goal is to present accurate, well-sourced information that
            honors their legacies.
          </p>
          <div className="bg-surface-alt mb-6 rounded-lg p-4">
            <p className="text-muted text-sm">
              <span className="font-semibold">Expected:</span> Q1 2026
            </p>
          </div>
          <p className="text-muted text-sm">
            Do you have stories, photos, or information about historical figures
            from Brava? We&apos;d love to hear from you.{" "}
            <a
              href="/contact"
              className="text-ocean-blue hover:text-ocean-blue-light underline"
            >
              Get in touch
            </a>
            .
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {people.map((page) => (
        <motion.a
          key={page.slug}
          href={`/people/${page.slug}`}
          variants={itemVariants}
          className="group bg-surface block overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="p-4">
            <span className="text-text-secondary text-xs">
              {new Date(page.publishDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <h3 className="font-merriweather text-body group-hover:text-ocean-blue mt-2 line-clamp-2 font-semibold transition-colors">
              {page.title}
            </h3>
            <p className="text-text-secondary mt-2 line-clamp-3 text-sm">
              {page.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {page.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-alt text-muted rounded px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}
