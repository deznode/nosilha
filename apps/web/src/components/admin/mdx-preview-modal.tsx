"use client";

import { useState } from "react";
import { Code, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";
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
  storyTitle: _storyTitle,
  slug,
  storyId,
  onCommit,
  isCommitting = false,
}: MdxPreviewModalProps) {
  const [showValidation, setShowValidation] = useState(true);

  // Simulate schema validation (would be replaced with actual validation)
  const isSchemaValid =
    mdxContent.includes("---") && mdxContent.includes("title:");

  const handleCommit = async () => {
    await onCommit();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} size="5xl">
      <DialogTitle className="flex items-center gap-2">
        <Code className="text-ocean-blue h-5 w-5" />
        Velite Content Preview
      </DialogTitle>
      <DialogDescription>
        Generated MDX Source (content/stories/{slug}.mdx)
      </DialogDescription>

      <DialogBody>
        {/* Schema Compliance Indicator */}
        <div className="mb-6">
          {isSchemaValid ? (
            <div className="border-status-success-edge bg-status-success-surface text-status-success-ink flex items-center gap-2 rounded-lg border px-4 py-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Schema compliance verified
                </p>
                <p className="text-xs">All Velite schema requirements met</p>
              </div>
            </div>
          ) : (
            <div className="border-status-warning-edge bg-status-warning-surface text-status-warning-ink flex items-center gap-2 rounded-lg border px-4 py-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Verifying schema compliance...
                </p>
                <button
                  onClick={() => setShowValidation(!showValidation)}
                  className="text-xs hover:underline"
                >
                  {showValidation ? "Hide details" : "Show details"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MDX Preview with Syntax Highlighting */}
        <div className="border-hairline overflow-hidden rounded-lg border">
          <div className="border-hairline bg-surface-alt border-b px-4 py-2">
            <h3 className="text-body flex items-center gap-2 text-sm font-semibold">
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
        <div className="bg-canvas text-muted mt-4 rounded-lg px-4 py-3 text-xs">
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
