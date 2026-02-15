import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

/**
 * Zustand store for UI state management.
 * Manages theme, modals, and UI preferences.
 * Persists theme preference to localStorage.
 */

type Theme = "light" | "dark" | "system";
type ModalType = "login" | "signup" | "filter" | "share" | null;

interface UiState {
  // State
  theme: Theme;
  activeModal: ModalType;
  filterPanelOpen: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set, _get) => ({
        // Initial state
        theme: "system",
        activeModal: null,
        filterPanelOpen: false,
        sidebarOpen: false,
        sidebarCollapsed: false,
        mobileMenuOpen: false,

        // Actions
        setTheme: (theme) => set({ theme }),
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === "light" ? "dark" : "light",
          })),
        openModal: (modal) => set({ activeModal: modal }),
        closeModal: () => set({ activeModal: null }),
        toggleFilterPanel: () =>
          set((state) => ({
            filterPanelOpen: !state.filterPanelOpen,
          })),
        setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),
        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebarCollapsed: () =>
          set((state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          })),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleMobileMenu: () =>
          set((state) => ({
            mobileMenuOpen: !state.mobileMenuOpen,
          })),
        setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      }),
      {
        name: "ui-storage",
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: "UiStore",
    }
  )
);

// Selectors for optimized re-renders
export const useTheme = () => useUiStore((state) => state.theme);
export const useActiveModal = () => useUiStore((state) => state.activeModal);
export const useFilterPanelOpen = () =>
  useUiStore((state) => state.filterPanelOpen);
export const useSidebarOpen = () => useUiStore((state) => state.sidebarOpen);
export const useSidebarCollapsed = () =>
  useUiStore((state) => state.sidebarCollapsed);
