"use client";

import { clsx } from "clsx";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { isAiRunInFlight, type AiModerationStatus } from "@/types/ai";

interface AiStatusBadgeProps {
  moderationStatus?: AiModerationStatus | null;
  /** The latest analysis run. A queued, running or failed run outranks the moderation status. */
  lastRunStatus?: string | null;
  /** Show "Not analyzed" instead of nothing when there is no status at all. */
  showUnanalyzed?: boolean;
  /** Only the moderation states are clickable. */
  onClick?: () => void;
}

interface BadgeConfig {
  icon?: LucideIcon;
  iconClassName?: string;
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<AiModerationStatus, BadgeConfig> = {
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

const PROCESSING: BadgeConfig = {
  icon: Loader2,
  iconClassName: "animate-spin",
  label: "Analyzing...",
  className: "bg-brand/10 text-brand",
};

const FAILED: BadgeConfig = {
  icon: XCircle,
  label: "Analysis Failed",
  className: "bg-status-error/10 text-status-error",
};

const UNANALYZED: BadgeConfig = {
  label: "Not analyzed",
  className: "bg-surface-alt text-muted",
};

function resolveBadge({
  moderationStatus,
  lastRunStatus,
  showUnanalyzed,
}: AiStatusBadgeProps): { config?: BadgeConfig; clickable: boolean } {
  if (isAiRunInFlight(lastRunStatus)) {
    return { config: PROCESSING, clickable: false };
  }
  if (lastRunStatus === "FAILED") return { config: FAILED, clickable: false };
  if (moderationStatus) {
    return { config: STATUS_CONFIG[moderationStatus], clickable: true };
  }
  return { config: showUnanalyzed ? UNANALYZED : undefined, clickable: false };
}

export function AiStatusBadge(props: AiStatusBadgeProps) {
  const { onClick } = props;
  const { config, clickable } = resolveBadge(props);
  if (!config) return null;

  const Icon = config.icon;

  const badge = (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {Icon && <Icon size={10} className={config.iconClassName} />}
      {config.label}
    </span>
  );

  if (onClick && clickable) {
    return (
      <button type="button" onClick={onClick} className="cursor-pointer">
        {badge}
      </button>
    );
  }

  return badge;
}
