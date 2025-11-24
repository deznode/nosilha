import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { Article } from "@/components/content/article";
import { articles } from "@/.velite";
import {
  getBestLanguage,
  detectLanguage,
  type Language,
  LANGUAGE_COOKIE_NAME,
} from "@/lib/content/translations";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

// ISR revalidation
export const revalidate = 3600;

// Get articles for this category
const categoryArticles = articles.filter((a) => a.category === "people");

export async function generateStaticParams() {
  const slugs = [...new Set(categoryArticles.map((article) => article.slug))];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = categoryArticles.find(
    (a) => a.slug === slug && a.language === "en"
  );

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | People | Nos Ilha`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishDate,
      modifiedTime: article.updatedDate,
      authors: [article.author],
      tags: article.tags,
      images: article.coverImage ? [article.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function PeopleArticlePage({
  params,
  searchParams,
}: ArticlePageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;

  // Get available languages for this article
  const availableLanguages = categoryArticles
    .filter((a) => a.slug === slug)
    .map((a) => a.language as Language);

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

  // Find the article in the best available language
  const article = categoryArticles.find(
    (a) => a.slug === slug && a.language === bestLang
  );

  if (!article) {
    notFound();
  }

  const isFallback = bestLang !== requestedLang;

  return (
    <Article
      slug={article.slug}
      title={article.title}
      description={article.description}
      publishDate={article.publishDate}
      updatedDate={article.updatedDate}
      author={article.author}
      category={article.category}
      tags={article.tags}
      coverImage={article.coverImage}
      code={article.content}
      language={article.language as Language}
      availableLanguages={availableLanguages}
      isFallback={isFallback}
      requestedLanguage={isFallback ? requestedLang : undefined}
      relatedArticles={article.relatedArticles}
      series={article.series}
      seriesOrder={article.seriesOrder}
    />
  );
}
