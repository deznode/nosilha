import { defineConfig, defineCollection, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";

// Categories for Cape Verdean cultural heritage content
const categories = [
  "music",
  "history",
  "traditions",
  "places",
  "people",
] as const;

// Supported languages
const languages = ["en", "pt", "kea", "fr"] as const;

// Article schema shared between articles and pages
const baseContentSchema = s.object({
  title: s.string().max(100),
  description: s.string().max(200),
  language: s.enum(languages),
  publishDate: s.isodate(),
  updatedDate: s.isodate().optional(),
  author: s.string(),
  category: s.enum(categories),
  tags: s.array(s.string().max(30)).min(1).max(10),
  coverImage: s.string().optional(),
  // Translation tracking
  sourceHash: s.string().optional(),
  translationStatus: s.enum(["complete", "partial", "outdated"]).optional(),
  lastTranslated: s.isodate().optional(),
  // MDX content
  content: s.mdx(),
  // Slug from frontmatter (allows same slug across languages)
  slug: s.string(),
});

// Structured data schemas for cultural heritage pages
const timelineEventSchema = s.object({
  date: s.string(),
  title: s.string(),
  description: s.string(),
});

const historicalFigureSchema = s.object({
  name: s.string(),
  role: s.string(),
  years: s.string(),
  description: s.string(),
  slug: s.string().optional(),
});

const thematicSectionSchema = s.object({
  title: s.string(),
  description: s.string(),
  content: s.string(),
  image: s.string(),
  imageCourtesy: s.string(),
  icon: s.string().optional(),
});

const citationSchema = s.object({
  source: s.string(),
  author: s.string(),
  year: s.number().optional(),
  url: s.string().optional(),
});

// Page collection for top-level routes (/history, /people)
const pages = defineCollection({
  name: "Page",
  pattern: "pages/**/*.mdx",
  schema: baseContentSchema.extend({
    // Optional structured data for cultural heritage pages
    timeline: s.array(timelineEventSchema).optional(),
    figures: s.array(historicalFigureSchema).optional(),
    sections: s.array(thematicSectionSchema).optional(),
    citations: s.array(citationSchema).optional(),
  }),
});

// Article collection for /articles/* routes
const articles = defineCollection({
  name: "Article",
  pattern: "articles/**/*.mdx",
  schema: baseContentSchema.extend({
    relatedArticles: s.array(s.string()).max(5).default([]),
    series: s.string().optional(),
    seriesOrder: s.number().optional(),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    clean: true,
  },
  collections: { pages, articles },
  mdx: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          keepBackground: false,
        },
      ],
    ],
  },
});
