"use client";

import { useState, useEffect } from "react";
import { MessageSquare, FileText, Mail, MapPin, Image } from "lucide-react";
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
  MediaQueue,
} from "@/components/admin/queues";
import { StoryDetailModal } from "@/components/admin/story-detail-modal";
import {
  getAdminStats,
  getSuggestionsForAdmin,
  getStoriesForAdmin,
  getContactMessages,
  getDirectorySubmissions,
  getTopContributors,
  updateSuggestionStatus,
  updateStoryStatus,
  updateContactMessageStatus,
  deleteContactMessage,
  updateDirectorySubmissionStatus,
  getAdminMedia,
  updateMediaStatus,
} from "@/lib/api";
import type {
  AdminStats,
  Suggestion,
  Contributor,
  ContactMessage,
  ContactMessageStatus,
  DirectorySubmission,
  AdminMediaListItem,
  MediaModerationAction,
} from "@/types/admin";
import type { StorySubmission } from "@/types/story";
import { SubmissionStatus } from "@/types/story";

type ActiveTab = "suggestions" | "stories" | "messages" | "directory" | "media";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("suggestions");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stories, setStories] = useState<StorySubmission[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [directorySubmissions, setDirectorySubmissions] = useState<
    DirectorySubmission[]
  >([]);
  const [mediaItems, setMediaItems] = useState<AdminMediaListItem[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [selectedStory, setSelectedStory] = useState<StorySubmission | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [
          statsData,
          suggestionsData,
          storiesData,
          messagesData,
          directoryData,
          mediaData,
          contributorsData,
        ] = await Promise.all([
          getAdminStats(),
          getSuggestionsForAdmin(),
          getStoriesForAdmin(),
          getContactMessages(),
          getDirectorySubmissions(),
          getAdminMedia(),
          getTopContributors(),
        ]);

        setStats(statsData);
        setSuggestions(suggestionsData.items);
        setStories(storiesData.items);
        setMessages(messagesData.items);
        setDirectorySubmissions(directoryData.items);
        setMediaItems(mediaData.items);
        setContributors(contributorsData);
      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSuggestionStatusChange = async (
    id: string,
    status: SubmissionStatus
  ) => {
    try {
      // Map status to action
      const action =
        status === SubmissionStatus.APPROVED ? "APPROVE" : "REJECT";
      await updateSuggestionStatus(id, action);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch (error) {
      console.error("Failed to update suggestion:", error);
    }
  };

  const handleStoryStatusChange = async (
    id: string,
    status: SubmissionStatus
  ) => {
    try {
      // Map status to action
      const action =
        status === SubmissionStatus.APPROVED ? "APPROVE" : "REJECT";
      await updateStoryStatus(id, action);
      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch (error) {
      console.error("Failed to update story:", error);
    }
  };

  const handleViewStory = (story: StorySubmission) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
  };

  const handleMessageStatusChange = async (
    id: string,
    status: ContactMessageStatus
  ) => {
    try {
      await updateContactMessageStatus(id, status);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  const handleMessageDelete = async (id: string) => {
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleDirectoryStatusChange = async (
    id: string,
    status: SubmissionStatus
  ) => {
    try {
      await updateDirectorySubmissionStatus(id, status);
      setDirectorySubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch (error) {
      console.error("Failed to update directory submission:", error);
    }
  };

  const handleMediaStatusChange = async (
    id: string,
    action: MediaModerationAction,
    reason?: string,
    notes?: string
  ) => {
    try {
      const updatedMedia = await updateMediaStatus(id, {
        action,
        reason,
        adminNotes: notes,
      });
      // Update the media item in the list with the new status
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: updatedMedia.status } : m
        )
      );
    } catch (error) {
      console.error("Failed to update media status:", error);
    }
  };

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
            <div className="flex items-center space-x-2">
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
        <KPICards
          stats={
            stats || {
              newSuggestions: 0,
              storySubmissions: 0,
              contactInquiries: 0,
              directorySubmissions: 0,
              mediaPending: 0,
              activeUsers: 0,
              locationsCovered: 0,
              weeklyActivity: [],
              coverageByTown: [],
            }
          }
          isLoading={isLoading}
        />

        {/* Analytics Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Weekly Activity Chart */}
          <ActivityChart
            data={stats?.weeklyActivity || []}
            isLoading={isLoading}
          />

          {/* Geographic & Contributors Column */}
          <div className="space-y-6">
            <CoverageChart
              data={stats?.coverageByTown || []}
              isLoading={isLoading}
            />
            <TopContributors
              contributors={contributors}
              isLoading={isLoading}
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
              onClick={() => setActiveTab("media")}
              className={`${
                activeTab === "media"
                  ? "border-[var(--color-bougainvillea)] text-[var(--color-bougainvillea)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
            >
              <Image size={16} /> Media Archive
              {mediaItems.filter(
                (m) => m.status === "PENDING_REVIEW" || m.status === "FLAGGED"
              ).length > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {
                    mediaItems.filter(
                      (m) =>
                        m.status === "PENDING_REVIEW" || m.status === "FLAGGED"
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
            isLoading={isLoading}
            onStatusChange={handleSuggestionStatusChange}
          />
        )}
        {activeTab === "stories" && (
          <StoriesQueue
            stories={stories}
            isLoading={isLoading}
            onStatusChange={handleStoryStatusChange}
            onViewFull={handleViewStory}
          />
        )}
        {activeTab === "messages" && (
          <MessagesQueue
            messages={messages}
            isLoading={isLoading}
            onStatusChange={handleMessageStatusChange}
            onDelete={handleMessageDelete}
          />
        )}
        {activeTab === "directory" && (
          <DirectoryQueue
            submissions={directorySubmissions}
            isLoading={isLoading}
            onStatusChange={handleDirectoryStatusChange}
          />
        )}
        {activeTab === "media" && (
          <MediaQueue
            mediaItems={mediaItems}
            isLoading={isLoading}
            onStatusChange={handleMediaStatusChange}
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
    </div>
  );
}
