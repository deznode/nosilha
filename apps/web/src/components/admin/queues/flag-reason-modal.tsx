"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Flag, X } from "lucide-react";

interface FlagReasonModalProps {
  isOpen: boolean;
  itemType: string;
  itemTitle: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function FlagReasonModal({
  isOpen,
  itemType,
  itemTitle,
  onClose,
  onConfirm,
}: FlagReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      // Reset form
      setReason("");
    }
  };

  const handleCancel = () => {
    // Reset form
    setReason("");
    onClose();
  };

  const isValid = reason.trim().length > 0;

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
            className="bg-surface relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-md data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <DialogTitle className="text-body text-lg font-semibold">
                  Flag {itemType}
                </DialogTitle>
              </div>
              <button
                onClick={handleCancel}
                className="hover:bg-surface-alt rounded-full p-2 transition-colors"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-body mb-4 text-sm">
                You are about to flag{" "}
                <span className="font-medium">{itemTitle}</span>. Please provide
                a reason for flagging this item:
              </p>

              {/* Reason Textarea */}
              <div className="mb-4">
                <label
                  htmlFor="flag-reason"
                  className="text-body mb-2 block text-sm font-medium"
                >
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="flag-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="e.g., Needs verification, Quality concern, Inappropriate content..."
                  className="border-hairline bg-surface text-body placeholder-muted block w-full rounded-md border px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  required
                />
                <p className="text-muted mt-1 text-xs">
                  This reason will be stored for moderation tracking
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-hairline bg-canvas flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={handleCancel}
                className="border-hairline bg-surface text-body hover:bg-surface-alt rounded-md border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isValid}
                className="rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                <Flag className="mr-1.5 inline-block h-4 w-4" />
                Confirm Flag
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
