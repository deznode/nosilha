import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * ThemeToggle allows users to cycle between system, light, and dark themes.
 *
 * Features smooth animations and respects user's system preferences while
 * allowing manual override. Essential for accessibility and user comfort
 * when browsing Brava Island's cultural heritage content.
 */
const meta = {
  title: "Nos Ilha/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - theme toggle in its default state.
 * Automatically detects and respects system theme preference.
 */
export const Default: Story = {};

/**
 * In Header - demonstrates theme toggle placement in navigation header.
 * Common pattern across Nos Ilha platform.
 */
export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="bg-background-primary flex items-center gap-4 rounded-lg p-4 shadow-sm">
        <span className="text-text-primary text-sm font-medium">Theme:</span>
        <Story />
      </div>
    ),
  ],
};

/**
 * In Sidebar - shows theme toggle in a vertical sidebar layout.
 * Useful for settings or navigation panels.
 */
export const InSidebar: Story = {
  decorators: [
    (Story) => (
      <div className="bg-background-primary flex w-48 flex-col gap-2 rounded-lg p-4 shadow-sm">
        <div className="text-text-primary text-sm font-semibold">Settings</div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Theme</span>
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Light Mode - demonstrates the appearance in light mode.
 * Shows sun icon when light theme is active.
 */
export const LightMode: Story = {
  parameters: {
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => {
      // Set initial theme to light for this story
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", "light");
      }
      return <Story />;
    },
  ],
};

/**
 * Dark Mode - demonstrates the appearance in dark mode.
 * Shows moon icon when dark theme is active.
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => {
      // Set initial theme to dark for this story
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", "dark");
      }
      return <Story />;
    },
  ],
};

/**
 * System Mode - demonstrates system theme detection.
 * Shows desktop icon and adapts to user's OS preference.
 */
export const SystemMode: Story = {
  decorators: [
    (Story) => {
      // Set initial theme to system for this story
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", "system");
      }
      return <Story />;
    },
  ],
};

/**
 * With Label - shows theme toggle with descriptive label.
 * Improves accessibility and user understanding.
 */
export const WithLabel: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center gap-2">
        <label className="text-text-secondary text-sm" htmlFor="theme-toggle">
          Appearance:
        </label>
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile View - demonstrates responsive behavior on mobile devices.
 * Ensures touch targets meet accessibility guidelines (44x44px minimum).
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background-primary flex w-full items-center justify-between p-4 shadow-sm">
        <span className="text-text-primary text-sm font-medium">Nos Ilha</span>
        <Story />
      </div>
    ),
  ],
};

/**
 * Interaction Demo - showcases the cycle animation behavior.
 * Click to cycle through: System → Light → Dark → System
 */
export const InteractionDemo: Story = {
  decorators: [
    (Story) => (
      <div className="flex flex-col items-center gap-4">
        <p className="text-text-secondary text-center text-sm">
          Click the button to cycle through themes:
          <br />
          <span className="text-text-primary font-medium">
            System → Light → Dark → System
          </span>
        </p>
        <Story />
        <p className="text-text-tertiary text-center text-xs">
          Each click triggers a smooth rotation animation
        </p>
      </div>
    ),
  ],
};
