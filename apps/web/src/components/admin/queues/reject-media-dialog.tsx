"use client";

import { Fragment, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XCircle, Loader2 } from "lucide-react";

interface RejectMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  mediaTitle: string;
  isLoading?: boolean;
}

export function RejectMediaDialog({
  isOpen,
  onClose,
  onConfirm,
  mediaTitle,
  isLoading = false,
}: RejectMediaDialogProps) {
  const [reason, setReason] = useState("");

  const canSubmit = reason.trim().length > 0;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="rounded-card bg-canvas shadow-floating w-full max-w-md p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-status-error/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <XCircle
                    className="text-status-error h-6 w-6"
                    aria-hidden="true"
                  />
                </div>

                <DialogTitle className="text-body mt-4 font-serif text-lg font-semibold">
                  Reject Media
                </DialogTitle>

                <p className="text-muted mt-2 text-sm">
                  Are you sure you want to reject &ldquo;{mediaTitle}&rdquo;?
                </p>

                <div className="mt-4 w-full text-left">
                  <label
                    htmlFor="reject-reason"
                    className="text-muted mb-1 block text-sm"
                  >
                    Reason
                  </label>
                  <textarea
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Low quality, duplicate, inappropriate..."
                    rows={2}
                    maxLength={1024}
                    className="border-hairline bg-surface text-body placeholder:text-muted rounded-button focus:ring-status-error w-full border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex w-full gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="rounded-button border-hairline bg-canvas text-body hover:bg-surface focus:ring-edge flex-1 border px-4 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading || !canSubmit}
                    className="rounded-button bg-status-error hover:bg-status-error/90 focus:ring-status-error flex-1 px-4 py-2.5 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Rejecting...
                      </span>
                    ) : (
                      "Reject"
                    )}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
