'use client';

import { BookOpenIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Citation = {
  source: string;
  author: string;
  year: number;
  url?: string;
};

type CitationSectionProps = {
  citations: Citation[];
};

export function CitationSection({ citations }: CitationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BookOpenIcon className="h-8 w-8 text-ocean-blue mr-3" />
          <h3 className="font-serif text-2xl font-bold text-text-primary">
            Sources & Citations
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronDownIcon
            className={`h-6 w-6 text-gray-600 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>
      <p className="text-text-secondary mb-6">
        The information presented in this article is based on a variety of historical and academic sources. We believe in giving credit to the researchers, writers, and institutions that have done the hard work of preserving and sharing Brava&apos;s history.
      </p>
      {isOpen && (
        <ul className="space-y-4 mt-6">
          {citations.map((citation, index) => (
            <li key={index} className="border-l-4 border-ocean-blue pl-4">
              <p className="text-text-primary font-semibold">
                {citation.source}
              </p>
              <p className="text-text-secondary text-sm">
                By {citation.author} ({citation.year})
              </p>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ocean-blue hover:underline text-sm"
                >
                  Read More
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
