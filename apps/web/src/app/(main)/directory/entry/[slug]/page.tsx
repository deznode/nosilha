import type { Metadata } from "next";
import { getEntryBySlug } from "@/lib/api";
import { generateDirectoryEntryMetadata, siteConfig } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { DirectoryEntryDetailPageContent } from "@/components/pages/directory-entry-detail-page-content";

// Enable ISR with 30 minute revalidation for individual entries
export const revalidate = 1800;

interface DetailPageProps {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return <DirectoryEntryDetailPageContent entry={entry} />;
}
