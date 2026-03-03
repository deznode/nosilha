import { z } from "zod";

/**
 * Zod schema for the gallery media edit form.
 * Validates title (required), description, category, and attribution fields.
 */
export const galleryEditSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title cannot exceed 255 characters"),
  description: z
    .string()
    .max(2048, "Description cannot exceed 2048 characters")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .max(100, "Category cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  attribution: z
    .string()
    .max(255, "Attribution cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  showInGallery: z.boolean().optional(),
});

export type GalleryEditInput = z.infer<typeof galleryEditSchema>;
