import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockStoriesApi } from "@/lib/mocks/stories";
import { StoryDetailContent } from "@/components/stories/story-detail-content";
import { SubmissionStatus } from "@/types/story";

interface StoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await mockStoriesApi.getStoryBySlug(slug);

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
  const story = await mockStoriesApi.getStoryBySlug(slug);

  // Only show approved stories publicly
  if (!story || story.status !== SubmissionStatus.APPROVED) {
    notFound();
  }

  // Get related stories (same location or type, excluding current)
  const allStories = await mockStoriesApi.getStories(SubmissionStatus.APPROVED);
  const relatedStories = allStories
    .filter(
      (s) =>
        s.id !== story.id &&
        (s.location === story.location || s.type === story.type)
    )
    .slice(0, 3);

  return <StoryDetailContent story={story} relatedStories={relatedStories} />;
}
