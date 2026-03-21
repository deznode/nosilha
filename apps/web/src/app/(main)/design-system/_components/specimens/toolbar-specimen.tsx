"use client";

import {
  Share2,
  Link2,
  Printer,
  MessageSquarePlus,
  Heart,
  PartyPopper,
  Lightbulb,
  ThumbsUp,
  Sparkles,
  X,
} from "lucide-react";
import clsx from "clsx";

/**
 * Toolbar specimen for the design system gallery.
 * Documents the ContentActionToolbar with its desktop and mobile variants.
 */
export function ToolbarSpecimen() {
  const reactions = [
    { emoji: "❤️", label: "Love", icon: Heart },
    { emoji: "🎉", label: "Celebrate", icon: PartyPopper },
    { emoji: "💡", label: "Insightful", icon: Lightbulb },
    { emoji: "👏", label: "Applause", icon: ThumbsUp },
  ];

  const sharingActions = [
    { label: "Share", icon: Share2 },
    { label: "Copy Link", icon: Link2 },
  ];

  const utilityActions = [
    { label: "Print", icon: Printer },
    { label: "Suggest", icon: MessageSquarePlus },
  ];

  return (
    <div className="space-y-10">
      {/* Overview */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Content Action Toolbar
        </h3>
        <p className="text-muted mb-4 text-sm">
          Responsive toolbar for content pages that adapts between desktop
          (left-rail) and mobile (FAB) layouts. Provides sharing, reactions, and
          utility actions.
        </p>
        <div className="bg-surface-alt rounded-card space-y-2 p-4">
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Desktop (≥1024px)</strong> - Fixed left-rail with vertical
              stack
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Mobile (&lt;1024px)</strong> - Floating Action Button with
              expandable menu
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Scroll-triggered</strong> - Optional visibility after
              scroll threshold
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Reduced motion</strong> - Respects prefers-reduced-motion
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Desktop Layout (Left-Rail)
        </h3>
        <p className="text-muted mb-4 text-sm">
          Fixed to the left side, vertically centered. Grouped actions with
          dividers.
        </p>
        <div className="flex gap-8">
          {/* Mock toolbar */}
          <div className="bg-surface rounded-card shadow-medium flex flex-col p-4">
            {/* Sharing Actions */}
            <div className="flex flex-col gap-2">
              {sharingActions.map((action) => (
                <div
                  key={action.label}
                  className="text-muted hover:text-body flex items-center gap-2 text-sm"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </div>
              ))}
            </div>

            <div className="border-hairline my-3 border-t" />

            {/* Reactions */}
            <div className="flex flex-col gap-2">
              {reactions.map((reaction) => (
                <div
                  key={reaction.label}
                  className="text-muted hover:text-body flex items-center gap-2 text-sm"
                >
                  <span className="text-base">{reaction.emoji}</span>
                  <span className="text-xs">0</span>
                </div>
              ))}
            </div>

            <div className="border-hairline my-3 border-t" />

            {/* Utility Actions */}
            <div className="flex flex-col gap-2">
              {utilityActions.map((action) => (
                <div
                  key={action.label}
                  className="text-muted hover:text-body flex items-center gap-2 text-sm"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex-1">
            <h4 className="text-body mb-2 text-sm font-medium">
              Action Groups
            </h4>
            <ol className="text-muted list-inside list-decimal space-y-2 text-sm">
              <li>
                <strong>Sharing</strong> - Share (native/Web Share API) + Copy
                Link
              </li>
              <li>
                <strong>Reactions</strong> - Emoji reactions with counts
                (❤️🎉💡👏)
              </li>
              <li>
                <strong>Utilities</strong> - Print page + Suggest improvement
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Mobile Layout (FAB)
        </h3>
        <p className="text-muted mb-4 text-sm">
          56×56px floating button at bottom-right. Expands upward on tap.
        </p>
        <div className="flex items-end justify-end gap-8">
          {/* Expanded state mockup */}
          <div className="flex flex-col items-end gap-4">
            {/* Expanded menu */}
            <div className="bg-surface rounded-card shadow-floating p-4">
              <div className="flex flex-col gap-2">
                {sharingActions.map((action) => (
                  <div
                    key={action.label}
                    className="bg-surface-alt flex h-10 w-10 items-center justify-center rounded-full"
                  >
                    <action.icon className="text-muted h-5 w-5" />
                  </div>
                ))}
              </div>
              <div className="border-hairline my-3 border-t" />
              <div className="flex gap-2">
                {reactions.map((reaction) => (
                  <span key={reaction.label} className="text-xl">
                    {reaction.emoji}
                  </span>
                ))}
              </div>
              <div className="border-hairline my-3 border-t" />
              <div className="flex flex-col gap-2">
                {utilityActions.map((action) => (
                  <div
                    key={action.label}
                    className="bg-surface-alt flex h-10 w-10 items-center justify-center rounded-full"
                  >
                    <action.icon className="text-muted h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>
            {/* FAB button (expanded) */}
            <div className="bg-ocean-blue shadow-floating flex h-14 w-14 items-center justify-center rounded-full text-white">
              <X className="h-6 w-6" />
            </div>
            <p className="text-muted text-xs">Expanded</p>
          </div>

          {/* Collapsed state */}
          <div className="flex flex-col items-end">
            <div className="bg-ocean-blue shadow-floating flex h-14 w-14 items-center justify-center rounded-full text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-muted mt-4 text-xs">Collapsed</p>
          </div>
        </div>
      </div>

      {/* Reactions System */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Reactions System
        </h3>
        <p className="text-muted mb-4 text-sm">
          Single-select reactions with optimistic updates. Backend stores counts
          per content ID.
        </p>
        <div className="border-hairline bg-surface rounded-card border p-4">
          <div className="flex gap-6">
            {reactions.map((reaction, i) => (
              <div
                key={reaction.label}
                className={clsx(
                  "flex flex-col items-center gap-1",
                  i === 0 && "text-ocean-blue"
                )}
              >
                <span className="text-2xl">{reaction.emoji}</span>
                <span className="text-xs font-medium">
                  {i === 0 ? "42" : "0"}
                </span>
                <span className="text-muted text-xs">{reaction.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Props */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Required Props
        </h3>
        <div className="border-hairline bg-surface rounded-card overflow-x-auto border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-hairline border-b">
                <th className="text-body px-4 py-2 text-left font-medium">
                  Prop
                </th>
                <th className="text-body px-4 py-2 text-left font-medium">
                  Type
                </th>
                <th className="text-body px-4 py-2 text-left font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-hairline border-b">
                <td className="px-4 py-2 font-mono">contentId</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">UUID for reactions API</td>
              </tr>
              <tr className="border-hairline border-b">
                <td className="px-4 py-2 font-mono">contentSlug</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">URL-friendly identifier</td>
              </tr>
              <tr className="border-hairline border-b">
                <td className="px-4 py-2 font-mono">contentTitle</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">For share dialog</td>
              </tr>
              <tr className="border-hairline border-b">
                <td className="px-4 py-2 font-mono">contentUrl</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">Full URL to share</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">reactions</td>
                <td className="px-4 py-2">Reaction[]</td>
                <td className="px-4 py-2">Initial reaction config</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { ContentActionToolbar } from "@/components/ui/content-action-toolbar";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`<ContentActionToolbar`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`contentId="uuid-123"`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`contentSlug="faja-dagua-beach"`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`contentTitle="Fajã d'Água Beach"`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`contentUrl="https://nosilha.com/directory/beaches/faja-dagua"`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`contentType="DIRECTORY_ENTRY"`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`reactions={defaultReactions}`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`isAuthenticated={true}`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`showOnScroll={true}`}
          </code>
          <code className="text-muted block text-sm">{`/>`}</code>
        </div>
      </div>
    </div>
  );
}
