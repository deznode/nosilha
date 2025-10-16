import { z } from "zod";

/**
 * Zod schemas for search and filter parameters.
 * Used for validating URL search params and filter form inputs.
 */

// Category enum matching backend
const categoryEnum = z.enum(["Restaurant", "Hotel", "Beach", "Landmark", "all"]);

// Filter parameters schema
export const filterSchema = z.object({
  searchQuery: z.string().optional(),
  category: categoryEnum.optional(),
  town: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  hasImage: z.boolean().optional(),
});

// URL search params schema (all values are strings from URL)
export const urlSearchParamsSchema = z.object({
  q: z.string().optional(), // search query
  category: z.string().optional(),
  town: z.string().optional(),
  minRating: z.string().optional(),
  hasImage: z.string().optional(),
});

// Transform URL params to filter params
export function parseUrlSearchParams(
  params: URLSearchParams
): z.infer<typeof filterSchema> {
  const urlParams = urlSearchParamsSchema.parse({
    q: params.get("q") || undefined,
    category: params.get("category") || undefined,
    town: params.get("town") || undefined,
    minRating: params.get("minRating") || undefined,
    hasImage: params.get("hasImage") || undefined,
  });

  return filterSchema.parse({
    searchQuery: urlParams.q,
    category: urlParams.category as z.infer<typeof categoryEnum> | undefined,
    town: urlParams.town,
    minRating: urlParams.minRating ? parseFloat(urlParams.minRating) : undefined,
    hasImage: urlParams.hasImage === "true",
  });
}

// Export inferred types
export type FilterInput = z.infer<typeof filterSchema>;
export type CategoryValue = z.infer<typeof categoryEnum>;
