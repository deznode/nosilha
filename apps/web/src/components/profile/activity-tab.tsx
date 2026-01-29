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
    <div className="border-hairline flex animate-pulse gap-4 rounded-lg border p-4">
      <div className="bg-surface-alt h-10 w-10 flex-shrink-0 rounded-full" />
      <div className="flex-grow">
        <div className="flex items-start justify-between">
          <div className="bg-surface-alt mb-2 h-5 w-48 rounded" />
          <div className="bg-surface-alt h-5 w-20 rounded" />
        </div>
        <div className="bg-surface-alt mb-2 h-4 w-full rounded" />
        <div className="bg-surface-alt h-3 w-32 rounded" />
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
        text: "text-valley-green",
        badge: "bg-green-100 text-valley-green dark:bg-green-900/30",
      };
    case "PENDING":
    case "UNDER_REVIEW":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-sobrado-ochre",
        badge: "bg-yellow-100 text-sobrado-ochre dark:bg-yellow-900/30",
      };
    case "REJECTED":
      return {
        bg: "bg-accent-error/10",
        text: "text-accent-error",
        badge: "bg-accent-error/10 text-accent-error",
      };
    default:
      return {
        bg: "bg-surface-alt",
        text: "text-muted",
        badge: "bg-surface-alt text-muted",
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
        <h3 className="text-body mb-4 text-lg font-bold">
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
        <AlertCircle className="text-accent-error mx-auto h-12 w-12" />
        <h3 className="text-body mt-2 text-sm font-medium">
          Failed to load contributions
        </h3>
        <p className="text-muted mt-1 text-sm">
          {error.message || "Please try again later."}
        </p>
      </div>
    );
  }

  if (!contributions) {
    return (
      <div className="py-12 text-center">
        <FileText className="text-muted mx-auto h-12 w-12" />
        <h3 className="text-body mt-2 text-sm font-medium">
          No contributions yet
        </h3>
        <p className="text-muted mt-1 text-sm">
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
        <FileText className="text-muted mx-auto h-12 w-12" />
        <h3 className="text-body mt-2 text-sm font-medium">
          No contributions yet
        </h3>
        <p className="text-muted mt-1 text-sm">
          Share your stories, suggest improvements, or react to content to get
          started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-body mb-4 text-lg font-bold">Your Contributions</h3>

      {/* Reactions Summary */}
      {contributions.totalReactions > 0 && (
        <div className="border-hairline rounded-lg border p-4">
          <h4 className="text-body mb-3 font-bold">
            Reactions ({contributions.totalReactions})
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(contributions.reactionCounts).map(
              ([type, count]) => (
                <div
                  key={type}
                  className="bg-surface flex items-center gap-2 rounded-md p-3"
                >
                  <div className="text-ocean-blue">{getReactionIcon(type)}</div>
                  <div>
                    <div className="text-muted text-xs">
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </div>
                    <div className="text-body font-bold">{count}</div>
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
          <h4 className="text-body mb-3 font-bold">
            Suggestions ({contributions.totalSuggestions})
          </h4>
          <div className="space-y-3">
            {contributions.suggestions.map(
              (suggestion: SuggestionSummaryDto) => {
                const styles = getStatusStyles(suggestion.status);
                return (
                  <div
                    key={suggestion.id}
                    className="border-hairline hover:bg-surface-alt flex gap-4 rounded-lg border p-4 transition-colors"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}
                    >
                      <Lightbulb size={20} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-body truncate font-bold">
                          {suggestion.suggestionType.replace(/_/g, " ")}
                        </h5>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                        >
                          {suggestion.status}
                        </span>
                      </div>
                      <div className="text-muted mt-2 flex items-center gap-3 text-xs">
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
          <h4 className="text-body mb-3 font-bold">
            Stories ({contributions.totalStories})
          </h4>
          <div className="space-y-3">
            {contributions.stories.map((story: StorySummaryDto) => {
              const styles = getStatusStyles(story.status);
              return (
                <div
                  key={story.id}
                  className="border-hairline hover:bg-surface-alt flex gap-4 rounded-lg border p-4 transition-colors"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}
                  >
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-body truncate font-bold">
                        {story.title}
                      </h5>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                      >
                        {story.status}
                      </span>
                    </div>
                    <p className="text-muted mt-1 text-xs">
                      {story.storyType.replace(/_/g, " ")}
                    </p>
                    <div className="text-muted mt-2 flex items-center gap-3 text-xs">
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
