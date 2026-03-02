import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cacheLife } from "next/cache";
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

// Get pages for this category
const categoryPages = pages.filter((p) => p.category === "history");

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
    title: `${page.title} | History | Nos Ilha`,
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

export default async function HistoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;

  // Resolve language outside cache boundary (uses headers/cookies)
  const availableLanguages = categoryPages
    .filter((p) => p.slug === slug)
    .map((p) => p.language as Language);

  if (availableLanguages.length === 0) {
    notFound();
  }

  const headersList = await headers();
  const cookieStore = await cookies();
  const acceptLanguage = headersList.get("accept-language");
  const cookieValue = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;

  const requestedLang = detectLanguage(lang, cookieValue, acceptLanguage);
  const bestLang = getBestLanguage(requestedLang, availableLanguages);

  if (!bestLang) {
    notFound();
  }

  return cachedHistorySlugContent(
    slug,
    bestLang,
    requestedLang,
    availableLanguages
  );
}

async function cachedHistorySlugContent(
  slug: string,
  bestLang: Language,
  requestedLang: Language,
  availableLanguages: Language[]
) {
  "use cache";
  cacheLife("content");

  const page = categoryPages.find(
    (p) => p.slug === slug && p.language === bestLang
  );

  if (!page) {
    notFound();
  }

  const isFallback = bestLang !== requestedLang;

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
    />
  );
}
