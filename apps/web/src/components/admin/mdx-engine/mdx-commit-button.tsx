"use client";

import { useState } from "react";
import { FileCode, Loader2 } from "lucide-react";
import { MdxPreviewModal } from "./mdx-preview-modal";
import { generateMdx, commitMdx } from "@/lib/api";
import type { MdxContent } from "@/types/admin";

interface MdxCommitButtonProps {
  storyId: string;
  storyTitle: string;
}

export function MdxCommitButton({ storyId, storyTitle }: MdxCommitButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [mdxContent, setMdxContent] = useState<MdxContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const content = await generateMdx(storyId);
      setMdxContent(content);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to generate MDX:", err);
      // Show error toast/notification
      alert(
        `Error: ${err instanceof Error ? err.message : "Failed to generate MDX content"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommit = async (mdxSource: string) => {
    setIsCommitting(true);

    try {
      const result = await commitMdx(
        storyId,
        mdxSource,
        `Archive story: ${storyTitle}`
      );

      // Success - close modal and show success message
      setIsModalOpen(false);
      setMdxContent(null);

      // Show success toast/notification
      alert(
        `MDX committed successfully!\nPath: ${result.mdxPath}\nCommitted by: ${result.committedBy}`
      );
    } catch (err) {
      console.error("Failed to commit MDX:", err);
      // Show error toast/notification
      alert(
        `Error: ${err instanceof Error ? err.message : "Failed to commit MDX content"}`
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isCommitting) {
      setIsModalOpen(false);
      setMdxContent(null);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-surface border-ocean-blue text-ocean-blue hover:bg-ocean-blue inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        title="Generate MDX for archival"
      >
        {isGenerating ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileCode size={14} />
            Generate MDX
          </>
        )}
      </button>

      <MdxPreviewModal
        mdxContent={mdxContent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCommit={handleCommit}
        isCommitting={isCommitting}
      />
    </>
  );
}
