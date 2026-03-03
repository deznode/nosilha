"use client";

import { useMemo } from "react";
import * as runtime from "react/jsx-runtime";
import { PrintPageWrapper } from "@/components/ui/print-page-wrapper";
import { VideoHeroSection } from "@/components/ui/video-hero-section";
import { mdxComponents } from "@/lib/content/mdx-components";
import type {
  TimelineEvent,
  HistoricalFigure,
  ThematicSection,
} from "@/components/content";

interface Hero {
  videoSrc: string;
  title: string;
  subtitle: string;
}

interface Citation {
  source: string;
  author: string;
  year?: number;
  url?: string;
}

interface IconGridItem {
  icon: string;
  title: string;
  description: string;
  iconColor?: string;
}

interface Statistic {
  value: string;
  label: string;
  description: string;
  color: string;
}

// Type-safe scope for MDX component data
type MDXScope = {
  sections?: ThematicSection[];
  figures?: HistoricalFigure[];
  timeline?: TimelineEvent[];
  citations?: Citation[];
  iconGridItems?: IconGridItem[];
  statisticsData?: Statistic[];
  [key: string]: unknown; // Allow additional props
};

interface HistoryPageContentProps {
  code: string;
  hero?: Hero;
  sections: ThematicSection[];
  figures: HistoricalFigure[];
  timeline: TimelineEvent[];
  citations: Citation[];
  iconGridItems: IconGridItem[];
  statisticsData: Statistic[];
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
  hero,
  sections,
  figures,
  timeline,
  citations,
  iconGridItems,
  statisticsData,
}: HistoryPageContentProps) {
  return (
    <PrintPageWrapper>
      <div className="bg-background-secondary font-sans">
        {/* Full-Screen Video Hero (outside container) */}
        {hero && (
          <VideoHeroSection
            videoSrc={hero.videoSrc}
            title={hero.title}
            subtitle={hero.subtitle}
            overlayContent={[]}
            className="h-[calc(100vh-81px)]"
          />
        )}

        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <MDXWrapper
            code={code}
            scope={{
              sections,
              figures,
              timeline,
              citations,
              iconGridItems,
              statisticsData,
            }}
          />
        </div>
      </div>
    </PrintPageWrapper>
  );
}
