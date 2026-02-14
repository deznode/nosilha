"use client";

import { useState } from "react";
import { Search, ExternalLink, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useR2Objects } from "@/hooks/queries/admin";
import { Button } from "@/components/catalyst-ui/button";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Browse Tab — lists objects in the R2 bucket with prefix filtering
 * and continuation-token pagination.
 */
export function BrowseTab() {
  const [prefix, setPrefix] = useState("");
  const [continuationToken, setContinuationToken] = useState<
    string | undefined
  >(undefined);

  const { data, isLoading, isFetching } = useR2Objects({
    prefix: prefix || undefined,
    continuationToken,
    maxKeys: 100,
  });

  const handlePrefixChange = (value: string) => {
    setPrefix(value);
    setContinuationToken(undefined);
  };

  const handleLoadMore = () => {
    if (data?.continuationToken) {
      setContinuationToken(data.continuationToken);
    }
  };

  return (
    <div className="space-y-4">
      {/* Prefix Filter */}
      <div className="relative">
        <Search
          className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Filter by prefix (e.g. gallery/uploads/)"
          value={prefix}
          onChange={(e) => handlePrefixChange(e.target.value)}
          className="border-hairline bg-canvas text-body placeholder:text-muted focus:ring-ocean-blue rounded-button w-full border py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-alt h-16 animate-pulse rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data && data.objects.length === 0 && (
        <div className="border-hairline flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted text-sm">
            No objects found{prefix ? ` with prefix "${prefix}"` : ""}
          </p>
        </div>
      )}

      {/* Object List */}
      {!isLoading && data && data.objects.length > 0 && (
        <>
          <p className="text-muted text-xs">
            {data.objects.length} objects
            {data.isTruncated ? " (more available)" : ""}
            {isFetching && !isLoading ? " — refreshing..." : ""}
          </p>
          <div className="divide-hairline divide-y">
            {data.objects.map((obj) => (
              <div
                key={obj.key}
                className="hover:bg-surface-alt flex items-center justify-between gap-4 py-3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="text-body truncate text-sm font-medium"
                    title={obj.key}
                  >
                    {obj.key}
                  </p>
                  <p className="text-muted text-xs">
                    {formatBytes(obj.size)} &middot;{" "}
                    {formatDate(obj.lastModified)}
                  </p>
                </div>
                <a
                  href={obj.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    "text-ocean-blue hover:text-ocean-blue/80 flex shrink-0 items-center gap-1 text-xs",
                    "transition-colors"
                  )}
                >
                  View
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>

          {/* Load More */}
          {data.isTruncated && (
            <div className="flex justify-center pt-2">
              <Button
                outline
                onClick={handleLoadMore}
                disabled={isFetching}
              >
                <ChevronDown data-slot="icon" />
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
