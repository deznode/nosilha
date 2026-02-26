import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ApiClient,
  PaginatedResult,
  PaginationMetadata,
  StorySubmitRequest,
  StorySubmittedResponse,
  StoryModerationAction,
  SuggestionModerationAction,
  DashboardCounts,
  DirectorySubmissionRequest,
  DirectorySubmissionConfirmation,
} from "@/lib/api-contracts";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
  ReactionType,
} from "@/types/reaction";
import type { MediaMetadataDto, ApprovedMediaPageResponse } from "@/types/api";
import type { StorySubmission } from "@/types/story";
import { SubmissionStatus } from "@/types/story";
import type {
  AdminStats,
  Suggestion,
  Contributor,
  ContactMessage,
  ContactMessageStatus,
  DirectorySubmission,
  AdminQueueResponse,
} from "@/types/admin";
import type { BookmarkDto, BookmarkWithEntryDto } from "@/types/bookmark";
import type {
  ProfileDto,
  ContributionsDto,
  ProfileUpdateRequest,
} from "@/types/profile";
import type { ContactRequest, ContactConfirmationDto } from "@/types/contact";
import { MOCK_STORIES, mockStoriesApi } from "@/lib/mocks/stories";
import {
  MOCK_SUGGESTIONS,
  MOCK_CONTACT_MESSAGES,
  MOCK_DIRECTORY_SUBMISSIONS,
  mockAdminApi,
} from "@/lib/mocks/admin";

const MOCK_ENTRIES: DirectoryEntry[] = [
  // AUTHENTIC HOTEL ENTRIES FROM DATABASE
  {
    id: "1",
    slug: "djababas-eco-lodge",
    name: "Djabraba's Eco-Lodge",
    category: "Hotel",
    imageUrl: "/images/directory/djababas-eco-lodge.jpg",
    town: "Nova Sintra",
    latitude: 14.871,
    longitude: -24.712,
    description:
      "An eco-lodge offering sustainable mountain accommodation with traditional Cape Verdean hospitality and stunning views of the volcanic landscape.",
    tags: ["eco-lodge", "sustainable", "mountain", "nova-sintra"],
    contentActions: {
      order: ["SHARE", "REACTIONS", "COPY_LINK", "PRINT", "SUGGEST"],
      disabled: ["PRINT"],
    },
    rating: 4.8,
    reviewCount: 120,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    details: {
      phoneNumber: "+238 555 5678",
      amenities: [
        "Eco-Tourism",
        "Mountain Views",
        "Traditional Architecture",
        "Cultural Immersion",
        "Sustainable Practices",
      ],
    },
  },
  {
    id: "2",
    slug: "pousada-nova-sintra",
    name: "Pousada Nova Sintra",
    category: "Hotel",
    imageUrl: "/images/directory/pousada-nova-sintra.jpg",
    town: "Nova Sintra",
    latitude: 14.8687443,
    longitude: -24.6943796,
    description:
      "An authentic family-run pousada in the heart of Nova Sintra, offering traditional Cape Verdean hospitality with views of the surrounding mountains and cultural immersion experiences.",
    tags: ["hospitality", "family-run", "nova-sintra"],
    contentActions: null,
    rating: 4.6,
    reviewCount: 87,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    details: {
      phoneNumber: "+238 262 0444",
      amenities: [
        "Family-Run",
        "Cultural Immersion",
        "Mountain Views",
        "Traditional Breakfast",
        "Local Guides",
      ],
    },
  },
  {
    id: "3",
    slug: "pensao-paulo",
    name: "Pensão Paulo",
    category: "Hotel",
    imageUrl: "/images/directory/pensao-paulo.jpg",
    town: "Nova Sintra",
    latitude: 14.865,
    longitude: -24.707,
    description:
      "A welcoming pensão offering comfortable accommodation and authentic local experience in Nova Sintra, where guests become part of the Brava Island community.",
    tags: ["community", "hospitality", "nova-sintra"],
    contentActions: null,
    rating: 4.3,
    reviewCount: 112,
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-17T14:30:00Z",
    details: {
      phoneNumber: "+238 285 1300",
      amenities: [
        "Community Experience",
        "Local Hospitality",
        "Central Location",
        "Traditional Architecture",
      ],
    },
  },

  // AUTHENTIC RESTAURANT ENTRIES FROM DATABASE
  {
    id: "4",
    slug: "nos-raiz",
    name: "Nós Raiz",
    category: "Restaurant",
    imageUrl: "/images/directory/nos-raiz.jpg",
    town: "Nova Sintra",
    latitude: 14.8635,
    longitude: -24.7055,
    description:
      "An authentic local restaurant celebrating Cape Verdean roots with traditional recipes and cultural storytelling, where every meal connects diners to Brava Island heritage.",
    tags: ["restaurant", "local-cuisine", "nova-sintra", "heritage"],
    contentActions: null,
    rating: 4.5,
    reviewCount: 88,
    createdAt: "2024-01-04T10:00:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
    details: {
      phoneNumber: "+238 285 1400",
      openingHours: "11:00 AM - 10:00 PM Daily",
      cuisine: [
        "Traditional Cape Verdean",
        "Cultural Storytelling",
        "Local Recipes",
        "Heritage Cuisine",
      ],
    },
  },

  // AUTHENTIC BEACH ENTRIES FROM DATABASE
  {
    id: "5",
    slug: "praia-de-faja-dagua",
    name: "Praia de Fajã d'Água",
    category: "Beach",
    imageUrl: "/images/directory/praia-de-faja-dagua.jpg",
    town: "Fajã d'Água",
    latitude: 14.8588,
    longitude: -24.7578,
    description:
      "A beautiful black sand beach nestled in a green valley, offering a tranquil escape and natural swimming pools.",
    tags: ["beach", "nature", "faja-dagua"],
    contentActions: null,
    rating: 5.0,
    reviewCount: 250,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-19T14:30:00Z",
    details: null,
  },

  // AUTHENTIC HERITAGE ENTRIES FROM DATABASE
  {
    id: "6",
    slug: "igreja-nossa-senhora-do-monte",
    name: "Igreja Nossa Senhora do Monte",
    category: "Heritage",
    imageUrl: "/images/directory/igreja-nossa-senhora-do-monte.jpg",
    town: "Nossa Senhora do Monte",
    latitude: 14.8591559,
    longitude: -24.7164904,
    description:
      "This sacred pilgrimage church has drawn faithful souls for over 160 years, where August processions unite island residents with diaspora descendants in shared devotion.",
    tags: ["pilgrimage", "heritage", "nossa-senhora-do-monte"],
    contentActions: null,
    rating: 4.9,
    reviewCount: 234,
    createdAt: "2024-01-06T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    details: null,
  },
  {
    id: "7",
    slug: "casa-eugenio-tavares",
    name: "Casa Eugénio Tavares",
    category: "Heritage",
    imageUrl: "/images/directory/casa-eugenio-tavares.jpg",
    town: "Nova Sintra",
    latitude: 14.8648,
    longitude: -24.7068,
    description:
      "The preserved home of Cape Verde's greatest poet, where morna was perfected and sodade given voice, connecting our island soul to hearts across the world.",
    tags: ["morna", "heritage", "nova-sintra"],
    contentActions: null,
    rating: 4.7,
    reviewCount: 189,
    createdAt: "2024-01-07T10:00:00Z",
    updatedAt: "2024-01-21T14:30:00Z",
    details: null,
  },
  {
    id: "8",
    slug: "praca-eugenio-tavares",
    name: "Praça Eugénio Tavares",
    category: "Heritage",
    imageUrl: "/images/directory/praca-eugenio-tavares.jpg",
    town: "Nova Sintra",
    latitude: 14.8638,
    longitude: -24.7062,
    description:
      "Our town's cultural heart where the poet's bust watches over daily life, surrounded by colonial sobrados and the hibiscus gardens that inspired his verses about island beauty.",
    tags: ["heritage", "public-square", "nova-sintra"],
    contentActions: null,
    rating: 4.6,
    reviewCount: 167,
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-22T14:30:00Z",
    details: null,
  },
];

/**
 * Internal mock bookmark type with userId for storage
 */
interface MockBookmark {
  id: string;
  userId: string;
  entryId: string;
  createdAt: string;
}

/**
 * Mock API Client - Implements ApiClient interface for testing and development
 * This implementation provides realistic mock data with simulated async behavior
 */
export class MockApiClient implements ApiClient {
  /**
   * Mock bookmark storage for simulating user bookmarks
   */
  private mockBookmarks: MockBookmark[] = [];

  /**
   * Simulates network delay for realistic testing
   */
  private async simulateDelay(ms: number = 100): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetches all directory entries or entries for a specific category.
   * Simulates ISR caching behavior with realistic delays.
   */
  async getEntriesByCategory(
    category: string,
    page: number = 0,
    size: number = 20,
    searchQuery?: string,
    town?: string,
    sort?: string
  ): Promise<PaginatedResult<DirectoryEntry>> {
    console.log(
      `Mock API: Fetching entries for category: ${category}, page: ${page}, size: ${size}, search: ${searchQuery}, town: ${town}, sort: ${sort}`
    );
    await this.simulateDelay(150);

    let filteredEntries = MOCK_ENTRIES;
    if (category.toLowerCase() !== "all") {
      filteredEntries = MOCK_ENTRIES.filter(
        (entry) => entry.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply town filter if provided
    if (town) {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.town?.toLowerCase() === town.toLowerCase()
      );
    }

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim().length >= 2) {
      const query = searchQuery.trim().toLowerCase();
      filteredEntries = filteredEntries.filter(
        (entry) =>
          entry.name.toLowerCase().includes(query) ||
          entry.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting if provided
    if (sort) {
      filteredEntries = [...filteredEntries].sort((a, b) => {
        switch (sort) {
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "rating_desc":
            return (b.rating || 0) - (a.rating || 0);
          case "created_at_desc":
          default:
            // Default sort by creation date descending
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
        }
      });
    }

    // Simulate pagination
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const items = filteredEntries.slice(startIndex, endIndex);
    const totalElements = filteredEntries.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size || 1));

    const pagination: PaginationMetadata = {
      page,
      size,
      totalElements,
      totalPages,
      first: page <= 0,
      last: page >= totalPages - 1,
    };

    return { items, pagination };
  }

  /**
   * Fetches a single directory entry by its slug.
   * Includes realistic delay and proper undefined handling.
   */
  async getEntryBySlug(slug: string): Promise<DirectoryEntry | undefined> {
    console.log(`Mock API: Fetching entry with slug: ${slug}`);
    await this.simulateDelay(100);
    return MOCK_ENTRIES.find((entry) => entry.slug === slug);
  }

  /**
   * Creates a new directory entry (mock implementation).
   * Simulates validation and returns a realistic response.
   */
  async createDirectoryEntry(
    entryData: Omit<
      DirectoryEntry,
      "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
    >
  ): Promise<DirectoryEntry> {
    console.log(`Mock API: Creating new directory entry:`, entryData);
    await this.simulateDelay(300); // Longer delay for write operations

    // Simulate validation
    if (!entryData.name || entryData.name.trim().length === 0) {
      throw new Error("Validation failed: name: Name is required");
    }

    // Create mock entry with generated fields
    const newEntry: DirectoryEntry = {
      ...entryData,
      id: `mock-${Date.now()}`,
      slug: entryData.name.toLowerCase().replace(/\s+/g, "-"),
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DirectoryEntry;

    // Add to mock data (in real scenario, this would persist)
    MOCK_ENTRIES.push(newEntry);
    return newEntry;
  }

  /**
   * Mock implementation for submitting a directory entry for review.
   * Simulates authenticated submission flow.
   */
  async submitDirectoryEntry(
    request: DirectorySubmissionRequest
  ): Promise<DirectorySubmissionConfirmation> {
    console.log(`Mock API: Submitting directory entry for review:`, request);
    await this.simulateDelay(300);

    // Simulate validation
    if (!request.name || request.name.trim().length === 0) {
      throw new Error("Validation failed: name: Name is required");
    }
    if (!request.description || request.description.trim().length < 10) {
      throw new Error(
        "Validation failed: description: Description must be at least 10 characters"
      );
    }

    // Return confirmation (simulates backend response)
    return {
      id: `mock-${Date.now()}`,
      name: request.name,
      status: "PENDING",
    };
  }

  /**
   * Fetches entries for map display with larger page size.
   * Uses no caching to simulate real-time map data.
   */
  async getEntriesForMap(
    category: string = "all"
  ): Promise<PaginatedResult<DirectoryEntry>> {
    console.log(`Mock API: Fetching entries for map, category: ${category}`);
    await this.simulateDelay(200);

    const filtered =
      category.toLowerCase() === "all"
        ? MOCK_ENTRIES
        : MOCK_ENTRIES.filter(
            (entry) => entry.category.toLowerCase() === category.toLowerCase()
          );

    const pagination: PaginationMetadata = {
      page: 0,
      size: filtered.length,
      totalElements: filtered.length,
      totalPages: 1,
      first: true,
      last: true,
    };

    return { items: filtered, pagination };
  }

  /**
   * Mock image upload implementation.
   * Simulates file processing and returns a mock URL.
   */
  async uploadImage(
    file: File,
    options?: {
      entryId?: string;
      category?: string;
      description?: string;
    }
  ): Promise<string> {
    console.log(`Mock API: Uploading image:`, {
      fileName: file.name,
      size: file.size,
      entryId: options?.entryId,
      category: options?.category,
      description: options?.description,
    });
    await this.simulateDelay(1000); // Longer delay for file upload

    // Simulate validation
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    // Return mock URL
    const timestamp = Date.now();
    return `/images/uploads/mock-${timestamp}-${file.name}`;
  }

  /**
   * Fetches media metadata for a directory entry.
   * Returns only AVAILABLE media items.
   */
  async getMediaByEntry(entryId: string): Promise<MediaMetadataDto[]> {
    console.log(`Mock API: Fetching media for entry: ${entryId}`);
    await this.simulateDelay(100);

    // Return empty array for mock (no media uploaded in mock mode)
    return [];
  }

  /**
   * Fetches approved user-uploaded media for gallery display.
   * Returns empty in mock mode (no user uploads in mock).
   */
  async getApprovedMedia(options?: {
    contentType?: string;
    page?: number;
    size?: number;
  }): Promise<ApprovedMediaPageResponse> {
    console.log(`Mock API: Fetching approved media`, options);
    await this.simulateDelay(100);

    // Return empty array for mock (no media uploaded in mock mode)
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: options?.page ?? 0,
    };
  }

  /**
   * Fetches all towns with simulated caching behavior.
   */
  async getTowns(): Promise<Town[]> {
    console.log(`Mock API: Fetching all towns`);
    await this.simulateDelay(120);
    return MOCK_TOWNS;
  }

  /**
   * Fetches a single town by its slug.
   */
  async getTownBySlug(slug: string): Promise<Town | undefined> {
    console.log(`Mock API: Fetching town with slug: ${slug}`);
    await this.simulateDelay(100);
    return MOCK_TOWNS.find((town) => town.slug === slug);
  }

  /**
   * Fetches towns for map display.
   */
  async getTownsForMap(): Promise<Town[]> {
    console.log(`Mock API: Fetching towns for map`);
    await this.simulateDelay(150);
    return MOCK_TOWNS;
  }

  // ================================
  // REACTION OPERATIONS (User Story 2) - Mock Implementation
  // ================================

  // In-memory storage for mock reactions (simulates database)
  private mockReactions: Map<
    string,
    {
      id: string;
      contentId: string;
      userId: string;
      reactionType: ReactionType;
    }
  > = new Map();

  // Track reaction counts per content (simulates aggregated database query)
  private mockReactionCounts: Map<string, Record<ReactionType, number>> =
    new Map();

  /**
   * Submits a new reaction or updates an existing reaction (mock implementation).
   * Simulates backend business logic: toggle behavior and rate limiting.
   */
  async submitReaction(
    createDto: ReactionCreateDto
  ): Promise<ReactionResponseDto> {
    console.log(`Mock API: Submitting reaction`, createDto);
    await this.simulateDelay(200);

    // Mock user ID (in real app, this comes from JWT token)
    const mockUserId = "mock-user-123";
    const reactionKey = `${mockUserId}-${createDto.contentId}`;

    // Get existing reaction for this user + content
    const existingReaction = this.mockReactions.get(reactionKey);

    // Initialize counts if not exist
    if (!this.mockReactionCounts.has(createDto.contentId)) {
      this.mockReactionCounts.set(createDto.contentId, {
        LOVE: 0,
        CELEBRATE: 0,
        INSIGHTFUL: 0,
        SUPPORT: 0,
      });
    }

    const counts = this.mockReactionCounts.get(createDto.contentId)!;

    // Toggle behavior: If clicking same type, remove reaction
    if (existingReaction?.reactionType === createDto.reactionType) {
      // Remove reaction
      this.mockReactions.delete(reactionKey);
      counts[createDto.reactionType] = Math.max(
        0,
        counts[createDto.reactionType] - 1
      );

      return {
        id: existingReaction.id,
        contentId: createDto.contentId,
        reactionType: createDto.reactionType,
        count: counts[createDto.reactionType],
      };
    }

    // If user had different reaction, decrement old count
    if (
      existingReaction &&
      existingReaction.reactionType !== createDto.reactionType
    ) {
      counts[existingReaction.reactionType] = Math.max(
        0,
        counts[existingReaction.reactionType] - 1
      );
    }

    // Create or update reaction
    const reactionId = existingReaction?.id || `mock-reaction-${Date.now()}`;
    this.mockReactions.set(reactionKey, {
      id: reactionId,
      contentId: createDto.contentId,
      userId: mockUserId,
      reactionType: createDto.reactionType,
    });

    // Increment new count
    counts[createDto.reactionType] += 1;

    return {
      id: reactionId,
      contentId: createDto.contentId,
      reactionType: createDto.reactionType,
      count: counts[createDto.reactionType],
    };
  }

  /**
   * Removes user's reaction to content (mock implementation).
   */
  async deleteReaction(contentId: string): Promise<void> {
    console.log(`Mock API: Deleting reaction for content ${contentId}`);
    await this.simulateDelay(150);

    // Mock user ID
    const mockUserId = "mock-user-123";
    const reactionKey = `${mockUserId}-${contentId}`;

    const existingReaction = this.mockReactions.get(reactionKey);
    if (!existingReaction) {
      throw new Error("Reaction not found");
    }

    // Decrement count
    const counts = this.mockReactionCounts.get(contentId);
    if (counts) {
      counts[existingReaction.reactionType] = Math.max(
        0,
        counts[existingReaction.reactionType] - 1
      );
    }

    // Remove reaction
    this.mockReactions.delete(reactionKey);
  }

  /**
   * Gets aggregated reaction counts for a specific content page (mock implementation).
   * Returns realistic mock data with optional user reaction.
   */
  async getReactionCounts(contentId: string): Promise<ReactionCountsDto> {
    console.log(`Mock API: Fetching reaction counts for content ${contentId}`);
    await this.simulateDelay(100);

    // Mock user ID
    const mockUserId = "mock-user-123";
    const reactionKey = `${mockUserId}-${contentId}`;

    // Get current counts or initialize with realistic mock data
    let counts = this.mockReactionCounts.get(contentId);
    if (!counts) {
      // Generate realistic mock counts for demonstration
      counts = {
        LOVE: Math.floor(Math.random() * 50) + 10, // 10-60 loves
        CELEBRATE: Math.floor(Math.random() * 30) + 5, // 5-35 celebrate
        INSIGHTFUL: Math.floor(Math.random() * 20) + 3, // 3-23 insightful
        SUPPORT: Math.floor(Math.random() * 40) + 8, // 8-48 support
      };
      this.mockReactionCounts.set(contentId, counts);
    }

    // Get user's current reaction if exists
    const userReaction = this.mockReactions.get(reactionKey);

    return {
      contentId,
      reactions: counts,
      userReaction: userReaction?.reactionType || null,
    };
  }

  /**
   * Submits a content improvement suggestion (mock implementation).
   * Simulates backend validation, rate limiting, and honeypot spam protection.
   */
  async submitSuggestion(suggestionDto: {
    contentId: string;
    pageTitle: string;
    pageUrl: string;
    contentType: string;
    name: string;
    email: string;
    suggestionType:
      | "CORRECTION"
      | "ADDITION"
      | "FEEDBACK"
      | "PHOTO_IDENTIFICATION";
    message: string;
    mediaId?: string;
    honeypot?: string;
  }): Promise<{ id: string | null; message: string }> {
    console.log(`Mock API: Submitting suggestion`, suggestionDto);
    await this.simulateDelay(300);

    // Simulate honeypot spam protection
    if (suggestionDto.honeypot) {
      console.log("Mock API: Honeypot spam detected");
      // Silently accept spam (return success to avoid revealing detection)
      return {
        id: null,
        message: "Thank you for your submission.",
      };
    }

    // Simulate validation errors
    if (suggestionDto.name.length < 2 || suggestionDto.name.length > 255) {
      throw new Error("Name must be between 2 and 255 characters");
    }
    if (!suggestionDto.email.includes("@")) {
      throw new Error("Invalid email format");
    }
    if (
      suggestionDto.message.length < 10 ||
      suggestionDto.message.length > 5000
    ) {
      throw new Error("Message must be between 10 and 5000 characters");
    }

    // Simulate successful submission
    const suggestionId = `mock-suggestion-${Date.now()}`;
    console.log(`Mock API: Suggestion ${suggestionId} created successfully`);

    return {
      id: suggestionId,
      message:
        "Thank you for helping preserve our cultural heritage. Your suggestion has been received and will be reviewed by our team.",
    };
  }

  // ================================
  // BOOKMARK OPERATIONS (User Story 2 - Mock)
  // ================================

  /**
   * Mock implementation for creating a bookmark.
   * Simulates saving a bookmark to user's saved places.
   */
  async createBookmark(entryId: string): Promise<BookmarkDto> {
    console.log(`Mock API: Creating bookmark for entry ${entryId}`);
    await this.simulateDelay(200);

    // Simulate entry not found
    const entry = MOCK_ENTRIES.find((e) => e.id === entryId);
    if (!entry) {
      throw new Error("Directory entry not found.");
    }

    // Simulate duplicate bookmark
    const existingBookmark = this.mockBookmarks.find(
      (b) => b.entryId === entryId && b.userId === "mock-user-id"
    );
    if (existingBookmark) {
      throw new Error("This entry is already bookmarked.");
    }

    // Simulate max bookmarks limit (100)
    const userBookmarks = this.mockBookmarks.filter(
      (b) => b.userId === "mock-user-id"
    );
    if (userBookmarks.length >= 100) {
      throw new Error("Maximum bookmark limit reached.");
    }

    // Create new bookmark
    const newBookmark: MockBookmark = {
      id: `bookmark-${Date.now()}`,
      userId: "mock-user-id",
      entryId,
      createdAt: new Date().toISOString(),
    };

    this.mockBookmarks.push(newBookmark);

    // Return DTO without userId
    return {
      id: newBookmark.id,
      entryId: newBookmark.entryId,
      createdAt: newBookmark.createdAt,
    };
  }

  /**
   * Mock implementation for deleting a bookmark.
   */
  async deleteBookmark(entryId: string): Promise<void> {
    console.log(`Mock API: Deleting bookmark for entry ${entryId}`);
    await this.simulateDelay(200);

    const bookmarkIndex = this.mockBookmarks.findIndex(
      (b) => b.entryId === entryId && b.userId === "mock-user-id"
    );

    if (bookmarkIndex === -1) {
      throw new Error("Bookmark not found");
    }

    this.mockBookmarks.splice(bookmarkIndex, 1);
  }

  /**
   * Mock implementation for fetching user's bookmarks with entry details.
   */
  async getBookmarks(
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResult<BookmarkWithEntryDto>> {
    console.log(`Mock API: Fetching bookmarks page=${page} size=${size}`);
    await this.simulateDelay(300);

    // Filter bookmarks for current user
    const userBookmarks = this.mockBookmarks.filter(
      (b) => b.userId === "mock-user-id"
    );

    // Sort by creation date (most recent first)
    userBookmarks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const start = page * size;
    const end = start + size;
    const paginatedBookmarks = userBookmarks.slice(start, end);

    // Enrich with entry details
    const bookmarksWithEntries: BookmarkWithEntryDto[] = [];
    for (const bookmark of paginatedBookmarks) {
      const entry = MOCK_ENTRIES.find((e) => e.id === bookmark.entryId);
      if (!entry) continue;

      bookmarksWithEntries.push({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        entry: {
          id: entry.id,
          name: entry.name,
          category: entry.category,
          slug: entry.slug,
          description: entry.description,
          town: entry.town,
          thumbnailUrl: entry.imageUrl ?? null,
          averageRating: entry.rating ?? null,
        },
      });
    }

    return {
      items: bookmarksWithEntries,
      pagination: {
        page,
        size,
        totalElements: userBookmarks.length,
        totalPages: Math.ceil(userBookmarks.length / size),
        first: page === 0,
        last: end >= userBookmarks.length,
      },
    };
  }

  /**
   * Mock implementation for fetching related content.
   * Simulates the backend algorithm by matching category, town, and cuisine.
   *
   * **User Story 5 - Phase 9**: Discovering Related Cultural Content
   *
   * @param contentId UUID of the current heritage page
   * @param limit Number of results to return (3-5, default: 5)
   * @returns Promise resolving to array of related directory entries
   */
  async getRelatedContent(
    contentId: string,
    limit: number = 5
  ): Promise<DirectoryEntry[]> {
    console.log(
      `Mock API: Fetching related content for ${contentId}, limit=${limit}`
    );
    await this.simulateDelay(150);

    // Find the current entry
    const currentEntry = MOCK_ENTRIES.find((entry) => entry.id === contentId);
    if (!currentEntry) {
      console.warn(`Mock API: Content ${contentId} not found`);
      return [];
    }

    const relatedEntries: DirectoryEntry[] = [];

    // Priority 1: Same category + same town
    const sameCategoryTown = MOCK_ENTRIES.filter(
      (entry) =>
        entry.id !== contentId &&
        entry.category.toLowerCase() === currentEntry.category.toLowerCase() &&
        entry.town.toLowerCase() === currentEntry.town.toLowerCase()
    );
    relatedEntries.push(...sameCategoryTown);

    // Priority 2: Same category + shared cuisine (for restaurants)
    if (
      relatedEntries.length < limit &&
      currentEntry.category === "Restaurant" &&
      currentEntry.details?.cuisine &&
      currentEntry.details.cuisine.length > 0
    ) {
      const currentCuisines = currentEntry.details.cuisine.map((c) =>
        c.trim().toLowerCase()
      );
      const sameCategoryCuisine = MOCK_ENTRIES.filter(
        (entry) =>
          entry.id !== contentId &&
          entry.category === "Restaurant" &&
          entry.details?.cuisine &&
          entry.details.cuisine.length > 0 &&
          !relatedEntries.includes(entry) &&
          entry.details.cuisine.some((c) =>
            currentCuisines.some((cc) => c.trim().toLowerCase().includes(cc))
          )
      );
      relatedEntries.push(...sameCategoryCuisine);
    }

    // Priority 3: Same category fallback
    if (relatedEntries.length < 3) {
      const sameCategoryOnly = MOCK_ENTRIES.filter(
        (entry) =>
          entry.id !== contentId &&
          entry.category.toLowerCase() ===
            currentEntry.category.toLowerCase() &&
          !relatedEntries.includes(entry)
      );
      relatedEntries.push(...sameCategoryOnly);
    }

    const results = relatedEntries.slice(0, limit);
    console.log(`Mock API: Returning ${results.length} related entries`);
    return results;
  }

  // ================================
  // STORY SUBMISSION OPERATIONS (Mock)
  // ================================

  /**
   * Submits a new story (mock implementation).
   * Simulates validation and honeypot spam protection.
   */
  async submitStory(data: StorySubmitRequest): Promise<StorySubmittedResponse> {
    console.log(`Mock API: Submitting story`, data);
    await this.simulateDelay(500);

    // Simulate honeypot spam detection
    if (data.honeypot) {
      console.log("Mock API: Honeypot spam detected");
      return { id: null, message: "Thank you for your submission." };
    }

    // Simulate validation
    if (!data.title || data.title.length < 3) {
      throw new Error("Title must be at least 3 characters");
    }
    if (!data.content || data.content.length < 10) {
      throw new Error("Content must be at least 10 characters");
    }

    const storyId = `mock-story-${Date.now()}`;
    console.log(`Mock API: Story ${storyId} submitted successfully`);

    return {
      id: storyId,
      message:
        "Thank you for sharing your story. It has been submitted for review.",
    };
  }

  /**
   * Fetches published stories (mock implementation).
   * Returns stories with APPROVED status only.
   */
  async getStories(
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResult<StorySubmission>> {
    console.log(`Mock API: Fetching stories, page: ${page}, size: ${size}`);
    await this.simulateDelay(300);

    const approvedStories = await mockStoriesApi.getStories(
      "APPROVED" as SubmissionStatus
    );

    // Simple pagination
    const start = page * size;
    const end = start + size;
    const paginatedStories = approvedStories.slice(start, end);

    return {
      items: paginatedStories,
      pagination: {
        page,
        size,
        totalElements: approvedStories.length,
        totalPages: Math.ceil(approvedStories.length / size),
        first: page === 0,
        last: end >= approvedStories.length,
      },
    };
  }

  /**
   * Fetches a single story by slug (mock implementation).
   * Returns story only if it has APPROVED status.
   */
  async getStoryBySlug(slug: string): Promise<StorySubmission | undefined> {
    console.log(`Mock API: Fetching story by slug: ${slug}`);
    await this.simulateDelay(200);

    const story = await mockStoriesApi.getStoryBySlug(slug);

    // Only return approved stories for public access
    if (story && story.status === ("APPROVED" as SubmissionStatus)) {
      return story;
    }

    return undefined;
  }

  // ================================
  // ADMIN STORY MODERATION OPERATIONS (Mock)
  // ================================

  /**
   * Gets stories for admin moderation queue (mock implementation).
   */
  async getStoriesForAdmin(
    status?: SubmissionStatus | "ALL",
    _page: number = 0,
    _size: number = 20
  ): Promise<AdminQueueResponse<StorySubmission>> {
    console.log(`Mock API: Fetching stories for admin, status: ${status}`);
    return mockStoriesApi.getStoriesForAdmin(status);
  }

  /**
   * Updates story moderation status (mock implementation).
   */
  async updateStoryStatus(
    id: string,
    action: StoryModerationAction,
    notes?: string,
    slug?: string
  ): Promise<void> {
    console.log(
      `Mock API: Updating story ${id} with action: ${action}`,
      notes,
      slug
    );
    await this.simulateDelay(300);

    // Map action to status
    const statusMap: Record<StoryModerationAction, SubmissionStatus> = {
      APPROVE: "APPROVED" as SubmissionStatus,
      REJECT: "REJECTED" as SubmissionStatus,
      FLAG: "FLAGGED" as SubmissionStatus,
      PUBLISH: "PUBLISHED" as SubmissionStatus,
      UNPUBLISH: "PENDING" as SubmissionStatus,
    };

    const story = MOCK_STORIES.find((s) => s.id === id);
    if (!story) {
      throw new Error("Story not found");
    }

    // Update in mock data (in real scenario would persist)
    story.status = statusMap[action];
    if (notes) {
      story.adminNotes = notes;
    }
    if (slug && action === "PUBLISH") {
      story.slug = slug;
    }
    story.reviewedBy = "admin";
    story.reviewedAt = new Date().toISOString();

    console.log(`Mock API: Story ${id} status updated to ${story.status}`);
  }

  /**
   * Toggles featured status for a story (mock implementation).
   */
  async toggleStoryFeatured(id: string, featured: boolean): Promise<void> {
    console.log(`Mock API: Toggling featured for story ${id} to: ${featured}`);
    await this.simulateDelay(200);
    // Mock implementation - just log the action
  }

  /**
   * Deletes a story (mock implementation).
   */
  async deleteStory(id: string): Promise<void> {
    console.log(`Mock API: Deleting story ${id}`);
    await this.simulateDelay(200);

    const index = MOCK_STORIES.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("Story not found");
    }
    // In real scenario would remove from array
  }

  // ================================
  // MDX ARCHIVAL ENGINE OPERATIONS (Mock)
  // ================================

  /**
   * Generates MDX content from an approved story (mock implementation).
   */
  async generateMdx(
    storyId: string,
    options?: import("@/types/admin").GenerateMdxOptions
  ): Promise<import("@/types/admin").MdxContent> {
    console.log(`Mock API: Generating MDX for story ${storyId}`, options);
    await this.simulateDelay(1000); // Simulate processing time

    const story = MOCK_STORIES.find((s) => s.id === storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    if (story.status !== SubmissionStatus.APPROVED) {
      throw new Error("Story must be approved before generating MDX");
    }

    // Generate mock MDX content
    const mockMdxSource = `---
title: "${story.title}"
slug: "${story.slug}"
author: "${story.author}"
date: "${story.submittedAt}"
language: "en"
location: "${story.location || "Brava Island"}"
storyType: "${story.type}"
tags: ["community-story", "heritage"]
excerpt: "${story.content.substring(0, 100)}..."
---

# ${story.title}

${story.content
  .split("\n\n")
  .map((p) => `${p}`)
  .join("\n\n")}

---

*Story submitted by ${story.author} on ${story.submittedAt}*
`;

    // Randomly decide if schema is valid for testing
    const schemaValid = Math.random() > 0.3; // 70% chance of valid schema

    return {
      storyId: story.id,
      slug: story.slug,
      mdxSource: mockMdxSource,
      frontmatter: {
        title: story.title,
        slug: story.slug,
        author: story.author,
        date: story.submittedAt,
        language: "en",
        location: story.location || "Brava Island",
        storyType: story.type,
        tags: ["community-story", "heritage"],
        excerpt: `${story.content.substring(0, 100)}...`,
      },
      schemaValid,
      validationErrors: schemaValid
        ? undefined
        : [
            "Missing required field: category",
            "Date format should be YYYY-MM-DD",
            "Excerpt exceeds 160 character limit",
          ],
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Commits MDX content to the repository (mock implementation).
   */
  async commitMdx(
    storyId: string,
    mdxSource: string,
    commitMessage?: string
  ): Promise<import("@/types/admin").MdxCommitResult> {
    console.log(`Mock API: Committing MDX for story ${storyId}`, commitMessage);
    await this.simulateDelay(1500); // Simulate git operations

    const story = MOCK_STORIES.find((s) => s.id === storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    // Simulate successful commit
    return {
      storyId: story.id,
      slug: story.slug,
      mdxPath: `content/stories/${story.slug}.mdx`,
      committedAt: new Date().toISOString(),
      committedBy: "admin@nosilha.cv",
    };
  }

  // ================================
  // ADMIN SUGGESTION MODERATION OPERATIONS (Mock)
  // ================================

  /**
   * Gets suggestions for admin moderation queue (mock implementation).
   */
  async getSuggestionsForAdmin(
    status?: SubmissionStatus | "ALL",
    _page: number = 0,
    _size: number = 20
  ): Promise<AdminQueueResponse<Suggestion>> {
    console.log(`Mock API: Fetching suggestions for admin, status: ${status}`);
    return mockAdminApi.getSuggestions(status);
  }

  /**
   * Updates suggestion moderation status (mock implementation).
   */
  async updateSuggestionStatus(
    id: string,
    action: SuggestionModerationAction,
    notes?: string
  ): Promise<void> {
    console.log(
      `Mock API: Updating suggestion ${id} with action: ${action}`,
      notes
    );
    await this.simulateDelay(300);

    const statusMap: Record<SuggestionModerationAction, SubmissionStatus> = {
      APPROVE: "APPROVED" as SubmissionStatus,
      REJECT: "REJECTED" as SubmissionStatus,
    };

    const suggestion = MOCK_SUGGESTIONS.find((s) => s.id === id);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    suggestion.status = statusMap[action];
    if (notes) {
      suggestion.adminNotes = notes;
    }
    suggestion.reviewedBy = "admin";
    suggestion.reviewedAt = new Date().toISOString();
  }

  /**
   * Deletes a suggestion (mock implementation).
   */
  async deleteSuggestion(id: string): Promise<void> {
    console.log(`Mock API: Deleting suggestion ${id}`);
    await this.simulateDelay(200);

    const index = MOCK_SUGGESTIONS.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("Suggestion not found");
    }
  }

  // ================================
  // ADMIN DASHBOARD OPERATIONS (Mock)
  // ================================

  /**
   * Gets admin dashboard statistics (mock implementation).
   */
  async getAdminStats(): Promise<AdminStats> {
    console.log(`Mock API: Fetching admin stats`);
    return mockAdminApi.getStats();
  }

  /**
   * Gets dashboard counts for pending items (mock implementation).
   */
  async getDashboardCounts(): Promise<DashboardCounts> {
    console.log(`Mock API: Fetching dashboard counts`);
    await this.simulateDelay(200);

    // Calculate counts from mock data
    return {
      pendingSuggestions: MOCK_SUGGESTIONS.filter((s) => s.status === "PENDING")
        .length,
      pendingStories: MOCK_STORIES.filter((s) => s.status === "PENDING").length,
      pendingMessages: MOCK_CONTACT_MESSAGES.filter(
        (m) => m.status === "UNREAD"
      ).length,
      pendingDirectory: MOCK_DIRECTORY_SUBMISSIONS.filter(
        (d) => d.status === "PENDING"
      ).length,
    };
  }

  /**
   * Gets top contributors (mock implementation).
   */
  async getTopContributors(): Promise<Contributor[]> {
    console.log(`Mock API: Fetching top contributors`);
    return mockAdminApi.getTopContributors();
  }

  // ================================
  // ADMIN CONTACT MESSAGES (Mock)
  // ================================

  /**
   * Gets contact messages for admin (mock implementation).
   */
  async getContactMessages(
    status?: ContactMessageStatus,
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<ContactMessage>> {
    console.log(
      `Mock API: Fetching contact messages, status: ${status}, page: ${page}, size: ${size}`
    );
    return mockAdminApi.getContactMessages();
  }

  /**
   * Updates contact message status (mock implementation).
   */
  async updateContactMessageStatus(
    id: string,
    status: ContactMessageStatus
  ): Promise<ContactMessage> {
    console.log(
      `Mock API: Updating contact message ${id} status to: ${status}`
    );
    return mockAdminApi.updateContactMessageStatus(id, status);
  }

  /**
   * Deletes a contact message (mock implementation).
   */
  async deleteContactMessage(id: string): Promise<void> {
    console.log(`Mock API: Deleting contact message ${id}`);
    return mockAdminApi.deleteContactMessage(id);
  }

  // ================================
  // ADMIN DIRECTORY SUBMISSIONS (Mock)
  // ================================

  /**
   * Gets directory submissions for admin (mock implementation).
   */
  async getDirectorySubmissions(
    status?: SubmissionStatus | "ALL",
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<DirectorySubmission>> {
    console.log(
      `Mock API: Fetching directory submissions, status: ${status}, page: ${page}, size: ${size}`
    );
    return mockAdminApi.getDirectorySubmissions(status);
  }

  /**
   * Updates directory submission status (mock implementation).
   */
  async updateDirectorySubmissionStatus(
    id: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<DirectorySubmission> {
    console.log(
      `Mock API: Updating directory submission ${id} status to: ${status}`,
      notes
    );
    return mockAdminApi.updateDirectorySubmissionStatus(id, status, notes);
  }

  /**
   * Updates an existing directory entry (mock implementation).
   */
  async updateDirectoryEntry(
    id: string,
    data: import("@/lib/api-contracts").UpdateDirectoryEntryRequest
  ): Promise<DirectorySubmission> {
    console.log(`Mock API: Updating directory entry ${id}`, data);
    await this.simulateDelay(300);

    // Find in mock directory submissions
    const submission = MOCK_DIRECTORY_SUBMISSIONS.find((d) => d.id === id);
    if (!submission) {
      throw new Error("Directory entry not found");
    }

    // Update fields
    if (data.name) submission.name = data.name;
    if (data.category) {
      // Convert uppercase category to title case
      const categoryMap: Record<string, DirectorySubmission["category"]> = {
        RESTAURANT: "Restaurant",
        HOTEL: "Hotel",
        BEACH: "Beach",
        HERITAGE: "Heritage",
        NATURE: "Nature",
      };
      submission.category = categoryMap[data.category] || submission.category;
    }
    if (data.town) submission.town = data.town;
    if (data.description) submission.description = data.description;
    if (data.tags) submission.tags = data.tags;
    if (data.imageUrl !== undefined) submission.imageUrl = data.imageUrl;
    if (data.priceLevel !== undefined) submission.priceLevel = data.priceLevel;
    if (data.latitude !== undefined) submission.latitude = data.latitude;
    if (data.longitude !== undefined) submission.longitude = data.longitude;

    return submission;
  }

  /**
   * Deletes a directory entry permanently (mock implementation).
   */
  async deleteDirectoryEntry(id: string): Promise<void> {
    console.log(`Mock API: Deleting directory entry ${id}`);
    await this.simulateDelay(200);

    const index = MOCK_DIRECTORY_SUBMISSIONS.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error("Directory entry not found");
    }

    MOCK_DIRECTORY_SUBMISSIONS.splice(index, 1);
  }

  // ================================
  // ADMIN MEDIA MODERATION OPERATIONS - Mock Implementation
  // ================================

  /**
   * Mock data for media items
   */
  private mockMediaItems: import("@/types/admin").AdminMediaListItem[] = [
    {
      id: "media-1",
      title: "Historic Photo of Furna",
      contentType: "image/jpeg",
      thumbnailUrl: "/images/placeholder.jpg",
      status: "PENDING_REVIEW",
      severity: 0,
      uploadedBy: "Maria Silva",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "media-2",
      title: "Traditional Dance Performance",
      contentType: "video/mp4",
      status: "FLAGGED",
      severity: 3,
      uploadedBy: "João Costa",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "media-3",
      title: "Landscape of Vila Nova Sintra",
      contentType: "image/png",
      thumbnailUrl: "/images/placeholder.jpg",
      status: "AVAILABLE",
      severity: 0,
      uploadedBy: "Ana Santos",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  async getAdminMedia(
    status?: import("@/types/admin").MediaStatus | "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<import("@/types/admin").AdminMediaListItem>> {
    console.log(`Mock API: Fetching media items, status: ${status}`);

    const filteredItems =
      status && status !== "ALL"
        ? this.mockMediaItems.filter((m) => m.status === status)
        : this.mockMediaItems;

    const start = page * size;
    const end = start + size;
    const items = filteredItems.slice(start, end);

    return {
      items,
      total: filteredItems.length,
      page,
      pageSize: size,
      hasMore: end < filteredItems.length,
    };
  }

  async getAdminMediaDetail(
    id: string
  ): Promise<import("@/types/admin").AdminMediaDetail> {
    console.log(`Mock API: Fetching media detail for ${id}`);

    const media = this.mockMediaItems.find((m) => m.id === id);
    if (!media) {
      throw new Error(`Media item ${id} not found`);
    }

    return {
      ...media,
      fileName: `${media.title.toLowerCase().replace(/\s+/g, "-")}.jpg`,
      publicUrl: media.thumbnailUrl,
      category: "heritage",
      description: "A beautiful capture of Cape Verdean culture and heritage",
    };
  }

  async updateMediaStatus(
    id: string,
    request: import("@/types/admin").UpdateMediaStatusRequest
  ): Promise<import("@/types/admin").AdminMediaDetail> {
    console.log(
      `Mock API: Updating media ${id} with action: ${request.action}`
    );

    const mediaIndex = this.mockMediaItems.findIndex((m) => m.id === id);
    if (mediaIndex === -1) {
      throw new Error(`Media item ${id} not found`);
    }

    const media = this.mockMediaItems[mediaIndex];

    // Map action to status
    let newStatus: import("@/types/admin").MediaStatus;
    switch (request.action) {
      case "APPROVE":
        newStatus = "AVAILABLE";
        break;
      case "FLAG":
        newStatus = "FLAGGED";
        break;
      case "REJECT":
        newStatus = "DELETED";
        break;
      default:
        newStatus = media.status;
    }

    // Update the mock data
    this.mockMediaItems[mediaIndex] = {
      ...media,
      status: newStatus,
    };

    return {
      ...this.mockMediaItems[mediaIndex],
      fileName: `${media.title.toLowerCase().replace(/\s+/g, "-")}.jpg`,
      publicUrl: media.thumbnailUrl,
      category: "heritage",
      description: "A beautiful capture of Cape Verdean culture and heritage",
      rejectionReason: request.reason,
    };
  }

  async deleteMedia(id: string): Promise<void> {
    console.log(`Mock API: Deleting media ${id}`);

    const mediaIndex = this.mockMediaItems.findIndex((m) => m.id === id);
    if (mediaIndex === -1) {
      throw new Error(`Media item ${id} not found`);
    }

    this.mockMediaItems.splice(mediaIndex, 1);
  }

  // ================================
  // PROFILE OPERATIONS (User Story 1) - Mock Implementation
  // ================================

  /**
   * Gets authenticated user's profile (mock implementation).
   */
  async getProfile(): Promise<ProfileDto> {
    console.warn(
      "Mock API: getProfile not yet implemented, returning empty profile"
    );
    // Return a mock profile with default values
    return {
      id: "mock-profile-id",
      userId: "mock-user-id",
      displayName: null,
      location: null,
      preferredLanguage: "EN",
      notificationPreferences: {
        storyPublished: true,
        suggestionApproved: true,
        weeklyDigest: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Gets authenticated user's contributions (mock implementation).
   */
  async getContributions(): Promise<ContributionsDto> {
    console.warn(
      "Mock API: getContributions not yet implemented, returning empty contributions"
    );
    // Return a mock contributions object with empty data
    return {
      reactionCounts: {},
      suggestions: [],
      stories: [],
      totalReactions: 0,
      totalSuggestions: 0,
      totalStories: 0,
    };
  }

  /**
   * Updates authenticated user's profile (mock implementation).
   */
  async updateProfile(request: ProfileUpdateRequest): Promise<ProfileDto> {
    console.warn(
      "Mock API: updateProfile not yet implemented, returning mock updated profile"
    );
    await this.simulateDelay(150);

    // Return a mock profile with the updated values
    return {
      id: "mock-profile-id",
      userId: "mock-user-id",
      displayName: request.displayName ?? null,
      location: request.location ?? null,
      preferredLanguage: request.preferredLanguage ?? "EN",
      notificationPreferences: {
        storyPublished: request.notificationPreferences?.storyPublished ?? true,
        suggestionApproved:
          request.notificationPreferences?.suggestionApproved ?? true,
        weeklyDigest: request.notificationPreferences?.weeklyDigest ?? false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // ================================
  // CONTACT FORM OPERATIONS (User Story 5)
  // ================================

  /**
   * Submits a contact form message (mock implementation).
   * Returns a mock confirmation response.
   */
  async submitContactMessage(
    request: ContactRequest
  ): Promise<ContactConfirmationDto> {
    console.log("Mock API: Submitting contact form", request);
    await this.simulateDelay(200);

    // Return mock confirmation
    return {
      id: `mock-contact-${Date.now()}`,
      message:
        "Thank you for your message. We'll get back to you within 2-3 business days.",
      submittedAt: new Date().toISOString(),
    };
  }

  // ================================
  // GALLERY OPERATIONS (UNIFIED MEDIA) - Mock Stubs
  // ================================

  async getGalleryMedia(): Promise<
    import("@/types/gallery").PublicGalleryMediaPageResponse
  > {
    console.log(`Mock API: Gallery methods not implemented yet`);
    await this.simulateDelay(300);
    return { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
  }

  async getGalleryMediaById(): Promise<
    import("@/types/gallery").PublicGalleryMedia | undefined
  > {
    await this.simulateDelay(200);
    return undefined;
  }

  async getGalleryCategories(): Promise<string[]> {
    await this.simulateDelay(150);
    return ["Heritage", "Culture", "Nature"];
  }

  async getRandomGalleryMedia(): Promise<
    import("@/types/gallery").PublicGalleryMedia[]
  > {
    await this.simulateDelay(200);
    return [];
  }

  async getFeaturedPhoto(): Promise<
    import("@/types/gallery").PublicGalleryMedia | null
  > {
    await this.simulateDelay(200);
    return null;
  }

  async getWeeklyDiscovery(): Promise<
    import("@/types/gallery").PublicGalleryMedia[]
  > {
    await this.simulateDelay(200);
    return [];
  }

  async getGalleryTimeline(): Promise<
    import("@/types/gallery").TimelineResponse
  > {
    await this.simulateDelay(200);
    return { groups: [], totalCount: 0 };
  }

  async submitExternalMedia(): Promise<{ id: string; message: string }> {
    await this.simulateDelay(500);
    return {
      id: "mock-submission-id",
      message: "Submission received for review",
    };
  }

  // ================================
  // ADMIN GALLERY MODERATION - Mock Stubs
  // ================================

  async getAdminGallery(): Promise<
    import("@/types/admin").AdminQueueResponse<
      import("@/types/gallery").GalleryMedia
    >
  > {
    await this.simulateDelay(300);
    return { items: [], total: 0, page: 0, pageSize: 20, hasMore: false };
  }

  async getAdminGalleryDetail(): Promise<
    import("@/types/gallery").GalleryMedia
  > {
    await this.simulateDelay(200);
    throw new Error("Not found");
  }

  async updateGalleryStatus(
    id: string,
    request: import("@/types/gallery").UpdateGalleryStatusRequest
  ): Promise<import("@/types/gallery").GalleryMedia> {
    console.log(`Mock API: Update gallery status ${id}:`, request);
    await this.simulateDelay(500);
    throw new Error("Not implemented");
  }

  async updateGalleryMedia(
    id: string,
    request: import("@/types/gallery").UpdateGalleryMediaRequest
  ): Promise<import("@/types/gallery").GalleryMedia> {
    console.log(`Mock API: Update gallery media ${id}:`, request);
    await this.simulateDelay(500);
    throw new Error("Not implemented");
  }

  async archiveGalleryMedia(): Promise<void> {
    await this.simulateDelay(300);
  }

  async createExternalMedia(): Promise<
    import("@/types/gallery").ExternalMedia
  > {
    await this.simulateDelay(500);
    throw new Error("Not implemented");
  }

  async promoteToHeroImage(mediaId: string): Promise<void> {
    console.log(`Mock API: Promoting media ${mediaId} to hero image`);
    await this.simulateDelay(500);
    // Mock implementation - just log and return
  }

  // ================================
  // ADMIN AI REVIEW OPERATIONS
  // ================================

  async getAiReviewQueue(): Promise<
    import("@/types/admin").AdminQueueResponse<
      import("@/types/ai").AnalysisRunSummary
    >
  > {
    await this.simulateDelay(300);
    return { items: [], total: 0, page: 0, pageSize: 20, hasMore: false };
  }

  async getAiRunDetail(): Promise<import("@/types/ai").AnalysisRunDetail> {
    await this.simulateDelay(200);
    throw new Error("Not found");
  }

  async approveAiRun(): Promise<void> {
    await this.simulateDelay(300);
  }

  async rejectAiRun(): Promise<void> {
    await this.simulateDelay(300);
  }

  async approveEditedAiRun(): Promise<void> {
    await this.simulateDelay(300);
  }

  async getAiStatus(): Promise<import("@/types/ai").AiStatusResponse[]> {
    await this.simulateDelay(200);
    return [];
  }

  async triggerAnalysis(
    mediaId: string
  ): Promise<import("@/types/ai").AnalysisTriggerResponse> {
    await this.simulateDelay(300);
    return {
      mediaId,
      analysisRunId: crypto.randomUUID(),
      status: "PENDING",
    };
  }

  async triggerBatchAnalysis(
    request: import("@/types/ai").AnalyzeBatchRequest
  ): Promise<import("@/types/ai").BatchAnalysisTriggerResponse> {
    await this.simulateDelay(500);
    return {
      batchId: crypto.randomUUID(),
      accepted: request.mediaIds.length,
      rejected: 0,
      errors: [],
    };
  }

  // ================================
  // TEXT AI OPERATIONS - Mock Stubs
  // ================================

  async checkAiAvailable(): Promise<import("@/types/ai").AiAvailableResponse> {
    await this.simulateDelay(100);
    return { available: true };
  }

  async polishContent(
    request: import("@/types/ai").PolishContentRequest
  ): Promise<import("@/types/ai").PolishContentResponse> {
    console.log(`Mock API: Polishing content`);
    await this.simulateDelay(500);
    return { content: request.content, aiApplied: false };
  }

  async translateContent(
    request: import("@/types/ai").TranslateContentRequest
  ): Promise<import("@/types/ai").TranslateContentResponse> {
    console.log(`Mock API: Translating content to ${request.targetLang}`);
    await this.simulateDelay(500);
    return { content: request.content, aiApplied: false };
  }

  async generatePrompts(
    _request: import("@/types/ai").GeneratePromptsRequest
  ): Promise<import("@/types/ai").GeneratePromptsResponse> {
    console.log(`Mock API: Generating prompts`);
    await this.simulateDelay(500);
    return {
      prompts: [
        "What sounds do you remember from your childhood?",
        "Can you describe the view from your favorite spot?",
        "Who taught you about the traditions?",
      ],
    };
  }

  async generateDirectoryContent(
    _request: import("@/types/ai").GenerateDirectoryContentRequest
  ): Promise<import("@/types/ai").DirectoryContentResponse> {
    console.log(`Mock API: Generating directory content`);
    await this.simulateDelay(500);
    return {
      description: "A charming place in Brava Island.",
      tags: ["traditional", "local", "heritage"],
    };
  }

  // ================================
  // ADMIN AI DASHBOARD - Mock Stubs
  // ================================

  async getAiHealth(): Promise<import("@/types/ai").AiHealthResponse> {
    await this.simulateDelay(300);
    return {
      enabled: true,
      providers: [
        {
          name: "cloud-vision",
          enabled: true,
          capabilities: ["LABELS", "OCR", "LANDMARKS"],
          usage: { count: 42, limit: 1000, percentUsed: 4.2 },
        },
        {
          name: "gemini-cultural",
          enabled: true,
          capabilities: ["CULTURAL_CONTEXT"],
          usage: { count: 15, limit: 500, percentUsed: 3.0 },
        },
      ],
      domains: [
        {
          domain: "gallery",
          enabled: false,
          updatedAt: new Date().toISOString(),
          updatedBy: null,
        },
        {
          domain: "stories",
          enabled: false,
          updatedAt: new Date().toISOString(),
          updatedBy: null,
        },
        {
          domain: "directory",
          enabled: false,
          updatedAt: new Date().toISOString(),
          updatedBy: null,
        },
      ],
    };
  }

  async updateAiDomainConfig(
    domain: string,
    request: import("@/types/ai").UpdateDomainConfigRequest
  ): Promise<import("@/types/ai").AiDomainConfig> {
    await this.simulateDelay(300);
    return {
      domain,
      enabled: request.enabled,
      updatedAt: new Date().toISOString(),
      updatedBy: "mock-admin-uuid",
    };
  }

  // ================================
  // ADMIN R2 STORAGE - Mock Stubs
  // ================================

  async listR2Bucket(): Promise<
    import("@/types/r2-admin").R2BucketListResponse
  > {
    await this.simulateDelay(300);
    return { objects: [], continuationToken: null, isTruncated: false };
  }

  async bulkPresignR2(): Promise<
    import("@/types/r2-admin").BulkPresignResponse
  > {
    await this.simulateDelay(300);
    return { presigns: [] };
  }

  async bulkConfirmR2(): Promise<
    import("@/types/r2-admin").BulkConfirmResponse
  > {
    await this.simulateDelay(300);
    return { accepted: 0, rejected: 0, created: [], errors: [] };
  }

  async detectR2Orphans(): Promise<
    import("@/types/r2-admin").OrphanDetectionResponse
  > {
    await this.simulateDelay(300);
    return {
      orphans: [],
      totalScanned: 0,
      continuationToken: null,
      isTruncated: false,
    };
  }

  async linkR2Orphan(): Promise<import("@/types/gallery").UserUploadMedia> {
    await this.simulateDelay(300);
    throw new Error("Mock: linkR2Orphan not implemented");
  }

  async deleteR2Orphan(): Promise<void> {
    await this.simulateDelay(300);
  }
}

// Legacy synchronous functions for backward compatibility and build-time use
export function getMockEntriesByCategory(category: string): DirectoryEntry[] {
  console.log(`Legacy: Using mock fallback for category: ${category}`);
  if (category.toLowerCase() === "all") return MOCK_ENTRIES;
  return MOCK_ENTRIES.filter(
    (entry) => entry.category.toLowerCase() === category.toLowerCase()
  );
}

export function getMockEntryBySlug(slug: string): DirectoryEntry | undefined {
  console.log(`Legacy: Using mock fallback for slug: ${slug}`);
  return MOCK_ENTRIES.find((entry) => entry.slug === slug);
}

// Mock town data aligned with V6 migration database data
const MOCK_TOWNS: Town[] = [
  {
    id: "1",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description:
      "Our mountain capital where cobblestone streets wind between flower-filled gardens and colonial sobrados tell stories of diaspora dreams realized",
    latitude: 14.87111,
    longitude: -24.69611,
    population: "1,536 (2010 census)",
    elevation: "520m",
    founded: "Late 17th century",
    highlights: [
      "UNESCO Tentative List site",
      "Praça Eugénio Tavares",
      "Colonial sobrados",
      "Eugénio Tavares Museum",
    ],
    heroImage: "/images/towns/nova-sintra-hero.jpg",
    gallery: [
      "/images/towns/nova-sintra-1.jpg",
      "/images/towns/nova-sintra-2.jpg",
      "/images/towns/nova-sintra-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    slug: "furna",
    name: "Furna",
    description:
      "Where the sea meets the land in a perfect volcanic embrace, this ancient harbor welcomes every visitor with the rhythms of working boats and ocean waves",
    latitude: 14.88694,
    longitude: -24.68,
    population: "612 (2010 census)",
    elevation: "Sea level",
    founded: "Early 18th century as major port",
    highlights: [
      "Volcanic crater harbor",
      "Fishing fleet",
      "Maritime festivals",
      "Nossa Senhora dos Navegantes",
    ],
    heroImage: "/images/towns/furna-hero.jpg",
    gallery: [
      "/images/towns/furna-1.jpg",
      "/images/towns/furna-2.jpg",
      "/images/towns/furna-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "3",
    slug: "faja-de-agua",
    name: "Fajã d'Água",
    description:
      "Once our gateway to the world's whaling ships, now a hidden paradise where volcanic pools offer perfect refuge from the Atlantic's power",
    latitude: 14.87306,
    longitude: -24.73194,
    population: "126 (2010 census)",
    elevation: "Sea level-100m",
    founded: "18th century as main port",
    highlights: [
      "Natural swimming pools",
      "Agricultural terraces",
      "Abandoned airport",
      "Emigrant monument",
    ],
    heroImage: "/images/towns/faja-de-agua-hero.jpg",
    gallery: [
      "/images/towns/faja-de-agua-1.jpg",
      "/images/towns/faja-de-agua-2.jpg",
      "/images/towns/faja-de-agua-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "4",
    slug: "nossa-senhora-do-monte",
    name: "Nossa Senhora do Monte",
    description:
      "High among the clouds, this sacred place has drawn pilgrims for over 150 years, offering both spiritual solace and breathtaking views of our island home",
    latitude: 14.85806,
    longitude: -24.71806,
    population: "271 (2010 census)",
    elevation: "642m",
    founded: "Parish established around 1826",
    highlights: [
      "Pilgrimage church",
      "August 15th festival",
      "Monte Fontainhas views",
      "Religious processions",
    ],
    heroImage: "/images/towns/nossa-senhora-do-monte-hero.jpg",
    gallery: [
      "/images/towns/nossa-senhora-do-monte-1.jpg",
      "/images/towns/nossa-senhora-do-monte-2.jpg",
      "/images/towns/nossa-senhora-do-monte-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "5",
    slug: "cachaco",
    name: "Cachaço",
    description:
      "In Brava's remote highlands, generations of families have perfected the art of cheese-making, creating flavors that carry the essence of our mountain pastures",
    latitude: 14.83694,
    longitude: -24.69694,
    population: "228 (2010 census)",
    elevation: "592m",
    founded: "19th century",
    highlights: [
      "Queijo do Cachaço",
      "Fogo island views",
      "Traditional cheese making",
      "Mountain isolation",
    ],
    heroImage: "/images/towns/cachaco-hero.jpg",
    gallery: [
      "/images/towns/cachaco-1.jpg",
      "/images/towns/cachaco-2.jpg",
      "/images/towns/cachaco-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "6",
    slug: "cova-joana",
    name: "Cova Joana",
    description:
      "Cradled within an ancient crater's embrace, this peaceful valley village showcases the harmony possible between volcanic power and human cultivation",
    latitude: 14.86306,
    longitude: -24.71306,
    population: "183 (2010 census)",
    elevation: "400m",
    founded: "19th century",
    highlights: [
      "Volcanic crater setting",
      "Colonial sobrados",
      "Hibiscus hedges",
      "Mountain tranquility",
    ],
    heroImage: "/images/towns/cova-joana-hero.jpg",
    gallery: [
      "/images/towns/cova-joana-1.jpg",
      "/images/towns/cova-joana-2.jpg",
      "/images/towns/cova-joana-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
];

// Legacy synchronous functions for towns (backward compatibility)
export function getMockTowns(): Town[] {
  console.log("Legacy: Using mock fallback for towns");
  return MOCK_TOWNS;
}

export function getMockTownBySlug(slug: string): Town | undefined {
  console.log(`Legacy: Using mock fallback for town slug: ${slug}`);
  return MOCK_TOWNS.find((town) => town.slug === slug);
}
