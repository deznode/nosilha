import type { DirectoryEntry } from "@/types/directory";
import { supabase } from "@/lib/supabase-client";
import { getMockEntriesByCategory, getMockEntryBySlug } from "@/lib/mock-api";

// 1. Read the base URL from environment variables.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 2. Add a check to ensure the variable is defined.
if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. Please check your .env.local file."
  );
}

/**
 * Creates an authenticated fetch request with JWT token from Supabase session
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    ...options.headers,
  };

  // Add Authorization header if user is authenticated
  if (session?.access_token) {
    Object.assign(headers, {
      Authorization: `Bearer ${session.access_token}`,
    });
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Token expired or invalid - sign out user
    await supabase.auth.signOut();
    window.location.href = "/login";
    throw new Error("Authentication expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error(
      "Access denied. You do not have permission to perform this action."
    );
  }

  return response;
}

/**
 * Fetches all directory entries or entries for a specific category from the backend API.
 * Uses ISR with 1 hour cache for optimal performance and falls back to mock data.
 * @param category The category to fetch, or 'all' to fetch all entries.
 * @returns A promise that resolves to an array of directory entries.
 */
export async function getEntriesByCategory(
  category: string
): Promise<DirectoryEntry[]> {
  const endpoint =
    category.toLowerCase() === "all"
      ? `${API_BASE_URL}/api/v1/directory/entries`
      : `${API_BASE_URL}/api/v1/directory/entries?category=${category}`;

  try {
    // Use ISR with 1 hour cache for directory content (semi-static data)
    const response = await fetch(endpoint, { 
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch entries by category, using fallback:", error);
    // Fallback to mock data for resilience
    return getMockEntriesByCategory(category);
  }
}

/**
 * Fetches a single directory entry by its slug from the backend API.
 * Uses ISR with 30 minute cache for individual entries and falls back to mock data.
 * @param slug The slug of the entry to fetch.
 * @returns A promise that resolves to a single directory entry or undefined if not found.
 */
export async function getEntryBySlug(
  slug: string
): Promise<DirectoryEntry | undefined> {
  const endpoint = `${API_BASE_URL}/api/v1/directory/slug/${slug}`;

  try {
    // Use ISR with 30 minute cache for individual entries
    const response = await fetch(endpoint, { 
      next: { revalidate: 1800 } 
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Try fallback for 404s as well
        return getMockEntryBySlug(slug);
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch entry by slug "${slug}", using fallback:`, error);
    // Fallback to mock data for resilience
    return getMockEntryBySlug(slug);
  }
}

/**
 * Creates a new directory entry by sending a POST request to the backend API.
 * @param entryData The data for the new entry, excluding id and slug.
 * @returns A promise that resolves to the newly created directory entry.
 */
export async function createDirectoryEntry(
  entryData: Omit<DirectoryEntry, "id" | "slug" | "rating" | "reviewCount">
): Promise<DirectoryEntry> {
  const endpoint = `${API_BASE_URL}/api/v1/directory/entries`;

  const response = await authenticatedFetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entryData),
  });

  if (!response.ok) {
    const errorResult = await response.json();
    throw new Error(errorResult.message || "Failed to create directory entry.");
  }

  return await response.json();
}

/**
 * Fetches entries for real-time interactive features like maps.
 * Uses no-store cache to ensure fresh data for dynamic interactions.
 * @param category The category to fetch, or 'all' to fetch all entries.
 * @returns A promise that resolves to an array of directory entries.
 */
export async function getEntriesForMap(
  category: string = "all"
): Promise<DirectoryEntry[]> {
  const endpoint =
    category.toLowerCase() === "all"
      ? `${API_BASE_URL}/api/v1/directory/entries`
      : `${API_BASE_URL}/api/v1/directory/entries?category=${category}`;

  try {
    // Keep dynamic for real-time map interactions
    const response = await fetch(endpoint, { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch entries for map, using fallback:", error);
    // Fallback to mock data for resilience
    return getMockEntriesByCategory(category);
  }
}
