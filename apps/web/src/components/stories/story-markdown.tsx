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
              className="mt-6 mb-3 font-serif text-xl font-bold text-slate-900 dark:text-white"
              {...props}
            >
              {children}
            </h3>
          ),
          h3: ({ children, ...props }) => (
            <h4
              className="mt-4 mb-2 font-serif text-lg font-semibold text-slate-800 dark:text-slate-200"
              {...props}
            >
              {children}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p
              className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300"
              {...props}
            >
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul
              className="mb-6 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300"
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              className="mb-6 list-decimal space-y-2 pl-6 text-slate-700 dark:text-slate-300"
              {...props}
            >
              {children}
            </ol>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="my-6 border-l-4 border-[var(--color-ocean-blue)]/30 bg-slate-50 py-3 pl-4 pr-4 text-slate-600 italic dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
              {...props}
            >
              {children}
            </blockquote>
          ),
          strong: ({ children, ...props }) => (
            <strong
              className="font-semibold text-slate-900 dark:text-white"
              {...props}
            >
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
