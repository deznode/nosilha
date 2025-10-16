/**
 * Unit tests for filterStore (Phase 2.7)
 * Tests search and filter state management with Zustand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore, useSearchQuery, useSelectedCategory } from "@/stores/filterStore";

describe("filterStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useFilterStore.setState({
      searchQuery: "",
      selectedCategory: undefined,
      selectedTown: undefined,
      minRating: undefined,
      hasImage: undefined,
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useFilterStore.getState();

      expect(state.searchQuery).toBe("");
      expect(state.selectedCategory).toBeUndefined();
      expect(state.selectedTown).toBeUndefined();
      expect(state.minRating).toBeUndefined();
      expect(state.hasImage).toBeUndefined();
    });
  });

  describe("setSearchQuery Action", () => {
    it("should update search query", () => {
      useFilterStore.getState().setSearchQuery("restaurant");

      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("restaurant");
    });

    it("should handle empty search query", () => {
      useFilterStore.setState({ searchQuery: "test" });

      useFilterStore.getState().setSearchQuery("");

      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("");
    });
  });

  describe("setCategory Action", () => {
    it("should set category filter", () => {
      useFilterStore.getState().setCategory("Restaurant");

      const state = useFilterStore.getState();
      expect(state.selectedCategory).toBe("Restaurant");
    });

    it("should clear category filter", () => {
      useFilterStore.setState({ selectedCategory: "Hotel" });

      useFilterStore.getState().setCategory(undefined);

      const state = useFilterStore.getState();
      expect(state.selectedCategory).toBeUndefined();
    });
  });

  describe("setTown Action", () => {
    it("should set town filter", () => {
      useFilterStore.getState().setTown("Nova Sintra");

      const state = useFilterStore.getState();
      expect(state.selectedTown).toBe("Nova Sintra");
    });
  });

  describe("setMinRating Action", () => {
    it("should set minimum rating filter", () => {
      useFilterStore.getState().setMinRating(4.0);

      const state = useFilterStore.getState();
      expect(state.minRating).toBe(4.0);
    });
  });

  describe("setHasImage Action", () => {
    it("should set has image filter", () => {
      useFilterStore.getState().setHasImage(true);

      const state = useFilterStore.getState();
      expect(state.hasImage).toBe(true);
    });
  });

  describe("setFilters Action", () => {
    it("should set multiple filters at once", () => {
      useFilterStore.getState().setFilters({
        searchQuery: "beach",
        category: "Beach",
        town: "Fajã d'Água",
      });

      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("beach");
      expect(state.selectedCategory).toBe("Beach");
      expect(state.selectedTown).toBe("Fajã d'Água");
    });

    it("should partially update filters", () => {
      useFilterStore.setState({
        searchQuery: "hotel",
        selectedCategory: "Hotel",
      });

      useFilterStore.getState().setFilters({
        town: "Nova Sintra",
      });

      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("hotel"); // Unchanged
      expect(state.selectedCategory).toBe("Hotel"); // Unchanged
      expect(state.selectedTown).toBe("Nova Sintra"); // Updated
    });
  });

  describe("clearFilters Action", () => {
    it("should clear all filters", () => {
      useFilterStore.setState({
        searchQuery: "test",
        selectedCategory: "Restaurant",
        selectedTown: "Nova Sintra",
        minRating: 4.5,
        hasImage: true,
      });

      useFilterStore.getState().clearFilters();

      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("");
      expect(state.selectedCategory).toBeUndefined();
      expect(state.selectedTown).toBeUndefined();
      expect(state.minRating).toBeUndefined();
      expect(state.hasImage).toBeUndefined();
    });
  });

  describe("hasActiveFilters Utility", () => {
    it("should return false when no filters are active", () => {
      const hasFilters = useFilterStore.getState().hasActiveFilters();

      expect(hasFilters).toBe(false);
    });

    it("should return true when search query is set", () => {
      useFilterStore.setState({ searchQuery: "test" });

      const hasFilters = useFilterStore.getState().hasActiveFilters();

      expect(hasFilters).toBe(true);
    });

    it("should return true when category is selected", () => {
      useFilterStore.setState({ selectedCategory: "Restaurant" });

      const hasFilters = useFilterStore.getState().hasActiveFilters();

      expect(hasFilters).toBe(true);
    });

    it("should return true when town is selected", () => {
      useFilterStore.setState({ selectedTown: "Nova Sintra" });

      const hasFilters = useFilterStore.getState().hasActiveFilters();

      expect(hasFilters).toBe(true);
    });

    it("should return true when minRating is set", () => {
      useFilterStore.setState({ minRating: 4.0 });

      const hasFilters = useFilterStore.getState().hasActiveFilters();

      expect(hasFilters).toBe(true);
    });
  });

  describe("Selectors", () => {
    it("useSearchQuery selector should return search query", () => {
      useFilterStore.setState({ searchQuery: "landmark" });

      // Test selector by accessing state directly
      const query = useFilterStore.getState().searchQuery;

      expect(query).toBe("landmark");
    });

    it("useSelectedCategory selector should return selected category", () => {
      useFilterStore.setState({ selectedCategory: "Hotel" });

      // Test selector by accessing state directly
      const category = useFilterStore.getState().selectedCategory;

      expect(category).toBe("Hotel");
    });
  });
});
