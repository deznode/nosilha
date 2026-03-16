"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StoryCard } from "@/components/stories";
import { getStories } from "@/lib/api";
import { Pagination, fromPaginatedResult } from "@/components/ui/pagination";

function StoryCardSkeleton() {
  return (
    <div className="border-hairline bg-canvas rounded-card shadow-subtle animate-pulse border">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-surface-alt h-5 w-16 rounded" />
          <div className="bg-surface-alt h-4 w-24 rounded" />
        </div>
        <div className="bg-surface-alt mb-3 h-6 w-3/4 rounded" />
        <div className="mb-4 space-y-2">
          <div className="bg-surface-alt h-4 w-full rounded" />
          <div className="bg-surface-alt h-4 w-5/6 rounded" />
          <div className="bg-surface-alt h-4 w-2/3 rounded" />
        </div>
        <div className="border-surface flex gap-4 border-t pt-4">
          <div className="bg-surface-alt h-4 w-20 rounded" />
          <div className="bg-surface-alt h-4 w-24 rounded" />
        </div>
      </div>
      <div className="border-hairline bg-surface flex justify-end border-t px-6 py-3">
        <div className="bg-surface-alt h-5 w-24 rounded" />
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["stories", "list", page, 12],
    queryFn: () => getStories(page, 12),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const stories = data?.items ?? [];
  const paginationData = fromPaginatedResult(data?.pagination ?? null);

  return (
    <div className="bg-canvas min-h-screen pb-12">
      {/* Header */}
      <div className="border-hairline bg-canvas shadow-subtle border-b">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-left">
              <h1 className="text-ocean-blue mb-4 font-serif text-3xl font-bold md:text-4xl">
                Voices of Brava
              </h1>
              <p className="text-muted max-w-2xl text-lg">
                A collection of memories, traditions, and histories shared by
                our community. From the misty hills of Nova Sintra to the
                diaspora worldwide.
              </p>
            </div>
            <Link
              href="/contribute/story"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button shadow-subtle flex shrink-0 items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              <Plus size={18} />
              Share Your Story
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex items-center justify-center py-12 md:col-span-2 lg:col-span-3">
              <div className="text-center">
                <p className="text-muted text-lg">
                  No stories yet. Be the first to share your memory!
                </p>
              </div>
            </div>
          ) : (
            stories.map((story) => <StoryCard key={story.id} story={story} />)
          )}
        </div>

        {paginationData && (
          <Pagination
            {...paginationData}
            onPageChange={setPage}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}
