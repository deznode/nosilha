"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Check, Trash2, Clock } from "lucide-react";
import type { ContactMessageStatus } from "@/types/admin";
import { Button } from "@/components/catalyst-ui/button";
import {
  useAdminMessages,
  useUpdateMessageStatus,
  useDeleteMessage,
} from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import { Pagination, fromAdminQueueResponse } from "@/components/ui/pagination";

export function MessagesQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    ContactMessageStatus | "ALL"
  >("ALL");
  const [page, setPage] = useState(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset page on filter change
  useEffect(() => setPage(0), [filterStatus]);

  const messagesQuery = useAdminMessages(
    page,
    20,
    filterStatus === "ALL" ? undefined : filterStatus
  );
  const updateMessage = useUpdateMessageStatus();
  const deleteMessageMutation = useDeleteMessage();
  const toast = useToast();

  const messages = messagesQuery.data?.items ?? [];
  const isLoading = messagesQuery.isLoading;

  const handleStatusChange = (id: string, status: ContactMessageStatus) => {
    const label = status === "READ" ? "marked as read" : "archived";
    updateMessage.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(`Message ${label} successfully`).show();
        },
        onError: () => {
          toast.error(`Failed to update message. Please try again.`).show();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMessageMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Message deleted successfully").show();
      },
      onError: () => {
        toast.error("Failed to delete message. Please try again.").show();
      },
    });
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const paginationData = fromAdminQueueResponse(messagesQuery.data);

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

  const getStatusBadge = (status: ContactMessageStatus) => {
    switch (status) {
      case "UNREAD":
        return "bg-valley-green/10 text-valley-green";
      case "READ":
        return "bg-surface-alt text-muted";
      case "ARCHIVED":
        return "bg-ocean-blue/10 text-ocean-blue";
    }
  };

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as ContactMessageStatus | "ALL")
            }
            className="border-hairline bg-surface text-muted hover:bg-surface-alt rounded-md border px-3 py-1.5 text-sm font-medium"
          >
            <option value="ALL">All Messages</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="border-hairline bg-surface placeholder-muted focus:border-ocean-blue focus:ring-ocean-blue block w-full rounded-md border py-2 pr-3 pl-10 leading-5 focus:ring-1 focus:outline-none sm:text-sm"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-muted h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        {filteredMessages.length === 0 ? (
          <div className="text-muted p-8 text-center">
            {searchQuery && messages.length > 0
              ? "No results match your search"
              : "No messages found"}
          </div>
        ) : (
          <ul className="divide-hairline divide-y">
            {filteredMessages.map((message) => (
              <li
                key={message.id}
                className={`p-6 transition-colors ${
                  message.status === "UNREAD"
                    ? "bg-valley-green/5"
                    : "hover:bg-surface-alt"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 rounded-xl p-3 ${
                        message.status === "UNREAD"
                          ? "bg-valley-green shadow-elevated text-white"
                          : "bg-surface-alt text-muted"
                      }`}
                    >
                      <Mail size={18} />
                    </div>
                    <div className="max-w-2xl">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-body font-bold">
                          {message.subject}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                            message.status
                          )}`}
                        >
                          {message.status}
                        </span>
                      </div>
                      <p className="text-body mt-2 text-sm leading-relaxed">
                        {message.message}
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-surface-alt text-muted flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                            {message.name.charAt(0)}
                          </div>
                          <span className="text-body text-xs font-bold">
                            {message.name}
                          </span>
                        </div>
                        <span className="text-muted text-xs font-medium">
                          {message.email}
                        </span>
                        <span className="text-muted flex items-center gap-1 text-xs">
                          <Clock size={12} /> {message.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {message.status === "UNREAD" && (
                      <Button
                        outline
                        onClick={() => handleStatusChange(message.id, "READ")}
                      >
                        <Check data-slot="icon" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      color="blue"
                      onClick={() => handleStatusChange(message.id, "ARCHIVED")}
                    >
                      <Mail data-slot="icon" />
                      Archive
                    </Button>
                    <Button
                      outline
                      onClick={() => handleDelete(message.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 data-slot="icon" />
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {paginationData && !searchQuery && (
        <Pagination
          {...paginationData}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
}
