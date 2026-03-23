/**
 * Admin Mock Data
 *
 * Mock data for the admin dashboard and moderation queues.
 */

import type {
  AdminStats,
  Suggestion,
  Contributor,
  ContactMessage,
  DirectorySubmission,
  AdminQueueResponse,
} from "@/types/admin";
import { SubmissionStatus } from "@/types/story";

export const MOCK_ADMIN_STATS: AdminStats = {
  newSuggestions: 24,
  storySubmissions: 12,
  contactInquiries: 5,
  directorySubmissions: 3,
  mediaPending: 7,
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
    { name: "Nova Sintra", value: 35, fill: "var(--brand-ocean-blue)" },
    { name: "Furna", value: 25, fill: "var(--brand-valley-green)" },
    { name: "Fajã d'Água", value: 20, fill: "var(--brand-bougainvillea-pink)" },
    { name: "N.S. do Monte", value: 20, fill: "var(--brand-sunny-yellow)" },
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

export const MOCK_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: "cm1",
    name: "Ana Rodrigues",
    email: "ana.rodrigues@email.com",
    subject: "PARTNERSHIP",
    message:
      "Hello! I represent a Cape Verdean cultural organization based in Boston. We would love to discuss a potential partnership to promote Brava Island heritage to our diaspora community.",
    status: "UNREAD",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "cm2",
    name: "Pedro Santos",
    email: "pedro.santos@travel.cv",
    subject: "GENERAL_INQUIRY",
    message:
      "I am planning a trip to Brava next month. Could you provide more information about accommodation options in Nova Sintra and the best hiking trails?",
    status: "UNREAD",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
  },
  {
    id: "cm3",
    name: "Maria Fernandes",
    email: "maria.f@example.com",
    subject: "CONTENT_SUGGESTION",
    message:
      "I have a collection of historical photos from my grandmother who lived in Furna in the 1960s. How can I contribute these to your archive?",
    status: "READ",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "cm4",
    name: "Carlos Mendes",
    email: "carlos.m@gmail.com",
    subject: "TECHNICAL_ISSUE",
    message:
      "The map feature is not loading properly on my mobile device (iPhone 14, Safari). The markers appear but the base map stays blank.",
    status: "ARCHIVED",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "cm5",
    name: "João Tavares",
    email: "jtavares@diaspora.org",
    subject: "GENERAL_INQUIRY",
    message:
      "I am fluent in Portuguese, Kriolu, and English. I would like to volunteer to help translate content for the platform. Please let me know how I can contribute.",
    status: "READ",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

export const MOCK_DIRECTORY_SUBMISSIONS: DirectorySubmission[] = [
  {
    id: "ds1",
    name: "Bar Saudade",
    category: "Restaurant",
    town: "Nova Sintra",
    description:
      "A cozy bar in the heart of Nova Sintra serving traditional Cape Verdean drinks and snacks. Known for their grogue and live morna music on weekends.",
    tags: ["bar", "live-music", "traditional", "grogue"],
    priceLevel: "$",
    status: SubmissionStatus.PENDING,
    submittedBy: "Maria Costa",
    submittedByEmail: "maria.costa@email.com",
    submittedAt: "2 hours ago",
  },
  {
    id: "ds2",
    name: "Miradouro da Esperança",
    category: "Heritage",
    town: "Nossa Senhora do Monte",
    description:
      "A stunning viewpoint overlooking the entire island and the neighboring Fogo volcano. Best visited at sunset for spectacular views.",
    tags: ["viewpoint", "sunset", "photography", "hiking"],
    latitude: 14.8521,
    longitude: -24.7123,
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: SubmissionStatus.PENDING,
    submittedBy: "João Neves",
    submittedByEmail: "joao.neves@example.com",
    submittedAt: "1 day ago",
  },
  {
    id: "ds3",
    name: "Trilho das Fontainhas",
    category: "Nature",
    town: "Furna",
    description:
      "A scenic hiking trail that winds through terraced hillsides and traditional villages. The path offers views of the ocean and connects several natural springs.",
    tags: ["hiking", "nature", "springs", "scenic"],
    status: SubmissionStatus.PENDING,
    submittedBy: "Ana Sousa",
    submittedByEmail: "ana.sousa@gmail.com",
    submittedAt: "3 days ago",
  },
  {
    id: "ds4",
    name: "Casa da Cultura",
    category: "Heritage",
    town: "Nova Sintra",
    description:
      "The cultural center hosts exhibitions, music performances, and workshops on traditional crafts. A hub for local artists and cultural events.",
    tags: ["museum", "arts", "workshops", "events"],
    imageUrl:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800",
    status: SubmissionStatus.APPROVED,
    submittedBy: "Carlos Lima",
    submittedByEmail: "carlos.lima@culture.cv",
    submittedAt: "1 week ago",
    reviewedBy: "admin",
    reviewedAt: "5 days ago",
  },
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

  // Contact Messages API
  getContactMessages: async (): Promise<AdminQueueResponse<ContactMessage>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      items: MOCK_CONTACT_MESSAGES,
      total: MOCK_CONTACT_MESSAGES.length,
      page: 1,
      pageSize: 10,
      hasMore: false,
    };
  },

  updateContactMessageStatus: async (
    id: string,
    status: ContactMessage["status"]
  ): Promise<ContactMessage> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const message = MOCK_CONTACT_MESSAGES.find((m) => m.id === id);
    if (!message) throw new Error("Message not found");
    return { ...message, status };
  },

  deleteContactMessage: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = MOCK_CONTACT_MESSAGES.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Message not found");
    // In real implementation, this would delete from database
  },

  // Directory Submissions API
  getDirectorySubmissions: async (
    status?: SubmissionStatus | "ALL"
  ): Promise<AdminQueueResponse<DirectorySubmission>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const filtered =
      status && status !== "ALL"
        ? MOCK_DIRECTORY_SUBMISSIONS.filter((s) => s.status === status)
        : MOCK_DIRECTORY_SUBMISSIONS;
    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: 10,
      hasMore: false,
    };
  },

  updateDirectorySubmissionStatus: async (
    id: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<DirectorySubmission> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const submission = MOCK_DIRECTORY_SUBMISSIONS.find((s) => s.id === id);
    if (!submission) throw new Error("Directory submission not found");
    return {
      ...submission,
      status,
      adminNotes: notes,
      reviewedBy: "admin",
      reviewedAt: new Date().toISOString(),
    };
  },
};
