"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  FileText,
  Mail,
  MapPin,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@/components/ui/tab-group";
import {
  KPICards,
  ActivityChart,
  CoverageChart,
  TopContributors,
} from "@/components/admin/dashboard";
import {
  SuggestionsQueue,
  StoriesQueue,
  MessagesQueue,
  DirectoryQueue,
  GalleryQueue,
  AiReviewQueue,
} from "@/components/admin/queues";
import { StoryDetailModal } from "@/components/admin/story-detail-modal";
import { AiReviewDetailModal } from "@/components/admin/ai-review-detail-modal";
import { FlagReasonModal } from "@/components/admin/queues/flag-reason-modal";
import { DirectoryEditModal } from "@/components/admin/queues/directory-edit-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminStats,
  useAdminSuggestions,
  useAdminStories,
  useAdminMessages,
  useAdminDirectorySubmissions,
  useAdminGallery,
  useAdminContributors,
  useUpdateSuggestionStatus,
  useUpdateStoryStatus,
  useUpdateMessageStatus,
  useDeleteMessage,
  useUpdateDirectoryStatus,
  useDeleteDirectoryEntry,
  useUpdateGalleryStatus,
  usePromoteToHeroImage,
  useAiReviewQueue,
  useAiStatus,
  useTriggerAnalysis,
  useTriggerBatchAnalysis,
} from "@/hooks/queries/admin";
import type {
  AdminStats,
  ContactMessageStatus,
  DirectorySubmission,
} from "@/types/admin";
import type { GalleryModerationAction } from "@/types/gallery";
import type { StorySubmission } from "@/types/story";
import { SubmissionStatus } from "@/types/story";

// Default stats for loading state
const defaultStats: AdminStats = {
  newSuggestions: 0,
  storySubmissions: 0,
  contactInquiries: 0,
  directorySubmissions: 0,
  mediaPending: 0,
  activeUsers: 0,
  locationsCovered: 0,
  weeklyActivity: [],
  coverageByTown: [],
};

export default function AdminDashboardPage() {
  const [selectedStory, setSelectedStory] = useState<StorySubmission | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [storyToFlag, setStoryToFlag] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Directory CRUD modal state
  const [isDirectoryEditModalOpen, setIsDirectoryEditModalOpen] =
    useState(false);
  const [directoryToEdit, setDirectoryToEdit] =
    useState<DirectorySubmission | null>(null);
  const [isDirectoryFlagModalOpen, setIsDirectoryFlagModalOpen] =
    useState(false);
  const [directoryToFlag, setDirectoryToFlag] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // Directory deletion confirmation dialog state
  const [directoryToDelete, setDirectoryToDelete] =
    useState<DirectorySubmission | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // AI Review modal state
  const [selectedAiRunId, setSelectedAiRunId] = useState<string | null>(null);
  const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);

  // Toast notifications
  const toast = useToast();

  // TanStack Query hooks - each manages its own loading/error state independently
  const statsQuery = useAdminStats();
  const suggestionsQuery = useAdminSuggestions();
  const storiesQuery = useAdminStories();
  const messagesQuery = useAdminMessages();
  const directoryQuery = useAdminDirectorySubmissions();
  const galleryQuery = useAdminGallery();
  const aiReviewQuery = useAiReviewQueue();
  const contributorsQuery = useAdminContributors();

  // Mutation hooks
  const updateSuggestion = useUpdateSuggestionStatus();
  const updateStory = useUpdateStoryStatus();
  const updateMessage = useUpdateMessageStatus();
  const deleteMessage = useDeleteMessage();
  const updateDirectory = useUpdateDirectoryStatus();
  const deleteDirectoryEntry = useDeleteDirectoryEntry();
  const updateGallery = useUpdateGalleryStatus();
  const promoteToHero = usePromoteToHeroImage();
  const triggerAnalysis = useTriggerAnalysis();
  const triggerBatchAnalysis = useTriggerBatchAnalysis();

  // Derived data with fallbacks
  const stats = statsQuery.data ?? defaultStats;
  const suggestions = suggestionsQuery.data?.items ?? [];
  const stories = storiesQuery.data?.items ?? [];
  const messages = messagesQuery.data?.items ?? [];
  const directorySubmissions = directoryQuery.data?.items ?? [];
  const galleryItems = useMemo(
    () => galleryQuery.data?.items ?? [],
    [galleryQuery.data]
  );
  const aiReviewItems = aiReviewQuery.data?.items ?? [];
  const contributors = contributorsQuery.data ?? [];

  // Batch fetch AI status for gallery media items
  const galleryMediaIds = useMemo(
    () => galleryItems.map((item) => item.id),
    [galleryItems]
  );
  const aiStatusQuery = useAiStatus(galleryMediaIds);
  const aiStatusMap = useMemo(
    () => new Map((aiStatusQuery.data ?? []).map((s) => [s.mediaId, s])),
    [aiStatusQuery.data]
  );

  // Loading state - show loading for KPI cards
  const isLoading = statsQuery.isLoading;

  // Pre-computed pending counts to avoid repeated filtering
  const pendingSuggestions = suggestions.filter(
    (s) => s.status === SubmissionStatus.PENDING
  );
  const pendingStories = stories.filter(
    (s) => s.status === SubmissionStatus.PENDING
  );
  const pendingDirectorySubmissions = directorySubmissions.filter(
    (s) => s.status === SubmissionStatus.PENDING
  );
  const pendingGalleryItems = galleryItems.filter(
    (g) => g.status === "PENDING_REVIEW" || g.status === "FLAGGED"
  );
  const pendingAiReviews = aiReviewItems.filter(
    (i) => i.moderationStatus === "PENDING_REVIEW"
  );

  // Event handlers using mutation hooks
  const handleSuggestionStatusChange = (
    id: string,
    status: SubmissionStatus
  ) => {
    const action = status === SubmissionStatus.APPROVED ? "APPROVE" : "REJECT";
    updateSuggestion.mutate({ id, action });
  };

  const handleStoryStatusChange = (id: string, status: SubmissionStatus) => {
    const action = status === SubmissionStatus.APPROVED ? "APPROVE" : "REJECT";
    updateStory.mutate({ id, action });
  };

  const handleStoryFlag = (id: string, title: string) => {
    setStoryToFlag({ id, title });
    setIsFlagModalOpen(true);
  };

  const handleFlagConfirm = (reason: string) => {
    if (storyToFlag) {
      updateStory.mutate({
        id: storyToFlag.id,
        action: "FLAG",
        notes: reason,
      });
    }
    setIsFlagModalOpen(false);
    setStoryToFlag(null);
  };

  const handleFlagClose = () => {
    setIsFlagModalOpen(false);
    setStoryToFlag(null);
  };

  const handleViewStory = (story: StorySubmission) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
  };

  const handleMessageStatusChange = (
    id: string,
    status: ContactMessageStatus
  ) => {
    updateMessage.mutate({ id, status });
  };

  const handleMessageDelete = (id: string) => {
    deleteMessage.mutate(id);
  };

  const handleDirectoryStatusChange = (
    id: string,
    status: SubmissionStatus
  ) => {
    const statusLabels: Record<SubmissionStatus, string> = {
      [SubmissionStatus.APPROVED]: "approved",
      [SubmissionStatus.REJECTED]: "rejected",
      [SubmissionStatus.ARCHIVED]: "archived",
      [SubmissionStatus.PENDING]: "updated",
      [SubmissionStatus.DRAFT]: "updated",
      [SubmissionStatus.FLAGGED]: "flagged",
      [SubmissionStatus.PUBLISHED]: "published",
    };
    const statusLabel = statusLabels[status];
    updateDirectory.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(`Entry ${statusLabel} successfully`).show();
        },
        onError: () => {
          toast
            .error(`Failed to ${statusLabel} entry. Please try again.`)
            .show();
        },
      }
    );
  };

  const handleDirectoryEdit = (submission: DirectorySubmission) => {
    setDirectoryToEdit(submission);
    setIsDirectoryEditModalOpen(true);
  };

  const handleDirectoryEditClose = () => {
    setIsDirectoryEditModalOpen(false);
    setDirectoryToEdit(null);
  };

  const handleDirectoryEditSuccess = () => {
    // Query invalidation handled by the mutation hook
    toast.success("Directory entry updated successfully").show();
    setIsDirectoryEditModalOpen(false);
    setDirectoryToEdit(null);
  };

  const handleDirectoryDelete = (submission: DirectorySubmission) => {
    setDirectoryToDelete(submission);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (directoryToDelete) {
      deleteDirectoryEntry.mutate(directoryToDelete.id, {
        onSuccess: () => {
          toast.success(`"${directoryToDelete.name}" has been deleted`).show();
          setIsDeleteDialogOpen(false);
          setDirectoryToDelete(null);
        },
        onError: () => {
          toast.error("Failed to delete entry. Please try again.").show();
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDirectoryToDelete(null);
  };

  const handleDirectoryFlag = (submission: DirectorySubmission) => {
    setDirectoryToFlag({ id: submission.id, name: submission.name });
    setIsDirectoryFlagModalOpen(true);
  };

  const handleDirectoryFlagConfirm = (reason: string) => {
    if (directoryToFlag) {
      updateDirectory.mutate(
        {
          id: directoryToFlag.id,
          status: SubmissionStatus.FLAGGED,
          notes: reason,
        },
        {
          onSuccess: () => {
            toast.info(`"${directoryToFlag.name}" has been flagged`).show();
          },
          onError: () => {
            toast.error("Failed to flag entry. Please try again.").show();
          },
        }
      );
    }
    setIsDirectoryFlagModalOpen(false);
    setDirectoryToFlag(null);
  };

  const handleDirectoryFlagClose = () => {
    setIsDirectoryFlagModalOpen(false);
    setDirectoryToFlag(null);
  };

  const handleGalleryStatusChange = (
    id: string,
    action: GalleryModerationAction,
    reason?: string,
    notes?: string
  ) => {
    updateGallery.mutate({
      id,
      request: { action, reason, adminNotes: notes },
    });
  };

  const handlePromoteToHero = (mediaId: string) => {
    promoteToHero.mutate(mediaId);
  };

  const handleTriggerAnalysis = (mediaId: string) => {
    triggerAnalysis.mutate(mediaId, {
      onSuccess: () => {
        toast.success("AI analysis triggered").show();
      },
      onError: () => {
        toast.error("Failed to trigger AI analysis. Please try again.").show();
      },
    });
  };

  const handleTriggerBatchAnalysis = async (mediaIds: string[]) => {
    return new Promise<void>((resolve, reject) => {
      triggerBatchAnalysis.mutate(
        { mediaIds },
        {
          onSuccess: (data) => {
            const parts = [`AI analysis triggered for ${data.accepted} items`];
            if (data.rejected > 0) {
              parts.push(`(${data.rejected} rejected)`);
            }
            toast.success(parts.join(" ")).show();
            resolve();
          },
          onError: () => {
            toast
              .error("Failed to trigger batch AI analysis. Please try again.")
              .show();
            reject();
          },
        }
      );
    });
  };

  const handleAiReview = (runId: string) => {
    setSelectedAiRunId(runId);
    setIsAiReviewModalOpen(true);
  };

  const handleAiReviewClose = () => {
    setIsAiReviewModalOpen(false);
    setSelectedAiRunId(null);
  };

  const handleViewAiReview = (mediaId: string) => {
    // Find the AI review run for this media item from the queue
    const run = aiReviewItems.find((item) => item.mediaId === mediaId);
    if (run) {
      handleAiReview(run.id);
    }
  };

  const unreadMessages = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* KPI Cards */}
        <KPICards stats={stats} isLoading={isLoading} />

        {/* Analytics Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Weekly Activity Chart */}
          <ActivityChart data={stats.weeklyActivity} isLoading={isLoading} />

          {/* Geographic & Contributors Column */}
          <div className="space-y-6">
            <CoverageChart data={stats.coverageByTown} isLoading={isLoading} />
            <TopContributors
              contributors={contributors}
              isLoading={contributorsQuery.isLoading}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <TabGroup className="mb-6">
          <TabList>
            <Tab
              icon={MessageSquare}
              badge={pendingSuggestions.length}
              color="blue"
            >
              Suggestions
            </Tab>
            <Tab icon={FileText} badge={pendingStories.length} color="pink">
              Stories
            </Tab>
            <Tab icon={Mail} badge={unreadMessages} color="green">
              Inquiries
            </Tab>
            <Tab
              icon={MapPin}
              badge={pendingDirectorySubmissions.length}
              color="ochre"
            >
              Directory
            </Tab>
            <Tab
              icon={ImageIcon}
              badge={pendingGalleryItems.length}
              color="blue"
            >
              Gallery
            </Tab>
            <Tab icon={Sparkles} badge={pendingAiReviews.length} color="ochre">
              AI Review
            </Tab>
          </TabList>

          <TabPanels className="mt-6">
            <TabPanel>
              <SuggestionsQueue />
            </TabPanel>
            <TabPanel>
              <StoriesQueue />
            </TabPanel>
            <TabPanel>
              <MessagesQueue />
            </TabPanel>
            <TabPanel>
              <DirectoryQueue
                submissions={directorySubmissions}
                isLoading={directoryQuery.isLoading}
                onStatusChange={handleDirectoryStatusChange}
                onEdit={handleDirectoryEdit}
                onDelete={handleDirectoryDelete}
                onFlag={handleDirectoryFlag}
              />
            </TabPanel>
            <TabPanel>
              <GalleryQueue
                items={galleryItems}
                isLoading={galleryQuery.isLoading}
                onStatusChange={handleGalleryStatusChange}
                onPromoteToHero={handlePromoteToHero}
                aiStatuses={aiStatusMap}
                onViewAiReview={handleViewAiReview}
                onTriggerAnalysis={handleTriggerAnalysis}
                isTriggerPending={triggerAnalysis.isPending}
                triggeringMediaId={triggerAnalysis.variables}
                onTriggerBatchAnalysis={handleTriggerBatchAnalysis}
                isBatchTriggerPending={triggerBatchAnalysis.isPending}
              />
            </TabPanel>
            <TabPanel>
              <AiReviewQueue />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>

      {/* Story Detail Modal */}
      <StoryDetailModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={(id) =>
          handleStoryStatusChange(id, SubmissionStatus.APPROVED)
        }
        onReject={(id) =>
          handleStoryStatusChange(id, SubmissionStatus.REJECTED)
        }
      />

      {/* Flag Reason Modal */}
      <FlagReasonModal
        isOpen={isFlagModalOpen}
        itemType="Story"
        itemTitle={storyToFlag?.title || ""}
        onClose={handleFlagClose}
        onConfirm={handleFlagConfirm}
      />

      {/* Directory Edit Modal */}
      <DirectoryEditModal
        isOpen={isDirectoryEditModalOpen}
        entry={directoryToEdit}
        onClose={handleDirectoryEditClose}
        onSuccess={handleDirectoryEditSuccess}
      />

      {/* Directory Flag Modal */}
      <FlagReasonModal
        isOpen={isDirectoryFlagModalOpen}
        itemType="Directory Entry"
        itemTitle={directoryToFlag?.name || ""}
        onClose={handleDirectoryFlagClose}
        onConfirm={handleDirectoryFlagConfirm}
      />

      {/* AI Review Detail Modal */}
      <AiReviewDetailModal
        runId={selectedAiRunId}
        isOpen={isAiReviewModalOpen}
        onClose={handleAiReviewClose}
      />

      {/* Directory Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${directoryToDelete?.name}"?`}
        description="This will permanently remove the directory entry. This action cannot be undone."
        confirmLabel="Delete Entry"
        variant="danger"
        isLoading={deleteDirectoryEntry.isPending}
      />
    </div>
  );
}
