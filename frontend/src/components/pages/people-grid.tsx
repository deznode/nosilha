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
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Coming Soon
            </span>
          </div>
          <h2 className="font-merriweather mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Research in Progress
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            We are conducting careful research to properly document the
            remarkable individuals who shaped Brava&apos;s cultural heritage.
            Our goal is to present accurate, well-sourced information that
            honors their legacies.
          </p>
          <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Expected:</span> Q1 2026
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Do you have stories, photos, or information about historical figures
            from Brava? We&apos;d love to hear from you.{" "}
            <a
              href="/contact"
              className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
          className="group block overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
        >
          <div className="p-4">
            <span className="text-text-secondary text-xs">
              {new Date(page.publishDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <h3 className="font-merriweather text-text-primary group-hover:text-ocean-blue mt-2 line-clamp-2 font-semibold transition-colors dark:text-white">
              {page.title}
            </h3>
            <p className="text-text-secondary mt-2 line-clamp-3 text-sm">
              {page.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {page.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
