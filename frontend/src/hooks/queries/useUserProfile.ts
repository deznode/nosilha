import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { userProfileSchema, type UserProfile } from "@/schemas/userProfileSchema";

/**
 * TanStack Query hook for fetching user profile data.
 * Provides automatic caching, refetching, and loading states.
 *
 * @param userId - The user's unique identifier
 * @param options - Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useUserProfile(
  userId: string | undefined,
  options?: Omit<UseQueryOptions<UserProfile, Error>, "queryKey" | "queryFn">
) {
  return useQuery<UserProfile, Error>({
    queryKey: ["user", "profile", userId],
    queryFn: async () => {
      // TODO: Replace with actual API call when user profile endpoint is available
      // For now, this is a placeholder implementation
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();

      // Runtime validation with Zod
      const validated = userProfileSchema.safeParse(data);

      if (!validated.success) {
        console.error(
          "User profile validation failed:",
          validated.error.format()
        );
        throw new Error("Invalid user profile data");
      }

      return validated.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!userId, // Only run query if userId is provided
    ...options,
  });
}
