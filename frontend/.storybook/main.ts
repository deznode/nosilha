import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook configuration for Nos Ilha - Component Documentation & A11y
 *
 * Simplified configuration focused on:
 * - Living component documentation
 * - Accessibility validation (a11y addon)
 * - Visual component exploration
 *
 * NOT used for automated testing in CI (local development only)
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook", // Visual testing and comprehensive addon bundle
    "@storybook/addon-docs", // Documentation addon
    "@storybook/addon-a11y", // Accessibility testing (KEEP - valuable for local validation)
    // Vitest integration removed - use dedicated npm run test:unit instead
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  docs: {
    autodocs: "tag", // Enable automatic documentation generation
  },
};
export default config;
