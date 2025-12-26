"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Utensils,
  Landmark,
  Mountain,
  Music,
} from "lucide-react";
import Image from "next/image";
import type { DirectorySubmission } from "@/types/admin";
import { SubmissionStatus } from "@/types/story";

interface DirectoryQueueProps {
  submissions: DirectorySubmission[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: SubmissionStatus) => void;
  onViewFull?: (submission: DirectorySubmission) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Restaurant: <Utensils size={18} />,
  Landmark: <Landmark size={18} />,
  Nature: <Mountain size={18} />,
  Culture: <Music size={18} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Restaurant:
    "bg-[var(--color-valley-green)]/10 text-[var(--color-valley-green)]",
  Landmark: "bg-[var(--color-ocean-blue)]/10 text-[var(--color-ocean-blue)]",
  Nature: "bg-[var(--color-valley-green)]/10 text-[var(--color-valley-green)]",
  Culture:
    "bg-[var(--color-bougainvillea)]/10 text-[var(--color-bougainvillea)]",
};

export function DirectoryQueue({
  submissions,
  isLoading,
  onStatusChange,
  onViewFull,
}: DirectoryQueueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "ALL">(
    "ALL"
  );

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.town.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;
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

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case SubmissionStatus.APPROVED:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case SubmissionStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
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
              setFilterStatus(e.target.value as SubmissionStatus | "ALL")
            }
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <option value="ALL">All Status</option>
            <option value={SubmissionStatus.PENDING}>Pending</option>
            <option value={SubmissionStatus.APPROVED}>Approved</option>
            <option value={SubmissionStatus.REJECTED}>Rejected</option>
          </select>
          <button className="flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Filter className="mr-2 h-4 w-4" /> Newest First
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search submissions..."
            className="block w-full rounded-md border border-slate-200 bg-white py-2 pr-3 pl-10 leading-5 placeholder-slate-400 focus:border-[var(--color-ocean-blue)] focus:ring-1 focus:ring-[var(--color-ocean-blue)] focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:placeholder-slate-500"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="overflow-hidden border border-slate-200 bg-white shadow sm:rounded-md dark:border-slate-700 dark:bg-slate-800">
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No directory submissions found
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredSubmissions.map((submission) => (
              <li
                key={submission.id}
                className="p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 rounded-xl p-3 ${CATEGORY_COLORS[submission.category]}`}
                    >
                      {CATEGORY_ICONS[submission.category]}
                    </div>
                    <div className="flex-grow">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {submission.name}
                        </h4>
                        <span
                          className={`rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400`}
                        >
                          {submission.category}
                        </span>
                        {submission.priceLevel && (
                          <span className="rounded bg-[var(--color-valley-green)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-valley-green)]">
                            {submission.priceLevel}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {submission.description}
                      </p>
                      {submission.imageUrl && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-700">
                            <Image
                              src={submission.imageUrl}
                              alt={submission.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Visual Asset Attached
                          </span>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {submission.town}
                        </span>
                        <span>•</span>
                        <span>Submitted by {submission.submittedBy}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {submission.submittedAt}
                        </span>
                      </div>
                      {submission.tags && submission.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Tag size={12} className="text-slate-400" />
                          {submission.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold ${getStatusBadge(
                        submission.status
                      )}`}
                    >
                      {submission.status}
                    </span>
                    <div className="flex gap-2">
                      {onViewFull && (
                        <button
                          onClick={() => onViewFull(submission)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold transition-all hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                          <ExternalLink size={12} /> View Full
                        </button>
                      )}
                      {submission.status === SubmissionStatus.PENDING && (
                        <>
                          <button
                            onClick={() =>
                              onStatusChange?.(
                                submission.id,
                                SubmissionStatus.APPROVED
                              )
                            }
                            className="rounded-lg bg-[var(--color-valley-green)]/10 p-2 text-[var(--color-valley-green)] transition-all hover:bg-[var(--color-valley-green)] hover:text-white"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() =>
                              onStatusChange?.(
                                submission.id,
                                SubmissionStatus.REJECTED
                              )
                            }
                            className="rounded-lg bg-red-100/50 p-2 text-red-500 transition-all hover:bg-red-500 hover:text-white dark:bg-red-900/20"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
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
