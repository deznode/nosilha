"use client";

import { clsx } from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
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
      {/* Global AI Toggle */}
      <GlobalToggleCard enabled={data.enabled} />

      {/* Provider Cards */}
      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">Providers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.providers.map((provider) => (
            <ProviderCard key={provider.name} provider={provider} />
          ))}
        </div>
      </section>

      {/* Domain Toggle Cards */}
      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">Domain Toggles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.domains.map((domain) => (
            <DomainCard
              key={domain.domain}
              config={domain}
              globalEnabled={data.enabled}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface GlobalToggleCardProps {
  enabled: boolean;
}

function GlobalToggleCard({ enabled }: GlobalToggleCardProps) {
  const toast = useToast();
  const mutation = useUpdateAiDomainConfig();

  const handleToggle = () => {
    mutation.mutate(
      { domain: "global", request: { enabled: !enabled } },
      {
        onSuccess: (updated) => {
          toast
            .success(`AI globally ${updated.enabled ? "enabled" : "disabled"}`)
            .show();
        },
        onError: (err) => {
          toast.error(`Failed to toggle: ${err.message}`).show();
        },
      }
    );
  };

  return (
    <div
      className={clsx(
        "rounded-card border-2 p-6",
        enabled
          ? "border-valley-green/30 bg-valley-green/5"
          : "border-status-error/30 bg-status-error/5"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <CheckCircle2 className="text-valley-green h-6 w-6 shrink-0" />
          ) : (
            <AlertTriangle className="text-status-error h-6 w-6 shrink-0" />
          )}
          <div>
            <h2 className="text-body text-lg font-semibold">
              Global AI {enabled ? "Enabled" : "Disabled"}
            </h2>
            <p className="text-muted text-sm">
              {enabled
                ? "All AI features are operational"
                : "All AI operations are disabled across all domains"}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`${enabled ? "Disable" : "Enable"} global AI`}
          disabled={mutation.isPending}
          onClick={handleToggle}
          className={clsx(
            "focus:ring-ocean-blue relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none",
            enabled ? "bg-valley-green" : "bg-status-error/60",
            mutation.isPending && "cursor-not-allowed opacity-50"
          )}
        >
          <span
            className={clsx(
              "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
              enabled ? "translate-x-7" : "translate-x-0"
            )}
          />
          {mutation.isPending && (
            <Loader2 className="absolute inset-0 m-auto h-3.5 w-3.5 animate-spin text-white" />
          )}
        </button>
      </div>
      {!enabled && (
        <p className="text-status-error/80 mt-3 text-xs font-medium">
          Warning: Domain-level toggles below have no effect while global AI is
          disabled.
        </p>
      )}
    </div>
  );
}

function usageBarColor(percentUsed: number): string {
  if (percentUsed >= 90) return "bg-status-error";
  if (percentUsed >= 70) return "bg-status-warning";
  return "bg-valley-green";
}

function ProviderCard({ provider }: { provider: AiProviderHealth }) {
  const usageColor = usageBarColor(provider.usage.percentUsed);

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

interface DomainCardProps {
  config: AiDomainConfig;
  globalEnabled: boolean;
}

function DomainCard({ config, globalEnabled }: DomainCardProps) {
  const toast = useToast();
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
        <div>
          <span
            className={clsx(
              "text-xs font-medium",
              config.enabled ? "text-valley-green" : "text-muted"
            )}
          >
            {config.enabled ? "Enabled" : "Disabled"}
          </span>
          {!globalEnabled && (
            <span className="text-status-error/70 ml-2 text-xs italic">
              Overridden — global AI is off
            </span>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled}
          aria-label={`${config.enabled ? "Disable" : "Enable"} AI for ${meta?.label ?? config.domain}`}
          disabled={mutation.isPending}
          onClick={handleToggle}
          className={clsx(
            "focus:ring-ocean-blue relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none",
            config.enabled ? "bg-valley-green" : "bg-surface-alt",
            mutation.isPending && "cursor-not-allowed opacity-50"
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
    <div className="animate-pulse space-y-8">
      {/* Status banner skeleton */}
      <div className="bg-surface-alt rounded-card h-14" />

      {/* Provider section skeleton */}
      <div>
        <div className="bg-surface-alt mb-4 h-6 w-24 rounded" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-card border-hairline h-40 border"
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
              className="bg-surface rounded-card border-hairline h-36 border"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
