import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { getApiClient } from "@/lib/api-factory";
import type {
  PolishContentRequest,
  PolishContentResponse,
  TranslateContentRequest,
  TranslateContentResponse,
  GeneratePromptsRequest,
  GeneratePromptsResponse,
  GenerateDirectoryContentRequest,
  DirectoryContentResponse,
  AiAvailableResponse,
} from "@/types/ai";

/**
 * TanStack Query hook for checking text AI availability.
 * Only fetches when user is authenticated.
 */
export function useAiAvailable() {
  const { session } = useAuth();
  const apiClient = getApiClient();

  return useQuery<AiAvailableResponse, Error>({
    queryKey: ["ai", "available"],
    queryFn: async () => apiClient.checkAiAvailable(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!session,
  });
}

/**
 * TanStack Query mutation hook for polishing content via AI.
 * Returns polished text on success.
 */
export function usePolishContent() {
  const apiClient = getApiClient();

  return useMutation<PolishContentResponse, Error, PolishContentRequest>({
    mutationFn: async (request) => apiClient.polishContent(request),
  });
}

/**
 * TanStack Query mutation hook for translating content via AI.
 * Returns translated text on success.
 */
export function useTranslateContent() {
  const apiClient = getApiClient();

  return useMutation<TranslateContentResponse, Error, TranslateContentRequest>({
    mutationFn: async (request) => apiClient.translateContent(request),
  });
}

/**
 * TanStack Query mutation hook for generating story writing prompts.
 * Returns a list of prompts on success.
 */
export function useGeneratePrompts() {
  const apiClient = getApiClient();

  return useMutation<GeneratePromptsResponse, Error, GeneratePromptsRequest>({
    mutationFn: async (request) => apiClient.generatePrompts(request),
  });
}

/**
 * TanStack Query mutation hook for generating directory entry content.
 * Returns AI-generated description and tags on success.
 */
export function useGenerateDirectoryContent() {
  const apiClient = getApiClient();

  return useMutation<
    DirectoryContentResponse,
    Error,
    GenerateDirectoryContentRequest
  >({
    mutationFn: async (request) => apiClient.generateDirectoryContent(request),
  });
}
