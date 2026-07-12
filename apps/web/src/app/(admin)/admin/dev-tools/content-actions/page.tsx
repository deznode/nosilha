"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentActionToolbar } from "@/components/content/content-action-toolbar/content-action-toolbar";
import type { Reaction } from "@/types/content-action-toolbar/component-props";

const mockReactions: Reaction[] = [
  {
    id: "LOVE",
    emoji: "\u2764\uFE0F",
    count: 24,
    isSelected: false,
    ariaLabel: "React with love",
  },
  {
    id: "CELEBRATE",
    emoji: "\uD83C\uDF89",
    count: 12,
    isSelected: true,
    ariaLabel: "React to celebrate",
  },
  {
    id: "INSIGHTFUL",
    emoji: "\uD83D\uDCA1",
    count: 8,
    isSelected: false,
    ariaLabel: "Mark as insightful",
  },
  {
    id: "SUPPORT",
    emoji: "\uD83D\uDC4F",
    count: 5,
    isSelected: false,
    ariaLabel: "Show support",
  },
];

const scrollSectionReactions: Reaction[] = [
  {
    id: "LOVE",
    emoji: "\u2764\uFE0F",
    count: 42,
    isSelected: true,
    ariaLabel: "React with love",
  },
  {
    id: "CELEBRATE",
    emoji: "\uD83C\uDF89",
    count: 18,
    isSelected: false,
    ariaLabel: "React to celebrate",
  },
  {
    id: "INSIGHTFUL",
    emoji: "\uD83D\uDCA1",
    count: 15,
    isSelected: false,
    ariaLabel: "Mark as insightful",
  },
  {
    id: "SUPPORT",
    emoji: "\uD83D\uDC4F",
    count: 7,
    isSelected: false,
    ariaLabel: "Show support",
  },
];

export default function ContentActionsDevPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Content Actions</h1>
      <p className="text-muted mb-8">
        ContentActionToolbar with desktop rail and mobile FAB. Scroll down to
        see the toolbar appear.
      </p>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">
          Default (always visible)
        </h2>
        <div className="relative min-h-[200px]">
          <ContentActionToolbar
            contentId="a1b2c3d4-0001-4000-8000-000000000001"
            contentSlug="demo-heritage-entry"
            contentTitle="Eugénio Tavares Monument"
            contentUrl="https://nosilha.com/directory/heritage/eugenio-tavares"
            contentType="HERITAGE"
            reactions={mockReactions}
            isAuthenticated={true}
          />
          <div className="ml-16 max-w-prose">
            <p className="text-body leading-relaxed">
              This is sample content that demonstrates how the
              ContentActionToolbar appears alongside page content. The toolbar
              shows reactions, share, bookmark, and suggest improvement actions.
              On desktop, it renders as a vertical rail to the left. On mobile,
              it renders as a floating action button.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">
          Show on Scroll (scroll down to reveal)
        </h2>
        <div className="relative min-h-[600px]">
          <ContentActionToolbar
            contentId="a1b2c3d4-0002-4000-8000-000000000002"
            contentSlug="demo-nature-entry"
            contentTitle="Monte Fontainhas Trail"
            contentUrl="https://nosilha.com/directory/nature/monte-fontainhas"
            contentType="NATURE"
            reactions={scrollSectionReactions}
            isAuthenticated={false}
            showOnScroll
            scrollThreshold={200}
          />
          <div className="ml-16 max-w-prose space-y-4">
            <p className="text-body leading-relaxed">
              The Monte Fontainhas trail is one of Brava Island&apos;s most
              scenic hiking routes. Starting from the village of Cachaço, the
              trail winds through terraced agricultural land before ascending
              into the cloud forest zone.
            </p>
            <p className="text-body leading-relaxed">
              Along the way, hikers pass through groves of dragon trees and
              endemic flora, with sweeping views of the neighboring island of
              Fogo on clear days. The trail is approximately 6 kilometers and
              takes about 3 hours to complete.
            </p>
            <p className="text-body leading-relaxed">
              Local guides are available in Cachaço and Nova Sintra, offering
              cultural commentary on the agricultural traditions and natural
              history of the area. The best time to hike is during the green
              season (August-November) when the landscape is most lush.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">
          Unauthenticated State
        </h2>
        <p className="text-muted mb-4 text-sm">
          When <code>isAuthenticated=false</code>, reactions and bookmarks
          prompt sign-in.
        </p>
        <div className="relative min-h-[200px]">
          <ContentActionToolbar
            contentId="a1b2c3d4-0003-4000-8000-000000000003"
            contentSlug="demo-restaurant"
            contentTitle="Par d'Mar Restaurant"
            contentUrl="https://nosilha.com/directory/restaurant/par-dmar"
            contentType="RESTAURANT"
            reactions={mockReactions}
            isAuthenticated={false}
          />
          <div className="ml-16 max-w-prose">
            <p className="text-body leading-relaxed">
              Par d&apos;Mar serves traditional Cape Verdean cuisine with a
              focus on fresh seafood caught daily by local fishermen. Try the
              grilled wahoo with fried banana and mandioca.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
