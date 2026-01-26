"use client";

import { useState } from "react";
import {
  MessageSquare,
  FileText,
  Mail,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
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
} from "@/components/admin/queues";
import { StoryDetailModal } from "@/components/admin/story-detail-modal";
import { FlagReasonModal } from "@/components/admin/queues/flag-reason-modal";
import { DirectoryEditModal } from "@/components/admin/queues/directory-edit-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { SystemStatusBadges } from "@/components/admin/system-status-badge";
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
  useUpdateDirectoryEntry,
  useDeleteDirectoryEntry,
  useUpdateGalleryStatus,
  usePromoteToHeroImage,
} from "@/hooks/queries/admin";
import type {
  AdminStats,
  ContactMessageStatus,
  DirectorySubmission,
} from "@/types/admin";
import type { GalleryModerationAction } from "@/types/gallery";
import type { StorySubmission } from "@/types/story";
import { SubmissionStatus } from "@/types/story";

type ActiveTab =
  | "suggestions"
  | "stories"
  | "messages"
  | "directory"
  | "gallery";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("suggestions");
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

  // Toast notifications
  const toast = useToast();

  // TanStack Query hooks - each manages its own loading/error state independently
  const statsQuery = useAdminStats();
  const suggestionsQuery = useAdminSuggestions();
  const storiesQuery = useAdminStories();
  const messagesQuery = useAdminMessages();
  const directoryQuery = useAdminDirectorySubmissions();
  const galleryQuery = useAdminGallery();
  const contributorsQuery = useAdminContributors();

  // Mutation hooks
  const updateSuggestion = useUpdateSuggestionStatus();
  const updateStory = useUpdateStoryStatus();
  const updateMessage = useUpdateMessageStatus();
  const deleteMessage = useDeleteMessage();
  const updateDirectory = useUpdateDirectoryStatus();
  // Note: updateDirectoryEntry available for future inline update features
  const _updateDirectoryEntry = useUpdateDirectoryEntry();
  const deleteDirectoryEntry = useDeleteDirectoryEntry();
  const updateGallery = useUpdateGalleryStatus();
  const promoteToHero = usePromoteToHeroImage();

  // Derived data with fallbacks
  const stats = statsQuery.data ?? defaultStats;
  const suggestions = suggestionsQuery.data?.items ?? [];
  const stories = storiesQuery.data?.items ?? [];
  const messages = messagesQuery.data?.items ?? [];
  const directorySubmissions = directoryQuery.data?.items ?? [];
  const galleryItems = galleryQuery.data?.items ?? [];
  const contributors = contributorsQuery.data ?? [];

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
    const statusLabel =
      status === SubmissionStatus.APPROVED
        ? "approved"
        : status === SubmissionStatus.REJECTED
          ? "rejected"
          : status === SubmissionStatus.ARCHIVED
            ? "archived"
            : "updated";
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

  // Computed values
  const pendingCount =
    pendingSuggestions.length +
    pendingStories.length +
    pendingDirectorySubmissions.length;

  const unreadMessages = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="bg-canvas min-h-screen pb-12">
      {/* Header */}
      <header className="border-hairline bg-surface border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-body text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <SystemStatusBadges />
              {pendingCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {pendingCount} Pending Items
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
        <div className="border-hairline mb-6 border-b">
          <nav
            className="-mb-px flex space-x-4 overflow-x-auto md:space-x-8"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`${
                activeTab === "suggestions"
                  ? "border-ocean-blue text-ocean-blue"
                  : "text-muted hover:text-body hover:border-ocean-blue/30 border-transparent"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <MessageSquare size={16} /> Suggestions
              {pendingSuggestions.length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {pendingSuggestions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`${
                activeTab === "stories"
                  ? "border-bougainvillea-pink text-bougainvillea-pink"
                  : "text-muted hover:text-body hover:border-bougainvillea-pink/30 border-transparent"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <FileText size={16} /> Stories
              {pendingStories.length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {pendingStories.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`${
                activeTab === "messages"
                  ? "border-valley-green text-valley-green"
                  : "text-muted hover:text-body hover:border-valley-green/30 border-transparent"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <Mail size={16} /> Inquiries
              {unreadMessages > 0 && (
                <span className="bg-valley-green/20 text-valley-green ml-1 inline-flex animate-pulse items-center rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {unreadMessages}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`${
                activeTab === "directory"
                  ? "border-sobrado-ochre text-sobrado-ochre"
                  : "text-muted hover:text-body hover:border-sobrado-ochre/30 border-transparent"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <MapPin size={16} /> Directory
              {pendingDirectorySubmissions.length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {pendingDirectorySubmissions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`${
                activeTab === "gallery"
                  ? "border-ocean-blue text-ocean-blue"
                  : "text-muted hover:text-body hover:border-ocean-blue/30 border-transparent"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <ImageIcon size={16} /> Gallery
              {pendingGalleryItems.length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {pendingGalleryItems.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "suggestions" && (
          <SuggestionsQueue
            suggestions={suggestions}
            isLoading={suggestionsQuery.isLoading}
            onStatusChange={handleSuggestionStatusChange}
          />
        )}
        {activeTab === "stories" && (
          <StoriesQueue
            stories={stories}
            isLoading={storiesQuery.isLoading}
            onStatusChange={handleStoryStatusChange}
            onViewFull={handleViewStory}
            onFlag={handleStoryFlag}
          />
        )}
        {activeTab === "messages" && (
          <MessagesQueue
            messages={messages}
            isLoading={messagesQuery.isLoading}
            onStatusChange={handleMessageStatusChange}
            onDelete={handleMessageDelete}
          />
        )}
        {activeTab === "directory" && (
          <DirectoryQueue
            submissions={directorySubmissions}
            isLoading={directoryQuery.isLoading}
            onStatusChange={handleDirectoryStatusChange}
            onEdit={handleDirectoryEdit}
            onDelete={handleDirectoryDelete}
            onFlag={handleDirectoryFlag}
          />
        )}
        {activeTab === "gallery" && (
          <GalleryQueue
            items={galleryItems}
            isLoading={galleryQuery.isLoading}
            onStatusChange={handleGalleryStatusChange}
            onPromoteToHero={handlePromoteToHero}
          />
        )}
      </main>

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
