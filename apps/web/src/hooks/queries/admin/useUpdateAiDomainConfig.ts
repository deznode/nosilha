/**
 * AI Domain Config Mutation Hook
 *
 * TanStack Query mutation hook for toggling domain-level AI feature flags.
 * Uses optimistic updates for immediate toggle feedback with error rollback.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAiDomainConfig } from "@/lib/api";
import { adminKeys } from "./keys";
import type {
  AiDomainConfig,
  AiHealthResponse,
  UpdateDomainConfigRequest,
} from "@/types/ai";

interface UpdateDomainConfigVars {
  domain: string;
  request: UpdateDomainConfigRequest;
}

/**
 * Hook for toggling a domain's AI feature config.
 *
 * Optimistically updates the health cache on mutate,
 * rolls back on error, and invalidates on success for server reconciliation.
 */
export function useUpdateAiDomainConfig() {
  const queryClient = useQueryClient();
  const healthKey = adminKeys.aiDashboard.health();

  return useMutation<
    AiDomainConfig,
    Error,
    UpdateDomainConfigVars,
    { prev: AiHealthResponse | undefined }
  >({
    mutationFn: ({ domain, request }) => updateAiDomainConfig(domain, request),
    onMutate: async ({ domain, request }) => {
      await queryClient.cancelQueries({ queryKey: healthKey });
      const prev = queryClient.getQueryData<AiHealthResponse>(healthKey);
      queryClient.setQueryData<AiHealthResponse>(healthKey, (old) => {
        if (!old) return old;
        if (domain === "global") {
          return { ...old, enabled: request.enabled };
        }
        return {
          ...old,
          domains: old.domains.map((d) =>
            d.domain === domain ? { ...d, enabled: request.enabled } : d
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData<AiHealthResponse>(healthKey, context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: healthKey });
    },
  });
}
