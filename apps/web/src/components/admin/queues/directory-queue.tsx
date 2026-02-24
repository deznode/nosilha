"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  Utensils,
  Hotel,
  Umbrella,
  Castle,
  TreePine,
  Pencil,
  Trash2,
  Flag,
} from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";
import type { DirectorySubmission } from "@/types/admin";
import { SubmissionStatus } from "@/types/story";
import { Button } from "@/components/catalyst-ui/button";
import { DirectoryEditModal } from "@/components/admin/queues/directory-edit-modal";
import { FlagReasonModal } from "@/components/admin/queues/flag-reason-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useAdminDirectorySubmissions,
  useUpdateDirectoryStatus,
  useDeleteDirectoryEntry,
} from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import { Pagination, fromAdminQueueResponse } from "@/components/ui/pagination";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Restaurant: <Utensils size={18} />,
  Hotel: <Hotel size={18} />,
  Beach: <Umbrella size={18} />,
  Heritage: <Castle size={18} />,
  Nature: <TreePine size={18} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Restaurant: "bg-bougainvillea-pink/10 text-bougainvillea-pink",
  Hotel: "bg-ocean-blue/10 text-ocean-blue",
  Beach: "bg-sunny-yellow/10 text-sunny-yellow",
  Heritage: "bg-valley-green/10 text-valley-green",
  Nature: "bg-valley-green/10 text-valley-green",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  [SubmissionStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  [SubmissionStatus.APPROVED]:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  [SubmissionStatus.REJECTED]:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  [SubmissionStatus.FLAGGED]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  [SubmissionStatus.ARCHIVED]: "bg-surface-alt text-muted",
};

export function DirectoryQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "ALL">(
    "ALL"
  );
  const [page, setPage] = useState(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset page on filter change
  useEffect(() => setPage(0), [filterStatus]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [directoryToEdit, setDirectoryToEdit] =
    useState<DirectorySubmission | null>(null);

  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [directoryToFlag, setDirectoryToFlag] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [directoryToDelete, setDirectoryToDelete] =
    useState<DirectorySubmission | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const directoryQuery = useAdminDirectorySubmissions(
    page,
    20,
    filterStatus === "ALL" ? undefined : filterStatus
  );
  const updateDirectory = useUpdateDirectoryStatus();
  const deleteDirectoryEntry = useDeleteDirectoryEntry();
  const toast = useToast();

  const submissions = directoryQuery.data?.items ?? [];
  const isLoading = directoryQuery.isLoading;

  const handleStatusChange = (id: string, status: SubmissionStatus) => {
    const statusLabels: Record<SubmissionStatus, string> = {
      [SubmissionStatus.APPROVED]: "approved",
      [SubmissionStatus.REJECTED]: "rejected",
      [SubmissionStatus.ARCHIVED]: "archived",
      [SubmissionStatus.PENDING]: "updated",
      [SubmissionStatus.DRAFT]: "updated",
      [SubmissionStatus.FLAGGED]: "flagged",
      [SubmissionStatus.PUBLISHED]: "published",
    };
    const statusLabel = statusLabels[status];
    updateDirectory.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(`Entry ${statusLabel} successfully`).show();
        },
        onError: () => {
          toast
            .error(`Failed to ${statusLabel} entry. Please try again.`)
            .show();
        },
      }
    );
  };

  const handleEdit = (submission: DirectorySubmission) => {
    setDirectoryToEdit(submission);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setDirectoryToEdit(null);
  };

  const handleEditSuccess = () => {
    toast.success("Directory entry updated successfully").show();
    setIsEditModalOpen(false);
    setDirectoryToEdit(null);
  };

  const handleDelete = (submission: DirectorySubmission) => {
    setDirectoryToDelete(submission);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (directoryToDelete) {
      deleteDirectoryEntry.mutate(directoryToDelete.id, {
        onSuccess: () => {
          toast.success(`"${directoryToDelete.name}" has been deleted`).show();
          setIsDeleteDialogOpen(false);
          setDirectoryToDelete(null);
        },
        onError: () => {
          toast.error("Failed to delete entry. Please try again.").show();
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDirectoryToDelete(null);
  };

  const handleFlag = (submission: DirectorySubmission) => {
    setDirectoryToFlag({ id: submission.id, name: submission.name });
    setIsFlagModalOpen(true);
  };

  const handleFlagConfirm = (reason: string) => {
    if (directoryToFlag) {
      updateDirectory.mutate(
        {
          id: directoryToFlag.id,
          status: SubmissionStatus.FLAGGED,
          notes: reason,
        },
        {
          onSuccess: () => {
            toast.info(`"${directoryToFlag.name}" has been flagged`).show();
          },
          onError: () => {
            toast.error("Failed to flag entry. Please try again.").show();
          },
        }
      );
    }
    setIsFlagModalOpen(false);
    setDirectoryToFlag(null);
  };

  const handleFlagClose = () => {
    setIsFlagModalOpen(false);
    setDirectoryToFlag(null);
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.town.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const paginationData = fromAdminQueueResponse(directoryQuery.data);

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
            <option value={SubmissionStatus.FLAGGED}>Flagged</option>
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
            placeholder="Search submissions..."
            className="border-hairline bg-surface placeholder-muted focus:border-ocean-blue focus:ring-ocean-blue block w-full rounded-md border py-2 pr-3 pl-10 leading-5 focus:ring-1 focus:outline-none sm:text-sm"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-muted h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        {filteredSubmissions.length === 0 ? (
          <div className="text-muted p-8 text-center">
            No directory submissions found
          </div>
        ) : (
          <ul className="divide-hairline divide-y">
            {filteredSubmissions.map((submission) => (
              <li
                key={submission.id}
                className="hover:bg-surface-alt p-6 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={clsx(
                        "mt-1 rounded-xl p-3",
                        CATEGORY_COLORS[submission.category]
                      )}
                    >
                      {CATEGORY_ICONS[submission.category]}
                    </div>
                    <div className="flex-grow">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-body font-bold">
                          {submission.name}
                        </h4>
                        <span className="bg-surface-alt text-muted rounded px-2 py-0.5 text-[10px] font-bold">
                          {submission.category}
                        </span>
                        {submission.priceLevel && (
                          <span className="bg-valley-green/10 text-valley-green rounded px-2 py-0.5 text-[10px] font-bold">
                            {submission.priceLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-muted mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed">
                        {submission.description}
                      </p>
                      {submission.imageUrl && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="border-hairline relative h-20 w-32 overflow-hidden rounded-lg border shadow-sm">
                            <Image
                              src={submission.imageUrl}
                              alt={submission.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
                            Visual Asset Attached
                          </span>
                        </div>
                      )}
                      <div className="text-muted mt-4 flex flex-wrap items-center gap-3 text-[10px] font-bold tracking-wider uppercase">
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
                          <Tag size={12} className="text-muted" />
                          {submission.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="bg-surface-alt text-muted rounded-full px-2 py-0.5 text-xs"
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
                      className={clsx(
                        "rounded-full border px-3 py-1 text-[10px] font-bold",
                        STATUS_BADGE_CLASSES[submission.status] ??
                          "bg-surface-alt text-muted"
                      )}
                    >
                      {submission.status}
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        outline
                        onClick={() => handleEdit(submission)}
                        title="Edit entry"
                      >
                        <Pencil data-slot="icon" />
                        Edit
                      </Button>

                      {submission.status === SubmissionStatus.PENDING && (
                        <>
                          <Button
                            color="green"
                            onClick={() =>
                              handleStatusChange(
                                submission.id,
                                SubmissionStatus.APPROVED
                              )
                            }
                          >
                            <CheckCircle data-slot="icon" />
                            Approve
                          </Button>
                          <Button
                            color="red"
                            onClick={() =>
                              handleStatusChange(
                                submission.id,
                                SubmissionStatus.REJECTED
                              )
                            }
                          >
                            <XCircle data-slot="icon" />
                            Reject
                          </Button>
                          <Button
                            color="yellow"
                            onClick={() => handleFlag(submission)}
                            title="Flag for review"
                          >
                            <Flag data-slot="icon" />
                            Flag
                          </Button>
                        </>
                      )}

                      <Button
                        outline
                        onClick={() => handleDelete(submission)}
                        title="Delete permanently"
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 data-slot="icon" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
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

      <DirectoryEditModal
        isOpen={isEditModalOpen}
        entry={directoryToEdit}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />

      <FlagReasonModal
        isOpen={isFlagModalOpen}
        itemType="Directory Entry"
        itemTitle={directoryToFlag?.name || ""}
        onClose={handleFlagClose}
        onConfirm={handleFlagConfirm}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${directoryToDelete?.name}"?`}
        description="This will permanently remove the directory entry. This action cannot be undone."
        confirmLabel="Delete Entry"
        variant="danger"
        isLoading={deleteDirectoryEntry.isPending}
      />
    </div>
  );
}
