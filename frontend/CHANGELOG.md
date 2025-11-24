# Changelog

All notable changes to the Nos Ilha frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Feature 007: MDX Content Platform

#### Documentation (2025-01-24)
- Created comprehensive contributor documentation suite:
  - `docs/CONTRIBUTING_CONTENT.md` - Main contributor guide with quick start, workflows, and troubleshooting
  - `docs/TRANSLATION_GUIDE.md` - Complete translation workflows for PT/KEA/FR with cultural adaptation guidelines
  - `docs/MDX_COMPONENTS.md` - Comprehensive component reference with TypeScript interfaces and live examples
  - `docs/MDX_QUICK_REFERENCE.md` - Printable cheat sheet with commands, syntax, and validation fixes
- Added visual verification analysis documents:
  - `.analysis/history-page-comparison.md` - Section-by-section code comparison
  - `.analysis/comprehensive-comparison-summary.md` - Complete verification checklist
  - `.analysis/visual-verification-report.md` - Playwright screenshot analysis results

#### Components
- Created new layout components for MDX content:
  - `Section` - Content section wrapper with card/default/gradient variants
  - `TwoColumnGrid` - Responsive two-column grid layout with configurable gaps
  - `SectionTitle` - Consistent h3 title styling with optional centering
  - `Card` - Individual card component for grid layouts
  - `CalloutBox` - Highlighted box with 4 color gradient variants (ocean-valley, valley-ocean, pink-yellow, yellow-pink)
  - `IconGrid` - Grid layout for icons with gradient background
  - `StatisticsGrid` - Grid of statistics boxes with colored backgrounds
- Enhanced existing components:
  - Added "valley-ocean" variant to CalloutBox component
  - Added mt-16 spacing to IconGrid component
  - Updated component exports in `src/components/content/index.ts`

#### MDX Integration
- Updated `src/lib/content/mdx-components.tsx` to register all new components
- Enhanced `velite.config.ts` with hero schema for page-level video heroes
- Modified `src/app/(main)/history/history-page-content.tsx`:
  - Added hero prop support
  - Moved VideoHeroSection rendering outside content container for full-viewport display
- Updated `src/app/(main)/history/page.tsx` to pass hero data from frontmatter

#### Content
- Refactored `/history` page from 1014-line TSX to 369-line MDX:
  - Moved structured data (timeline, figures, citations, statistics) to frontmatter
  - Replaced inline HTML with reusable MDX components
  - Added hero section data to frontmatter
  - Restructured all sections with proper component wrappers
  - Achieved pixel-perfect visual parity with original TSX version

#### Testing & Verification
- Conducted comprehensive visual verification using Playwright MCP
- Verified all 15 major sections match original layout exactly
- Confirmed zero visual discrepancies between MDX and original TSX versions
- Validated component rendering, spacing, colors, and responsive behavior

### Fixed

#### Layout Issues (2025-01-24)
- Fixed VideoHeroSection viewport height by moving to frontmatter-driven rendering
- Fixed "Continue Your Journey" section title spacing (mb-4 instead of mb-8)
- Fixed Section component padding pattern (p-8 for sections, p-6 for nested cards)
- Fixed IconGrid spacing by adding mt-16 to match original layout
- Fixed MDX Link component errors by using standard `<a>` tags

#### Component Issues
- Added missing "valley-ocean" variant to CalloutBox component
- Fixed component registration in mdx-components.tsx
- Fixed component exports in content/index.ts

### Changed

#### Architecture
- Migrated history page from TSX to data-driven MDX architecture
- Implemented component-based content system for cultural heritage pages
- Adopted frontmatter-first approach for structured content
- Created backup of original TSX implementation at `src/app/(main)/history/backup/page.tsx`

#### Content Structure
- Separated presentation (components) from content (MDX + frontmatter)
- Reduced code duplication through reusable components
- Improved content maintainability and contributor experience
- Enhanced multilingual support through MDX structure

## Version History Notes

### Feature 007: MDX Content Platform
**Branch**: `007-mdx-content-platform`
**Started**: 2025-01-24
**Status**: Complete - Visual verification passed

**Goal**: Transform the history page from hardcoded TSX to a maintainable MDX-based content platform while achieving pixel-perfect visual parity.

**Results**:
- ✅ Reduced code from 1014 lines (TSX) to 369 lines (MDX)
- ✅ Created 6 new reusable layout components
- ✅ Achieved pixel-perfect visual parity (0 discrepancies)
- ✅ Created comprehensive contributor documentation (4 guides)
- ✅ Established patterns for future cultural heritage pages

**Breaking Changes**: None - All changes are additive

**Migration Notes**: Original TSX backup preserved at `/history/backup` for reference

---

## Documentation Standards

All changelog entries should include:
- Date of change
- Type of change (Added/Fixed/Changed/Deprecated/Removed/Security)
- Component/feature affected
- Brief description of what changed and why
- Breaking changes (if any)

## Semantic Versioning

We follow semantic versioning for releases:
- **MAJOR**: Breaking changes that require migration
- **MINOR**: New features that are backwards-compatible
- **PATCH**: Bug fixes and documentation updates
