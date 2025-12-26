"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-factory";
import type { ProfileUpdateRequest, ProfileDto } from "@/types/profile";

/**
 * TanStack Query mutation hook for updating user profile settings.
 * Handles profile updates with cache invalidation for consistency.
 *
 * **Authentication Required**: Uses JWT token from Supabase session.
 *
 * **Usage**:
 * ```tsx
 * const { mutate: updateProfile, isPending, isError, error } = useUpdateProfile();
 *
 * const handleSave = (data: ProfileUpdateRequest) => {
 *   updateProfile(data, {
 *     onSuccess: () => toast.success('Profile updated!'),
 *     onError: (error) => toast.error(error.message),
 *   });
 * };
 * ```
 *
 * @returns Mutation result with mutate function and loading/error states
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation<ProfileDto, Error, ProfileUpdateRequest>({
    mutationFn: (request: ProfileUpdateRequest) =>
      apiClient.updateProfile(request),
    onSuccess: (updatedProfile: ProfileDto) => {
      // Update the cached profile data
      queryClient.setQueryData(["user", "profile"], updatedProfile);
      // Also invalidate to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
