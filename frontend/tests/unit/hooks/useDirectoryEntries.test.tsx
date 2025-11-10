import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDirectoryEntries } from "@/hooks/queries/useDirectoryEntries";
import * as api from "@/lib/api";
import type { DirectoryEntry } from "@/types/directory";
import type { ReactNode } from "react";

// Mock the API module
vi.mock("@/lib/api");

const mockDirectoryEntries: DirectoryEntry[] = [
  {
    id: "1",
    name: "Casa da Morabeza",
    slug: "casa-da-morabeza",
    category: "Restaurant",
    description:
      "Traditional Cape Verdean restaurant serving authentic cachupa",
    town: "Nova Sintra",
    latitude: 14.8675,
    longitude: -24.7065,
    rating: 4.5,
    reviewCount: 42,
    imageUrl: "https://example.com/image.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    details: {
      phoneNumber: "+238 281 1234",
      openingHours: "Mon-Sat 12:00-22:00",
      cuisine: ["Cape Verdean", "Seafood"],
    },
  },
  {
    id: "2",
    name: "Hotel Brava",
    slug: "hotel-brava",
    category: "Hotel",
    description: "Comfortable hotel with ocean views",
    town: "Nova Sintra",
    latitude: 14.8685,
    longitude: -24.7075,
    rating: 4.0,
    reviewCount: 28,
    imageUrl: "https://example.com/hotel.jpg",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    details: {
      amenities: ["Wi-Fi", "Pool", "Restaurant"],
    },
  },
];

describe("useDirectoryEntries", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("fetches directory entries successfully", async () => {
    // Mock the API call to return mock data
    vi.mocked(api.getEntriesByCategory).mockResolvedValue(mockDirectoryEntries);

    const { result } = renderHook(
      () => useDirectoryEntries("Restaurant", 0, 20),
      { wrapper }
    );

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data was fetched correctly
    expect(result.current.data).toEqual(mockDirectoryEntries);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Verify API was called with correct parameters
    expect(api.getEntriesByCategory).toHaveBeenCalledWith("Restaurant", 0, 20);
    expect(api.getEntriesByCategory).toHaveBeenCalledTimes(1);
  });

  it("handles API errors gracefully", async () => {
    const mockError = new Error("Failed to fetch entries");
    vi.mocked(api.getEntriesByCategory).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDirectoryEntries("all", 0, 20), {
      wrapper,
    });

    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify error state
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("caches data correctly", async () => {
    vi.mocked(api.getEntriesByCategory).mockResolvedValue(mockDirectoryEntries);

    // First render
    const { result: result1, unmount: unmount1 } = renderHook(
      () => useDirectoryEntries("Restaurant", 0, 20),
      { wrapper }
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    expect(api.getEntriesByCategory).toHaveBeenCalledTimes(1);

    // Unmount first hook
    unmount1();

    // Second render with same parameters should use cached data
    const { result: result2 } = renderHook(
      () => useDirectoryEntries("Restaurant", 0, 20),
      { wrapper }
    );

    // Should immediately have cached data (not loading)
    await waitFor(() =>
      expect(result2.current.data).toEqual(mockDirectoryEntries)
    );

    // API should not be called again (cached)
    expect(api.getEntriesByCategory).toHaveBeenCalledTimes(1);
  });

  it("refetches when category changes", async () => {
    vi.mocked(api.getEntriesByCategory).mockResolvedValue(mockDirectoryEntries);

    const { result, rerender } = renderHook(
      ({ category }) => useDirectoryEntries(category, 0, 20),
      {
        wrapper,
        initialProps: { category: "Restaurant" },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getEntriesByCategory).toHaveBeenCalledWith("Restaurant", 0, 20);

    // Change category
    rerender({ category: "Hotel" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getEntriesByCategory).toHaveBeenCalledWith("Hotel", 0, 20);
    expect(api.getEntriesByCategory).toHaveBeenCalledTimes(2);
  });

  it("validates data with Zod schema", async () => {
    const invalidData = [
      {
        id: "1",
        // Missing required fields like 'name', 'category', etc.
      },
    ];

    vi.mocked(api.getEntriesByCategory).mockResolvedValue(invalidData as any);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useDirectoryEntries("all", 0, 20), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should log validation error but still return data (graceful degradation)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Directory entries validation failed:",
      expect.any(Object)
    );
    expect(result.current.data).toEqual(invalidData);

    consoleErrorSpy.mockRestore();
  });

  it("uses default parameters when not provided", async () => {
    vi.mocked(api.getEntriesByCategory).mockResolvedValue(mockDirectoryEntries);

    const { result } = renderHook(() => useDirectoryEntries(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify default parameters were used
    expect(api.getEntriesByCategory).toHaveBeenCalledWith("all", 0, 20);
  });

  it("respects custom staleTime and gcTime", async () => {
    vi.mocked(api.getEntriesByCategory).mockResolvedValue(mockDirectoryEntries);

    const { result } = renderHook(
      () =>
        useDirectoryEntries("Restaurant", 0, 20, {
          staleTime: 10 * 60 * 1000, // 10 minutes
          gcTime: 60 * 60 * 1000, // 1 hour
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDirectoryEntries);
  });
});
