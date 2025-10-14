import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook configuration for Nos Ilha modular architecture
 * Provides living component documentation for the cultural heritage platform
 */
const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook", // Visual testing and comprehensive addon bundle
    "@storybook/addon-docs", // Documentation addon
    "@storybook/addon-a11y", // Accessibility testing
    "@storybook/addon-vitest", // Vitest integration
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