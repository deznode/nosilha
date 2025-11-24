"use client";

import { useMemo } from "react";
import * as runtime from "react/jsx-runtime";
import { PrintPageWrapper } from "@/components/ui/print-page-wrapper";
import { mdxComponents } from "@/lib/content/mdx-components";
import type {
  TimelineEvent,
  HistoricalFigure,
  ThematicSection,
} from "@/components/content";

interface Citation {
  source: string;
  author: string;
  year?: number;
  url?: string;
}

// Type-safe scope for MDX component data
type MDXScope = {
  sections?: ThematicSection[];
  figures?: HistoricalFigure[];
  timeline?: TimelineEvent[];
  citations?: Citation[];
  [key: string]: unknown; // Allow additional props
};

interface HistoryPageContentProps {
  code: string;
  sections: ThematicSection[];
  figures: HistoricalFigure[];
  timeline: TimelineEvent[];
  citations: Citation[];
}

// Helper to render Velite MDX content with scope
function useMDXComponent(code: string, scope: MDXScope = {}) {
  return useMemo(() => {
    // Create const declarations for scope variables
    // The code expects arguments[0] to contain JSX runtime
    // We pass scope in arguments[1] and declare variables from it
    const scopeDeclarations = Object.keys(scope)
      .map((key) => `const ${key} = arguments[1].${key};`)
      .join("\n");

    // Prepend scope declarations to the code

    const fn = new Function(`${scopeDeclarations}\n${code}`);

    // Call with runtime in arguments[0] and scope in arguments[1]
    return fn(runtime, scope).default;
  }, [code, scope]);
}

// Wrapper component to handle MDX rendering
function MDXWrapper({ code, scope }: { code: string; scope: MDXScope }) {
  const Component = useMDXComponent(code, scope);
  // ESLint false positive: Component is memoized via useMemo in useMDXComponent
  // This is the standard pattern for MDX libraries (mdx-bundler, next-mdx-remote)
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={mdxComponents} />;
}

export function HistoryPageContent({
  code,
  sections,
  figures,
  timeline,
  citations,
}: HistoryPageContentProps) {
  return (
    <PrintPageWrapper>
      <MDXWrapper
        code={code}
        scope={{ sections, figures, timeline, citations }}
      />
    </PrintPageWrapper>
  );
}
