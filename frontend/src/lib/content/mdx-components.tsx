/**
 * MDX Component Registry
 * Exports all UI components available for use in MDX content
 */

import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

// UI Components
import { VideoHeroSection } from "@/components/ui/video-hero-section";
import { PageHeader } from "@/components/ui/page-header";
import { ContentActionToolbar } from "@/components/ui/content-action-toolbar/content-action-toolbar";
import { CitationSection } from "@/components/ui/citation-section";
import { ImageWithCourtesy } from "@/components/ui/image-with-courtesy";
import { PrintPageWrapper } from "@/components/ui/print-page-wrapper";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { PrintButton } from "@/components/ui/actions/print-button";
import { Card } from "@/components/ui/card";
import { ImageGallery } from "@/components/ui/image-gallery";
import { RelatedContent } from "@/components/ui/related-content";

// Content Components (Data-Driven)
import { HistoricalTimeline } from "@/components/content/historical-timeline";
import { HistoricalFigures } from "@/components/content/historical-figures";
import { ThematicSections } from "@/components/content/thematic-sections";
import { StatisticsGrid } from "@/components/content/statistics-grid";
import { IconGrid } from "@/components/content/icon-grid";
import { CalloutBox } from "@/components/content/callout-box";
import { Card as ContentCard, CardGrid } from "@/components/content/card";
import { Section } from "@/components/content/section";
import { TwoColumnGrid } from "@/components/content/two-column-grid";
import { SectionTitle } from "@/components/content/section-title";

// Custom MDX components for enhanced content
export const mdxComponents: MDXComponents = {
  // Next.js optimized components
  Image,
  img: (props) => {
    // Default responsive image handling
    const { src, alt, ...rest } = props as { src?: string; alt?: string };
    if (!src) return null;
    return (
      <Image
        src={src}
        alt={alt || ""}
        width={800}
        height={450}
        className="my-6 rounded-lg"
        {...rest}
      />
    );
  },
  a: ({ href, children, ...props }) => {
    // Handle internal vs external links
    if (href?.startsWith("/") || href?.startsWith("#")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  // Cultural heritage UI components
  VideoHeroSection,
  PageHeader,
  ContentActionToolbar,
  CitationSection,
  ImageWithCourtesy,
  PrintPageWrapper,
  BackToTopButton,
  PrintButton,
  Card,
  ImageGallery,
  RelatedContent,

  // Data-driven content components
  HistoricalTimeline,
  HistoricalFigures,
  ThematicSections,
  StatisticsGrid,
  IconGrid,
  CalloutBox,
  ContentCard,
  CardGrid,
  Section,
  TwoColumnGrid,
  SectionTitle,

  // Typography enhancements
  h1: ({ children, ...props }) => (
    <h1
      className="font-merriweather text-nosihla-text-primary mt-12 mb-6 text-4xl font-bold first:mt-0 dark:text-white"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="font-merriweather text-nosihla-text-primary mt-10 mb-4 text-3xl font-bold dark:text-white"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="font-merriweather text-nosihla-text-primary mt-8 mb-3 text-2xl font-semibold dark:text-white"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      className="text-nosihla-text-secondary my-4 text-base leading-relaxed dark:text-gray-300"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-4 list-inside list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-4 list-inside list-decimal space-y-2" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-nosihla-ocean-blue text-nosihla-text-secondary my-6 border-l-4 pl-4 italic dark:text-gray-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800"
      {...props}
    >
      {children}
    </code>
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
