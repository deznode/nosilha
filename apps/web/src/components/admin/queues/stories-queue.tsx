"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { QueueItem } from "./queue-item";
import { MdxPreviewModal } from "@/components/admin/mdx-preview-modal";
import { generateMdx } from "@/lib/api";
import { archiveStoryToMDX } from "@/app/actions/archive-story";
import { useToast } from "@/hooks/use-toast";
import type { StorySubmission } from "@/types/story";
import { SubmissionStatus } from "@/types/story";

interface StoriesQueueProps {
  stories: StorySubmission[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: SubmissionStatus) => void;
  onViewFull?: (story: StorySubmission) => void;
  onFlag?: (id: string, title: string) => void;
}

export function StoriesQueue({
  stories,
  isLoading,
  onStatusChange,
  onViewFull,
  onFlag,
}: StoriesQueueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "ALL">(
    "ALL"
  );
  const [previewingStory, setPreviewingStory] =
    useState<StorySubmission | null>(null);
  const [mdxContent, setMdxContent] = useState<string>("");
  const [isGeneratingMdx, setIsGeneratingMdx] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const toast = useToast();

  const handleArchive = async (story: StorySubmission) => {
    setIsGeneratingMdx(true);
    setPreviewingStory(story);

    try {
      const content = await generateMdx(story.id);
      setMdxContent(content.mdxSource);
    } catch (error) {
      console.error("Failed to generate MDX:", error);
      toast.showError(
        error instanceof Error
          ? error.message
          : "Failed to generate MDX content"
      );
      setPreviewingStory(null);
    } finally {
      setIsGeneratingMdx(false);
    }
  };

  const handleCommit = async () => {
    if (!previewingStory) return;

    setIsCommitting(true);

    try {
      const result = await archiveStoryToMDX(
        previewingStory.id,
        mdxContent,
        previewingStory.slug,
        previewingStory.title
      );

      if (result.success) {
        toast.showSuccess(
          `Story archived successfully! Committed to GitHub: ${result.commitUrl || "repository"}`
        );
        setPreviewingStory(null);
        setMdxContent("");
        // Trigger parent component to refresh the list
        window.location.reload();
      } else {
        toast.showError(result.error || "Failed to commit MDX content");
      }
    } catch (error) {
      console.error("Failed to commit MDX:", error);
      toast.showError(
        error instanceof Error ? error.message : "Failed to commit MDX content"
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isCommitting) {
      setPreviewingStory(null);
      setMdxContent("");
    }
  };

  const filteredStories = stories.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden border border-slate-200 bg-white shadow sm:rounded-md dark:border-slate-700 dark:bg-slate-800">
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex gap-4">
                <div className="h-16 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="mb-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as SubmissionStatus | "ALL")
            }
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <option value="ALL">All Status</option>
            <option value={SubmissionStatus.PENDING}>Pending</option>
            <option value={SubmissionStatus.APPROVED}>Approved</option>
            <option value={SubmissionStatus.REJECTED}>Rejected</option>
            <option value={SubmissionStatus.FLAGGED}>Flagged</option>
          </select>
          <button className="flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Filter className="mr-2 h-4 w-4" /> Newest First
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories..."
            className="block w-full rounded-md border border-slate-200 bg-white py-2 pr-3 pl-10 leading-5 placeholder-slate-400 focus:border-[var(--color-ocean-blue)] focus:ring-1 focus:ring-[var(--color-ocean-blue)] focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:placeholder-slate-500"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="overflow-hidden border border-slate-200 bg-white shadow sm:rounded-md dark:border-slate-700 dark:bg-slate-800">
        {filteredStories.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No stories found
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredStories.map((story) => (
              <QueueItem
                key={story.id}
                type="story"
                storyId={story.id}
                title={story.title}
                content={story.content}
                storyType={story.type}
                status={story.status}
                submittedBy={story.author}
                timestamp={story.submittedAt}
                location={story.location}
                imageUrl={story.imageUrl}
                archivedAt={story.archivedAt}
                commitUrl={story.commitUrl}
                onApprove={() =>
                  onStatusChange?.(story.id, SubmissionStatus.APPROVED)
                }
                onReject={() =>
                  onStatusChange?.(story.id, SubmissionStatus.REJECTED)
                }
                onViewFull={() => onViewFull?.(story)}
                onFlag={() => onFlag?.(story.id, story.title)}
                onArchive={() => handleArchive(story)}
                isArchiving={
                  isGeneratingMdx && previewingStory?.id === story.id
                }
              />
            ))}
          </ul>
        )}
      </div>

      {/* MDX Preview Modal */}
      {previewingStory && (
        <MdxPreviewModal
          isOpen={!!previewingStory}
          onClose={handleCloseModal}
          mdxContent={mdxContent}
          storyTitle={previewingStory.title}
          slug={previewingStory.slug}
          storyId={previewingStory.id}
          onCommit={handleCommit}
          isCommitting={isCommitting}
        />
      )}
    </div>
  );
}
