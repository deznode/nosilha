import { NextRequest, NextResponse } from "next/server";
import { getEntryBySlug } from "@/lib/api";
import { getEntryUrl } from "@/lib/directory-utils";

/**
 * API Route: Redirect old /directory/entry/:slug URLs to new /directory/:category/:slug format
 *
 * This provides backwards compatibility for existing links, bookmarks, and search engine results
 * that may still reference the old URL structure.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Look up the entry to determine its category
    const entry = await getEntryBySlug(slug);

    if (!entry) {
      // Entry not found - redirect to directory listing
      return NextResponse.redirect(new URL("/directory", request.url), 301);
    }

    // Build the new category-scoped URL
    const newPath = getEntryUrl(entry.slug, entry.category);
    const newUrl = new URL(newPath, request.url);

    // Permanent redirect (301) for SEO - indicates the resource has moved permanently
    return NextResponse.redirect(newUrl, 301);
  } catch (error) {
    console.error("Error redirecting entry:", error);
    // Fallback to directory listing on error
    return NextResponse.redirect(new URL("/directory", request.url), 302);
  }
}
