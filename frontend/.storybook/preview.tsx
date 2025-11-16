import React, { useEffect } from "react";
import type { Preview, Decorator } from "@storybook/nextjs-vite";
import { QueryProvider } from "../src/components/providers/query-provider";
import { initialize, mswDecorator } from "msw-storybook-addon";
import { StorybookRouterProvider } from "../src/stories/storybook-router-context";
import "../src/app/globals.css";

// Initialize MSW
initialize();

/**
 * Mock router decorator
 * @param Story Story component
 * @returns JSX.Element
 */
const withMockRouter: Decorator = (Story) => (
  <StorybookRouterProvider>
    <Story />
  </StorybookRouterProvider>
);

/**
 * Theme decorator to toggle between light and dark modes
 * @param Story Story component
 * @param context Storybook context
 * @returns JSX.Element
 */
const withTheme: Decorator = (Story, context) => {
  const { globals } = context;
  const theme = globals.theme || "light";

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);
  }, [theme]);

  return <Story />;
};

/**
 * Providers decorator to wrap stories with necessary context providers
 * @param Story Story component
 * @returns JSX.Element
 */
const withProviders: Decorator = (Story) => (
  <QueryProvider>
    <div className="font-sans">
      <Story />
    </div>
  </QueryProvider>
);

const preview: Preview = {
  decorators: [mswDecorator, withMockRouter, withTheme, withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#1a202c",
        },
      ],
    },
    a11y: {
      test: "todo",
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
