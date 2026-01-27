"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  BookOpen,
  Clock,
} from "lucide-react";
import type { StorySubmission } from "@/types/story";
import { StoryType } from "@/types/story";
import { StoryCard } from "./story-card";
import { StoryMarkdown } from "./story-markdown";
import { Badge } from "@/components/catalyst-ui/badge";

interface StoryDetailContentProps {
  story: StorySubmission;
  relatedStories?: StorySubmission[];
}

const STORY_TYPE_CONFIG: Record<
  StoryType,
  {
    icon: typeof BookOpen;
    label: string;
    badgeColor: "blue" | "red" | "green";
  }
> = {
  [StoryType.QUICK]: {
    icon: Clock,
    label: "Quick Memory",
    badgeColor: "blue",
  },
  [StoryType.FULL]: {
    icon: BookOpen,
    label: "Full Story",
    badgeColor: "red",
  },
  [StoryType.GUIDED]: {
    icon: BookOpen,
    label: "Guided Template",
    badgeColor: "green",
  },
};

/**
 * Map API story type string to StoryType enum value.
 * API returns keys like "FULL", enum values are labels like "Full Story".
 */
function getStoryTypeFromApi(apiType: string): StoryType {
  const typeMap: Record<string, StoryType> = {
    QUICK: StoryType.QUICK,
    FULL: StoryType.FULL,
    GUIDED: StoryType.GUIDED,
  };
  return typeMap[apiType] || StoryType.FULL;
}

export function StoryDetailContent({
  story,
  relatedStories = [],
}: StoryDetailContentProps) {
  const storyType = getStoryTypeFromApi(story.type);
  const typeConfig = STORY_TYPE_CONFIG[storyType];
  const TypeIcon = typeConfig.icon;

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="border-hairline bg-canvas border-b">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <Link
            href="/stories"
            className="text-muted hover:text-ocean-blue mb-6 inline-flex items-center text-sm transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Stories
          </Link>

          {/* Story Type Badge */}
          <div className="mb-4">
            <Badge color={typeConfig.badgeColor}>
              <TypeIcon size={14} className="mr-1.5" />
              {typeConfig.label}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-body mb-4 font-serif text-3xl font-bold sm:text-4xl">
            {story.title}
          </h1>

          {/* Metadata */}
          <div className="text-muted flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <User size={16} />
              <span>{story.author}</span>
            </div>
            {story.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>{story.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{story.submittedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Story Content */}
        <StoryMarkdown content={story.content} />

        {/* Share CTA */}
        <div className="border-hairline mt-12 border-t pt-8">
          <div className="bg-surface rounded-lg p-6 text-center">
            <h3 className="text-body mb-2 text-lg font-semibold">
              Do you have a story to share?
            </h3>
            <p className="text-muted mb-4">
              Help preserve Brava&apos;s cultural heritage by contributing your
              own memories and experiences.
            </p>
            <Link
              href="/contribute/story"
              className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center rounded-lg px-6 py-3 font-medium text-white transition-colors"
            >
              Share Your Story
            </Link>
          </div>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-body mb-6 font-serif text-2xl font-bold">
              Related Stories
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedStories.map((relatedStory) => (
                <StoryCard key={relatedStory.id} story={relatedStory} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
