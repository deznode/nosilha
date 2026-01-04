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
  // Draft status - drafts are filtered out in production
  draft: s.boolean().optional().default(false),
  // Translation tracking
  sourceHash: s.string().optional(),
  translationStatus: s.enum(["complete", "partial", "outdated"]).optional(),
  lastTranslated: s.isodate().optional(),
  // MDX content
  content: s.mdx(),
  // Slug from frontmatter (allows same slug across languages)
  slug: s.string(),
  // Related articles
  relatedArticles: s.array(s.string()).optional(),
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

const iconGridItemSchema = s.object({
  icon: s.string(),
  title: s.string(),
  description: s.string(),
  iconColor: s.string().optional(),
});

const statisticSchema = s.object({
  value: s.string(),
  label: s.string(),
  description: s.string(),
  color: s.string(),
});

const heroSchema = s.object({
  videoSrc: s.string(),
  title: s.string(),
  subtitle: s.string(),
});

// Page collection for top-level routes (/history, /people)
const pages = defineCollection({
  name: "Page",
  pattern: "pages/**/*.mdx",
  schema: baseContentSchema.extend({
    // Optional hero section
    hero: heroSchema.optional(),
    // Optional structured data for cultural heritage pages
    timeline: s.array(timelineEventSchema).optional(),
    figures: s.array(historicalFigureSchema).optional(),
    sections: s.array(thematicSectionSchema).optional(),
    citations: s.array(citationSchema).optional(),
    iconGridItems: s.array(iconGridItemSchema).optional(),
    statisticsData: s.array(statisticSchema).optional(),
  }),
});

// Story types for community-submitted narratives
const storyTypes = ["quick", "full", "guided"] as const;

// Story schema for community-submitted MDX stories
const storySchema = s.object({
  title: s.string().max(255),
  slug: s.string(),
  author: s.string(),
  date: s.isodate(),
  language: s.enum(["en", "pt", "kea"]),
  location: s.string().optional(),
  storyType: s.enum(storyTypes),
  tags: s.array(s.string()).optional(),
  sourceStoryId: s.string(), // Links back to DB record
  content: s.mdx(),
});

// Stories collection for community-submitted narratives
const stories = defineCollection({
  name: "Story",
  pattern: "stories/**/*.mdx",
  schema: storySchema,
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    clean: true,
  },
  collections: { pages, stories },
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
