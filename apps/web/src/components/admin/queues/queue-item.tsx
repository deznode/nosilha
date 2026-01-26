"use client";

import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Flag,
  Github,
  Code,
  Eye,
} from "lucide-react";
import { SubmissionStatus, StoryType } from "@/types/story";
import { Badge } from "@/components/catalyst-ui/badge";
import { Button } from "@/components/catalyst-ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";

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
  const styles: Record<SubmissionStatus, string> = {
    [SubmissionStatus.DRAFT]: "bg-surface-alt text-body",
    [SubmissionStatus.PENDING]:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    [SubmissionStatus.APPROVED]:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    [SubmissionStatus.REJECTED]:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    [SubmissionStatus.FLAGGED]:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    [SubmissionStatus.PUBLISHED]:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    [SubmissionStatus.ARCHIVED]: "bg-surface-alt text-muted",
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
            <p className="text-ocean-blue truncate text-sm font-medium">
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
              <Button color="green" onClick={props.onApprove}>
                <CheckCircle data-slot="icon" />
                Approve
              </Button>
              <Button color="red" onClick={props.onReject}>
                <XCircle data-slot="icon" />
                Reject
              </Button>
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
            <p className="text-bougainvillea-pink truncate text-sm font-medium">
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
            <div className="border-hairline bg-surface-alt relative h-16 w-24 flex-shrink-0 overflow-hidden rounded border">
              <Image
                src={props.imageUrl}
                alt={props.title}
                fill
                className="object-cover"
                unoptimized
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
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={props.onArchive}
                disabled={props.isArchiving}
                isLoading={props.isArchiving}
                icon={<Code size={14} />}
                title="Archive to MDX"
              >
                {props.isArchiving ? "Generating..." : "MDX Archive"}
              </AnimatedButton>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button plain onClick={props.onViewFull}>
              <Eye data-slot="icon" />
              View Full
            </Button>
            <Button color="green" onClick={props.onApprove}>
              <CheckCircle data-slot="icon" />
              Publish
            </Button>
            <Button color="red" onClick={props.onReject}>
              <XCircle data-slot="icon" />
              Reject
            </Button>
            <Button color="yellow" onClick={props.onFlag}>
              <Flag data-slot="icon" />
              Flag
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
