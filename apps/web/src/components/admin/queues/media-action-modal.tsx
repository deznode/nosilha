"use client";

import { useState } from "react";
import { X, Flag, XCircle } from "lucide-react";
import type { MediaModerationAction } from "@/types/admin";
import { Button } from "@/components/catalyst-ui/button";

interface MediaActionModalProps {
  isOpen: boolean;
  action: MediaModerationAction;
  mediaTitle: string;
  onClose: () => void;
  onConfirm: (reason: string, notes?: string) => void;
}

const FLAG_REASONS = [
  "Needs verification",
  "Quality issue",
  "Copyright concern",
  "Inappropriate content",
  "Other",
];

export function MediaActionModal({
  isOpen,
  action,
  mediaTitle,
  onClose,
  onConfirm,
}: MediaActionModalProps) {
  const [selectedReason, setSelectedReason] = useState(FLAG_REASONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setSelectedReason(FLAG_REASONS[0]);
    setAdditionalNotes("");
  };

  const handleConfirm = () => {
    const reason =
      action === "FLAG" || action === "REJECT" ? selectedReason : "";
    onConfirm(reason, additionalNotes || undefined);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const actionText = action === "FLAG" ? "Flag" : "Reject";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-surface relative w-full max-w-md transform overflow-hidden rounded-lg shadow-xl transition-all">
          {/* Header */}
          <div className="border-hairline flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-body text-lg font-semibold">
              {actionText} Media
            </h3>
            <Button plain onClick={handleCancel}>
              <X data-slot="icon" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-body mb-4 text-sm">
              You are about to {actionText.toLowerCase()}{" "}
              <span className="font-medium">{mediaTitle}</span>. Please provide
              a reason:
            </p>

            {/* Reason Dropdown */}
            <div className="mb-4">
              <label
                htmlFor="reason"
                className="text-body mb-2 block text-sm font-medium"
              >
                Reason
              </label>
              <select
                id="reason"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="border-hairline bg-surface text-body focus:border-ocean-blue focus:ring-ocean-blue block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              >
                {FLAG_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div className="mb-4">
              <label
                htmlFor="notes"
                className="text-body mb-2 block text-sm font-medium"
              >
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                placeholder="Add any additional context or notes..."
                className="border-hairline bg-surface text-body placeholder-muted focus:border-ocean-blue focus:ring-ocean-blue block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-hairline flex justify-end gap-3 border-t px-6 py-4">
            <Button outline onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              color={action === "FLAG" ? "yellow" : "red"}
              onClick={handleConfirm}
            >
              {action === "FLAG" ? (
                <Flag data-slot="icon" />
              ) : (
                <XCircle data-slot="icon" />
              )}
              Confirm {actionText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
