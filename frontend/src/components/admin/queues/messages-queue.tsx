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
  const [filterStatus, setFilterStatus] = useState<ContactMessageStatus | "ALL">(
    "ALL"
  );

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
      <div className="overflow-hidden border border-slate-200 bg-white shadow sm:rounded-md dark:border-slate-700 dark:bg-slate-800">
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
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
        return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
      case "REPLIED":
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
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <option value="ALL">All Messages</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
          </select>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="block w-full rounded-md border border-slate-200 bg-white py-2 pr-3 pl-10 leading-5 placeholder-slate-400 focus:border-[var(--color-ocean-blue)] focus:ring-1 focus:ring-[var(--color-ocean-blue)] focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:placeholder-slate-500"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="overflow-hidden border border-slate-200 bg-white shadow sm:rounded-md dark:border-slate-700 dark:bg-slate-800">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No messages found
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredMessages.map((message) => (
              <li
                key={message.id}
                className={`p-6 transition-colors ${
                  message.status === "UNREAD"
                    ? "bg-[var(--color-valley-green)]/5"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 rounded-xl p-3 ${
                        message.status === "UNREAD"
                          ? "bg-[var(--color-valley-green)] text-white shadow-lg"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-700"
                      }`}
                    >
                      <Mail size={18} />
                    </div>
                    <div className="max-w-2xl">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white">
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
                      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {message.message}
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 dark:bg-slate-600">
                            {message.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {message.name}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                          {message.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} /> {message.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {message.status === "UNREAD" && (
                      <button
                        onClick={() => onStatusChange?.(message.id, "READ")}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold shadow-sm transition-all hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
                      >
                        <Check size={12} /> Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => onStatusChange?.(message.id, "REPLIED")}
                      className="flex items-center gap-1 rounded-lg bg-[var(--color-ocean-blue)] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-blue-800"
                    >
                      <Mail size={12} /> Reply
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
