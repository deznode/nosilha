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
 * Checks text AI availability. Only fetches when user is authenticated.
 */
export function useAiAvailable() {
  const { session } = useAuth();
  const apiClient = getApiClient();

  return useQuery<AiAvailableResponse, Error>({
    queryKey: ["ai", "available"],
    queryFn: () => apiClient.checkAiAvailable(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!session,
  });
}

/** Polishes content text via AI. */
export function usePolishContent() {
  const apiClient = getApiClient();

  return useMutation<PolishContentResponse, Error, PolishContentRequest>({
    mutationFn: (request) => apiClient.polishContent(request),
  });
}

/** Translates content to a target language via AI. */
export function useTranslateContent() {
  const apiClient = getApiClient();

  return useMutation<TranslateContentResponse, Error, TranslateContentRequest>({
    mutationFn: (request) => apiClient.translateContent(request),
  });
}

/** Generates story writing prompts via AI. */
export function useGeneratePrompts() {
  const apiClient = getApiClient();

  return useMutation<GeneratePromptsResponse, Error, GeneratePromptsRequest>({
    mutationFn: (request) => apiClient.generatePrompts(request),
  });
}

/** Generates AI description and tags for a directory entry. */
export function useGenerateDirectoryContent() {
  const apiClient = getApiClient();

  return useMutation<
    DirectoryContentResponse,
    Error,
    GenerateDirectoryContentRequest
  >({
    mutationFn: (request) => apiClient.generateDirectoryContent(request),
  });
}
