"use client";

import { clsx } from "clsx";
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
      "bg-status-warning/10 text-status-warning dark:bg-status-warning/20",
  },
  APPROVED: {
    icon: CheckCircle,
    label: "AI Applied",
    className:
      "bg-status-success/10 text-status-success dark:bg-status-success/20",
  },
  REJECTED: {
    icon: XCircle,
    label: "AI Rejected",
    className:
      "bg-mist-100 text-basalt-600 dark:bg-basalt-800/30 dark:text-basalt-500",
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
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className
      )}
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
