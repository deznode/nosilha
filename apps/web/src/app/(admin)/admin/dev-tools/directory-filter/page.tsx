"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FilterToolbar } from "@/components/directory/filter-toolbar";
import type { SortBy } from "@/components/directory/filter-toolbar";
import { ListViewCard } from "@/components/directory/list-view-card";
import { ViewToggle } from "@/components/directory/view-toggle";
import type { ViewMode } from "@/components/directory/view-toggle";
import { DirectoryCard } from "@/components/directory/directory-card";
import { getEntriesByCategory } from "@/lib/api";
import type { DirectoryEntry } from "@/types/directory";

export default function DirectoryFilterDevPage() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTown, setSelectedTown] = useState("All");
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { items } = await getEntriesByCategory("all");
        if (mounted) setEntries(items);
      } catch (err) {
        console.error("Failed to load entries:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const towns = [...new Set(entries.map((e) => e.town))].sort();
  const filtered = entries.filter((e) => {
    const matchesSearch =
      !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTown = selectedTown === "All" || e.town === selectedTown;
    return matchesSearch && matchesTown;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Directory Filter</h1>
      <p className="text-muted mb-8">
        FilterToolbar with DirectoryCard grid, ListViewCard list, and ViewToggle
        switcher.
      </p>

      <section className="mb-6">
        <h2 className="text-body mb-4 text-lg font-semibold">
          ViewToggle (standalone)
        </h2>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </section>

      <section className="mb-6">
        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          towns={["All", ...towns]}
          selectedTown={selectedTown}
          onTownChange={setSelectedTown}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filtered.length}
        />
      </section>

      {loading && (
        <p className="text-muted py-12 text-center">
          Loading entries from mock API...
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-muted py-12 text-center">
          No entries match your filters.
        </p>
      )}

      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((entry) => (
            <DirectoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && viewMode === "list" && (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <ListViewCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
