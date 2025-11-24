import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { pages } from "@/.velite";
import {
  getBestLanguage,
  detectLanguage,
  type Language,
  LANGUAGE_COOKIE_NAME,
} from "@/lib/content/translations";
import { HistoryPageContent } from "./history-page-content";

// Enable ISR with 2 hour revalidation for historical content
export const revalidate = 7200;

// Get history page data from Velite
const historyPages = pages.filter((p) => p.slug === "history");

export async function generateMetadata(): Promise<Metadata> {
  const historyPage = historyPages.find((p) => p.language === "en");

  if (!historyPage) {
    return { title: "History Not Found" };
  }

  return {
    title: `${historyPage.title} | Nos Ilha`,
    description: historyPage.description,
    openGraph: {
      title: historyPage.title,
      description: historyPage.description,
      type: "article",
      publishedTime: historyPage.publishDate,
      modifiedTime: historyPage.updatedDate,
      authors: [historyPage.author],
      tags: historyPage.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: historyPage.title,
      description: historyPage.description,
    },
  };
}

interface PageProps {
  searchParams: Promise<{
    lang?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;

  // Get available languages for history page
  const availableLanguages = historyPages.map((p) => p.language as Language);

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
  const page = historyPages.find((p) => p.language === bestLang);

  if (!page) {
    notFound();
  }

  return (
    <HistoryPageContent
      code={page.content}
      hero={page.hero}
      sections={page.sections || []}
      figures={page.figures || []}
      timeline={page.timeline || []}
      citations={page.citations || []}
      iconGridItems={page.iconGridItems || []}
      statisticsData={page.statisticsData || []}
    />
  );
}
