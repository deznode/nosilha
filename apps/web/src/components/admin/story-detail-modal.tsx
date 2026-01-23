"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  X,
  MapPin,
  Calendar,
  User,
  Check,
  XCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import type { StorySubmission } from "@/types/story";
import { StoryType, SubmissionStatus } from "@/types/story";
import { StoryMarkdown } from "../stories/story-markdown";

interface StoryDetailModalProps {
  story: StorySubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// Config keyed by backend enum names (QUICK, FULL, GUIDED)
const STORY_TYPE_CONFIG: Record<
  string,
  { icon: typeof BookOpen; label: string; color: string }
> = {
  QUICK: {
    icon: Clock,
    label: "Quick Memory",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  FULL: {
    icon: BookOpen,
    label: "Full Story",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  },
  GUIDED: {
    icon: BookOpen,
    label: "Guided Template",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  // Also support frontend enum values for backwards compatibility
  [StoryType.QUICK]: {
    icon: Clock,
    label: "Quick Memory",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  [StoryType.FULL]: {
    icon: BookOpen,
    label: "Full Story",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  },
  [StoryType.GUIDED]: {
    icon: BookOpen,
    label: "Guided Template",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

// Default config for unknown types
const DEFAULT_TYPE_CONFIG = {
  icon: BookOpen,
  label: "Story",
  color: "bg-surface-alt text-body",
};

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; color: string }
> = {
  [SubmissionStatus.DRAFT]: {
    label: "Draft",
    color:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  },
  [SubmissionStatus.PENDING]: {
    label: "Pending Review",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  [SubmissionStatus.APPROVED]: {
    label: "Approved",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  [SubmissionStatus.REJECTED]: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  [SubmissionStatus.FLAGGED]: {
    label: "Flagged",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  [SubmissionStatus.PUBLISHED]: {
    label: "Published",
    color:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  [SubmissionStatus.ARCHIVED]: {
    label: "Archived",
    color:
      "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
  },
};

export function StoryDetailModal({
  story,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: StoryDetailModalProps) {
  if (!story) return null;

  const typeConfig = STORY_TYPE_CONFIG[story.type] || DEFAULT_TYPE_CONFIG;
  const statusConfig = STATUS_CONFIG[story.status];
  const TypeIcon = typeConfig.icon;
  const isPending = story.status === SubmissionStatus.PENDING;

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="bg-surface relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-start justify-between border-b p-4">
              <div className="flex-1 pr-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.color}`}
                  >
                    <TypeIcon size={12} />
                    {typeConfig.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
                <DialogTitle className="text-body font-serif text-xl font-bold">
                  {story.title}
                </DialogTitle>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-surface-alt rounded-full p-2 transition-colors"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {/* Metadata */}
              <div className="text-muted mb-6 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <User size={14} />
                  <span>{story.author}</span>
                </div>
                {story.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>{story.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{story.submittedAt}</span>
                </div>
              </div>

              {/* Story Content */}
              <StoryMarkdown content={story.content} className="prose-slate" />

              {/* Admin Notes (if any) */}
              {story.adminNotes && (
                <div className="bg-canvas mt-6 rounded-lg p-4">
                  <h4 className="text-body mb-2 text-sm font-medium">
                    Admin Notes
                  </h4>
                  <p className="text-muted text-sm">{story.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-hairline bg-canvas flex items-center justify-end gap-3 border-t p-4">
              {isPending ? (
                <>
                  <button
                    onClick={() => {
                      onReject(story.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      onApprove(story.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  >
                    <Check size={16} />
                    Approve & Publish
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="bg-surface-alt text-body hover:bg-surface-alt/80 rounded-lg px-4 py-2 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
