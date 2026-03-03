"use client";

import { Database, FileCode2, Loader2 } from "lucide-react";
import { useSystemHealth } from "@/hooks/queries/admin";
import type { SystemStatus } from "@/hooks/queries/admin";

/**
 * System Status Badges Component
 *
 * Displays real-time status indicators for critical system components:
 * - Database connectivity status
 * - MDX Engine operational status
 *
 * Polls backend health endpoint every 30 seconds via useSystemHealth hook.
 * Shows green dot for connected/active, red for disconnected/inactive, gray for unknown.
 */
export function SystemStatusBadges() {
  const { data: status, isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="text-muted h-4 w-4 animate-spin" />
        <span className="text-muted text-xs">Checking status...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <StatusBadge
        icon={<Database className="h-3.5 w-3.5" />}
        label="Database"
        status={status?.database ?? "unknown"}
      />
      <StatusBadge
        icon={<FileCode2 className="h-3.5 w-3.5" />}
        label="MDX Engine"
        status={status?.mdxEngine ?? "unknown"}
      />
    </div>
  );
}

interface StatusBadgeProps {
  icon: React.ReactNode;
  label: string;
  status: SystemStatus["database"] | SystemStatus["mdxEngine"];
}

function StatusBadge({ icon, label, status }: StatusBadgeProps) {
  // Determine status indicator color and accessibility label
  const statusConfig = {
    connected: {
      dotColor: "bg-green-500",
      textColor: "text-body",
      ariaLabel: `${label} connected`,
    },
    active: {
      dotColor: "bg-green-500",
      textColor: "text-body",
      ariaLabel: `${label} active`,
    },
    disconnected: {
      dotColor: "bg-red-500",
      textColor: "text-red-700 dark:text-red-400",
      ariaLabel: `${label} disconnected`,
    },
    inactive: {
      dotColor: "bg-red-500",
      textColor: "text-red-700 dark:text-red-400",
      ariaLabel: `${label} inactive`,
    },
    unknown: {
      dotColor: "bg-basalt-500",
      textColor: "text-muted",
      ariaLabel: `${label} status unknown`,
    },
  };

  const config = statusConfig[status] ?? statusConfig.unknown;

  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-label={config.ariaLabel}
    >
      {/* Status dot indicator */}
      <div className="relative flex h-2 w-2 items-center justify-center">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${status === "connected" || status === "active" ? config.dotColor : ""}`}
          aria-hidden="true"
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`}
          aria-hidden="true"
        />
      </div>

      {/* Icon */}
      <span className={config.textColor} aria-hidden="true">
        {icon}
      </span>

      {/* Label - hidden on mobile, visible on md+ */}
      <span
        className={`hidden text-xs font-medium md:inline ${config.textColor}`}
      >
        {label}
      </span>
    </div>
  );
}
