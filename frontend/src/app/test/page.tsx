"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { DirectoryEntry } from "@/types/directory";
import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import { NosilhaLogo } from "@/components/ui/logo";
import { Logo as Logo2 } from "@/components/ui/logo2";
import { Logo as Logo3 } from "@/components/ui/logo3";
import { Logo as Logo4 } from "@/components/ui/logo4";
import NewsletterSignup from "@/components/ui/newsletter";
import { SocialMediaLinks } from "@/components/ui/social-media-links";
import Banner from "@/components/ui/banner";
import { SuggestImprovementForm } from "@/components/ui/actions/suggest-improvement-form";
import { RelatedContent } from "@/components/ui/related-content";
import { ShareButton } from "@/components/ui/actions/share-button";
import { CopyLinkButton } from "@/components/ui/actions/copy-link-button";
import { ReactionButtons } from "@/components/ui/actions/reaction-buttons";
import { Button } from "@/components/catalyst-ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * An updated test page that uses the PageHeader component.
 */
export default function TestPage() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadEntries = async () => {
      try {
        setEntriesLoading(true);
        const { items } = await getEntriesByCategory("all");
        if (isMounted) {
          setEntries(items);
          setEntriesError(null);
        }
      } catch (error) {
        console.error("Failed to load entries for the test page:", error);
        if (isMounted) {
          setEntriesError(
            "Unable to load directory entries from the mock API."
          );
        }
      } finally {
        if (isMounted) {
          setEntriesLoading(false);
        }
      }
    };

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const showcaseEntry = entries[0];
  const showcaseContentId = showcaseEntry?.id ?? "demo-content-id";
  const showcaseUrl = showcaseEntry
    ? `https://nosilha.com/directory/entry/${showcaseEntry.slug}`
    : "https://nosilha.com/directory/entry/demo-entry";
  const showcaseTitle = showcaseEntry?.name ?? "Eugénio Tavares Monument";
  const showcaseDescription =
    showcaseEntry?.description ??
    "A heritage-rich space on Brava Island that highlights our cultural identity.";
  const showcaseContentType = showcaseEntry?.category ?? "LANDMARK";

  return (
    <main className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <Banner
          title="Nos Ilha 2025"
          message="Discover the cultural heritage of Brava Island - explore landmarks, local businesses, and traditions"
          linkUrl="/directory/all"
        />
        <NosilhaLogo />
        <Logo2 />
        <Logo3 />
        <Logo4 />
        <PageHeader
          title="Component Test Page"
          subtitle="Rendering all items from the mock API to test our DirectoryCard component."
        />
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {entriesLoading && (
            <p className="text-text-secondary col-span-full text-center">
              Loading entries from the mock API...
            </p>
          )}
          {entriesError && !entriesLoading && (
            <p className="col-span-full text-center text-red-600">
              {entriesError}
            </p>
          )}
          {!entriesLoading &&
            !entriesError &&
            entries.map((entry) => (
              <DirectoryCard key={entry.id} entry={entry} />
            ))}
        </div>

        <section className="mt-16 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-zinc-100 ring-inset dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Content Action Components Showcase
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Testing every component from{" "}
                <code className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                  content-actions
                </code>{" "}
                using mock content data.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ShareButton
                title={showcaseTitle}
                url={showcaseUrl}
                description={showcaseDescription}
              />
              <CopyLinkButton url={showcaseUrl} />
              <Button onClick={() => setIsSuggestOpen(true)}>
                Suggest Improvement
              </Button>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Reactions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by the <code>ReactionButtons</code> component with mock
                API data.
              </p>
              <div className="mt-4">
                <ReactionButtons
                  contentId={showcaseContentId}
                  contentSlug="test-showcase"
                  reactions={[
                    {
                      id: "LOVE",
                      emoji: "❤️",
                      count: 12,
                      isSelected: false,
                      ariaLabel: "React with love",
                    },
                    {
                      id: "CELEBRATE",
                      emoji: "🎉",
                      count: 5,
                      isSelected: true,
                      ariaLabel: "React to celebrate",
                    },
                    {
                      id: "INSIGHTFUL",
                      emoji: "💡",
                      count: 8,
                      isSelected: false,
                      ariaLabel: "Mark as insightful",
                    },
                    {
                      id: "SUPPORT",
                      emoji: "👏",
                      count: 3,
                      isSelected: false,
                      ariaLabel: "Show support",
                    },
                  ]}
                  isAuthenticated={true}
                  orientation="horizontal"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Centralized Toast System
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Demonstrates global toast notifications using{" "}
                <code>useToast()</code> hook.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button
                  onClick={() => toast.showSuccess("Success toast triggered!")}
                >
                  Show Success Toast
                </Button>
                <Button
                  outline
                  onClick={() =>
                    toast.showError("Error toast triggered for demo")
                  }
                >
                  Show Error Toast
                </Button>
                <Button
                  onClick={() => {
                    toast.showSuccess("First toast");
                    setTimeout(() => toast.showError("Second toast"), 500);
                    setTimeout(() => toast.showSuccess("Third toast"), 1000);
                  }}
                >
                  Test Stacking (3 toasts)
                </Button>
              </div>
            </div>
          </div>
        </section>

        <NewsletterSignup />
        <SocialMediaLinks />
        <RelatedContent contentId={showcaseContentId} />

        <SuggestImprovementForm
          contentId={showcaseContentId}
          contentTitle={showcaseTitle}
          contentType={showcaseContentType}
          pageUrl={showcaseUrl}
          isOpen={isSuggestOpen}
          onClose={() => setIsSuggestOpen(false)}
        />
      </div>
    </main>
  );
}
