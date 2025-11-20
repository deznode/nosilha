// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import nextConfig from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      // Dependencies
      "node_modules/",
      // Build outputs
      ".next/",
      "out/",
      "build/",
      "dist/",
      "storybook-static/",
      // Test outputs
      "coverage/",
      "test-results/",
      "playwright-report/",
      ".nyc_output/",
      // Generated files
      "*.d.ts",
      "next-env.d.ts",
      // Third-party components
      "src/components/catalyst-ui/",
      // Environment files
      ".env*",
      // Logs
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      // Cache directories
      ".turbo/",
      ".vercel/",
      ".cache/",
    ],
  },
  // Next.js configs
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Disables conflicting ESLint rules
  eslintConfigPrettier,
  {
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error", // Shows formatting issues as ESLint errors

      // Configure TypeScript no-unused-vars to ignore underscore prefixed variables
      // This follows industry standard convention for intentionally unused variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Configure react/no-unescaped-entities for cultural heritage content
      // Allow common punctuation in text content to improve content creation experience
      "react/no-unescaped-entities": [
        "error",
        {
          forbid: [
            {
              char: ">",
              alternatives: ["&gt;"],
            },
            {
              char: "}",
              alternatives: ["&#125;"],
            },
          ],
        },
      ],
    },
  },
  // Test file overrides - relaxed rules for test code
  {
    files: ["tests/**/*.ts", "tests/**/*.tsx", "tests/**/*.js"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Mocks need type flexibility
      "@typescript-eslint/no-unused-vars": "warn", // Demote to warning
      "@typescript-eslint/no-require-imports": "off", // Allow CommonJS in setup files
    },
  },
  ...storybook.configs["flat/recommended"],
];

export default eslintConfig;
