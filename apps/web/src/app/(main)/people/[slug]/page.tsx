import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { Article } from "@/components/content/article";
import { pages } from "@/.velite";
import {
  getBestLanguage,
  detectLanguage,
  type Language,
  LANGUAGE_COOKIE_NAME,
} from "@/lib/content/translations";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

// ISR revalidation
export const revalidate = 3600;

// Get pages for this category
const categoryPages = pages.filter((p) => p.category === "people");

export async function generateStaticParams() {
  const slugs = [...new Set(categoryPages.map((page) => page.slug))];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = categoryPages.find(
    (p) => p.slug === slug && p.language === "en"
  );

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: `${page.title} | People | Nos Ilha`,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
      publishedTime: page.publishDate,
      modifiedTime: page.updatedDate,
      authors: [page.author],
      tags: page.tags,
      images: page.coverImage ? [page.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: page.coverImage ? [page.coverImage] : [],
    },
  };
}

export default async function PeoplePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;

  // Get available languages for this page
  const availableLanguages = categoryPages
    .filter((p) => p.slug === slug)
    .map((p) => p.language as Language);

  if (availableLanguages.length === 0) {
    notFound();
  }

  // Auto-detect language from URL param, cookie, or Accept-Language header
  const headersList = await headers();
  const cookieStore = await cookies();
  const acceptLanguage = headersList.get("accept-language");
  const cookieValue = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;

  const requestedLang = detectLanguage(lang, cookieValue, acceptLanguage);
  const bestLang = getBestLanguage(requestedLang, availableLanguages);

  if (!bestLang) {
    notFound();
  }

  // Find the page in the best available language
  const page = categoryPages.find(
    (p) => p.slug === slug && p.language === bestLang
  );

  if (!page) {
    notFound();
  }

  const isFallback = bestLang !== requestedLang;

  // Get related articles
  const relatedArticles = (page.relatedArticles || [])
    .map((slug) => {
      const articleVersions = pages.filter((p) => p.slug === slug);
      if (articleVersions.length === 0) return null;

      const availableLangs = articleVersions.map((p) => p.language as Language);
      const bestRelatedLang = getBestLanguage(bestLang, availableLangs);

      const relatedArticle = articleVersions.find(
        (p) => p.language === bestRelatedLang
      );
      if (!relatedArticle) return null;

      return {
        slug: relatedArticle.slug,
        title: relatedArticle.title,
        description: relatedArticle.description,
        coverImage: relatedArticle.coverImage,
        category: relatedArticle.category,
        language: relatedArticle.language,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  return (
    <Article
      slug={page.slug}
      title={page.title}
      description={page.description}
      publishDate={page.publishDate}
      updatedDate={page.updatedDate}
      author={page.author}
      category={page.category}
      tags={page.tags}
      coverImage={page.coverImage}
      code={page.content}
      language={page.language as Language}
      availableLanguages={availableLanguages}
      isFallback={isFallback}
      requestedLanguage={isFallback ? requestedLang : undefined}
      relatedArticles={relatedArticles}
    />
  );
}
