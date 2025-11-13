<!-- Layout: Component Gallery Dashboard -->

Design a web dashboard displaying a browsable catalog of extracted UI components in a responsive card grid layout with navigation to detail pages.

- Responsive grid layout adjusting from 1 column (mobile) to 2 columns (tablet) to 3-4 columns (desktop) based on viewport width
- Each component card contains: preview image thumbnail (16:9 ratio, top section), component name (bold heading below image), framework badge (React/Vue/etc. with icon), Tailwind version badge (small pill), category label (subtle text), tag chips (wrapped horizontally at bottom)
- Navigation header with logo/title "UI Components Catalog" and links to Gallery, Statistics, and Admin pages
- Empty state displays centered message "No components yet. Run a crawl to get started" with friendly illustration when catalog is empty
- Loading state shows skeleton cards with shimmer animation (gray placeholder blocks) while data fetches
- Page footer with catalog totals ("Showing 156 components") and last updated timestamp

**Visual Style**
Modern clean design with white/light gray background, component cards have subtle shadows (elevation 2), rounded corners (8px), hover state increases shadow (elevation 4) with smooth transition (200ms), framework badges use brand colors (React blue #61DAFB, Vue green #42B883), Tailwind badge in teal (#38BDF8), tags as small rounded pills with light gray background.

**Responsive & Interactions**
Cards clickable navigating to component detail page, lazy loading for preview images with fade-in animation, infinite scroll or pagination for large catalogs, mobile-first responsive breakpoints (640px, 768px, 1024px), smooth hover transitions with slight scale (1.02x) on cards.

---

<!-- Component: Search & Filter Bar -->

Design a sticky search and filter interface positioned above the component gallery for keyword searching and category filtering with real-time results.

- Horizontal bar layout with search input (60% width, left-aligned) and filter dropdowns (40% width, right-aligned)
- Search input has magnifying glass icon (left), placeholder "Search components, tags, categories...", clear "×" button (right, appears when input has text)
- Filter dropdowns include: Category (All/Buttons/Forms/Navigation/etc.), Framework (All/React/Vue/Svelte/etc.), Tailwind Version (All/v3/v2/etc.)
- Active filters display as dismissible badges below search bar with "×" close button and blue background
- Results count indicator shows "Found 23 components" in subtle gray text below filters
- "Clear all filters" text link appears when filters are active

**Visual Style**
White background with subtle bottom border shadow for sticky appearance, search input has light gray border with blue focus ring, filter dropdowns with chevron icons, active filter badges use primary blue (#3B82F6) with white text, results count in gray (#6B7280) text, Lato font family.

**Interactions**
Real-time search with 300ms debounce as user types, filter dropdowns with checkbox multi-select for categories/frameworks, clicking active filter badge removes that filter, "Clear all" removes all filters at once, search highlights matching text in results (optional), empty search state shows "No results found. Try different keywords" message.

---

<!-- Component: Component Detail Page -->

Design a comprehensive detail page displaying full component information including large preview, syntax-highlighted code, metadata, and version history in a two-column desktop layout.

- Two-column layout (desktop 60/40 split, mobile stacked): left column contains large preview image (full width) and full JSX code block with dark theme syntax highlighting, right column contains metadata card and version history section
- Code block features: Dark theme (like VS Code), line numbers, language indicator "JSX" badge, "Copy Code" button (top-right) with clipboard icon
- Metadata card displays: component name (large heading), category badge, framework badge with icon, Tailwind version pill, tags as wrapped chips, source URL as clickable link with external icon, last indexed timestamp, last modified timestamp, version number (e.g., "v3")
- Version history section (collapsible): accordion-style list showing version numbers with timestamps, expandable to show content hash details
- Breadcrumb navigation at top: "Gallery > Category > Component Name"
- Back button "← Back to Gallery" in top-left corner

**Visual Style**
Code block uses VS Code Dark+ theme with syntax colors (keywords purple, strings green, functions yellow), metadata card has light gray background with rounded corners and organized key-value pairs, version history uses timeline-style vertical line with dots, preview image has subtle border, clean white page background with good spacing.

**Interactions**
Copy code button shows success toast "Code copied!" for 2 seconds, version history expands/collapses smoothly with chevron rotation, source URL opens in new tab with external link icon, back button navigates to previous gallery view with filters preserved, mobile displays single stacked column with code block horizontally scrollable.

---

<!-- Component: Statistics Dashboard -->

Design a metrics dashboard displaying catalog-level statistics, recent activity, and system health in an organized card-based layout.

- Card-based dashboard with three main sections vertically stacked: Overview Stats (top), Recent Activity (middle), Catalog Health (bottom)
- Overview Stats section contains: large total components count (prominent number with label), components by section horizontal bar chart (showing counts for Buttons, Forms, Navigation, etc.), components by framework pie or donut chart (React, Vue, Svelte proportions)
- Recent Activity section displays: last crawl timestamp with clock icon, newly added components count (with green "+" indicator), recently updated components count (with blue refresh icon), list of 5 most recent component updates (name, timestamp, "View" link)
- Catalog Health section shows: archived components count (with archive icon), partial extraction count (if any, with warning icon in yellow), last successful crawl status badge (green "Success" or red "Failed"), error count (if any)

**Visual Style**
Each section is white card with subtle shadow and rounded corners (8px), cards have 24px padding, large numbers use 48px font size with lighter gray labels, bar charts use Ocean Blue (#005A8D) with light blue backgrounds, pie charts use color-coded segments (React blue, Vue green, Svelte orange), status badges have green (#10B981) for success and red (#EF4444) for errors, icons use 24px size with consistent line weight.

**Responsive & Layout**
Desktop: cards arranged in flexible grid with Overview Stats spanning full width, Recent Activity and Catalog Health side-by-side (50/50). Mobile: all cards stacked vertically full-width. Charts scale responsively within cards. Typography hierarchy with Merriweather headings and Lato body text. Optional: clicking chart segments filters gallery by category.

---

<!-- Component: Admin Control Panel -->

Design an administrative interface for triggering crawler operations with real-time progress monitoring and live log output.

- Three-section vertical layout: Crawl Controls (top), Real-Time Progress (middle), Recent Logs (bottom)
- Crawl Controls contains horizontally arranged buttons: "Start Full Crawl" (primary blue button, large), "Resume Crawl" (secondary gray button, visible if checkpoint exists), "Clear Checkpoint" (danger red button with warning icon, subtle placement)
- Real-Time Progress section displays: animated progress bar (blue gradient with pulse effect), percentage text above bar (e.g., "42%"), current status message below bar (e.g., "Crawling section 3 of 8..."), component counts (e.g., "Processed 45 / 120 components"), elapsed time (e.g., "Running for 2m 34s")
- Recent Logs section shows: scrollable text area (terminal-style, max height 400px), monospace font log entries, color-coded log levels (INFO in white, WARN in yellow, ERROR in red), auto-scroll to bottom as new logs appear, timestamps prefix each log line

**Visual Style**
Button hierarchy with primary blue (#3B82F6), secondary gray (#6B7280), danger red (#EF4444), progress bar uses animated gradient or pulse effect, status text in large clear typography, logs use monospace font (Monaco, Consolas) with dark gray background (#1F2937) and light text (#F9FAFB), section dividers with subtle borders.

**Interactions**
Buttons disabled during active crawl with loading spinner, "Start Full Crawl" confirms with modal "This will process all components. Continue?", progress updates via WebSocket or 1-second polling, log area auto-scrolls to bottom (with manual scroll override), success toast notification when crawl completes, error banner with retry button if crawl fails, elapsed time updates every second.
