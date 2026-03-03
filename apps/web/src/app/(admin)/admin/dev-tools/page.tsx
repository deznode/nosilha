import Link from "next/link";
import { Blocks, Monitor, Map, Layout } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DevToolCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const devTools: DevToolCard[] = [
  {
    title: "Components",
    description:
      "Component showcase with DirectoryCards, logos, toasts, reactions, and action buttons",
    href: "/admin/dev-tools/components",
    icon: Blocks,
  },
  {
    title: "Hero & Sticky Nav",
    description:
      "Hero section prototype with sticky navigation bar that transforms on scroll",
    href: "/admin/dev-tools/hero",
    icon: Monitor,
  },
  {
    title: "Landing Page",
    description:
      "Full landing page prototype with hero, navigation grid, featured stories, and CTA",
    href: "/admin/dev-tools/land",
    icon: Layout,
  },
  {
    title: "Map Style Switcher",
    description:
      "Mapbox style switcher component for streets, outdoors, and satellite views",
    href: "/admin/dev-tools/map",
    icon: Map,
  },
];

export default function DevToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-body mb-2 text-2xl font-bold">Dev Tools</h1>
      <p className="text-muted mb-8">
        Development sandboxes and component prototypes.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {devTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-surface border-hairline hover:shadow-medium rounded-card group border p-6 transition-all hover:-translate-y-0.5"
          >
            <tool.icon className="text-ocean-blue mb-3 h-6 w-6" />
            <h2 className="text-body group-hover:text-ocean-blue mb-1 text-lg font-semibold transition-colors">
              {tool.title}
            </h2>
            <p className="text-muted text-sm">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
