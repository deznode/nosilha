"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Image as ImageIcon,
  Play,
  Plus,
  Search,
  X,
  Shuffle,
  Loader2,
  LayoutGrid,
  CalendarDays,
  MapPin,
  Check,
} from "lucide-react";
import { clsx } from "clsx";
import { MasonryPhotoGrid, VideoSection } from "@/components/gallery";
import { FeaturedPhotoCard } from "@/components/gallery/featured-photo-card";
import { WeeklyDiscoverySection } from "@/components/gallery/weekly-discovery-section";
import { TimelineView } from "@/components/gallery/timeline-view";
import { Select } from "@/components/ui/select";
import { FilterChip } from "@/components/ui/filter-chip";
import { FilterBottomSheet } from "@/components/ui/filter-bottom-sheet";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { mediaItemToPhoto } from "@/components/gallery/masonry-photo-grid";
import { useGalleryInfiniteQuery } from "@/hooks/queries/useGalleryInfiniteQuery";
import { getRandomGalleryMedia } from "@/lib/api";
import { mapGalleryMediaToMediaItem } from "@/lib/gallery-mappers";
import type {
  PublicGalleryMedia,
  TimelineResponse,
  DecadeFilter,
  GalleryView,
} from "@/types/gallery";
import type { MediaCategory } from "@/types/media";
import { GALLERY_CATEGORIES } from "@/types/media";

const GalleryMapCanvas = dynamic(
  () =>
    import("@/components/gallery/gallery-map-canvas").then(
      (mod) => mod.GalleryMapCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-alt rounded-card flex h-[60vh] min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-brand h-8 w-8 animate-spin" />
          <p className="text-muted text-sm">Loading map...</p>
        </div>
      </div>
    ),
  }
);

function formatSearchStatus(query: string, totalItems: number): string {
  if (totalItems === 0) {
    return `No results for \u201c${query}\u201d`;
  }
  const plural = totalItems !== 1 ? "s" : "";
  return `${totalItems} result${plural} for \u201c${query}\u201d`;
}

const ERA_OPTIONS: { value: DecadeFilter; label: string }[] = [
  { value: "all", label: "All Eras" },
  { value: "pre-1975", label: "Pre-1975" },
  { value: "1975-1990", label: "1975\u20131990" },
  { value: "1990-2010", label: "1990\u20132010" },
  { value: "2010-plus", label: "2010+" },
];

interface GalleryContentProps {
  categories: string[];
  initialTab: "photos" | "videos";
  initialCategory: MediaCategory | "All";
  initialDecade: DecadeFilter;
  initialQuery: string;
  initialView?: GalleryView;
  featuredPhoto?: PublicGalleryMedia | null;
  weeklyPhotos?: PublicGalleryMedia[];
  timelineData?: TimelineResponse | null;
}

export function GalleryContent({
  categories,
  initialTab,
  initialCategory,
  initialDecade,
  initialQuery,
  initialView = "grid",
  featuredPhoto,
  weeklyPhotos,
  timelineData,
}: GalleryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"photos" | "videos">(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | "All">(
    initialCategory
  );
  const [decadeFilter, setDecadeFilter] = useState<DecadeFilter>(initialDecade);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeView, setActiveView] = useState<GalleryView>(initialView);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [surprisePhoto, setSurprisePhoto] = useState<
    import("@/components/ui/image-lightbox").Photo | null
  >(null);
  const [mapLightboxIndex, setMapLightboxIndex] = useState<number | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{
    lat: number;
    lng: number;
    photoId: string;
  } | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!initialQuery);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MediaCategory | "All">(
    initialCategory
  );

  const handleSurpriseMe = async () => {
    setSurpriseLoading(true);
    try {
      const items = await getRandomGalleryMedia(1);
      if (items.length > 0) {
        const mediaItem = mapGalleryMediaToMediaItem(items[0]);
        setSurprisePhoto(mediaItemToPhoto(mediaItem));
      }
    } finally {
      setSurpriseLoading(false);
    }
  };

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const {
    items: allItems,
    totalItems,
    isPlaceholderData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useGalleryInfiniteQuery({
    filters: {
      category: categoryFilter !== "All" ? categoryFilter : undefined,
      decade: decadeFilter !== "all" ? decadeFilter : undefined,
      q: debouncedQuery || undefined,
      hasGeo: activeView === "map" ? true : undefined,
    },
  });

  const photos = useMemo(
    () => allItems.filter((item) => item.type === "IMAGE"),
    [allItems]
  );
  const videos = useMemo(
    () => allItems.filter((item) => item.type === "VIDEO"),
    [allItems]
  );

  // Track loaded page count for URL sync
  const loadedPages = useMemo(() => {
    if (!allItems.length) return 0;
    return Math.ceil(allItems.length / 24) - 1;
  }, [allItems.length]);

  const updateUrl = useCallback(
    (
      tab: "photos" | "videos",
      category: MediaCategory | "All",
      decade: DecadeFilter,
      query?: string,
      page?: number,
      view?: GalleryView
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab !== "photos") {
        params.set("tab", tab);
      } else {
        params.delete("tab");
      }
      if (category !== "All") {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      if (decade !== "all") {
        params.set("decade", decade);
      } else {
        params.delete("decade");
      }
      const q = query !== undefined ? query : debouncedQuery;
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      const p = page !== undefined ? page : loadedPages;
      if (p > 0) {
        params.set("page", String(p));
      } else {
        params.delete("page");
      }
      const v = view !== undefined ? view : activeView;
      if (v !== "grid") {
        params.set("view", v);
      } else {
        params.delete("view");
      }
      const qs = params.toString();
      router.replace(`/gallery${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams, debouncedQuery, loadedPages, activeView]
  );

  // Sync URL when debounced query or loaded pages change
  useEffect(() => {
    updateUrl(
      activeTab,
      categoryFilter,
      decadeFilter,
      debouncedQuery,
      loadedPages
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, loadedPages]);

  const handleTabChange = (tab: "photos" | "videos") => {
    setActiveTab(tab);
    updateUrl(tab, categoryFilter, decadeFilter);
  };

  const handleCategoryChange = (category: MediaCategory | "All") => {
    setCategoryFilter(category);
    updateUrl(activeTab, category, decadeFilter);
  };

  const handleDecadeChange = (decade: DecadeFilter) => {
    setDecadeFilter(decade);
    updateUrl(activeTab, categoryFilter, decade);
  };

  const handleViewChange = (view: GalleryView) => {
    if (activeView === "map" && view !== "map") {
      setFlyToCoords(null);
    }
    setActiveView(view);
    updateUrl(
      activeTab,
      categoryFilter,
      decadeFilter,
      undefined,
      undefined,
      view
    );
  };

  const handleTimelineDecadeSelect = (decade: string) => {
    const decadeVal = decade as DecadeFilter;
    setDecadeFilter(decadeVal);
    setActiveView("grid");
    updateUrl(
      activeTab,
      categoryFilter,
      decadeVal,
      undefined,
      undefined,
      "grid"
    );
  };

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedQuery("");
  };

  // Compute era counts from loaded photos
  const eraCounts = useMemo(() => {
    const counts = new Map<DecadeFilter, number>();
    counts.set("all", photos.length);
    for (const photo of photos) {
      const year = photo.dateTaken
        ? new Date(photo.dateTaken).getFullYear()
        : photo.approximateDate
          ? parseInt(photo.approximateDate.match(/(\d{4})/)?.[1] ?? "0", 10)
          : null;
      if (year && year > 0) {
        if (year < 1975) {
          counts.set("pre-1975", (counts.get("pre-1975") ?? 0) + 1);
        } else if (year < 1990) {
          counts.set("1975-1990", (counts.get("1975-1990") ?? 0) + 1);
        } else if (year < 2010) {
          counts.set("1990-2010", (counts.get("1990-2010") ?? 0) + 1);
        } else {
          counts.set("2010-plus", (counts.get("2010-plus") ?? 0) + 1);
        }
      }
    }
    return counts;
  }, [photos]);

  const geoTaggedCount = useMemo(
    () =>
      photos.filter((p) => p.latitude != null && p.longitude != null).length,
    [photos]
  );

  const resolvedCategories: MediaCategory[] =
    categories.length > 0
      ? (categories as MediaCategory[])
      : GALLERY_CATEGORIES;

  const eraOptions = useMemo(
    () =>
      ERA_OPTIONS.map((era) => ({
        value: era.value,
        label:
          era.value !== "all" && eraCounts.has(era.value)
            ? `${era.label} (${eraCounts.get(era.value)})`
            : era.label,
      })),
    [eraCounts]
  );

  const categoryOptions = useMemo(
    () =>
      (["All", ...resolvedCategories] as string[]).map((cat) => ({
        value: cat,
        label: cat === "All" ? "All Categories" : cat,
      })),
    [resolvedCategories]
  );

  const hasActiveFilters = decadeFilter !== "all" || categoryFilter !== "All";

  const clearAllFilters = () => {
    setDecadeFilter("all");
    setCategoryFilter("All");
    updateUrl(activeTab, "All", "all");
  };

  const contributors = useMemo(
    () => new Set(allItems.map((item) => item.author).filter(Boolean)),
    [allItems]
  );

  return (
    <div className="bg-canvas min-h-screen pb-12">
      {/* Header */}
      <div className="bg-basalt-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-4 font-serif text-3xl font-bold md:text-5xl">
                Brava Media Center
              </h1>
              <p className="hidden max-w-2xl text-lg font-light text-white/70 sm:block">
                A visual archive of our island. Explore historical photographs,
                community moments, and videos celebrating the culture of Brava.
              </p>
              {totalItems > 0 && (
                <p className="mt-2 hidden text-sm text-white/50 sm:block">
                  Exploring {totalItems} items
                  {contributors.size > 1
                    ? ` from ${contributors.size} contributors`
                    : ""}{" "}
                  in the Brava visual archive
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={handleSurpriseMe}
                disabled={surpriseLoading || totalItems === 0}
                className="rounded-button flex items-center gap-2 border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-white/60 hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {surpriseLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Shuffle size={18} />
                )}
                <span className="hidden sm:inline">Surprise Me</span>
              </button>
              <Link
                href="/contribute/media"
                className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button shadow-subtle flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add to Archive</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Toolbar */}
      <div className="border-hairline bg-canvas shadow-subtle sticky top-16 z-30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Row 1: Tabs + search icon + view toggle */}
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 space-x-8">
              <button
                onClick={() => handleTabChange("photos")}
                className={clsx(
                  "flex shrink-0 items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                  activeTab === "photos"
                    ? "border-ocean-blue text-ocean-blue"
                    : "text-muted hover:border-hairline hover:text-body border-transparent"
                )}
              >
                <ImageIcon size={18} />
                <span className={clsx(isSearchExpanded && "hidden sm:inline")}>
                  Photos
                  <span className="hidden sm:inline"> ({photos.length})</span>
                </span>
              </button>
              <button
                onClick={() => handleTabChange("videos")}
                className={clsx(
                  "flex shrink-0 items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                  activeTab === "videos"
                    ? "border-bougainvillea-pink text-bougainvillea-pink"
                    : "text-muted hover:border-hairline hover:text-body border-transparent"
                )}
              >
                <Play size={18} />
                <span className={clsx(isSearchExpanded && "hidden sm:inline")}>
                  Videos
                  <span className="hidden sm:inline"> ({videos.length})</span>
                </span>
              </button>

              {/* Inline search (mobile: expandable, desktop: always visible) */}
              {isSearchExpanded ? (
                <div className="flex min-w-0 flex-1 items-center gap-1 py-2">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={16}
                      className="text-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                    />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search..."
                      autoFocus
                      className="border-hairline bg-surface text-body placeholder:text-muted focus:border-ocean-blue focus:ring-ocean-blue/20 rounded-button w-full border py-1.5 pr-8 pl-8 text-sm transition-colors focus:ring-2 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        clearSearch();
                        setIsSearchExpanded(false);
                      }}
                      className="text-muted hover:text-body absolute top-1/2 right-2 -translate-y-1/2"
                      aria-label="Close search"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="text-muted hover:text-body flex shrink-0 items-center self-center p-2 md:hidden"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Desktop search (always visible) */}
            <div className="relative mx-4 hidden w-56 md:block">
              <Search
                size={16}
                className="text-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search photos, videos..."
                className="border-hairline bg-surface text-body placeholder:text-muted focus:border-ocean-blue focus:ring-ocean-blue/20 rounded-button w-full border py-1.5 pr-8 pl-8 text-sm transition-colors focus:ring-2 focus:outline-none"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="text-muted hover:text-body absolute top-1/2 right-2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* View Toggle (photos tab only) */}
            {activeTab === "photos" && (
              <div className="border-hairline flex shrink-0 items-center gap-0.5 rounded-lg border p-0.5">
                <button
                  onClick={() => handleViewChange("grid")}
                  aria-label="Grid view"
                  aria-pressed={activeView === "grid"}
                  className={clsx(
                    "rounded-md p-1.5 transition-colors",
                    activeView === "grid"
                      ? "bg-ocean-blue text-white"
                      : "text-muted hover:text-body"
                  )}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => handleViewChange("timeline")}
                  aria-label="Timeline view"
                  aria-pressed={activeView === "timeline"}
                  className={clsx(
                    "rounded-md p-1.5 transition-colors",
                    activeView === "timeline"
                      ? "bg-ocean-blue text-white"
                      : "text-muted hover:text-body"
                  )}
                >
                  <CalendarDays size={16} />
                </button>
                <button
                  onClick={() => handleViewChange("map")}
                  aria-label="Map view"
                  aria-pressed={activeView === "map"}
                  title={`Map (${geoTaggedCount} photo${geoTaggedCount !== 1 ? "s" : ""} with locations)`}
                  className={clsx(
                    "rounded-md p-1.5 transition-colors",
                    activeView === "map"
                      ? "bg-ocean-blue text-white"
                      : "text-muted hover:text-body"
                  )}
                >
                  <MapPin size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Row 2: Filter chips (photos tab, grid/map view only) */}
          {activeTab === "photos" && activeView !== "timeline" && (
            <div className="border-hairline -mx-4 border-t px-4 sm:mx-0 sm:px-0">
              {/* Mobile: chip bar */}
              <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-2 md:hidden">
                {ERA_OPTIONS.map((era) => (
                  <FilterChip
                    key={era.value}
                    label={era.label}
                    active={decadeFilter === era.value}
                    count={eraCounts.get(era.value)}
                    onClick={() => handleDecadeChange(era.value)}
                  />
                ))}
                <FilterChip
                  label={categoryFilter === "All" ? "Category" : categoryFilter}
                  active={categoryFilter !== "All"}
                  onClick={() => {
                    setPendingCategory(categoryFilter);
                    setIsCategorySheetOpen(true);
                  }}
                  onClear={
                    categoryFilter !== "All"
                      ? () => handleCategoryChange("All")
                      : undefined
                  }
                />
                {hasActiveFilters && (
                  <FilterChip label="Clear" onClick={clearAllFilters} />
                )}
              </div>

              {/* Desktop: selects */}
              <div className="hidden items-center gap-3 py-2 md:flex">
                <Select
                  options={eraOptions}
                  value={decadeFilter}
                  onChange={(val) => handleDecadeChange(val as DecadeFilter)}
                  name="era-filter"
                />
                <Select
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(val) =>
                    handleCategoryChange(val as MediaCategory | "All")
                  }
                  name="category-filter"
                />
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-muted hover:text-body flex items-center gap-1 text-sm transition-colors"
                  >
                    <X size={14} />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search status (inline) */}
          {debouncedQuery && (
            <p
              className="text-muted border-hairline border-t py-1.5 text-xs"
              role="status"
            >
              {formatSearchStatus(
                debouncedQuery,
                activeTab === "photos" ? photos.length : videos.length
              )}
            </p>
          )}
        </div>
      </div>

      {/* Category Bottom Sheet (mobile) */}
      <FilterBottomSheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        title="Select Category"
        onApply={() => {
          handleCategoryChange(pendingCategory);
          setIsCategorySheetOpen(false);
        }}
        onClear={() => setPendingCategory("All")}
      >
        <div className="flex flex-col">
          {(["All", ...resolvedCategories] as string[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setPendingCategory(cat as MediaCategory | "All")}
              className={clsx(
                "flex items-center justify-between px-2 py-3 text-left text-sm transition-colors",
                pendingCategory === cat
                  ? "text-ocean-blue font-medium"
                  : "text-body"
              )}
            >
              <span>{cat === "All" ? "All Categories" : cat}</span>
              {pendingCategory === cat && (
                <Check size={18} className="text-ocean-blue shrink-0" />
              )}
            </button>
          ))}
        </div>
      </FilterBottomSheet>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Photo Gallery */}
        {activeTab === "photos" && (
          <>
            {activeView === "map" ? (
              <GalleryMapCanvas
                photos={photos}
                onPhotoSelect={(photo) => {
                  const idx = photos.findIndex((p) => p.id === photo.id);
                  if (idx >= 0) setMapLightboxIndex(idx);
                }}
                selectedPhotoId={
                  mapLightboxIndex !== null
                    ? photos[mapLightboxIndex]?.id
                    : undefined
                }
                flyToCoords={flyToCoords}
                onViewChange={handleViewChange}
                hasActiveFilters={hasActiveFilters || !!debouncedQuery}
                onClearFilters={clearAllFilters}
              />
            ) : activeView === "timeline" && timelineData ? (
              <TimelineView
                timeline={timelineData}
                onDecadeSelect={handleTimelineDecadeSelect}
              />
            ) : (
              <>
                {/* Featured Photo of the Day — hidden when filtering */}
                {!hasActiveFilters && !debouncedQuery && featuredPhoto && (
                  <div className="mb-6">
                    <FeaturedPhotoCard photo={featuredPhoto} />
                  </div>
                )}

                {/* Weekly Discovery — hidden when filtering */}
                {!hasActiveFilters &&
                  !debouncedQuery &&
                  weeklyPhotos &&
                  weeklyPhotos.length >= 3 && (
                    <WeeklyDiscoverySection photos={weeklyPhotos} />
                  )}

                <MasonryPhotoGrid
                  photos={photos}
                  categoryFilter={categoryFilter}
                  totalItems={totalItems}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage || isLoading}
                  isPlaceholderData={isPlaceholderData}
                  onLoadMore={() => fetchNextPage()}
                  searchQuery={debouncedQuery}
                />
              </>
            )}
          </>
        )}

        {/* Video Archive */}
        {activeTab === "videos" && <VideoSection videos={videos} />}
      </div>

      {/* Surprise Me Lightbox */}
      {surprisePhoto && (
        <ImageLightbox
          photos={[surprisePhoto]}
          initialIndex={0}
          isOpen={true}
          onClose={() => setSurprisePhoto(null)}
        />
      )}

      {/* Map Photo Lightbox */}
      {mapLightboxIndex !== null && (
        <ImageLightbox
          photos={photos.map(mediaItemToPhoto)}
          initialIndex={mapLightboxIndex}
          isOpen={true}
          onClose={() => setMapLightboxIndex(null)}
          onShowOnMap={(lat, lng, photoId) => {
            setMapLightboxIndex(null);
            handleViewChange("map");
            setFlyToCoords({ lat, lng, photoId });
          }}
        />
      )}
    </div>
  );
}
