"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { PrintPageWrapper } from "@/components/ui/print-page-wrapper";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { PageHeader } from "@/components/ui/page-header";
import {
  LANGUAGE_NAMES,
  LANGUAGE_COOKIE_NAME,
  type Language,
} from "@/lib/content/translations";

interface ArticleLayoutProps {
  title: string;
  description: string;
  publishDate: string;
  updatedDate?: string;
  author: string;
  category: string;
  tags: string[];
  coverImage?: string;
  children: ReactNode;
  // Language switcher props
  slug: string;
  availableLanguages?: Language[];
  currentLanguage?: Language;
  isFallback?: boolean;
  requestedLanguage?: Language;
}

export function ArticleLayout({
  title,
  description,
  publishDate,
  author,
  category,
  tags,
  children,
  slug,
  availableLanguages = [],
  currentLanguage = "en",
  isFallback = false,
  requestedLanguage,
}: ArticleLayoutProps) {
  return (
    <PrintPageWrapper>
      <article
        className="mx-auto max-w-4xl px-4 py-8"
        data-pagefind-body
        data-pagefind-meta={`title:${title}, category:${category}`}
        data-pagefind-filter={`category:${category}, language:${currentLanguage}`}
      >
        {/* Fallback indicator */}
        {isFallback && requestedLanguage && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This content is not available in{" "}
              {LANGUAGE_NAMES[requestedLanguage]}. Showing{" "}
              {LANGUAGE_NAMES[currentLanguage]} version.
            </p>
          </div>
        )}

        {/* Article header */}
        <PageHeader title={title} subtitle={description} />

        {/* Article metadata */}
        <div className="text-nosihla-text-secondary mb-8 flex flex-wrap gap-4 text-sm dark:text-gray-400">
          <span>
            Published:{" "}
            {new Date(publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>By {author}</span>
          <span className="capitalize">{category}</span>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-nosihla-ocean-blue/10 text-nosihla-ocean-blue dark:bg-nosihla-ocean-blue/20 dark:text-nosihla-ocean-blue-light rounded-full px-3 py-1 text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Language switcher */}
        {availableLanguages.length > 1 && (
          <div className="mb-8 flex gap-2">
            {availableLanguages.map((lang) => (
              <Link
                key={lang}
                href={`/${category}/${slug}?lang=${lang}`}
                onClick={() => {
                  // Set cookie to persist language preference (1 year expiry)
                  document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
                }}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  lang === currentLanguage
                    ? "bg-ocean-blue text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                aria-current={lang === currentLanguage ? "page" : undefined}
              >
                {LANGUAGE_NAMES[lang]}
              </Link>
            ))}
          </div>
        )}

        {/* Article content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {children}
        </div>

        <BackToTopButton />
      </article>
    </PrintPageWrapper>
  );
}
