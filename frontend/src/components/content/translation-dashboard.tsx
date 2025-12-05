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
      "bg-sobrado-ochre/20 text-sobrado-ochre dark:bg-sobrado-ochre/10 dark:text-sobrado-ochre",
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
        <div className="bg-surface rounded-lg p-4 shadow">
          <p className="text-muted text-sm">Total Articles</p>
          <p className="text-body text-2xl font-bold">{stats.totalArticles}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow">
          <p className="text-muted text-sm">Translation Coverage</p>
          <p className="text-body text-2xl font-bold">{stats.coverage}%</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow">
          <p className="text-muted text-sm">Missing Translations</p>
          <p className="text-status-error text-2xl font-bold">
            {stats.missingTranslations}
          </p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow">
          <p className="text-muted text-sm">Outdated Translations</p>
          <p className="text-sobrado-ochre text-2xl font-bold">
            {stats.outdatedTranslations}
          </p>
        </div>
      </div>

      {/* Translation Matrix */}
      <div className="bg-surface overflow-x-auto rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-hairline border-b">
              <th className="text-body px-4 py-3 text-left text-sm font-semibold">
                Article
              </th>
              <th className="text-body px-4 py-3 text-left text-sm font-semibold">
                Category
              </th>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <th
                  key={lang}
                  className="text-body px-4 py-3 text-center text-sm font-semibold"
                >
                  {LANGUAGE_NAMES[lang]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-hairline divide-y">
            {Array.from(articlesBySlug.entries()).map(
              ([slug, translations]) => {
                const englishArticle = translations.find(
                  (t) => t.language === "en"
                );
                return (
                  <tr key={slug} className="hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${englishArticle?.category || "articles"}/${slug}`}
                        className="text-ocean-blue text-sm font-medium hover:underline"
                      >
                        {englishArticle?.title || slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted text-sm capitalize">
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
          <p className="text-muted">
            No articles found. Create your first article to see translation
            status.
          </p>
        </div>
      )}
    </div>
  );
}
