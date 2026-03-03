#!/usr/bin/env npx tsx

/**
 * MDX Content Validation Script
 *
 * Validates:
 * - Frontmatter schema compliance
 * - Internal link targets (headings and pages)
 * - Cross-references (relatedArticles exist)
 * - Series references
 *
 * Features:
 * - Incremental validation via content hash caching
 * - Clear error messages with file:line:col format
 * - Pre-commit hook optimized (<5s target)
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Types
interface ValidationError {
  file: string;
  line?: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
}

interface ContentItem {
  slug: string;
  language: string;
  category: string;
  relatedArticles?: string[];
  series?: string;
}

interface CacheData {
  version: string;
  hashes: Record<string, string>;
}

// Constants
const CONTENT_DIR = path.join(process.cwd(), "content");
const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "content-hashes.json");
const CACHE_VERSION = "1.0.0";

const VALID_CATEGORIES = ["music", "history", "traditions", "places", "people"];
const VALID_LANGUAGES = ["en", "pt", "kea", "fr"];

// Parse command line arguments
const args = process.argv.slice(2);
const isIncremental = !args.includes("--full");
const isVerbose = args.includes("--verbose");
const specificFiles = args.filter((a) => !a.startsWith("--"));

// Utility functions
function generateHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function loadCache(): CacheData {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      if (data.version === CACHE_VERSION) {
        return data;
      }
    }
  } catch {
    // Cache corrupted, start fresh
  }
  return { version: CACHE_VERSION, hashes: {} };
}

function saveCache(cache: CacheData): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function findMdxFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }

  return files;
}

function parseFrontmatter(content: string): {
  data: Record<string, unknown>;
  body: string;
  endLine: number;
} {
  const lines = content.split("\n");

  if (lines[0] !== "---") {
    return { data: {}, body: content, endLine: 0 };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { data: {}, body: content, endLine: 0 };
  }

  const frontmatterLines = lines.slice(1, endIndex);
  const data: Record<string, unknown> = {};

  let currentKey = "";
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of frontmatterLines) {
    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line
        .replace(/^\s+-\s+/, "")
        .trim()
        .replace(/^["']|["']$/g, "");
      arrayValues.push(value);
      continue;
    }

    // Save previous array if we were in one
    if (inArray && currentKey) {
      data[currentKey] = [...arrayValues];
      arrayValues.length = 0;
      inArray = false;
    }

    // Key-value pair
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      currentKey = key;

      if (value === "" || value === "[]") {
        // Array starts on next lines or empty array
        inArray = value === "" || value === "[]";
        if (value === "[]") {
          data[key] = [];
          inArray = false;
        }
      } else {
        // Simple value
        let parsedValue: unknown = value.replace(/^["']|["']$/g, "");

        // Parse numbers
        if (/^\d+$/.test(parsedValue as string)) {
          parsedValue = parseInt(parsedValue as string, 10);
        }

        data[key] = parsedValue;
      }
    }
  }

  // Save final array if we were in one
  if (inArray && currentKey) {
    data[currentKey] = [...arrayValues];
  }

  const body = lines.slice(endIndex + 1).join("\n");
  return { data, body, endLine: endIndex + 1 };
}

function extractLinks(
  content: string,
  startLine: number
): Array<{ url: string; line: number; column: number }> {
  const links: Array<{ url: string; line: number; column: number }> = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Markdown links: [text](url)
    const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdLinkRegex.exec(line)) !== null) {
      links.push({
        url: match[2],
        line: startLine + i + 1,
        column: match.index + match[1].length + 3,
      });
    }

    // Heading anchors for self-reference validation
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      // Store heading for internal anchor validation
    }
  }

  return links;
}

function extractHeadings(content: string): string[] {
  const headings: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) {
      // Convert heading to anchor format
      const anchor = match[1]
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push(anchor);
    }
  }

  return headings;
}

// Validation functions
function validateFrontmatter(
  data: Record<string, unknown>,
  filePath: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  const relativePath = path.relative(process.cwd(), filePath);

  // Required fields
  const requiredFields = [
    "title",
    "description",
    "language",
    "publishDate",
    "author",
    "category",
    "tags",
    "slug",
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push({
        file: relativePath,
        line: 1,
        message: `Missing required field: ${field}`,
        severity: "error",
      });
    }
  }

  // Validate category
  if (data.category && !VALID_CATEGORIES.includes(data.category as string)) {
    errors.push({
      file: relativePath,
      line: 1,
      message: `Invalid category "${data.category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      severity: "error",
    });
  }

  // Validate language
  if (data.language && !VALID_LANGUAGES.includes(data.language as string)) {
    errors.push({
      file: relativePath,
      line: 1,
      message: `Invalid language "${data.language}". Must be one of: ${VALID_LANGUAGES.join(", ")}`,
      severity: "error",
    });
  }

  // Validate title length
  if (data.title && (data.title as string).length > 100) {
    errors.push({
      file: relativePath,
      line: 1,
      message: `Title too long (${(data.title as string).length} chars). Maximum is 100 characters.`,
      severity: "error",
    });
  }

  // Validate description length
  if (data.description && (data.description as string).length > 200) {
    errors.push({
      file: relativePath,
      line: 1,
      message: `Description too long (${(data.description as string).length} chars). Maximum is 200 characters.`,
      severity: "error",
    });
  }

  // Validate tags
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push({
        file: relativePath,
        line: 1,
        message: "Tags must be an array",
        severity: "error",
      });
    } else {
      if (data.tags.length === 0) {
        errors.push({
          file: relativePath,
          line: 1,
          message: "At least one tag is required",
          severity: "error",
        });
      }
      if (data.tags.length > 10) {
        errors.push({
          file: relativePath,
          line: 1,
          message: `Too many tags (${data.tags.length}). Maximum is 10.`,
          severity: "error",
        });
      }
      for (const tag of data.tags) {
        if ((tag as string).length > 30) {
          errors.push({
            file: relativePath,
            line: 1,
            message: `Tag "${tag}" too long. Maximum is 30 characters.`,
            severity: "error",
          });
        }
      }
    }
  }

  // Validate relatedArticles
  if (data.relatedArticles) {
    if (!Array.isArray(data.relatedArticles)) {
      errors.push({
        file: relativePath,
        line: 1,
        message: "relatedArticles must be an array",
        severity: "error",
      });
    } else if (data.relatedArticles.length > 5) {
      errors.push({
        file: relativePath,
        line: 1,
        message: `Too many related articles (${data.relatedArticles.length}). Maximum is 5.`,
        severity: "error",
      });
    }
  }

  // Validate date format
  if (data.publishDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.publishDate as string)) {
      errors.push({
        file: relativePath,
        line: 1,
        message: `Invalid date format "${data.publishDate}". Use YYYY-MM-DD.`,
        severity: "error",
      });
    }
  }

  return errors;
}

function validateInternalLinks(
  links: Array<{ url: string; line: number; column: number }>,
  headings: string[],
  filePath: string,
  allSlugs: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const relativePath = path.relative(process.cwd(), filePath);

  for (const link of links) {
    const { url, line, column } = link;

    // Skip external links
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:")
    ) {
      continue;
    }

    // Check anchor links within same document
    if (url.startsWith("#")) {
      const anchor = url.slice(1);
      if (!headings.includes(anchor)) {
        errors.push({
          file: relativePath,
          line,
          column,
          message: `Broken anchor link "${url}". Heading not found.`,
          severity: "error",
        });
      }
      continue;
    }

    // Check internal page links
    if (url.startsWith("/")) {
      // Extract slug from URL
      const parts = url.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const slug = parts[parts.length - 1].split("#")[0].split("?")[0];
        if (slug && !allSlugs.has(slug)) {
          errors.push({
            file: relativePath,
            line,
            column,
            message: `Broken internal link "${url}". Page "${slug}" not found.`,
            severity: "warning",
          });
        }
      }
    }
  }

  return errors;
}

function validateCrossReferences(
  data: Record<string, unknown>,
  filePath: string,
  allSlugs: Set<string>,
  allSeries: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const relativePath = path.relative(process.cwd(), filePath);

  // Validate relatedArticles
  if (data.relatedArticles && Array.isArray(data.relatedArticles)) {
    for (const slug of data.relatedArticles) {
      if (!allSlugs.has(slug as string)) {
        errors.push({
          file: relativePath,
          line: 1,
          message: `Related article "${slug}" not found. Available slugs: ${Array.from(allSlugs).slice(0, 5).join(", ")}${allSlugs.size > 5 ? "..." : ""}`,
          severity: "error",
        });
      }
    }
  }

  // Validate series reference
  if (data.series && !allSeries.has(data.series as string)) {
    errors.push({
      file: relativePath,
      line: 1,
      message: `Series "${data.series}" not found in series.yaml`,
      severity: "warning",
    });
  }

  return errors;
}

// Main validation function
async function validateContent(): Promise<void> {
  const startTime = Date.now();
  const errors: ValidationError[] = [];

  console.log("🔍 Validating MDX content...\n");

  // Find all MDX files
  const articlesDir = path.join(CONTENT_DIR, "articles");
  const pagesDir = path.join(CONTENT_DIR, "pages");

  let mdxFiles = [...findMdxFiles(articlesDir), ...findMdxFiles(pagesDir)];

  // Filter to specific files if provided
  if (specificFiles.length > 0) {
    mdxFiles = mdxFiles.filter((f) =>
      specificFiles.some((sf) => f.includes(sf) || path.basename(f) === sf)
    );
  }

  if (mdxFiles.length === 0) {
    console.log("No MDX files found to validate.");
    return;
  }

  // Load cache for incremental validation
  const cache = loadCache();
  const newHashes: Record<string, string> = {};

  // First pass: collect all slugs and metadata
  const allSlugs = new Set<string>();
  const allSeries = new Set<string>();
  const contentItems: Map<string, ContentItem> = new Map();

  // Load series from series.yaml
  const seriesFile = path.join(CONTENT_DIR, "series.yaml");
  if (fs.existsSync(seriesFile)) {
    const seriesContent = fs.readFileSync(seriesFile, "utf-8");
    // Match id values in YAML format: "- id: value" or "  id: value"
    const seriesMatches = seriesContent.match(/id:\s*["']?([\w-]+)["']?/g);
    if (seriesMatches) {
      for (const match of seriesMatches) {
        const id = match.match(/id:\s*["']?([\w-]+)["']?/)?.[1];
        if (id) allSeries.add(id);
      }
    }
  }

  // Collect all content metadata
  for (const filePath of mdxFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data } = parseFrontmatter(content);

    if (data.slug) {
      allSlugs.add(data.slug as string);
      contentItems.set(filePath, {
        slug: data.slug as string,
        language: data.language as string,
        category: data.category as string,
        relatedArticles: data.relatedArticles as string[],
        series: data.series as string,
      });
    }
  }

  // Second pass: validate each file
  let validatedCount = 0;
  let skippedCount = 0;

  for (const filePath of mdxFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const hash = generateHash(content);
    const relativePath = path.relative(process.cwd(), filePath);

    newHashes[relativePath] = hash;

    // Skip unchanged files in incremental mode
    if (isIncremental && cache.hashes[relativePath] === hash) {
      skippedCount++;
      if (isVerbose) {
        console.log(`⏭️  Skipped (unchanged): ${relativePath}`);
      }
      continue;
    }

    validatedCount++;
    if (isVerbose) {
      console.log(`📄 Validating: ${relativePath}`);
    }

    const { data, body, endLine } = parseFrontmatter(content);

    // Validate frontmatter
    const frontmatterErrors = validateFrontmatter(data, filePath);
    errors.push(...frontmatterErrors);

    // Extract and validate links
    const links = extractLinks(body, endLine);
    const headings = extractHeadings(body);
    const linkErrors = validateInternalLinks(
      links,
      headings,
      filePath,
      allSlugs
    );
    errors.push(...linkErrors);

    // Validate cross-references
    const refErrors = validateCrossReferences(
      data,
      filePath,
      allSlugs,
      allSeries
    );
    errors.push(...refErrors);
  }

  // Save updated cache
  cache.hashes = { ...cache.hashes, ...newHashes };
  saveCache(cache);

  // Report results
  const elapsed = Date.now() - startTime;
  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  console.log(`\n📊 Validation Summary`);
  console.log(`   Files validated: ${validatedCount}`);
  console.log(`   Files skipped (cached): ${skippedCount}`);
  console.log(`   Time: ${elapsed}ms`);
  console.log("");

  if (errors.length === 0) {
    console.log("✅ All content validated successfully!\n");
    return;
  }

  // Sort errors by file and line
  errors.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return (a.line || 0) - (b.line || 0);
  });

  // Print errors
  for (const error of errors) {
    const location = error.line
      ? error.column
        ? `${error.file}:${error.line}:${error.column}`
        : `${error.file}:${error.line}`
      : error.file;

    const icon = error.severity === "error" ? "❌" : "⚠️";
    console.log(`${icon} ${location}: ${error.message}`);
  }

  console.log(
    `\n📊 Found ${errorCount} error(s) and ${warningCount} warning(s)\n`
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run validation
validateContent().catch((error) => {
  console.error("Validation failed:", error);
  process.exit(1);
});
