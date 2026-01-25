"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for copy-to-clipboard functionality with toast feedback.
 * Returns copied state and copy function.
 */
export function useCopy(): {
  copied: boolean;
  copy: (value: string) => Promise<void>;
} {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied: ${value}`).show();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy").show();
    }
  }

  return { copied, copy };
}
