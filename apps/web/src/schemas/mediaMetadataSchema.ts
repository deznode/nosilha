import { z } from "zod";

/**
 * Zod schemas for media metadata validation.
 * Validates image/media metadata from API responses.
 */

// Media metadata schema
export const mediaMetadataSchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().uuid().optional(),
  mediaUrl: z.string().url(),
  fileName: z.string().optional(),
  originalName: z.string().optional(),
  contentType: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// AI metadata schema (placeholder for future integration)
export const aiMetadataSchema = z.object({
  labels: z.array(z.string()).optional(),
  altText: z.string().optional(),
  description: z.string().optional(),
  processedAt: z.string().datetime().optional(),
});

// Media upload response schema
export const mediaUploadResponseSchema = z.object({
  mediaUrl: z.string().url(),
  mediaId: z.string().uuid().optional(),
  aiMetadata: aiMetadataSchema.optional(),
});

// Array schema for validating lists of media metadata
export const mediaMetadataListSchema = z.array(mediaMetadataSchema);

// Export inferred types
export type MediaMetadata = z.infer<typeof mediaMetadataSchema>;
export type AIMetadata = z.infer<typeof aiMetadataSchema>;
export type MediaUploadResponse = z.infer<typeof mediaUploadResponseSchema>;
