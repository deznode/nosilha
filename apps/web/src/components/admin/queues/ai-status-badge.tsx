"use client";

import { Sparkles, CheckCircle, XCircle } from "lucide-react";
import type { AiModerationStatus } from "@/types/ai";

interface AiStatusBadgeProps {
  moderationStatus?: AiModerationStatus | null;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<
  AiModerationStatus,
  { icon: typeof Sparkles; label: string; className: string }
> = {
  PENDING_REVIEW: {
    icon: Sparkles,
    label: "AI Pending Review",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  APPROVED: {
    icon: CheckCircle,
    label: "AI Applied",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  REJECTED: {
    icon: XCircle,
    label: "AI Rejected",
    className:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/30 dark:text-zinc-400",
  },
};

export function AiStatusBadge({
  moderationStatus,
  onClick,
}: AiStatusBadgeProps) {
  if (!moderationStatus) return null;

  const config = STATUS_CONFIG[moderationStatus];
  if (!config) return null;

  const Icon = config.icon;

  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="cursor-pointer">
        {badge}
      </button>
    );
  }

  return badge;
}
