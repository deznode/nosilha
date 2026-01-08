"use client";

import { useState } from "react";
import { Search, Mail, Check, Trash2, Clock } from "lucide-react";
import type { ContactMessage, ContactMessageStatus } from "@/types/admin";

interface MessagesQueueProps {
  messages: ContactMessage[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: ContactMessageStatus) => void;
  onDelete?: (id: string) => void;
}

export function MessagesQueue({
  messages,
  isLoading,
  onStatusChange,
  onDelete,
}: MessagesQueueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    ContactMessageStatus | "ALL"
  >("ALL");

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
        return "bg-[var(--color-valley-green)]/10 text-[var(--color-valley-green)]";
      case "READ":
        return "bg-surface-alt text-muted";
      case "ARCHIVED":
        return "bg-[var(--color-ocean-blue)]/10 text-[var(--color-ocean-blue)]";
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
            className="border-hairline bg-surface placeholder-muted block w-full rounded-md border py-2 pr-3 pl-10 leading-5 focus:border-[var(--color-ocean-blue)] focus:ring-1 focus:ring-[var(--color-ocean-blue)] focus:outline-none sm:text-sm"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-muted h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        {filteredMessages.length === 0 ? (
          <div className="text-muted p-8 text-center">No messages found</div>
        ) : (
          <ul className="divide-hairline divide-y">
            {filteredMessages.map((message) => (
              <li
                key={message.id}
                className={`p-6 transition-colors ${
                  message.status === "UNREAD"
                    ? "bg-[var(--color-valley-green)]/5"
                    : "hover:bg-surface-alt"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 rounded-xl p-3 ${
                        message.status === "UNREAD"
                          ? "bg-[var(--color-valley-green)] text-white shadow-lg"
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
                      <button
                        onClick={() => onStatusChange?.(message.id, "READ")}
                        className="border-hairline bg-surface hover:bg-surface-alt flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-bold shadow-sm transition-all"
                      >
                        <Check size={12} /> Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => onStatusChange?.(message.id, "ARCHIVED")}
                      className="flex items-center gap-1 rounded-lg bg-[var(--color-ocean-blue)] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-blue-800"
                    >
                      <Mail size={12} /> Archive
                    </button>
                    <button
                      onClick={() => onDelete?.(message.id)}
                      className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
