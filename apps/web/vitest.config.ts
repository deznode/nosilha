import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest configuration for Nos Ilha - LOCAL DEVELOPMENT ONLY
 *
 * ⚠️ NOTE: Unit tests are NOT run in CI/CD (TypeScript + ESLint only).
 * Run these tests locally for TDD workflow using:
 *   - npm run test:unit           (run once)
 *   - npm run test:unit --watch   (watch mode)
 *
 * Simplified to test only critical stores and hooks.
 * Coverage thresholds removed (not enforced in CI).
 */
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/", "tests/", "**/*.config.*", "**/types/**"],
      // Thresholds removed - coverage not enforced (local development only)
    },
    projects: [
      // Unit testing project for critical stores and hooks only
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./tests/setup/vitest.setup.tsx"],
          include: ["tests/unit/**/*.test.{ts,tsx}"],
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
