import { z } from "zod";

/**
 * Zod schema for validating directory entry data at runtime.
 * Provides type-safe parsing and validation for API responses and form data.
 */

// Base schema with common properties
const baseDirectoryEntrySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  town: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Contact information (common across all entry types)
  phoneNumber: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
});

// Category-specific detail schemas
const restaurantDetailsSchema = z.object({
  phoneNumber: z.string(),
  openingHours: z.string(),
  cuisine: z.array(z.string()),
});

const hotelDetailsSchema = z.object({
  phoneNumber: z.string().optional(),
  amenities: z.array(z.string()),
});

// Discriminated union schema for all directory entry types
export const directoryEntrySchema = z.discriminatedUnion("category", [
  baseDirectoryEntrySchema.extend({
    category: z.literal("Restaurant"),
    details: restaurantDetailsSchema,
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Hotel"),
    details: hotelDetailsSchema,
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Beach"),
    details: z.null(),
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Heritage"),
    details: z.null(),
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Nature"),
    details: z.null(),
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Town"),
    details: z.null(),
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Viewpoint"),
    details: z.null(),
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Trail"),
    details: z.null(),
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Church"),
    details: z.null(),
  }),
  baseDirectoryEntrySchema.extend({
    category: z.literal("Port"),
    details: z.null(),
  }),
]);

// Array schema for validating lists of directory entries
export const directoryEntriesSchema = z.array(directoryEntrySchema);

// Export inferred types
export type DirectoryEntryInput = z.infer<typeof directoryEntrySchema>;
export type RestaurantDetailsInput = z.infer<typeof restaurantDetailsSchema>;
export type HotelDetailsInput = z.infer<typeof hotelDetailsSchema>;
