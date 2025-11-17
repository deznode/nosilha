import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Vitest configuration for Nos Ilha modular architecture testing
// Project 1: Unit tests with jsdom for React components
// Project 2: Storybook integration tests
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.*",
        "**/types/**",
        ".storybook/",
      ],
      // Coverage thresholds - currently advisory (non-blocking) in CI
      // See frontend-ci.yml for enforcement strategy during test suite development
      // TODO: Make blocking once test coverage reaches 70%
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    projects: [
      // Unit testing project for React components, hooks, and utilities
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./tests/setup/vitest.setup.tsx"],
          include: ["tests/unit/**/*.test.{ts,tsx}"],
        },
      },
      // Storybook integration testing project
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
