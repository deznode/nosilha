import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation endpoint for ISR cache invalidation.
 *
 * Called by the backend after admin actions that change content (e.g., promoting
 * a gallery image to hero image). This ensures users see updated content immediately
 * rather than waiting for the 30-minute ISR cache to expire.
 *
 * Security:
 * - Requires X-Revalidate-Secret header matching REVALIDATE_SECRET env var
 * - Only accepts POST requests
 *
 * Usage:
 * POST /api/revalidate
 * Headers: { "X-Revalidate-Secret": "your-secret" }
 * Body: { "path": "/directory/hotels/pensao-paulo" }
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
  let body: { path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { path } = body;

  if (!path || typeof path !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'path' parameter" },
      { status: 400 }
    );
  }

  // Validate path format (prevent path traversal attacks)
  const safePathPattern = /^\/[a-zA-Z0-9\-_\/]+$/;
  if (!safePathPattern.test(path) || path.includes("..")) {
    console.warn(`Invalid revalidation path rejected: ${path}`);
    return NextResponse.json(
      { error: "Invalid path format" },
      { status: 400 }
    );
  }

  try {
    revalidatePath(path);
    console.log(`Revalidated path: ${path}`);

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Failed to revalidate path ${path}:`, error);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
