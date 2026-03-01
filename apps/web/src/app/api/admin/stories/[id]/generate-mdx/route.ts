import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { MdxContent } from "@/types/admin";

/**
 * POST /api/admin/stories/[id]/generate-mdx
 *
 * Generates MDX preview from an approved story submission.
 *
 * Authentication: Required (ADMIN role, verified via request-scoped Supabase client)
 * Rate Limiting: Standard API rate limiting applies
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing story ID
 * @returns JSON response with generated MDX content or error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve params (Next.js 15+ async params)
    const { id } = await params;

    // Validate admin authentication using request-scoped Supabase client
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Route handlers cannot set cookies on the response directly here
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const role = user.app_metadata?.role;
    if (role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get session for the access token to forward to the backend
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body (if provided)
    let requestBody = {};
    try {
      const body = await request.json();
      requestBody = body || {};
    } catch {
      // No body provided, use defaults
      requestBody = {};
    }

    // Call backend API to generate MDX
    const backendUrl = `${env.apiUrl}/api/v1/admin/stories/${id}/generate-mdx`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    // Handle backend errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error:
              "Access denied. You do not have permission to perform this action.",
          },
          { status: 403 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          {
            error:
              errorData.message ||
              "Invalid request. Story must be in APPROVED status.",
          },
          { status: 400 }
        );
      }

      // Generic error
      return NextResponse.json(
        {
          error:
            errorData.message ||
            "Failed to generate MDX. Please try again later.",
        },
        { status: response.status }
      );
    }

    // Parse successful response
    const data = await response.json();

    // Extract data from ApiResult envelope
    const mdxContent: MdxContent = data.data || data;

    // Return generated MDX content
    return NextResponse.json(
      {
        mdx: mdxContent.mdxSource,
        slug: mdxContent.slug,
        frontmatter: mdxContent.frontmatter,
        schemaValid: mdxContent.schemaValid,
        validationErrors: mdxContent.validationErrors,
        generatedAt: mdxContent.generatedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating MDX:", error);

    return NextResponse.json(
      { error: "Internal server error while generating MDX" },
      { status: 500 }
    );
  }
}
