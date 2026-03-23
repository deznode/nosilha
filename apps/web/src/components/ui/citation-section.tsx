"use client";

import { BookOpen, ChevronDown } from "lucide-react";
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
    <section className="bg-background-primary border-border-primary shadow-subtle mt-16 rounded-lg border p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <BookOpen className="text-ocean-blue mr-3 h-8 w-8" />
          <h3 className="text-text-primary font-serif text-2xl font-bold">
            Sources & Citations
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover-surface-strong rounded-full p-2"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide citations" : "Show citations"}
        >
          <ChevronDown
            className={`text-basalt-500 h-6 w-6 transition-transform ${
              isOpen ? "rotate-180 transform" : ""
            }`}
          />
        </button>
      </div>
      <p className="text-text-secondary mb-6">
        The information presented in this article is based on a variety of
        historical and academic sources. We believe in giving credit to the
        researchers, writers, and institutions that have done the hard work of
        preserving and sharing Brava&apos;s history.
      </p>
      {isOpen && (
        <ul className="mt-6 space-y-4">
          {citations.map((citation, index) => (
            <li key={index} className="border-ocean-blue border-l-4 pl-4">
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
                  className="text-ocean-blue text-sm hover:underline"
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
