"use client";

import {
  FileText,
  Clock,
  Heart,
  Lightbulb,
  ThumbsUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useContributions } from "@/hooks/queries/use-contributions";
import type { SuggestionSummaryDto, StorySummaryDto } from "@/types/profile";

function ActivityItemSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex-grow">
        <div className="flex items-start justify-between">
          <div className="mb-2 h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  const upperStatus = status.toUpperCase();
  switch (upperStatus) {
    case "APPROVED":
    case "PUBLISHED":
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-[var(--color-valley-green)]",
        badge:
          "bg-green-100 text-[var(--color-valley-green)] dark:bg-green-900/30",
      };
    case "PENDING":
    case "UNDER_REVIEW":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-[var(--color-sobrado)]",
        badge:
          "bg-yellow-100 text-[var(--color-sobrado)] dark:bg-yellow-900/30",
      };
    case "REJECTED":
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        badge: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      };
    default:
      return {
        bg: "bg-slate-100 dark:bg-slate-900/30",
        text: "text-slate-600 dark:text-slate-400",
        badge:
          "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
      };
  }
}

function getReactionIcon(reactionType: string) {
  switch (reactionType) {
    case "LOVE":
      return <Heart size={16} className="fill-current" />;
    case "CELEBRATE":
      return <Sparkles size={16} />;
    case "INSIGHTFUL":
      return <Lightbulb size={16} />;
    case "SUPPORT":
      return <ThumbsUp size={16} />;
    default:
      return <Heart size={16} />;
  }
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ActivityTab() {
  const { contributions, isLoading, error } = useContributions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Recent Contributions
        </h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          Failed to load contributions
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {error.message || "Please try again later."}
        </p>
      </div>
    );
  }

  if (!contributions) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No contributions yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start contributing to see your activity here.
        </p>
      </div>
    );
  }

  const hasAnyContributions =
    contributions.totalReactions > 0 ||
    contributions.totalSuggestions > 0 ||
    contributions.totalStories > 0;

  if (!hasAnyContributions) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No contributions yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Share your stories, suggest improvements, or react to content to get
          started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        Your Contributions
      </h3>

      {/* Reactions Summary */}
      {contributions.totalReactions > 0 && (
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h4 className="mb-3 font-bold text-slate-900 dark:text-white">
            Reactions ({contributions.totalReactions})
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(contributions.reactionCounts).map(
              ([type, count]) => (
                <div
                  key={type}
                  className="flex items-center gap-2 rounded-md bg-slate-50 p-3 dark:bg-slate-800"
                >
                  <div className="text-[var(--color-ocean-blue)]">
                    {getReactionIcon(type)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {count}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {contributions.suggestions.length > 0 && (
        <div>
          <h4 className="mb-3 font-bold text-slate-900 dark:text-white">
            Suggestions ({contributions.totalSuggestions})
          </h4>
          <div className="space-y-3">
            {contributions.suggestions.map(
              (suggestion: SuggestionSummaryDto) => {
                const styles = getStatusStyles(suggestion.status);
                return (
                  <div
                    key={suggestion.id}
                    className="flex gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}
                    >
                      <Lightbulb size={20} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="truncate font-bold text-slate-900 dark:text-white">
                          {suggestion.suggestionType.replace(/_/g, " ")}
                        </h5>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                        >
                          {suggestion.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" /> Submitted{" "}
                          {formatDate(suggestion.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Stories List */}
      {contributions.stories.length > 0 && (
        <div>
          <h4 className="mb-3 font-bold text-slate-900 dark:text-white">
            Stories ({contributions.totalStories})
          </h4>
          <div className="space-y-3">
            {contributions.stories.map((story: StorySummaryDto) => {
              const styles = getStatusStyles(story.status);
              return (
                <div
                  key={story.id}
                  className="flex gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}
                  >
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="truncate font-bold text-slate-900 dark:text-white">
                        {story.title}
                      </h5>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                      >
                        {story.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {story.storyType.replace(/_/g, " ")}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" /> Submitted{" "}
                        {formatDate(story.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
