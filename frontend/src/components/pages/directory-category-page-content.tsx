"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import { formatCategoryTitle } from "@/lib/directory-utils";
import type { DirectoryEntry } from "@/types/directory";
import Link from "next/link";

export interface DirectoryCategoryPageContentProps {
  category: string;
  entries: DirectoryEntry[];
}

export function DirectoryCategoryPageContent({
  category,
  entries,
}: DirectoryCategoryPageContentProps) {
  const pageTitle = formatCategoryTitle(category);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = entries.filter(
    (entry) =>
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.town.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title={pageTitle}
          subtitle={`Browse all ${pageTitle.toLowerCase()} listings on Brava Island.`}
        />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-12 max-w-md"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="text-basalt-500 h-5 w-5" />
            </div>
            <input
              type="text"
              className="focus:ring-ocean-blue/30 focus:border-ocean-blue border-mist-200 block w-full rounded-full bg-white py-3 pr-4 pl-10 text-sm shadow-sm transition-all focus:ring-4 focus:outline-none"
              placeholder="Filter by name or town..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {filteredEntries.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <DirectoryCard entry={entry} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 text-center"
          >
            <p className="text-text-secondary text-xl">
              {entries.length === 0
                ? `No listings found in the "${pageTitle}" category.`
                : "No listings match your search."}
            </p>
            <p className="text-text-tertiary mt-2 text-base">
              Please try another category or check back later.
            </p>
            <Link
              href="/"
              className="bg-ocean-blue hover:bg-ocean-blue/90 focus:ring-ocean-blue mt-6 inline-block rounded-md px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              Back to Home
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
