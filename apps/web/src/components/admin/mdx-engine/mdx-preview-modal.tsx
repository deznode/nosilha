"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { MdxContent } from "@/types/admin";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface MdxPreviewModalProps {
  mdxContent: MdxContent | null;
  isOpen: boolean;
  onClose: () => void;
  onCommit: (mdxSource: string) => void;
  isCommitting?: boolean;
}

export function MdxPreviewModal({
  mdxContent,
  isOpen,
  onClose,
  onCommit,
  isCommitting = false,
}: MdxPreviewModalProps) {
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [showValidationConfirm, setShowValidationConfirm] = useState(false);

  if (!mdxContent) return null;

  const handleCommit = () => {
    if (!mdxContent.schemaValid) {
      setShowValidationConfirm(true);
      return;
    }
    onCommit(mdxContent.mdxSource);
  };

  const handleValidationConfirm = () => {
    setShowValidationConfirm(false);
    onCommit(mdxContent.mdxSource);
  };

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
            className="bg-surface relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-start justify-between border-b p-4">
              <div className="flex-1 pr-4">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="text-ocean-blue h-5 w-5" />
                  <DialogTitle className="text-body font-serif text-xl font-bold">
                    MDX Archival Engine
                  </DialogTitle>
                </div>
                <p className="text-muted text-sm">
                  Preview and commit generated MDX content
                </p>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-surface-alt rounded-full p-2 transition-colors"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              {/* Schema Validation Status */}
              <div className="mb-6">
                {mdxContent.schemaValid ? (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Schema-compliant MDX
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        All validation checks passed
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Schema validation errors
                        </p>
                        <button
                          onClick={() =>
                            setShowValidationDetails(!showValidationDetails)
                          }
                          className="text-xs text-amber-700 hover:underline dark:text-amber-400"
                        >
                          {showValidationDetails
                            ? "Hide details"
                            : "Show details"}
                        </button>
                      </div>
                    </div>
                    {showValidationDetails &&
                      mdxContent.validationErrors &&
                      mdxContent.validationErrors.length > 0 && (
                        <ul className="mt-2 space-y-1 border-t border-amber-200 pt-2 dark:border-amber-700">
                          {mdxContent.validationErrors.map((error, index) => (
                            <li
                              key={index}
                              className="text-xs text-amber-700 dark:text-amber-400"
                            >
                              • {error}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
              </div>

              {/* Frontmatter Preview */}
              <div className="bg-canvas mb-6 rounded-lg p-4">
                <h3 className="text-muted mb-3 flex items-center gap-2 text-sm font-semibold">
                  <FileText size={16} />
                  Frontmatter Preview
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="text-muted flex items-center gap-2">
                    <User size={14} />
                    <span className="font-medium">Author:</span>
                    <span>{mdxContent.frontmatter.author}</span>
                  </div>
                  <div className="text-muted flex items-center gap-2">
                    <Calendar size={14} />
                    <span className="font-medium">Date:</span>
                    <span>{mdxContent.frontmatter.date}</span>
                  </div>
                  {mdxContent.frontmatter.location && (
                    <div className="text-muted flex items-center gap-2">
                      <MapPin size={14} />
                      <span className="font-medium">Location:</span>
                      <span>{mdxContent.frontmatter.location}</span>
                    </div>
                  )}
                  <div className="text-muted flex items-center gap-2">
                    <FileText size={14} />
                    <span className="font-medium">Type:</span>
                    <span>{mdxContent.frontmatter.storyType}</span>
                  </div>
                </div>
                {mdxContent.frontmatter.tags &&
                  mdxContent.frontmatter.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {mdxContent.frontmatter.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-surface-alt text-muted rounded-full px-2 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* MDX Source Code Preview */}
              <div className="border-hairline rounded-lg border">
                <div className="border-hairline bg-surface-alt border-b px-4 py-2">
                  <h3 className="text-body text-sm font-semibold">
                    MDX Source
                  </h3>
                </div>
                <div className="max-h-96 overflow-auto">
                  <SyntaxHighlighter
                    language="markdown"
                    style={dark}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: "0.875rem",
                    }}
                    showLineNumbers
                  >
                    {mdxContent.mdxSource}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-muted mt-4 text-xs">
                <p>
                  Generated at:{" "}
                  {new Date(mdxContent.generatedAt).toLocaleString()}
                </p>
                <p>Slug: {mdxContent.slug}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-hairline bg-canvas flex items-center justify-end gap-3 border-t p-4">
              <button
                onClick={onClose}
                disabled={isCommitting}
                className="border-hairline text-body hover:bg-surface-alt rounded-lg border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Discard
              </button>
              <button
                onClick={handleCommit}
                disabled={isCommitting}
                className="bg-ocean-blue hover:bg-ocean-blue-deep inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCommitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Committing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Commit to Repository
                  </>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>

      {/* Validation Warning Confirmation */}
      <ConfirmationDialog
        isOpen={showValidationConfirm}
        onClose={() => setShowValidationConfirm(false)}
        onConfirm={handleValidationConfirm}
        title="Commit with validation errors?"
        description="Schema validation has errors. The MDX will be committed but not merged until validation passes."
        confirmLabel="Commit Anyway"
        variant="warning"
      />
    </Dialog>
  );
}
