/**
 * Admin Mock Data
 *
 * Mock data for the admin dashboard and moderation queues.
 */

import type {
  AdminStats,
  Suggestion,
  Contributor,
  AdminQueueResponse,
} from "@/types/admin";
import { SubmissionStatus } from "@/types/story";

export const MOCK_ADMIN_STATS: AdminStats = {
  newSuggestions: 24,
  storySubmissions: 12,
  activeUsers: 89,
  locationsCovered: 14,
  weeklyActivity: [
    { day: "Mon", suggestions: 3, stories: 1 },
    { day: "Tue", suggestions: 5, stories: 2 },
    { day: "Wed", suggestions: 4, stories: 0 },
    { day: "Thu", suggestions: 6, stories: 3 },
    { day: "Fri", suggestions: 8, stories: 2 },
    { day: "Sat", suggestions: 2, stories: 1 },
    { day: "Sun", suggestions: 1, stories: 0 },
  ],
  coverageByTown: [
    { name: "Nova Sintra", value: 35, fill: "var(--color-ocean-blue)" },
    { name: "Furna", value: 25, fill: "var(--color-valley-green)" },
    { name: "Fajã d'Água", value: 20, fill: "var(--color-bougainvillea)" },
    { name: "N.S. do Monte", value: 20, fill: "var(--color-sunny-yellow)" },
  ],
};

export const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: "s1",
    target: "Café Morabeza",
    targetType: "directory",
    description:
      "The opening hours are incorrect. The café closes at 6pm on weekdays and 4pm on weekends.",
    status: SubmissionStatus.PENDING,
    submittedBy: "anonymous",
    timestamp: "2 hours ago",
  },
  {
    id: "s2",
    target: "Morna Origins",
    targetType: "article",
    description:
      "You should mention Cesária Évora's contribution to popularizing Morna internationally.",
    status: SubmissionStatus.PENDING,
    submittedBy: "maria@example.com",
    timestamp: "1 day ago",
  },
  {
    id: "s3",
    target: "Eugenio Tavares Museum",
    targetType: "directory",
    description:
      "The museum has been renovated and now includes a new exhibition on his poetry.",
    status: SubmissionStatus.APPROVED,
    submittedBy: "joao@example.com",
    timestamp: "3 days ago",
    reviewedBy: "admin",
    reviewedAt: "2 days ago",
  },
  {
    id: "s4",
    target: "Furna Harbor",
    targetType: "directory",
    description: "The ferry schedule has changed. Please update the times.",
    status: SubmissionStatus.REJECTED,
    submittedBy: "anonymous",
    timestamp: "1 week ago",
    adminNotes: "Unable to verify - no source provided",
  },
];

export const MOCK_TOP_CONTRIBUTORS: Contributor[] = [
  { id: "c1", name: "Maria Silva", role: "Contributor", points: 245 },
  { id: "c2", name: "João Mendes", role: "Contributor", points: 189 },
  { id: "c3", name: "Ana Gomes", role: "Moderator", points: 156 },
  { id: "c4", name: "Carlos Baptista", role: "Contributor", points: 98 },
  { id: "c5", name: "Pedro Nunes", role: "Contributor", points: 72 },
];

// Mock API functions
export const mockAdminApi = {
  getStats: async (): Promise<AdminStats> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_ADMIN_STATS;
  },

  getSuggestions: async (
    status?: SubmissionStatus | "ALL"
  ): Promise<AdminQueueResponse<Suggestion>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const filtered =
      status && status !== "ALL"
        ? MOCK_SUGGESTIONS.filter((s) => s.status === status)
        : MOCK_SUGGESTIONS;
    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: 10,
      hasMore: false,
    };
  },

  updateSuggestionStatus: async (
    id: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<Suggestion> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const suggestion = MOCK_SUGGESTIONS.find((s) => s.id === id);
    if (!suggestion) throw new Error("Suggestion not found");
    return {
      ...suggestion,
      status,
      adminNotes: notes,
      reviewedBy: "admin",
      reviewedAt: new Date().toISOString(),
    };
  },

  getTopContributors: async (): Promise<Contributor[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_TOP_CONTRIBUTORS;
  },
};
