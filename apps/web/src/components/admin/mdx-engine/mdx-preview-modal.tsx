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

  if (!mdxContent) return null;

  const handleCommit = () => {
    if (!mdxContent.schemaValid) {
      const confirmed = window.confirm(
        "Schema validation has errors. Are you sure you want to commit this MDX? It will be committed but not merged until validation passes."
      );
      if (!confirmed) return;
    }
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
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-slate-800"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <div className="flex-1 pr-4">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--color-ocean-blue)]" />
                  <DialogTitle className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    MDX Archival Engine
                  </DialogTitle>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Preview and commit generated MDX content
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
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
              <div className="mb-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <FileText size={16} />
                  Frontmatter Preview
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User size={14} />
                    <span className="font-medium">Author:</span>
                    <span>{mdxContent.frontmatter.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar size={14} />
                    <span className="font-medium">Date:</span>
                    <span>{mdxContent.frontmatter.date}</span>
                  </div>
                  {mdxContent.frontmatter.location && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin size={14} />
                      <span className="font-medium">Location:</span>
                      <span>{mdxContent.frontmatter.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
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
                          className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* MDX Source Code Preview */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 dark:border-slate-700 dark:bg-slate-700">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
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
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                <p>
                  Generated at:{" "}
                  {new Date(mdxContent.generatedAt).toLocaleString()}
                </p>
                <p>Slug: {mdxContent.slug}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/30">
              <button
                onClick={onClose}
                disabled={isCommitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Discard
              </button>
              <button
                onClick={handleCommit}
                disabled={isCommitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-ocean-blue)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-ocean-blue-deep)] disabled:cursor-not-allowed disabled:opacity-50"
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
    </Dialog>
  );
}
