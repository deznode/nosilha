import Link from "next/link";
import {
  Blocks,
  Monitor,
  Map,
  Image,
  PenTool,
  Search,
  Lock,
  Upload,
  Maximize,
  MousePointerClick,
  User,
  Filter,
  Landmark,
  BookOpen,
  Puzzle,
  Camera,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DevToolCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface DevToolSection {
  title: string;
  cards: DevToolCard[];
}

const sections: DevToolSection[] = [
  {
    title: "UI Components",
    cards: [
      {
        title: "Components",
        description:
          "Component showcase with DirectoryCards, logos, toasts, reactions, and action buttons",
        href: "/admin/dev-tools/components",
        icon: Blocks,
      },
      {
        title: "Widgets",
        description:
          "WeatherWidget, KrioluProverbCard, FooterNewsletterForm, and TabGroup color variants",
        href: "/admin/dev-tools/widgets",
        icon: Puzzle,
      },
      {
        title: "Story Cards",
        description:
          "StoryCard grid display with StoryDetailContent for community narrative previews",
        href: "/admin/dev-tools/story-cards",
        icon: BookOpen,
      },
      {
        title: "Gallery Metadata",
        description:
          "ManualMetadataForm, MetadataBadges, PhotoTypeSelector, and VideoSection components",
        href: "/admin/dev-tools/gallery-metadata",
        icon: Camera,
      },
    ],
  },
  {
    title: "Content & Media",
    cards: [
      {
        title: "Photo Gallery",
        description:
          "PhotoGrid with category filtering, Lightbox overlay, MetadataBadges, and PhotoTypeSelector",
        href: "/admin/dev-tools/gallery",
        icon: Image,
      },
      {
        title: "Image Lightbox",
        description:
          "GalleryImageGrid masonry layout with fullscreen ImageLightbox navigation and thumbnails",
        href: "/admin/dev-tools/lightbox",
        icon: Maximize,
      },
      {
        title: "Content Blocks",
        description:
          "HistoricalTimeline, HistoricalFigures, and ThematicSections for heritage pages",
        href: "/admin/dev-tools/content-blocks",
        icon: Landmark,
      },
      {
        title: "Content Actions",
        description:
          "ContentActionToolbar with desktop rail and mobile FAB, reactions, share, and bookmark",
        href: "/admin/dev-tools/content-actions",
        icon: MousePointerClick,
      },
      {
        title: "Image Upload",
        description:
          "ImageUploader, ContributePhotosSection, and GalleryPicker for media uploads",
        href: "/admin/dev-tools/upload",
        icon: Upload,
      },
    ],
  },
  {
    title: "Pages & Layouts",
    cards: [
      {
        title: "Hero Sections",
        description:
          "Hero section prototype with sticky navigation bar that transforms on scroll",
        href: "/admin/dev-tools/hero",
        icon: Monitor,
      },
      {
        title: "User Profile",
        description:
          "ProfileHeader with skeleton loading, ProfileTabs, and InlineAuthPrompt",
        href: "/admin/dev-tools/profile",
        icon: User,
      },
      {
        title: "Auth Forms",
        description:
          "NosIlhaAuth form with login/signup toggle and OAuth provider buttons",
        href: "/admin/dev-tools/auth",
        icon: Lock,
      },
      {
        title: "Search",
        description:
          "UnifiedSearch component in both default and hero variants with search functionality",
        href: "/admin/dev-tools/search",
        icon: Search,
      },
      {
        title: "Directory Filter",
        description:
          "FilterToolbar with DirectoryCard grid, ListViewCard list, and ViewToggle switcher",
        href: "/admin/dev-tools/directory-filter",
        icon: Filter,
      },
    ],
  },
  {
    title: "Interactive Tools",
    cards: [
      {
        title: "Map Viewer",
        description:
          "Mapbox style switcher component for streets, outdoors, and satellite views",
        href: "/admin/dev-tools/map",
        icon: Map,
      },
      {
        title: "Story Editor",
        description:
          "StoryEditor with TemplateChips, StoryPromptsPanel, and PhotoUpload for community stories",
        href: "/admin/dev-tools/story-editor",
        icon: PenTool,
      },
    ],
  },
];

export default function DevToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-body mb-1 text-xl font-bold">Dev Tools</h1>
      <p className="text-muted mb-6">
        Development sandboxes and component prototypes.
      </p>

      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h2 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {section.cards.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-surface border-hairline hover:shadow-medium rounded-badge group border p-3 transition-all hover:-translate-y-0.5"
              >
                <tool.icon className="text-ocean-blue mb-2 h-5 w-5" />
                <h3 className="text-body group-hover:text-ocean-blue mb-0.5 text-sm font-semibold transition-colors">
                  {tool.title}
                </h3>
                <p className="text-muted text-xs">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
