"use client";

import { clsx } from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Image,
  FileText,
  MapPin,
} from "lucide-react";
import { useAiHealth, useUpdateAiDomainConfig } from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import type { AiProviderHealth, AiDomainConfig } from "@/types/ai";

const DOMAIN_META: Record<
  string,
  { label: string; description: string; icon: typeof Image }
> = {
  gallery: {
    label: "Gallery",
    description: "AI image analysis (Cloud Vision + Gemini)",
    icon: Image,
  },
  stories: {
    label: "Stories",
    description: "Text AI for stories (polish, translate, prompts)",
    icon: FileText,
  },
  directory: {
    label: "Directory",
    description: "AI content generation for directory entries",
    icon: MapPin,
  },
};

export function AiDashboardPanel() {
  const { data, isLoading, error } = useAiHealth();
  const toast = useToast();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="bg-surface rounded-card border-hairline flex flex-col items-center justify-center border p-12">
        <AlertTriangle className="text-status-error mb-3 h-8 w-8" />
        <p className="text-body font-medium">Failed to load AI health data</p>
        <p className="text-muted mt-1 text-sm">
          {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Global Status Banner */}
      <div
        className={clsx(
          "rounded-card flex items-center gap-3 px-5 py-4",
          data.enabled
            ? "bg-valley-green/10 text-valley-green"
            : "bg-status-error/10 text-status-error"
        )}
      >
        {data.enabled ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0" />
        )}
        <span className="font-medium">
          AI is globally {data.enabled ? "enabled" : "disabled"}
        </span>
      </div>

      {/* Provider Cards */}
      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">Providers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.providers.map((provider) => (
            <ProviderCard key={provider.name} provider={provider} />
          ))}
        </div>
      </section>

      {/* Domain Toggle Cards */}
      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">
          Domain Toggles
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.domains.map((domain) => (
            <DomainCard key={domain.domain} config={domain} toast={toast} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProviderCard({ provider }: { provider: AiProviderHealth }) {
  const usageColor =
    provider.usage.percentUsed >= 90
      ? "bg-status-error"
      : provider.usage.percentUsed >= 70
        ? "bg-status-warning"
        : "bg-valley-green";

  return (
    <div className="bg-surface rounded-card border-hairline shadow-subtle border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-body font-medium">{provider.name}</h3>
        <span
          className={clsx(
            "rounded-badge px-2 py-0.5 text-xs font-medium",
            provider.enabled
              ? "bg-valley-green/15 text-valley-green"
              : "bg-status-error/15 text-status-error"
          )}
        >
          {provider.enabled ? "Active" : "Disabled"}
        </span>
      </div>

      {/* Capabilities */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {provider.capabilities.map((cap) => (
          <span
            key={cap}
            className="bg-surface-alt text-muted rounded-badge px-2 py-0.5 text-xs"
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Usage Bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted">
            {provider.usage.count} / {provider.usage.limit}
          </span>
          <span className="text-muted">
            {provider.usage.percentUsed.toFixed(1)}%
          </span>
        </div>
        <div className="bg-surface-alt h-2 overflow-hidden rounded-full">
          <div
            className={clsx("h-full rounded-full transition-all", usageColor)}
            style={{
              width: `${Math.min(provider.usage.percentUsed, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DomainCard({
  config,
  toast,
}: {
  config: AiDomainConfig;
  toast: ReturnType<typeof useToast>;
}) {
  const mutation = useUpdateAiDomainConfig();
  const meta = DOMAIN_META[config.domain];
  const Icon = meta?.icon ?? FileText;

  const handleToggle = () => {
    mutation.mutate(
      { domain: config.domain, request: { enabled: !config.enabled } },
      {
        onSuccess: (updated) => {
          toast
            .success(
              `${meta?.label ?? config.domain} AI ${updated.enabled ? "enabled" : "disabled"}`
            )
            .show();
        },
        onError: (err) => {
          toast.error(`Failed to toggle: ${err.message}`).show();
        },
      }
    );
  };

  return (
    <div className="bg-surface rounded-card border-hairline shadow-subtle border p-5">
      <div className="mb-2 flex items-center gap-3">
        <Icon className="text-muted h-5 w-5 shrink-0" />
        <h3 className="text-body font-medium">
          {meta?.label ?? config.domain}
        </h3>
      </div>
      <p className="text-muted mb-4 text-sm">
        {meta?.description ?? `AI features for ${config.domain}`}
      </p>
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "text-xs font-medium",
            config.enabled ? "text-valley-green" : "text-muted"
          )}
        >
          {config.enabled ? "Enabled" : "Disabled"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled}
          disabled={mutation.isPending}
          onClick={handleToggle}
          className={clsx(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2",
            config.enabled ? "bg-valley-green" : "bg-surface-alt",
            mutation.isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={clsx(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
              config.enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
          {mutation.isPending && (
            <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Status banner skeleton */}
      <div className="bg-surface-alt rounded-card h-14" />

      {/* Provider section skeleton */}
      <div>
        <div className="bg-surface-alt mb-4 h-6 w-24 rounded" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-card border-hairline border h-40"
            />
          ))}
        </div>
      </div>

      {/* Domain section skeleton */}
      <div>
        <div className="bg-surface-alt mb-4 h-6 w-36 rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-card border-hairline border h-36"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
