import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { SectionWrapper } from "./_components/section-wrapper";
import { ColorGroupDisplay } from "./_components/specimens/color-swatch";
import { TypographyGroupDisplay } from "./_components/specimens/typography-specimen";
import { SpacingScale } from "./_components/specimens/spacing-scale";
import { ShadowGrid } from "./_components/specimens/shadow-card";
import { RadiusGrid } from "./_components/specimens/radius-specimen";
import { ButtonSpecimen } from "./_components/specimens/button-specimen";
import { InputSpecimen } from "./_components/specimens/input-specimen";
import { TextareaSpecimen } from "./_components/specimens/textarea-specimen";
import { SelectSpecimen } from "./_components/specimens/select-specimen";
import { CheckboxSpecimen } from "./_components/specimens/checkbox-specimen";
import { FeedbackSpecimen } from "./_components/specimens/feedback-specimen";
import { CardSpecimen } from "./_components/specimens/card-specimen";
import { ToastSpecimen } from "./_components/specimens/toast-specimen";
import { BadgeSpecimen } from "./_components/specimens/badge-specimen";
import { DialogSpecimen } from "./_components/specimens/dialog-specimen";
import { SkeletonSpecimen } from "./_components/specimens/skeleton-specimen";
import { PageHeaderSpecimen } from "./_components/specimens/page-header-specimen";
import { NavigationSpecimen } from "./_components/specimens/navigation-specimen";
import { ToolbarSpecimen } from "./_components/specimens/toolbar-specimen";
import { AvatarSpecimen } from "./_components/specimens/avatar-specimen";
import { OverlaySpecimen } from "./_components/specimens/overlay-specimen";
import { TabsSpecimen } from "./_components/specimens/tabs-specimen";
import { PaginationSpecimen } from "./_components/specimens/pagination-specimen";
import { allColorGroups } from "./_data/colors";
import { allTypographyGroups } from "./_data/typography";
import { spacingScale, shadowTokens, radiusTokens } from "./_data/spacing";

/**
 * Design System Gallery Page
 * Available only in development mode - returns 404 in production.
 *
 * Showcases the "Brava Tones" design foundations:
 * - Colors (Brand, Neutrals, Semantic, Status)
 * - Typography (Fraunces headings, Outfit body)
 * - Spacing (8px base scale)
 * - Shadows (5-level elevation system)
 * - Border Radius (4-tier system)
 *
 * And interactive UI components:
 * - Buttons (AnimatedButton variants, sizes, states)
 * - Inputs (Catalyst Input with icons, states)
 * - Checkboxes (22 color variants, states)
 * - Feedback (Banner, LoadingSpinner, ConfirmationDialog)
 * - Cards (Card component patterns)
 * - Badges (5 color variants, BadgeButton)
 * - Toasts (4 semantic variants, fluent builder API)
 * - Dialogs (HeadlessUI modal with size variants)
 * - Skeletons (Loading state placeholders)
 * - Avatars (User images with initials fallback, status, groups)
 * - Overlays (Tooltips, Popovers, Dropdowns)
 * - PageHeader (Animated page titles with accent bar)
 * - Navigation (Mobile bottom nav pattern)
 * - Toolbar (Content action toolbar - desktop/mobile)
 * - Tabs (HeadlessUI Tab with underline, pill, vertical styles)
 * - Pagination (Page navigation with ellipsis)
 */
export default function DesignSystemPage() {
  // Dev-only gating: return 404 in production
  if (env.isProd) {
    notFound();
  }

  return (
    <div className="divide-hairline divide-y">
      {/* Colors Section */}
      <SectionWrapper
        id="colors"
        title="Colors"
        description="The Brava Tones palette captures the island's natural beauty - from Atlantic blues to lush valley greens."
      >
        {allColorGroups.map((group) => (
          <ColorGroupDisplay key={group.name} group={group} />
        ))}
      </SectionWrapper>

      {/* Typography Section */}
      <SectionWrapper
        id="typography"
        title="Typography"
        description="Fraunces for expressive headings, Outfit for clear body text. A harmonious pairing of old-style serif and modern geometric sans."
      >
        {allTypographyGroups.map((group) => (
          <TypographyGroupDisplay key={group.name} group={group} />
        ))}
      </SectionWrapper>

      {/* Spacing Section */}
      <SectionWrapper
        id="spacing"
        title="Spacing"
        description="8px base unit with a consistent scale for harmonious layouts."
      >
        <SpacingScale tokens={spacingScale} />
      </SectionWrapper>

      {/* Shadows Section */}
      <SectionWrapper
        id="shadows"
        title="Shadows"
        description="Multi-layered shadows with Ocean Blue tint for a calm, premium feel. Each level conveys increasing elevation."
      >
        <ShadowGrid tokens={shadowTokens} />
      </SectionWrapper>

      {/* Border Radius Section */}
      <SectionWrapper
        id="radii"
        title="Border Radius"
        description="'Radical Softness' principle with four radius tiers from compact badges to expansive containers."
      >
        <RadiusGrid tokens={radiusTokens} />
      </SectionWrapper>

      {/* Components Section Divider */}
      <div className="border-hairline border-t pt-12">
        <h2 className="text-body mb-2 font-serif text-xl font-semibold">
          Components
        </h2>
        <p className="text-muted text-sm">
          Interactive UI components built on the Brava Tones foundation.
        </p>
      </div>

      {/* Buttons Section */}
      <SectionWrapper
        id="buttons"
        title="Buttons"
        description="AnimatedButton with Framer Motion effects. Four variants, three sizes, icon support, and loading states."
      >
        <ButtonSpecimen />
      </SectionWrapper>

      {/* Inputs Section */}
      <SectionWrapper
        id="inputs"
        title="Inputs"
        description="Form inputs from Catalyst UI with HeadlessUI. Supports icons, validation states, and helper text."
      >
        <InputSpecimen />
      </SectionWrapper>

      {/* Textarea Section */}
      <SectionWrapper
        id="textarea"
        title="Textarea"
        description="Multi-line text input following Catalyst patterns. Supports row variants, resize behavior, and Field integration."
      >
        <TextareaSpecimen />
      </SectionWrapper>

      {/* Select Section */}
      <SectionWrapper
        id="select"
        title="Select"
        description="Accessible dropdown using HeadlessUI Listbox. Works with React Hook Form Controller pattern."
      >
        <SelectSpecimen />
      </SectionWrapper>

      {/* Checkboxes Section */}
      <SectionWrapper
        id="checkboxes"
        title="Checkboxes"
        description="Catalyst Checkbox with 22 color variants. Supports checked, indeterminate, and disabled states."
      >
        <CheckboxSpecimen />
      </SectionWrapper>

      {/* Feedback Section */}
      <SectionWrapper
        id="feedback"
        title="Feedback"
        description="User feedback components: banners, loading indicators, and confirmation dialogs."
      >
        <FeedbackSpecimen />
      </SectionWrapper>

      {/* Cards Section */}
      <SectionWrapper
        id="cards"
        title="Cards"
        description="Card containers using Calm Premium design tokens. Supports hover lift animation."
      >
        <CardSpecimen />
      </SectionWrapper>

      {/* Badges Section */}
      <SectionWrapper
        id="badges"
        title="Badges"
        description="Inline status indicators from Catalyst UI with 5 color variants. Supports interactive BadgeButton."
      >
        <BadgeSpecimen />
      </SectionWrapper>

      {/* Toast Section */}
      <SectionWrapper
        id="toasts"
        title="Toasts"
        description="Toast notifications with fluent builder API. Four semantic variants with action button support."
      >
        <ToastSpecimen />
      </SectionWrapper>

      {/* Dialog Section */}
      <SectionWrapper
        id="dialogs"
        title="Dialogs"
        description="Modal dialogs from Catalyst UI with HeadlessUI. Focus trap, Esc to close, mobile-responsive bottom sheets."
      >
        <DialogSpecimen />
      </SectionWrapper>

      {/* Skeleton Section */}
      <SectionWrapper
        id="skeletons"
        title="Skeletons"
        description="Loading state placeholders that match content layout. Prevents layout shift during data fetching."
      >
        <SkeletonSpecimen />
      </SectionWrapper>

      {/* Avatar Section */}
      <SectionWrapper
        id="avatars"
        title="Avatars"
        description="User profile images with initials fallback, status indicators, and group stacking."
      >
        <AvatarSpecimen />
      </SectionWrapper>

      {/* Overlay Section */}
      <SectionWrapper
        id="overlays"
        title="Overlays"
        description="Tooltips, popovers, and dropdown menus using HeadlessUI with proper accessibility."
      >
        <OverlaySpecimen />
      </SectionWrapper>

      {/* Layout Section Divider */}
      <div className="border-hairline border-t pt-12">
        <h2 className="text-body mb-2 font-serif text-xl font-semibold">
          Layout & Navigation
        </h2>
        <p className="text-muted text-sm">
          Structural components for page layout and navigation patterns.
        </p>
      </div>

      {/* PageHeader Section */}
      <SectionWrapper
        id="page-header"
        title="Page Header"
        description="Animated page header with title, subtitle, heading level, and bougainvillea accent bar."
      >
        <PageHeaderSpecimen />
      </SectionWrapper>

      {/* Navigation Section */}
      <SectionWrapper
        id="navigation"
        title="Mobile Navigation"
        description="Bottom navigation bar for mobile devices. Thumb-zone optimized with iOS safe area support."
      >
        <NavigationSpecimen />
      </SectionWrapper>

      {/* Toolbar Section */}
      <SectionWrapper
        id="toolbar"
        title="Content Action Toolbar"
        description="Responsive toolbar for content pages with sharing, reactions, and utility actions."
      >
        <ToolbarSpecimen />
      </SectionWrapper>

      {/* Tabs Section */}
      <SectionWrapper
        id="tabs"
        title="Tabs"
        description="HeadlessUI Tab component for switching between content sections. Supports underline, pill, and vertical layouts."
      >
        <TabsSpecimen />
      </SectionWrapper>

      {/* Pagination Section */}
      <SectionWrapper
        id="pagination"
        title="Pagination"
        description="Page navigation controls with page numbers, prev/next buttons, and ellipsis for large ranges."
      >
        <PaginationSpecimen />
      </SectionWrapper>
    </div>
  );
}
