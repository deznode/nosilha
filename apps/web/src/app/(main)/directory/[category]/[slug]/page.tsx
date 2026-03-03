import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getEntryBySlug } from "@/lib/api";
import { generateDirectoryEntryMetadata, siteConfig } from "@/lib/metadata";
import { notFound, redirect } from "next/navigation";
import { DirectoryEntryDetailPageContent } from "@/components/pages/directory-entry-detail-page-content";
import { getCategorySlug, getCategoryFromSlug } from "@/lib/directory-utils";

interface DetailPageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Generate dynamic metadata for directory entries
export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    return {
      title: "Entry Not Found",
      description: "The requested directory entry could not be found.",
    };
  }

  return generateDirectoryEntryMetadata({
    entry,
    baseUrl: siteConfig.url,
    siteName: siteConfig.name,
    defaultImage: siteConfig.ogImage,
  });
}

export default async function DirectoryEntryDetailPage({
  params,
}: DetailPageProps) {
  "use cache";
  cacheLife("entry");
  const { category, slug } = await params;
  cacheTag(`entry:${category}:${slug}`, `category:${category}`);
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  // Validate that the URL category matches the entry's actual category
  const expectedCategorySlug = getCategorySlug(entry.category);
  const urlCategory = getCategoryFromSlug(category);

  // If the category in the URL doesn't match the entry's category, redirect
  if (urlCategory !== entry.category) {
    redirect(`/directory/${expectedCategorySlug}/${slug}`);
  }

  return <DirectoryEntryDetailPageContent entry={entry} />;
}
