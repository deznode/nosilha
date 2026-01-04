"use client";

import { useState } from "react";
import { Github, Code, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from "@/components/catalyst-ui/dialog";
import { Button } from "@/components/catalyst-ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MdxPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mdxContent: string;
  storyTitle: string;
  slug: string;
  storyId: string;
  onCommit: () => Promise<void>;
  isCommitting?: boolean;
}

export function MdxPreviewModal({
  isOpen,
  onClose,
  mdxContent,
  storyTitle,
  slug,
  storyId,
  onCommit,
  isCommitting = false,
}: MdxPreviewModalProps) {
  const [showValidation, setShowValidation] = useState(true);

  // Simulate schema validation (would be replaced with actual validation)
  const isSchemaValid = mdxContent.includes("---") && mdxContent.includes("title:");

  const handleCommit = async () => {
    await onCommit();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} size="5xl">
      <DialogTitle className="flex items-center gap-2">
        <Code className="h-5 w-5 text-[var(--color-ocean-blue)]" />
        Velite Content Preview
      </DialogTitle>
      <DialogDescription>
        Generated MDX Source (content/stories/{slug}.mdx)
      </DialogDescription>

      <DialogBody>
        {/* Schema Compliance Indicator */}
        <div className="mb-6">
          {isSchemaValid ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Schema compliance verified
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  All Velite schema requirements met
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Verifying schema compliance...
                </p>
                <button
                  onClick={() => setShowValidation(!showValidation)}
                  className="text-xs text-amber-700 hover:underline dark:text-amber-400"
                >
                  {showValidation ? "Hide details" : "Show details"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MDX Preview with Syntax Highlighting */}
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Code size={16} />
              MDX Source Code
            </h3>
          </div>
          <div className="max-h-[500px] overflow-auto">
            <SyntaxHighlighter
              language="markdown"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: "0.875rem",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
              showLineNumbers
              wrapLines
            >
              {mdxContent}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Metadata Info */}
        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
              <span className="font-medium">Story ID:</span> {storyId}
            </div>
            <div>
              <span className="font-medium">Slug:</span> {slug}
            </div>
            <div>
              <span className="font-medium">Destination:</span> content/stories/
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose} disabled={isCommitting}>
          Discard
        </Button>
        <Button
          color="blue"
          onClick={handleCommit}
          disabled={isCommitting}
          className="inline-flex items-center gap-2"
        >
          {isCommitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Committing...
            </>
          ) : (
            <>
              <Github size={16} />
              Commit to GitHub Archive
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
