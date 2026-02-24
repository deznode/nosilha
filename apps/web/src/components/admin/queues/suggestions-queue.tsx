"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { QueueItem } from "./queue-item";
import { SubmissionStatus } from "@/types/story";
import { Button } from "@/components/catalyst-ui/button";
import {
  useAdminSuggestions,
  useUpdateSuggestionStatus,
} from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import { Pagination, fromAdminQueueResponse } from "@/components/ui/pagination";

export function SuggestionsQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "ALL">(
    "ALL"
  );
  const [page, setPage] = useState(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset page on filter change
  useEffect(() => setPage(0), [filterStatus]);

  const suggestionsQuery = useAdminSuggestions(
    page,
    20,
    filterStatus === "ALL" ? undefined : filterStatus
  );
  const updateSuggestion = useUpdateSuggestionStatus();
  const toast = useToast();

  const suggestions = suggestionsQuery.data?.items ?? [];
  const isLoading = suggestionsQuery.isLoading;

  const handleStatusChange = (id: string, status: SubmissionStatus) => {
    const action = status === SubmissionStatus.APPROVED ? "APPROVE" : "REJECT";
    const label =
      status === SubmissionStatus.APPROVED ? "approved" : "rejected";
    updateSuggestion.mutate(
      { id, action },
      {
        onSuccess: () => {
          toast.success(`Suggestion ${label} successfully`).show();
        },
        onError: () => {
          toast
            .error(`Failed to ${label} suggestion. Please try again.`)
            .show();
        },
      }
    );
  };

  const filteredSuggestions = suggestions.filter((s) => {
    const matchesSearch =
      s.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const paginationData = fromAdminQueueResponse(suggestionsQuery.data);

  if (isLoading) {
    return (
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-surface-alt mb-2 h-4 w-1/3 rounded" />
              <div className="bg-surface-alt h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as SubmissionStatus | "ALL")
            }
            className="border-hairline bg-surface text-muted hover:bg-surface-alt rounded-md border px-3 py-1.5 text-sm font-medium"
          >
            <option value="ALL">All Status</option>
            <option value={SubmissionStatus.PENDING}>Pending</option>
            <option value={SubmissionStatus.APPROVED}>Approved</option>
            <option value={SubmissionStatus.REJECTED}>Rejected</option>
          </select>
          <Button plain>
            <Filter data-slot="icon" />
            Newest First
          </Button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suggestions..."
            className="border-hairline bg-surface placeholder-muted focus:border-ocean-blue focus:ring-ocean-blue block w-full rounded-md border py-2 pr-3 pl-10 leading-5 focus:ring-1 focus:outline-none sm:text-sm"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-muted h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        {filteredSuggestions.length === 0 ? (
          <div className="text-muted p-8 text-center">No suggestions found</div>
        ) : (
          <ul className="divide-hairline divide-y">
            {filteredSuggestions.map((suggestion) => (
              <QueueItem
                key={suggestion.id}
                type="suggestion"
                target={suggestion.target}
                description={suggestion.description}
                status={suggestion.status}
                submittedBy={suggestion.submittedBy}
                timestamp={suggestion.timestamp}
                onApprove={() =>
                  handleStatusChange(suggestion.id, SubmissionStatus.APPROVED)
                }
                onReject={() =>
                  handleStatusChange(suggestion.id, SubmissionStatus.REJECTED)
                }
              />
            ))}
          </ul>
        )}
      </div>

      {paginationData && (
        <Pagination
          {...paginationData}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
}
