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
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-md data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  Flag {itemType}
                </DialogTitle>
              </div>
              <button
                onClick={handleCancel}
                className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">
                You are about to flag{" "}
                <span className="font-medium">{itemTitle}</span>. Please provide
                a reason for flagging this item:
              </p>

              {/* Reason Textarea */}
              <div className="mb-4">
                <label
                  htmlFor="flag-reason"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="flag-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="e.g., Needs verification, Quality concern, Inappropriate content..."
                  className="block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                  required
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This reason will be stored for moderation tracking
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-700/30">
              <button
                onClick={handleCancel}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
