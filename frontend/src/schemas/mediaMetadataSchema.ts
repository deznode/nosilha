import { z } from "zod";

/**
 * Zod schemas for media metadata validation.
 * Validates image/media metadata from API responses and Cloud Vision AI.
 */

// Media metadata schema
export const mediaMetadataSchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().uuid(),
  mediaUrl: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  displayOrder: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Cloud Vision API label schema
export const visionLabelSchema = z.object({
  description: z.string(),
  score: z.number().min(0).max(1),
  topicality: z.number().min(0).max(1).optional(),
});

// Vision API results schema
export const visionApiResultsSchema = z.object({
  labels: z.array(visionLabelSchema).optional(),
  dominantColors: z.array(z.string()).optional(),
  landmarks: z.array(z.string()).optional(),
  text: z.string().optional(),
  safeSearchAnnotation: z
    .object({
      adult: z.string(),
      violence: z.string(),
      racy: z.string(),
    })
    .optional(),
});

// Media upload response schema
export const mediaUploadResponseSchema = z.object({
  mediaUrl: z.string().url(),
  mediaId: z.string().uuid().optional(),
  visionApiResults: visionApiResultsSchema.optional(),
});

// Array schema for validating lists of media metadata
export const mediaMetadataListSchema = z.array(mediaMetadataSchema);

// Export inferred types
export type MediaMetadata = z.infer<typeof mediaMetadataSchema>;
export type VisionLabel = z.infer<typeof visionLabelSchema>;
export type VisionApiResults = z.infer<typeof visionApiResultsSchema>;
export type MediaUploadResponse = z.infer<typeof mediaUploadResponseSchema>;
