import { z } from "zod";

/**
 * Zod schemas for user profile data validation.
 * Validates user data from authentication and profile API responses.
 */

// User profile schema
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  role: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Minimal user schema for auth context
export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  role: z.string().optional(),
});

// User profile update schema
export const userProfileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name is too long")
    .optional(),
  avatarUrl: z.string().url("Please enter a valid URL").nullable().optional(),
});

// Export inferred types
export type UserProfile = z.infer<typeof userProfileSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
