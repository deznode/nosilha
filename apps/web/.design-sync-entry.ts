// design-sync bundle entry.
//
// Nos Ilha has no published component package, so the converter would
// otherwise synthesize an entry from EVERY .tsx under src/ — dragging in
// admin screens, route handlers and server-only modules. This barrel is the
// explicit public surface that gets bundled to window.NosIlha instead.
//
// Scope for this sync is the palette test-case set from
// docs/10-product/theme-palette-brief.md §6. Adding a component here and to
// cfg.componentSrcMap in .design-sync/config.json is all it takes to widen it.
//
// Passed to package-build.mjs via --entry; keep it inside apps/web so
// PKG_DIR resolves to this package rather than the repo root.

/* ── Directory (brief §6 cases 1, 2, 7) ─────────────────────────────── */
export { DirectoryCard } from "@/components/directory/directory-card";
export { ListViewCard } from "@/components/directory/list-view-card";
export { FilterToolbar } from "@/components/directory/filter-toolbar";
export { ViewToggle } from "@/components/directory/view-toggle";
export { BookmarkButton } from "@/components/directory/bookmark-button";

/* ── Empty / loading surfaces (brief §4.4) ──────────────────────────── */
export { DirectoryCardSkeleton } from "@/components/ui/directory-card-skeleton";
export { DirectoryGridSkeleton } from "@/components/ui/directory-grid-skeleton";
export { LoadingSpinner, LoadingDots, LoadingPulse } from "@/components/ui/loading-spinner";

/* ── Filtering chrome (brief §6 case 7) ─────────────────────────────── */
export { FilterBottomSheet } from "@/components/ui/filter-bottom-sheet";
export { FilterChip } from "@/components/ui/filter-chip";

/* ── Status + feedback (brief §6 case 8) ────────────────────────────── */
export { default as Banner } from "@/components/ui/banner";
export { Toast } from "@/components/ui/toast/toast";
export { ToastContent } from "@/components/ui/toast/toast-content";
export { ToastAction } from "@/components/ui/toast/toast-action";

/* ── Entry detail page surfaces (brief §6 case 3) ───────────────────── */
export { Card } from "@/components/ui/card";
export { PageHeader } from "@/components/ui/page-header";
export { CitationSection } from "@/components/ui/citation-section";
export { ExpandableText } from "@/components/ui/expandable-text";
export { CreditDisplay } from "@/components/ui/credit-display";
export { FeatureCard } from "@/components/ui/feature-card";
export { default as StarRating } from "@/components/ui/start-rating";
export { Pagination } from "@/components/ui/pagination";
export { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tab-group";
export { Tooltip } from "@/components/ui/tooltip";
export { NosilhaLogo } from "@/components/ui/logo";

/* ── Gallery (brief §6 cases 4, 5) ──────────────────────────────────── */
export { MasonryPhotoGrid, MasonryPhotoGridSkeleton } from "@/components/gallery/masonry-photo-grid";
export { TimelineView } from "@/components/gallery/timeline-view";
export { FeaturedPhotoCard } from "@/components/gallery/featured-photo-card";
export { MetadataBadges } from "@/components/gallery/metadata-badges";
export { CompactVideoCard } from "@/components/gallery/compact-video-card";
export { VideoGrid } from "@/components/gallery/video-grid";

/* ── Map chrome (brief §6 case 6) ───────────────────────────────────────
 * map-canvas / brava-map are deliberately excluded: maplibre needs WebGL and
 * live tiles, so a static card can only ever show an empty canvas. Map colour
 * decisions belong in palette.json's `map` group (brief §4.5).            */
export { LocationCard } from "@/features/map/components/location-card";
export { LocationDetailCard } from "@/features/map/components/location-detail-card";
export { LocationBottomSheet } from "@/features/map/components/location-bottom-sheet";
export { CategoryPill } from "@/features/map/components/category-pill";
export { MapControls } from "@/features/map/components/map-controls";
export { MapHeader } from "@/features/map/components/map-header";

/* ── The app's own primitives ───────────────────────────────────────────
 * AnimatedButton — not Catalyst's Button — is what the specimen gallery and
 * the product actually use for actions. Catalyst's Button ships too because
 * AnimatedButton composes the same visual language and some surfaces still
 * reach for it directly.                                                  */
export { AnimatedButton } from "@/components/ui/animated-button";
export { Avatar, AvatarGroup, AvatarButton } from "@/components/ui/avatar";
export { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
export { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";

/* ── Form + action primitives (Tailwind Catalyst) ───────────────────── */
export { Button } from "@/components/catalyst-ui/button";
export { Badge, BadgeButton } from "@/components/catalyst-ui/badge";
export { Input, InputGroup } from "@/components/catalyst-ui/input";
export { Checkbox, CheckboxField, CheckboxGroup } from "@/components/catalyst-ui/checkbox";
export { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/catalyst-ui/dialog";
export {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
} from "@/components/catalyst-ui/dropdown";
export { Popover, PopoverButton, PopoverPanel, PopoverGroup } from "@/components/catalyst-ui/popover";
export { Field, Label, Description, ErrorMessage } from "@/components/catalyst-ui/fieldset";
export { Select } from "@/components/ui/select";
export { Textarea } from "@/components/ui/textarea";
