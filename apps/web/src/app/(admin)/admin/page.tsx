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
  useUpdateGalleryStatus,
} from "@/hooks/queries/admin";
import type { AdminStats, ContactMessageStatus } from "@/types/admin";
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
  const updateGallery = useUpdateGalleryStatus();

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
    updateDirectory.mutate({ id, status });
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

  // Computed values
  const pendingCount =
    suggestions.filter((s) => s.status === SubmissionStatus.PENDING).length +
    stories.filter((s) => s.status === SubmissionStatus.PENDING).length +
    directorySubmissions.filter((s) => s.status === SubmissionStatus.PENDING)
      .length;

  const unreadMessages = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
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
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav
            className="-mb-px flex space-x-4 overflow-x-auto md:space-x-8"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`${
                activeTab === "suggestions"
                  ? "border-[var(--color-ocean-blue)] text-[var(--color-ocean-blue)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <MessageSquare size={16} /> Suggestions
              {suggestions.filter((s) => s.status === SubmissionStatus.PENDING)
                .length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {
                    suggestions.filter(
                      (s) => s.status === SubmissionStatus.PENDING
                    ).length
                  }
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`${
                activeTab === "stories"
                  ? "border-[var(--color-bougainvillea)] text-[var(--color-bougainvillea)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <FileText size={16} /> Stories
              {stories.filter((s) => s.status === SubmissionStatus.PENDING)
                .length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {
                    stories.filter((s) => s.status === SubmissionStatus.PENDING)
                      .length
                  }
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`${
                activeTab === "messages"
                  ? "border-[var(--color-valley-green)] text-[var(--color-valley-green)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <Mail size={16} /> Inquiries
              {unreadMessages > 0 && (
                <span className="ml-1 inline-flex animate-pulse items-center rounded-full bg-[var(--color-valley-green)]/20 px-1.5 py-0.5 text-xs font-medium text-[var(--color-valley-green)]">
                  {unreadMessages}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`${
                activeTab === "directory"
                  ? "border-[var(--color-sobrado-ochre)] text-[var(--color-sobrado-ochre)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <MapPin size={16} /> Directory
              {directorySubmissions.filter(
                (s) => s.status === SubmissionStatus.PENDING
              ).length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {
                    directorySubmissions.filter(
                      (s) => s.status === SubmissionStatus.PENDING
                    ).length
                  }
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`${
                activeTab === "gallery"
                  ? "border-[var(--color-ocean-blue)] text-[var(--color-ocean-blue)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <ImageIcon size={16} /> Gallery
              {galleryItems.filter(
                (g) => g.status === "PENDING_REVIEW" || g.status === "FLAGGED"
              ).length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {
                    galleryItems.filter(
                      (g) =>
                        g.status === "PENDING_REVIEW" || g.status === "FLAGGED"
                    ).length
                  }
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
          />
        )}
        {activeTab === "gallery" && (
          <GalleryQueue
            items={galleryItems}
            isLoading={galleryQuery.isLoading}
            onStatusChange={handleGalleryStatusChange}
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
    </div>
  );
}
