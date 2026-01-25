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
import { CheckboxSpecimen } from "./_components/specimens/checkbox-specimen";
import { FeedbackSpecimen } from "./_components/specimens/feedback-specimen";
import { CardSpecimen } from "./_components/specimens/card-specimen";
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
    </div>
  );
}
