/**
 * Content schemas for MDX content platform
 * These schemas validate frontmatter and content metadata
 */

import { z } from "zod";

// Supported languages for Cape Verdean cultural heritage content
export const languages = ["en", "pt", "kea", "fr"] as const;
export type Language = (typeof languages)[number];

// Content categories
export const categories = [
  "music",
  "history",
  "traditions",
  "places",
  "people",
] as const;
export type Category = (typeof categories)[number];

// Translation status tracking
export const translationStatuses = ["complete", "partial", "outdated"] as const;
export type TranslationStatus = (typeof translationStatuses)[number];

// Category schema (T009)
export const CategorySchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
  description: z.string().max(200),
  parent: z.string().optional(),
  order: z.number().int().positive(),
});
export type CategoryType = z.infer<typeof CategorySchema>;

// Tag schema (T009)
export const TagSchema = z.object({
  id: z.string().min(2).max(30).toLowerCase(),
  name: z.string().min(2).max(30),
  count: z.number().int().nonnegative().default(0),
});
export type Tag = z.infer<typeof TagSchema>;

// Series schema (T010)
export const SeriesSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  description: z.string().max(300),
});
export type Series = z.infer<typeof SeriesSchema>;

// Base content schema shared between Article and Page (T008)
export const BaseContentSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(200),
  language: z.enum(languages),
  publishDate: z.string().datetime(),
  updatedDate: z.string().datetime().optional(),
  author: z.string().min(1),
  category: z.enum(categories),
  tags: z.array(z.string().min(2).max(30).toLowerCase()).min(1).max(10),
  coverImage: z.string().optional(),
  // Translation tracking fields
  sourceHash: z.string().optional(),
  translationStatus: z.enum(translationStatuses).optional(),
  lastTranslated: z.string().datetime().optional(),
});

// Article schema (T008)
export const ArticleSchema = BaseContentSchema.extend({
  relatedArticles: z.array(z.string()).max(5).default([]),
  series: z.string().optional(),
  seriesOrder: z.number().int().positive().optional(),
}).refine(
  (data) => {
    // If series is provided, seriesOrder must also be provided
    if (data.series && !data.seriesOrder) return false;
    if (data.seriesOrder && !data.series) return false;
    return true;
  },
  {
    message: "Both series and seriesOrder must be provided together",
  }
);
export type Article = z.infer<typeof ArticleSchema>;

// Page schema (same as base content, no series/related articles)
export const PageSchema = BaseContentSchema;
export type Page = z.infer<typeof PageSchema>;

// Translation status for dashboard
export const TranslationStatusSchema = z.object({
  slug: z.string(),
  languages: z.record(z.enum(languages), z.enum(translationStatuses)),
  completeness: z.number().min(0).max(100),
  lastUpdated: z.string().datetime(),
});
export type TranslationStatusType = z.infer<typeof TranslationStatusSchema>;

// Frontmatter validation helper
export function validateArticleFrontmatter(data: unknown): Article {
  return ArticleSchema.parse(data);
}

export function validatePageFrontmatter(data: unknown): Page {
  return PageSchema.parse(data);
}
