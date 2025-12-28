import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoryBySlug, getStories } from "@/lib/api";
import { StoryDetailContent } from "@/components/stories/story-detail-content";

interface StoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return {
      title: "Story Not Found | Nos Ilha",
    };
  }

  return {
    title: `${story.title} | Stories | Nos Ilha`,
    description: story.content.slice(0, 160) + "...",
    openGraph: {
      title: story.title,
      description: story.content.slice(0, 160) + "...",
      type: "article",
      authors: [story.author],
      ...(story.imageUrl && { images: [story.imageUrl] }),
    },
  };
}

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  // Only show approved stories publicly (backend already filters)
  if (!story) {
    notFound();
  }

  // Get related stories (same location or type, excluding current)
  const allStoriesResult = await getStories(0, 100);
  const relatedStories = allStoriesResult.items
    .filter(
      (s) =>
        s.id !== story.id &&
        (s.location === story.location || s.type === story.type)
    )
    .slice(0, 3);

  return <StoryDetailContent story={story} relatedStories={relatedStories} />;
}
