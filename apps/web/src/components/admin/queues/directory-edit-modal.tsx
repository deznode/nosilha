"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { MapPin, X } from "lucide-react";
import { DirectoryEntryForm } from "@/components/directory/directory-entry-form";
import type { DirectorySubmission } from "@/types/admin";

interface DirectoryEditModalProps {
  isOpen: boolean;
  entry: DirectorySubmission | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal for editing directory entries in the admin dashboard.
 *
 * Wraps DirectoryEntryForm in modal variant for inline editing
 * from the moderation queue without navigating away.
 */
export function DirectoryEditModal({
  isOpen,
  entry,
  onClose,
  onSuccess,
}: DirectoryEditModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  if (!entry) return null;

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
            className="bg-surface relative w-full max-w-2xl transform overflow-hidden rounded-2xl text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--color-ocean-blue)]" />
                <DialogTitle className="text-body text-lg font-semibold">
                  Edit Directory Entry
                </DialogTitle>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-surface-alt rounded-full p-2 transition-colors"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Form Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              <DirectoryEntryForm
                mode="edit"
                initialData={entry}
                variant="modal"
                onSuccess={handleSuccess}
              />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
