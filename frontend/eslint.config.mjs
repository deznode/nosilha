// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Disables conflicting ESLint rules
  ...compat.extends("prettier"),
  {
    plugins: {
      prettier: (await import("eslint-plugin-prettier")).default,
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
  ...storybook.configs["flat/recommended"]
];

export default eslintConfig;
