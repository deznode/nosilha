"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { QueueItem } from "./queue-item";
import { MdxPreviewModal } from "@/components/admin/mdx-preview-modal";
import { generateMdx, updateStoryStatus } from "@/lib/api";
import { archiveStoryToMDX } from "@/app/actions/archive-story";

/**
 * Generate a URL-friendly slug from a story title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}
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
  const [_publishingStoryId, setPublishingStoryId] = useState<string | null>(
    null
  );
  const toast = useToast();

  const handlePublish = async (story: StorySubmission) => {
    setPublishingStoryId(story.id);

    try {
      const slug = generateSlug(story.title);
      await updateStoryStatus(story.id, "PUBLISH", undefined, slug);
      toast.success(`Story "${story.title}" published successfully!`).show();
      // Trigger parent component to refresh the list
      window.location.reload();
    } catch (error) {
      console.error("Failed to publish story:", error);
      toast
        .error(
          error instanceof Error ? error.message : "Failed to publish story"
        )
        .show();
    } finally {
      setPublishingStoryId(null);
    }
  };

  const handleArchive = async (story: StorySubmission) => {
    setIsGeneratingMdx(true);
    setPreviewingStory(story);

    try {
      const content = await generateMdx(story.id);
      setMdxContent(content.mdxSource);
    } catch (error) {
      console.error("Failed to generate MDX:", error);
      toast
        .error(
          error instanceof Error
            ? error.message
            : "Failed to generate MDX content"
        )
        .show();
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
        toast
          .success(
            `Story archived successfully! Committed to GitHub: ${result.commitUrl || "repository"}`
          )
          .show();
        setPreviewingStory(null);
        setMdxContent("");
        // Trigger parent component to refresh the list
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to commit MDX content").show();
      }
    } catch (error) {
      console.error("Failed to commit MDX:", error);
      toast
        .error(
          error instanceof Error
            ? error.message
            : "Failed to commit MDX content"
        )
        .show();
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
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-surface-alt mb-2 h-4 w-1/3 rounded" />
              <div className="flex gap-4">
                <div className="bg-surface-alt h-16 w-24 rounded" />
                <div className="flex-1">
                  <div className="bg-surface-alt mb-2 h-3 w-full rounded" />
                  <div className="bg-surface-alt h-3 w-2/3 rounded" />
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
            className="border-hairline bg-surface text-muted hover:bg-surface-alt rounded-md border px-3 py-1.5 text-sm font-medium"
          >
            <option value="ALL">All Status</option>
            <option value={SubmissionStatus.PENDING}>Pending</option>
            <option value={SubmissionStatus.APPROVED}>Approved</option>
            <option value={SubmissionStatus.REJECTED}>Rejected</option>
            <option value={SubmissionStatus.FLAGGED}>Flagged</option>
          </select>
          <button className="border-hairline bg-surface text-muted hover:bg-surface-alt flex items-center rounded-md border px-3 py-1.5 text-sm font-medium">
            <Filter className="mr-2 h-4 w-4" /> Newest First
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories..."
            className="border-hairline bg-surface placeholder-muted block w-full rounded-md border py-2 pr-3 pl-10 leading-5 focus:border-[var(--color-ocean-blue)] focus:ring-1 focus:ring-[var(--color-ocean-blue)] focus:outline-none sm:text-sm"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-muted h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        {filteredStories.length === 0 ? (
          <div className="text-muted p-8 text-center">No stories found</div>
        ) : (
          <ul className="divide-hairline divide-y">
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
                onApprove={() => handlePublish(story)}
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
