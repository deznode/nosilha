"use client";

import { useMemo } from "react";
import * as runtime from "react/jsx-runtime";
import { ArticleLayout } from "./article-layout";
import { type Language } from "@/lib/content/translations";
import { RelatedArticleData } from "./related-articles";

interface ArticleProps {
  // Article metadata
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  updatedDate?: string;
  author: string;
  category: string;
  tags: string[];
  coverImage?: string;
  // MDX content (compiled by Velite as function string)
  code: string;
  // Language support
  language: Language;
  availableLanguages?: Language[];
  isFallback?: boolean;
  requestedLanguage?: Language;
  // Related content
  relatedArticles?: RelatedArticleData[];
  series?: string;
  seriesOrder?: number;
}

// Helper to render Velite MDX content
function useMDXComponent(code: string) {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default;
  }, [code]);
}

// Wrapper component to handle MDX rendering
interface MDXContentProps {
  code: string;
}

function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code);
  // ESLint false positive: Component is memoized via useMemo in useMDXComponent
  // This is the standard pattern for MDX libraries (mdx-bundler, next-mdx-remote)
  // eslint-disable-next-line react-hooks/static-components
  return <Component />;
}

export function Article({
  slug,
  title,
  description,
  publishDate,
  updatedDate,
  author,
  category,
  tags,
  coverImage,
  code,
  language,
  availableLanguages = [],
  isFallback = false,
  requestedLanguage,
  relatedArticles,
}: ArticleProps) {
  return (
    <ArticleLayout
      slug={slug}
      title={title}
      description={description}
      publishDate={publishDate}
      updatedDate={updatedDate}
      author={author}
      category={category}
      tags={tags}
      coverImage={coverImage}
      availableLanguages={availableLanguages}
      currentLanguage={language}
      isFallback={isFallback}
      requestedLanguage={requestedLanguage}
      relatedArticles={relatedArticles}
    >
      <MDXContent code={code} />
    </ArticleLayout>
  );
}
