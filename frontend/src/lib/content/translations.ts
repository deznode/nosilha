import crypto from "crypto";

/**
 * Supported languages in the platform
 */
export const SUPPORTED_LANGUAGES = ["en", "pt", "kea", "fr"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Cookie name for language preference
 */
export const LANGUAGE_COOKIE_NAME = "nosilha-lang";

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  pt: "Português",
  kea: "Kriolu",
  fr: "Français",
};

/**
 * Fallback chains for missing translations
 * KEA → PT → EN
 * FR → EN
 * PT → EN
 */
export const FALLBACK_CHAINS: Record<Language, Language[]> = {
  kea: ["pt", "en"],
  fr: ["en"],
  pt: ["en"],
  en: [],
};

/**
 * Translation status types
 */
export type TranslationStatus = "current" | "outdated" | "missing";

/**
 * Translation metadata for an article
 */
export interface TranslationInfo {
  language: Language;
  status: TranslationStatus;
  sourceHash?: string;
  translationHash?: string;
  lastUpdated?: string;
}

/**
 * Article with translation information
 */
export interface TranslatableArticle {
  slug: string;
  language: Language;
  title: string;
  content: string;
  sourceHash?: string;
  updatedDate?: string;
}

/**
 * Generate a hash of content for change detection
 */
export function generateContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Get the best available language for an article
 * following fallback chains
 */
export function getBestLanguage(
  requestedLang: Language,
  availableLanguages: Language[]
): Language | null {
  // Check if requested language is available
  if (availableLanguages.includes(requestedLang)) {
    return requestedLang;
  }

  // Follow fallback chain
  const fallbacks = FALLBACK_CHAINS[requestedLang];
  for (const fallback of fallbacks) {
    if (availableLanguages.includes(fallback)) {
      return fallback;
    }
  }

  // Last resort: return English if available
  if (availableLanguages.includes("en")) {
    return "en";
  }

  // Return first available language
  return availableLanguages[0] || null;
}

/**
 * Check if a translation is outdated compared to source
 */
export function isTranslationOutdated(
  sourceHash: string,
  translationSourceHash?: string
): boolean {
  if (!translationSourceHash) {
    return true; // No source hash means we can't verify
  }
  return sourceHash !== translationSourceHash;
}

/**
 * Get translation status for all languages of an article
 */
export function getTranslationStatus(
  articles: TranslatableArticle[],
  slug: string
): TranslationInfo[] {
  const articlesByLang = articles.filter((a) => a.slug === slug);
  const englishArticle = articlesByLang.find((a) => a.language === "en");
  const sourceHash = englishArticle
    ? generateContentHash(englishArticle.content)
    : undefined;

  return SUPPORTED_LANGUAGES.map((lang) => {
    const article = articlesByLang.find((a) => a.language === lang);

    if (!article) {
      return {
        language: lang,
        status: "missing" as TranslationStatus,
      };
    }

    // English is always current (it's the source)
    if (lang === "en") {
      return {
        language: lang,
        status: "current" as TranslationStatus,
        sourceHash,
        translationHash: sourceHash,
        lastUpdated: article.updatedDate,
      };
    }

    // Check if translation is current
    const translationHash = generateContentHash(article.content);
    const status: TranslationStatus =
      sourceHash && article.sourceHash && article.sourceHash !== sourceHash
        ? "outdated"
        : "current";

    return {
      language: lang,
      status,
      sourceHash: article.sourceHash,
      translationHash,
      lastUpdated: article.updatedDate,
    };
  });
}

/**
 * Group articles by slug for translation management
 */
export function groupArticlesBySlug<
  T extends { slug: string; language: string },
>(articles: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const article of articles) {
    const existing = grouped.get(article.slug) || [];
    existing.push(article);
    grouped.set(article.slug, existing);
  }

  return grouped;
}

/**
 * Calculate translation coverage percentage
 */
export function calculateTranslationCoverage(
  statuses: TranslationInfo[]
): number {
  const total = statuses.length;
  const translated = statuses.filter((s) => s.status !== "missing").length;
  return Math.round((translated / total) * 100);
}

/**
 * Get articles that need translation or update
 */
export function getArticlesNeedingAttention(
  allStatuses: Map<string, TranslationInfo[]>
): { slug: string; language: Language; status: TranslationStatus }[] {
  const needsAttention: {
    slug: string;
    language: Language;
    status: TranslationStatus;
  }[] = [];

  allStatuses.forEach((statuses, slug) => {
    statuses.forEach((status) => {
      if (status.status === "missing" || status.status === "outdated") {
        needsAttention.push({
          slug,
          language: status.language,
          status: status.status,
        });
      }
    });
  });

  return needsAttention;
}

/**
 * Parse Accept-Language header and return best matching supported language
 */
export function parseAcceptLanguage(
  acceptLanguage: string | null
): Language | null {
  if (!acceptLanguage) return null;

  // Parse Accept-Language header (e.g., "pt-BR,pt;q=0.9,en;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0].toLowerCase(), // Get primary language code
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  // Find first supported language
  for (const { code } of languages) {
    if (SUPPORTED_LANGUAGES.includes(code as Language)) {
      return code as Language;
    }
  }

  return null;
}

/**
 * Detect language from multiple sources with priority:
 * 1. URL parameter (explicit override)
 * 2. Cookie (user preference)
 * 3. Accept-Language header (browser default)
 * 4. Default to English
 */
export function detectLanguage(
  urlParam: string | undefined,
  cookieValue: string | undefined,
  acceptLanguage: string | null
): Language {
  // 1. URL parameter takes highest priority
  if (urlParam && SUPPORTED_LANGUAGES.includes(urlParam as Language)) {
    return urlParam as Language;
  }

  // 2. Cookie (user's saved preference)
  if (cookieValue && SUPPORTED_LANGUAGES.includes(cookieValue as Language)) {
    return cookieValue as Language;
  }

  // 3. Accept-Language header
  const browserLang = parseAcceptLanguage(acceptLanguage);
  if (browserLang) {
    return browserLang;
  }

  // 4. Default to English
  return "en";
}
