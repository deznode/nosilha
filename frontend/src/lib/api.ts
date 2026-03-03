import type { DirectoryEntry } from "@/types/directory";

// 1. Read the base URL from environment variables.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 2. Add a check to ensure the variable is defined.
if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined. Please check your .env.local file."
  );
}

/**
 * Fetches all directory entries or entries for a specific category from the backend API.
 * @param category The category to fetch, or 'all' to fetch all entries.
 * @returns A promise that resolves to an array of directory entries.
 */
export async function getEntriesByCategory(
  category: string
): Promise<DirectoryEntry[]> {
  const endpoint =
    category.toLowerCase() === "all"
      ? `${API_BASE_URL}/entries`
      : `${API_BASE_URL}/entries?category=${category}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch entries by category:", error);
    return [];
  }
}

/**
 * Fetches a single directory entry by its slug from the backend API.
 * @param slug The slug of the entry to fetch.
 * @returns A promise that resolves to a single directory entry or undefined if not found.
 */
export async function getEntryBySlug(
  slug: string
): Promise<DirectoryEntry | undefined> {
  const endpoint = `${API_BASE_URL}/slug/${slug}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch entry by slug "${slug}":`, error);
    return undefined;
  }
}
