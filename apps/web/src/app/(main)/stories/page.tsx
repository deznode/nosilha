"use client";

import { useState, useEffect } from "react";
import { StoryCard, FeaturedCTA } from "@/components/stories";
import { mockStoriesApi } from "@/lib/mocks";
import type { StorySubmission } from "@/types/story";
import { SubmissionStatus } from "@/types/story";

function StoryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mb-3 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-700/50">
        <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const [stories, setStories] = useState<StorySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStories() {
      setIsLoading(true);
      try {
        const allStories = await mockStoriesApi.getStories();
        // Only show approved stories
        const approved = allStories.filter(
          (s) => s.status === SubmissionStatus.APPROVED
        );
        setStories(approved);
      } catch (error) {
        console.error("Failed to load stories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStories();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 font-serif text-3xl font-bold text-[var(--color-ocean-blue)] md:text-4xl">
            Voices of Brava
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-500 dark:text-slate-400">
            A collection of memories, traditions, and histories shared by our
            community. From the misty hills of Nova Sintra to the diaspora
            worldwide.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured CTA Card */}
          <div className="md:col-span-2 lg:col-span-1">
            <FeaturedCTA />
          </div>

          {/* Story Cards */}
          {isLoading ? (
            <>
              <StoryCardSkeleton />
              <StoryCardSkeleton />
              <StoryCardSkeleton />
              <StoryCardSkeleton />
              <StoryCardSkeleton />
            </>
          ) : stories.length === 0 ? (
            <div className="flex items-center justify-center py-12 md:col-span-2 lg:col-span-2">
              <div className="text-center">
                <p className="text-lg text-slate-500 dark:text-slate-400">
                  No stories yet. Be the first to share your memory!
                </p>
              </div>
            </div>
          ) : (
            stories.map((story) => <StoryCard key={story.id} story={story} />)
          )}
        </div>
      </div>
    </div>
  );
}
