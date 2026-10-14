"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("common.citations");

  return (
    <section className="bg-background-primary border-border-primary shadow-subtle mt-16 rounded-lg border p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <BookOpen className="text-ocean-blue mr-3 h-8 w-8" />
          <h3 className="text-text-primary font-serif text-2xl font-bold">
            {t("title")}
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover-surface-strong rounded-full p-2"
          aria-expanded={isOpen}
          aria-label={isOpen ? t("hide") : t("show")}
        >
          <ChevronDown
            className={`text-basalt-500 h-6 w-6 transition-transform ${
              isOpen ? "rotate-180 transform" : ""
            }`}
          />
        </button>
      </div>
      <p className="text-text-secondary mb-6">{t("intro")}</p>
      {isOpen && (
        <ul className="mt-6 space-y-4">
          {citations.map((citation, index) => (
            <li key={index} className="border-ocean-blue border-l-4 pl-4">
              <p className="text-text-primary font-semibold">
                {citation.source}
              </p>
              <p className="text-text-secondary text-sm">
                {t("byline", {
                  author: citation.author,
                  year: String(citation.year),
                })}
              </p>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ocean-blue text-sm hover:underline"
                >
                  {t("readMore")}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
