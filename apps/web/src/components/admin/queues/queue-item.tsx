"use client";

import {
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Flag,
  Github,
  Code,
  Loader2,
} from "lucide-react";
import { SubmissionStatus, StoryType } from "@/types/story";
import { Badge } from "@/components/catalyst-ui/badge";

interface BaseQueueItemProps {
  status: SubmissionStatus;
  submittedBy: string;
  timestamp: string;
  onApprove?: () => void;
  onReject?: () => void;
  onFlag?: () => void;
}

interface SuggestionQueueItemProps extends BaseQueueItemProps {
  type: "suggestion";
  target: string;
  description: string;
}

interface StoryQueueItemProps extends BaseQueueItemProps {
  type: "story";
  storyId: string;
  title: string;
  content: string;
  storyType: StoryType;
  location?: string;
  imageUrl?: string;
  onViewFull?: () => void;
  onArchive?: () => void;
  isArchiving?: boolean;
  archivedAt?: string;
  commitUrl?: string;
}

type QueueItemProps = SuggestionQueueItemProps | StoryQueueItemProps;

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles = {
    [SubmissionStatus.PENDING]:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    [SubmissionStatus.APPROVED]:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    [SubmissionStatus.REJECTED]:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    [SubmissionStatus.FLAGGED]:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function StoryTypeBadge({ storyType }: { storyType: StoryType }) {
  return (
    <span className="bg-surface-alt text-body inline-flex rounded-full px-2 text-xs leading-5 font-semibold">
      {storyType}
    </span>
  );
}

export function QueueItem(props: QueueItemProps) {
  const isPending = props.status === SubmissionStatus.PENDING;
  const isPublished = props.status === SubmissionStatus.APPROVED;

  if (props.type === "suggestion") {
    return (
      <li className="hover:bg-surface-alt block transition duration-150 ease-in-out">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-[var(--color-ocean-blue)]">
              Target: {props.target}
            </p>
            <div className="ml-2 flex-shrink-0">
              <StatusBadge status={props.status} />
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="text-muted flex items-center text-sm">
                {props.description}
              </p>
            </div>
            <div className="text-muted mt-2 flex items-center text-sm sm:mt-0">
              <p>
                By {props.submittedBy} &bull; {props.timestamp}
              </p>
            </div>
          </div>
          {isPending && (
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={props.onApprove}
                className="inline-flex items-center rounded border border-transparent bg-green-100 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Approve
              </button>
              <button
                onClick={props.onReject}
                className="inline-flex items-center rounded border border-transparent bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              >
                <XCircle className="mr-1 h-3 w-3" /> Reject
              </button>
            </div>
          )}
        </div>
      </li>
    );
  }

  // Story type
  return (
    <li className="hover:bg-surface-alt block transition duration-150 ease-in-out">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-muted h-4 w-4" />
            <p className="truncate text-sm font-medium text-[var(--color-bougainvillea)]">
              {props.title}
            </p>
          </div>
          <div className="ml-2 flex flex-shrink-0 gap-2">
            <StoryTypeBadge storyType={props.storyType} />
            <StatusBadge status={props.status} />
            {props.archivedAt && (
              <Badge color="green" className="inline-flex items-center gap-1">
                <Github size={10} />
                Archived
              </Badge>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="mt-2 flex gap-4">
          {props.imageUrl && (
            <div className="border-hairline bg-surface-alt h-16 w-24 flex-shrink-0 overflow-hidden rounded border">
              <img
                src={props.imageUrl}
                alt={props.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-muted line-clamp-2 text-sm">{props.content}</p>
            {props.location && (
              <p className="text-muted mt-1 flex items-center text-xs">
                <MapPin size={10} className="mr-1" />
                {props.location}
              </p>
            )}
          </div>
        </div>

        <div className="text-muted mt-2 flex items-center text-xs">
          <p>
            Submitted by {props.submittedBy} &bull; {props.timestamp}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {/* Archive Button - Only show for PUBLISHED stories that are not yet archived */}
          <div>
            {isPublished && !props.archivedAt && props.onArchive && (
              <button
                onClick={props.onArchive}
                disabled={props.isArchiving}
                className="bg-surface inline-flex items-center gap-1.5 rounded-md border border-[var(--color-ocean-blue)] px-3 py-1 text-xs font-medium text-[var(--color-ocean-blue)] transition-colors hover:bg-[var(--color-ocean-blue)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                title="Archive to MDX"
              >
                {props.isArchiving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code size={14} />
                    MDX Archive
                  </>
                )}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={props.onViewFull}
              className="text-xs font-medium text-[var(--color-ocean-blue)] hover:underline"
            >
              View Full
            </button>
            <span className="text-border-hairline">|</span>
            <button
              onClick={props.onApprove}
              className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              Publish
            </button>
            <button
              onClick={props.onReject}
              className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Reject
            </button>
            <button
              onClick={props.onFlag}
              className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <Flag size={12} />
              Flag
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
