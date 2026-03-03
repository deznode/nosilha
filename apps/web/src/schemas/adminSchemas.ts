/**
 * Admin Zod Schemas
 *
 * Runtime validation schemas for admin API responses.
 * Used with TanStack Query hooks for type-safe data fetching.
 *
 * @see docs/STATE_MANAGEMENT.md for Zod integration patterns
 */

import { z } from "zod";

// ================================
// ENUMS & PRIMITIVES
// ================================

export const submissionStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const contactMessageStatusSchema = z.enum([
  "UNREAD",
  "READ",
  "ARCHIVED",
]);

export const mediaStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "PENDING_REVIEW",
  "FLAGGED",
  "AVAILABLE",
  "DELETED",
]);

// ================================
// ADMIN STATS
// ================================

export const weeklyActivityDataSchema = z.object({
  day: z.string(),
  suggestions: z.number(),
  stories: z.number(),
});

export const townCoverageDataSchema = z.object({
  name: z.string(),
  value: z.number(),
  fill: z.string(),
});

export const adminStatsSchema = z.object({
  newSuggestions: z.number(),
  storySubmissions: z.number(),
  contactInquiries: z.number(),
  directorySubmissions: z.number(),
  mediaPending: z.number(),
  activeUsers: z.number(),
  locationsCovered: z.number(),
  weeklyActivity: z.array(weeklyActivityDataSchema),
  coverageByTown: z.array(townCoverageDataSchema),
});

// ================================
// QUEUE ITEMS
// ================================

export const suggestionSchema = z.object({
  id: z.string(),
  target: z.string(),
  targetId: z.string().optional(),
  targetType: z.enum(["directory", "article", "story"]).optional(),
  description: z.string(),
  status: submissionStatusSchema,
  submittedBy: z.string(),
  submittedByEmail: z.string().optional(),
  timestamp: z.string(),
  adminNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
});

export const contributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["Contributor", "Moderator", "Admin"]),
  points: z.number(),
  avatar: z.string().optional(),
});

export const contactMessageSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  status: contactMessageStatusSchema,
  createdAt: z.string(),
});

export const directorySubmissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["Restaurant", "Heritage", "Nature", "Culture"]),
  town: z.string(),
  customTown: z.string().optional(),
  description: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string().optional(),
  priceLevel: z.enum(["$", "$$", "$$$"]).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: submissionStatusSchema,
  submittedBy: z.string(),
  submittedByEmail: z.string().optional(),
  submittedAt: z.string(),
  adminNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
});

export const adminMediaListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  contentType: z.string(),
  thumbnailUrl: z.string().optional(),
  status: mediaStatusSchema,
  severity: z.number(),
  uploadedBy: z.string().optional(),
  createdAt: z.string(),
});

// ================================
// GENERIC RESPONSE WRAPPER
// ================================

/**
 * Schema factory for AdminQueueResponse<T>
 * @param itemSchema Zod schema for the item type
 */
export const adminQueueResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasMore: z.boolean(),
  });

// ================================
// TYPE EXPORTS
// ================================

export type AdminStatsValidated = z.infer<typeof adminStatsSchema>;
export type SuggestionValidated = z.infer<typeof suggestionSchema>;
export type ContributorValidated = z.infer<typeof contributorSchema>;
export type ContactMessageValidated = z.infer<typeof contactMessageSchema>;
export type DirectorySubmissionValidated = z.infer<
  typeof directorySubmissionSchema
>;
export type AdminMediaListItemValidated = z.infer<
  typeof adminMediaListItemSchema
>;
