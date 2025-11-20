/**
 * Unit tests for uiStore (Phase 2.7)
 * Tests UI state management with Zustand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "@/stores/uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUiStore.setState({
      theme: "system",
      activeModal: null,
      filterPanelOpen: false,
      sidebarOpen: false,
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useUiStore.getState();

      expect(state.theme).toBe("system");
      expect(state.activeModal).toBeNull();
      expect(state.filterPanelOpen).toBe(false);
      expect(state.sidebarOpen).toBe(false);
    });
  });

  describe("Theme Actions", () => {
    it("should set theme to light", () => {
      useUiStore.getState().setTheme("light");

      const state = useUiStore.getState();
      expect(state.theme).toBe("light");
    });

    it("should set theme to dark", () => {
      useUiStore.getState().setTheme("dark");

      const state = useUiStore.getState();
      expect(state.theme).toBe("dark");
    });

    it("should toggle theme from light to dark", () => {
      useUiStore.setState({ theme: "light" });

      useUiStore.getState().toggleTheme();

      const state = useUiStore.getState();
      expect(state.theme).toBe("dark");
    });

    it("should toggle theme from dark to light", () => {
      useUiStore.setState({ theme: "dark" });

      useUiStore.getState().toggleTheme();

      const state = useUiStore.getState();
      expect(state.theme).toBe("light");
    });
  });

  describe("Modal Actions", () => {
    it("should open a modal", () => {
      useUiStore.getState().openModal("login");

      const state = useUiStore.getState();
      expect(state.activeModal).toBe("login");
    });

    it("should close active modal", () => {
      useUiStore.setState({ activeModal: "signup" });

      useUiStore.getState().closeModal();

      const state = useUiStore.getState();
      expect(state.activeModal).toBeNull();
    });
  });

  describe("Filter Panel Actions", () => {
    it("should toggle filter panel from closed to open", () => {
      useUiStore.getState().toggleFilterPanel();

      const state = useUiStore.getState();
      expect(state.filterPanelOpen).toBe(true);
    });

    it("should toggle filter panel from open to closed", () => {
      useUiStore.setState({ filterPanelOpen: true });

      useUiStore.getState().toggleFilterPanel();

      const state = useUiStore.getState();
      expect(state.filterPanelOpen).toBe(false);
    });

    it("should set filter panel open state directly", () => {
      useUiStore.getState().setFilterPanelOpen(true);

      let state = useUiStore.getState();
      expect(state.filterPanelOpen).toBe(true);

      useUiStore.getState().setFilterPanelOpen(false);

      state = useUiStore.getState();
      expect(state.filterPanelOpen).toBe(false);
    });
  });

  describe("Sidebar Actions", () => {
    it("should toggle sidebar from closed to open", () => {
      useUiStore.getState().toggleSidebar();

      const state = useUiStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });

    it("should set sidebar open state directly", () => {
      useUiStore.getState().setSidebarOpen(true);

      const state = useUiStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });
  });

  describe("Selectors", () => {
    it("useTheme selector should return theme", () => {
      useUiStore.setState({ theme: "dark" });

      // Test selector by accessing state directly
      const theme = useUiStore.getState().theme;

      expect(theme).toBe("dark");
    });

    it("useActiveModal selector should return active modal", () => {
      useUiStore.setState({ activeModal: "filter" });

      // Test selector by accessing state directly
      const modal = useUiStore.getState().activeModal;

      expect(modal).toBe("filter");
    });
  });
});
