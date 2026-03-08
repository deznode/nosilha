import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation endpoint for cache invalidation.
 *
 * Called by the backend after admin actions that change content (e.g., promoting
 * a gallery image to hero image). This ensures users see updated content immediately
 * rather than waiting for the cache to expire.
 *
 * Supports both path-based and tag-based invalidation:
 * - Tag-based: More granular, invalidates all pages tagged with a specific cache tag
 * - Path-based: Invalidates a specific URL path
 *
 * Security:
 * - Requires X-Revalidate-Secret header matching REVALIDATE_SECRET env var
 * - Only accepts POST requests
 *
 * Usage:
 * POST /api/revalidate
 * Headers: { "X-Revalidate-Secret": "your-secret" }
 * Body: { "path": "/directory/hotels/pensao-paulo" }
 *   or: { "tag": "gallery" }
 *   or: { "path": "/directory/hotels", "tag": "category:hotels" }
 */
export async function POST(request: NextRequest) {
  // Validate secret token
  const secret = request.headers.get("x-revalidate-secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    console.error("REVALIDATE_SECRET environment variable not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (secret !== expectedSecret) {
    console.warn("Invalid revalidation secret received");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  let body: { path?: string; tag?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { path, tag } = body;

  if (
    (!path || typeof path !== "string") &&
    (!tag || typeof tag !== "string")
  ) {
    return NextResponse.json(
      { error: "At least one of 'path' or 'tag' must be provided" },
      { status: 400 }
    );
  }

  // Validate path format (prevent path traversal attacks)
  if (path) {
    const safePathPattern = /^\/[a-zA-Z0-9\-_\/]*$/;
    if (!safePathPattern.test(path) || path.includes("..")) {
      console.warn(`Invalid revalidation path rejected: ${path}`);
      return NextResponse.json(
        { error: "Invalid path format" },
        { status: 400 }
      );
    }
  }

  // Validate tag format (alphanumeric, hyphens, underscores, colons)
  if (tag) {
    const safeTagPattern = /^[a-zA-Z0-9\-_:]+$/;
    if (!safeTagPattern.test(tag)) {
      console.warn(`Invalid revalidation tag rejected: ${tag}`);
      return NextResponse.json(
        { error: "Invalid tag format" },
        { status: 400 }
      );
    }
  }

  try {
    if (tag) {
      revalidateTag(tag, { expire: 0 });
      console.log(`Revalidated tag: ${tag}`);
    }

    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    return NextResponse.json({
      revalidated: true,
      ...(path && { path }),
      ...(tag && { tag }),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to revalidate:", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
