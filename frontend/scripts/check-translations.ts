#!/usr/bin/env npx tsx

/**
 * Translation Status Report Script
 *
 * Analyzes MDX content files and reports translation coverage
 * across all supported languages.
 *
 * Usage:
 *   pnpm run check:translations
 *   pnpm run check:translations -- --verbose
 */

import * as fs from "fs";
import * as path from "path";

// Types
interface ArticleTranslations {
  slug: string;
  category: string;
  languages: Set<string>;
  sourceLanguage: string;
  outdated: string[];
}

interface TranslationStats {
  totalArticles: number;
  fullyTranslated: number;
  partiallyTranslated: number;
  sourceOnly: number;
  byLanguage: Record<string, number>;
  outdatedCount: number;
}

// Constants
const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const SUPPORTED_LANGUAGES = ["en", "pt", "kea", "fr"];
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  pt: "Portuguese",
  kea: "Kriolu",
  fr: "French",
};

// Parse arguments
const isVerbose = process.argv.includes("--verbose");
const showOutdated = process.argv.includes("--outdated");

// Find all article directories
function findArticleDirectories(dir: string): string[] {
  const directories: string[] = [];

  if (!fs.existsSync(dir)) {
    return directories;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith("_")) {
      directories.push(path.join(dir, entry.name));
    }
  }

  return directories;
}

// Parse frontmatter to extract language and translation status
function parseFrontmatter(content: string): Record<string, unknown> {
  const lines = content.split("\n");

  if (lines[0] !== "---") {
    return {};
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return {};
  }

  const data: Record<string, unknown> = {};
  const frontmatterLines = lines.slice(1, endIndex);

  for (const line of frontmatterLines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  return data;
}

// Analyze translations for a single article directory
function analyzeArticle(articleDir: string): ArticleTranslations | null {
  const slug = path.basename(articleDir);
  const languages = new Set<string>();
  const outdated: string[] = [];
  let category = "";
  const sourceLanguage = "en";

  // Find all MDX files in the directory
  const files = fs.readdirSync(articleDir).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const lang = file.replace(".mdx", "");
    if (!SUPPORTED_LANGUAGES.includes(lang)) continue;

    const content = fs.readFileSync(path.join(articleDir, file), "utf-8");
    const frontmatter = parseFrontmatter(content);

    languages.add(lang);

    if (frontmatter.category) {
      category = frontmatter.category as string;
    }

    // Check for outdated translations
    if (
      frontmatter.translationStatus === "outdated" ||
      frontmatter.sourceHash
    ) {
      // If it has sourceHash, it's a translation
      if (lang !== "en") {
        // Could check if sourceHash matches current source
        // For now, just note that it has translation tracking
      }
    }

    if (frontmatter.translationStatus === "outdated") {
      outdated.push(lang);
    }
  }

  if (languages.size === 0) {
    return null;
  }

  return {
    slug,
    category,
    languages,
    sourceLanguage,
    outdated,
  };
}

// Generate translation report
function generateReport(): void {
  console.log("📊 Translation Status Report\n");

  const articleDirs = findArticleDirectories(ARTICLES_DIR);
  const articles: ArticleTranslations[] = [];

  for (const dir of articleDirs) {
    const article = analyzeArticle(dir);
    if (article) {
      articles.push(article);
    }
  }

  if (articles.length === 0) {
    console.log("No articles found.\n");
    return;
  }

  // Calculate statistics
  const stats: TranslationStats = {
    totalArticles: articles.length,
    fullyTranslated: 0,
    partiallyTranslated: 0,
    sourceOnly: 0,
    byLanguage: {},
    outdatedCount: 0,
  };

  // Initialize language counts
  for (const lang of SUPPORTED_LANGUAGES) {
    stats.byLanguage[lang] = 0;
  }

  for (const article of articles) {
    // Count languages
    for (const lang of article.languages) {
      stats.byLanguage[lang]++;
    }

    // Categorize translation status
    if (article.languages.size === SUPPORTED_LANGUAGES.length) {
      stats.fullyTranslated++;
    } else if (article.languages.size > 1) {
      stats.partiallyTranslated++;
    } else {
      stats.sourceOnly++;
    }

    // Count outdated
    stats.outdatedCount += article.outdated.length;
  }

  // Print summary
  console.log("📈 Summary");
  console.log("─".repeat(40));
  console.log(`Total articles: ${stats.totalArticles}`);
  console.log(
    `Fully translated: ${stats.fullyTranslated} (${((stats.fullyTranslated / stats.totalArticles) * 100).toFixed(1)}%)`
  );
  console.log(`Partially translated: ${stats.partiallyTranslated}`);
  console.log(`Source only: ${stats.sourceOnly}`);
  console.log(`Outdated translations: ${stats.outdatedCount}`);
  console.log("");

  // Print language breakdown
  console.log("🌍 Language Coverage");
  console.log("─".repeat(40));
  for (const lang of SUPPORTED_LANGUAGES) {
    const count = stats.byLanguage[lang];
    const percent = ((count / stats.totalArticles) * 100).toFixed(1);
    const bar = "█".repeat(Math.round((count / stats.totalArticles) * 20));
    console.log(
      `${LANGUAGE_NAMES[lang].padEnd(12)} ${count}/${stats.totalArticles} (${percent}%) ${bar}`
    );
  }
  console.log("");

  // Print missing translations
  if (isVerbose || showOutdated) {
    console.log("📋 Articles Needing Translation");
    console.log("─".repeat(40));

    for (const article of articles) {
      const missing = SUPPORTED_LANGUAGES.filter(
        (lang) => !article.languages.has(lang)
      );
      if (missing.length > 0) {
        console.log(`\n${article.slug} (${article.category})`);
        console.log(`  Available: ${Array.from(article.languages).join(", ")}`);
        console.log(`  Missing: ${missing.join(", ")}`);
        if (article.outdated.length > 0) {
          console.log(`  Outdated: ${article.outdated.join(", ")}`);
        }
      }
    }
    console.log("");
  }

  // Print outdated translations if any
  if (stats.outdatedCount > 0) {
    console.log("⚠️  Outdated Translations");
    console.log("─".repeat(40));
    for (const article of articles) {
      if (article.outdated.length > 0) {
        console.log(`${article.slug}: ${article.outdated.join(", ")}`);
      }
    }
    console.log("");
  }

  // Print action items
  console.log("📝 Recommended Actions");
  console.log("─".repeat(40));
  if (stats.sourceOnly > 0) {
    console.log(`• ${stats.sourceOnly} article(s) need initial translations`);
  }
  if (stats.outdatedCount > 0) {
    console.log(
      `• ${stats.outdatedCount} translation(s) are outdated and need review`
    );
  }
  const ptMissing = stats.totalArticles - stats.byLanguage.pt;
  if (ptMissing > 0) {
    console.log(
      `• ${ptMissing} article(s) missing Portuguese translation (primary target)`
    );
  }
  if (stats.sourceOnly === 0 && stats.outdatedCount === 0 && ptMissing === 0) {
    console.log("• No immediate actions needed - translations are up to date!");
  }
  console.log("");
}

// Run report
generateReport();
