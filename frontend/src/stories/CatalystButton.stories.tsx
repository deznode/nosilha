import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/catalyst-ui/button";

/**
 * Catalyst UI Button - versatile button component from the Catalyst design system.
 *
 * Supports multiple colors, variants (solid, outline, plain), and both button
 * and link functionality. Used throughout Nos Ilha for actions and navigation.
 */
const meta = {
  title: "Catalyst UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: [
        "dark/zinc",
        "light",
        "dark/white",
        "dark",
        "white",
        "zinc",
        "indigo",
        "cyan",
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "sky",
        "blue",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
      ],
    },
    outline: {
      control: "boolean",
      description: "Outline variant (border only)",
    },
    plain: {
      control: "boolean",
      description: "Plain variant (no background)",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary - default solid button in dark/zinc color.
 * Most common button variant across the platform.
 */
export const Primary: Story = {
  args: {
    children: "Explore Brava",
  },
};

/**
 * Ocean Blue - brand color button for primary actions.
 * Uses the signature Nos Ilha ocean blue color.
 */
export const OceanBlue: Story = {
  args: {
    children: "View Directory",
    color: "blue",
  },
};

/**
 * Valley Green - secondary brand color for nature/eco actions.
 * Represents Brava's lush valleys and vegetation.
 */
export const ValleyGreen: Story = {
  args: {
    children: "Explore Nature",
    color: "green",
  },
};

/**
 * Outline - border-only variant for secondary actions.
 * Provides visual hierarchy without drawing too much attention.
 */
export const Outline: Story = {
  args: {
    children: "Learn More",
    outline: true,
  },
};

/**
 * Plain - minimal variant for tertiary actions.
 * Subtle option for less important actions.
 */
export const Plain: Story = {
  args: {
    children: "Cancel",
    plain: true,
  },
};

/**
 * Link Button - button styled as link for navigation.
 * Demonstrates href functionality for Next.js navigation.
 */
export const AsLink: Story = {
  args: {
    children: "Visit Homepage",
    href: "/",
    color: "blue",
  },
};

/**
 * Disabled - shows disabled state styling.
 * Prevents interaction and reduces opacity.
 */
export const Disabled: Story = {
  args: {
    children: "Submit",
    disabled: true,
  },
};

/**
 * Success Action - green button for positive actions.
 * Used for confirmations and successful states.
 */
export const Success: Story = {
  args: {
    children: "Confirm",
    color: "green",
  },
};

/**
 * Danger Action - red button for destructive actions.
 * Used for deletions and warnings.
 */
export const Danger: Story = {
  args: {
    children: "Delete Entry",
    color: "red",
  },
};

/**
 * Warning Action - amber/yellow button for caution.
 * Used for actions requiring user attention.
 */
export const Warning: Story = {
  args: {
    children: "Proceed with Caution",
    color: "amber",
  },
};

/**
 * Small Size - demonstrates button in forms and compact layouts.
 */
export const InForm: Story = {
  decorators: [
    (Story) => (
      <form className="flex max-w-sm flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="text-text-primary mb-1 block text-sm"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="border-border-primary w-full rounded-lg border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <Story />
      </form>
    ),
  ],
  args: {
    children: "Subscribe to Newsletter",
    color: "blue",
  },
};

/**
 * Button Group - multiple buttons in a horizontal layout.
 * Common pattern for action panels and toolbars.
 */
export const ButtonGroup: Story = {
  decorators: [
    () => (
      <div className="flex gap-2">
        <Button outline>Cancel</Button>
        <Button plain>Save Draft</Button>
        <Button color="blue">Publish</Button>
      </div>
    ),
  ],
  args: {
    children: "Primary Action",
  },
};

/**
 * Mobile View - ensures buttons meet touch target requirements.
 * Minimum 44x44px tap area for accessibility.
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  args: {
    children: "Tap to Continue",
    color: "blue",
  },
  decorators: [
    (Story) => (
      <div className="flex w-full flex-col gap-2 p-4">
        <Story />
      </div>
    ),
  ],
};

/**
 * All Colors - showcases the full color palette.
 * Demonstrates visual consistency across brand colors.
 */
export const AllColors: Story = {
  args: {
    children: "Button",
  },
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <Button color="dark/zinc">Dark Zinc</Button>
      <Button color="blue">Blue</Button>
      <Button color="green">Green</Button>
      <Button color="red">Red</Button>
      <Button color="orange">Orange</Button>
      <Button color="amber">Amber</Button>
      <Button color="yellow">Yellow</Button>
      <Button color="lime">Lime</Button>
      <Button color="emerald">Emerald</Button>
      <Button color="teal">Teal</Button>
      <Button color="sky">Sky</Button>
      <Button color="indigo">Indigo</Button>
      <Button color="violet">Violet</Button>
      <Button color="purple">Purple</Button>
      <Button color="fuchsia">Fuchsia</Button>
      <Button color="pink">Pink</Button>
      <Button color="rose">Rose</Button>
      <Button color="cyan">Cyan</Button>
    </div>
  ),
};

/**
 * With Icon - demonstrates button with icon (future enhancement).
 * Placeholder for icon integration when needed.
 */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Add New Entry</span>
      </>
    ),
    color: "blue",
  },
};
