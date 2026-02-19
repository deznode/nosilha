/**
 * AI Domain Config Mutation Hook
 *
 * TanStack Query mutation hook for toggling domain-level AI feature flags.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAiDomainConfig } from "@/lib/api";
import { adminKeys } from "./keys";
import type {
  AiDomainConfig,
  UpdateDomainConfigRequest,
} from "@/types/ai";

interface UpdateDomainConfigVars {
  domain: string;
  request: UpdateDomainConfigRequest;
}

/**
 * Hook for toggling a domain's AI feature config.
 *
 * Invalidates AI dashboard health cache on success.
 */
export function useUpdateAiDomainConfig() {
  const queryClient = useQueryClient();

  return useMutation<AiDomainConfig, Error, UpdateDomainConfigVars>({
    mutationFn: ({ domain, request }) =>
      updateAiDomainConfig(domain, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.aiDashboard.health(),
      });
    },
  });
}
