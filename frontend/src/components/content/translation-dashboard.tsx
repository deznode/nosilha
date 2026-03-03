"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  type Language,
  type TranslationStatus,
} from "@/lib/content/translations";

interface ArticleTranslation {
  slug: string;
  category: string;
  title: string;
  language: Language;
  publishDate: string;
  updatedDate?: string;
  sourceHash?: string;
}

interface TranslationDashboardProps {
  articles: ArticleTranslation[];
}

interface TranslationStatusBadgeProps {
  status: TranslationStatus;
}

function TranslationStatusBadge({ status }: TranslationStatusBadgeProps) {
  const styles = {
    current:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    outdated:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    missing: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const labels = {
    current: "Current",
    outdated: "Outdated",
    missing: "Missing",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function TranslationDashboard({ articles }: TranslationDashboardProps) {
  // Group articles by slug
  const articlesBySlug = useMemo(() => {
    const grouped = new Map<string, ArticleTranslation[]>();
    for (const article of articles) {
      const existing = grouped.get(article.slug) || [];
      existing.push(article);
      grouped.set(article.slug, existing);
    }
    return grouped;
  }, [articles]);

  // Calculate statistics
  const stats = useMemo(() => {
    let totalTranslations = 0;
    let missingTranslations = 0;
    let outdatedTranslations = 0;

    articlesBySlug.forEach((translations) => {
      const englishArticle = translations.find((t) => t.language === "en");
      const sourceHash = englishArticle?.sourceHash;

      SUPPORTED_LANGUAGES.forEach((lang) => {
        if (lang === "en") return; // Skip source language
        totalTranslations++;

        const translation = translations.find((t) => t.language === lang);
        if (!translation) {
          missingTranslations++;
        } else if (sourceHash && translation.sourceHash !== sourceHash) {
          outdatedTranslations++;
        }
      });
    });

    return {
      totalArticles: articlesBySlug.size,
      totalTranslations,
      missingTranslations,
      outdatedTranslations,
      currentTranslations:
        totalTranslations - missingTranslations - outdatedTranslations,
      coverage: Math.round(
        ((totalTranslations - missingTranslations) / totalTranslations) * 100
      ),
    };
  }, [articlesBySlug]);

  // Get status for a specific translation
  const getStatus = (
    translations: ArticleTranslation[],
    lang: Language
  ): TranslationStatus => {
    if (lang === "en") return "current";

    const translation = translations.find((t) => t.language === lang);
    if (!translation) return "missing";

    const englishArticle = translations.find((t) => t.language === "en");
    if (
      englishArticle?.sourceHash &&
      translation.sourceHash !== englishArticle.sourceHash
    ) {
      return "outdated";
    }

    return "current";
  };

  return (
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Articles
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalArticles}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Translation Coverage
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.coverage}%
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Missing Translations
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.missingTranslations}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Outdated Translations
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.outdatedTranslations}
          </p>
        </div>
      </div>

      {/* Translation Matrix */}
      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Article
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Category
              </th>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <th
                  key={lang}
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {LANGUAGE_NAMES[lang]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from(articlesBySlug.entries()).map(
              ([slug, translations]) => {
                const englishArticle = translations.find(
                  (t) => t.language === "en"
                );
                return (
                  <tr
                    key={slug}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/${englishArticle?.category || "articles"}/${slug}`}
                        className="text-ocean-blue text-sm font-medium hover:underline"
                      >
                        {englishArticle?.title || slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 capitalize dark:text-gray-400">
                        {englishArticle?.category}
                      </span>
                    </td>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <td key={lang} className="px-4 py-3 text-center">
                        <TranslationStatusBadge
                          status={getStatus(translations, lang)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {articlesBySlug.size === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No articles found. Create your first article to see translation
            status.
          </p>
        </div>
      )}
    </div>
  );
}
