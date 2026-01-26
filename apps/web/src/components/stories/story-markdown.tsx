"use client";

import Markdown from "react-markdown";

interface StoryMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders user-submitted story content with markdown support.
 * Uses react-markdown which is secure by default (no raw HTML).
 *
 * Supported markdown:
 * - Headings (## → h3, ### → h4)
 * - Bold (**text**) and Italic (*text*)
 * - Lists (- item, 1. item)
 * - Blockquotes (> quote)
 */
export function StoryMarkdown({ content, className = "" }: StoryMarkdownProps) {
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <Markdown
        components={{
          // Demote headings: h1→h2, h2→h3 (page already has h1 title)
          h1: ({ children, ...props }) => (
            <h2
              className="mt-8 mb-4 font-serif text-2xl font-bold text-[var(--color-ocean-blue)]"
              {...props}
            >
              {children}
            </h2>
          ),
          h2: ({ children, ...props }) => (
            <h3
              className="text-body mt-6 mb-3 font-serif text-xl font-bold"
              {...props}
            >
              {children}
            </h3>
          ),
          h3: ({ children, ...props }) => (
            <h4
              className="text-body mt-4 mb-2 font-serif text-lg font-semibold"
              {...props}
            >
              {children}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p className="text-body mb-6 leading-relaxed" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="text-body mb-6 list-disc space-y-2 pl-6" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              className="text-body mb-6 list-decimal space-y-2 pl-6"
              {...props}
            >
              {children}
            </ol>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="text-muted bg-surface my-6 border-l-4 border-[var(--color-ocean-blue)]/30 py-3 pr-4 pl-4 italic"
              {...props}
            >
              {children}
            </blockquote>
          ),
          strong: ({ children, ...props }) => (
            <strong className="text-body font-semibold" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
